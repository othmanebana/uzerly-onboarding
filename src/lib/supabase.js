import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select(`*, campaigns_config(*), onboarding_steps(*), relance_rules(*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeClient)
}

export async function getClientById(id) {
  const { data, error } = await supabase
    .from('clients')
    .select(`*, campaigns_config(*), onboarding_steps(*), relance_rules(*)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeClient(data)
}

export async function createClient_(payload) {
  // 1. Get step template from global_config
  const template = await getStepTemplate()

  // 2. Insert client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([{
      name:                      payload.name,
      country:                   payload.country,
      city:                      payload.city,
      phone:                     payload.phone,
      activity_desc:             payload.activity_desc,
      setup_fee:                 payload.setup_fee     ? Number(payload.setup_fee)     : null,
      min_billing:               payload.min_billing   ? Number(payload.min_billing)   : null,
      am:                        payload.am,
      sales:                     payload.sales,
      notes:                     payload.notes,
      client_main_contact_name:  payload.client_main_contact_name,
      client_main_contact_email: payload.client_main_contact_email,
      client_tech_contact_name:  payload.client_tech_contact_name,
      client_tech_contact_email: payload.client_tech_contact_email,
    }])
    .select()
    .single()
  if (clientError) throw clientError

  // 3. Insert campaigns
  if (payload.solutions?.length) {
    const campaigns = payload.solutions.map(sol => ({
      client_id:         client.id,
      solution:          sol,
      sender_name:       payload.sender_name,
      commission_type:   payload.commission_type,
      commission_value:  payload.commission_value ? Number(payload.commission_value) : null,
      monthly_budget:    payload.monthly_budget   ? Number(payload.monthly_budget)   : null,
      networks:          payload.networks,
      excluded_networks: payload.excluded_networks,
    }))
    const { error: campError } = await supabase.from('campaigns_config').insert(campaigns)
    if (campError) throw campError
  }

  // 4. Create onboarding steps from template
  const steps = template.map(t => ({
    client_id:      client.id,
    step_number:    t.step_number,
    title:          t.title,
    owner:          t.owner,
    status:         'todo',
    duration_label: t.duration_label,
    description:    t.description,
    step_data:      {},
  }))
  // Mark step 1 as done (client just created)
  if (steps[0]) steps[0].status = 'done'

  const { error: stepsError } = await supabase.from('onboarding_steps').insert(steps)
  if (stepsError) throw stepsError

  // 5. Create default relance rules
  const { error: relanceError } = await supabase.from('relance_rules').insert([{
    client_id: client.id,
    paused: false,
    delay_e2: 3, delay_e3: 7, delay_e4: 10, delay_e5: 14,
  }])
  if (relanceError) console.warn('relance_rules insert warn:', relanceError)

  // 6. Fire webhook (dual format)
  await fireWebhook(client, payload)

  return client
}

export async function updateStepStatus(stepId, status) {
  const { error } = await supabase
    .from('onboarding_steps')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', stepId)
  if (error) throw error
}

export async function updateClientField(clientId, fields) {
  const { error } = await supabase.from('clients').update(fields).eq('id', clientId)
  if (error) throw error
}

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('role')
  if (error) throw error
  return data
}

export async function createTeamMember(payload) {
  const { data, error } = await supabase
    .from('team_members')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTeamMember(id) {
  // Soft delete
  const { error } = await supabase
    .from('team_members')
    .update({ active: false })
    .eq('id', id)
  if (error) throw error
}

// ─── GLOBAL CONFIG / STEP TEMPLATE ───────────────────────────────────────────

export async function getStepTemplate() {
  const { data, error } = await supabase
    .from('global_config')
    .select('config_value')
    .eq('config_key', 'step_template')
    .single()
  if (error) throw error
  return data.config_value
}

export async function saveStepTemplate(steps) {
  const { error } = await supabase
    .from('global_config')
    .update({ config_value: steps, updated_at: new Date().toISOString() })
    .eq('config_key', 'step_template')
  if (error) throw error
}

// ─── RELANCE RULES ────────────────────────────────────────────────────────────

export async function getRelanceRules(clientId) {
  const { data, error } = await supabase
    .from('relance_rules')
    .select('*')
    .eq('client_id', clientId)
    .single()
  if (error) return null
  return data
}

export async function upsertRelanceRules(clientId, rules) {
  const { error } = await supabase
    .from('relance_rules')
    .upsert({ client_id: clientId, ...rules, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ─── HANDOVER ─────────────────────────────────────────────────────────────────

export async function logHandover(payload) {
  const { data, error } = await supabase
    .from('handover_log')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getHandoverLog(clientId) {
  const { data, error } = await supabase
    .from('handover_log')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── HELP DOCUMENTS ───────────────────────────────────────────────────────────

export async function getHelpDocuments() {
  const { data, error } = await supabase
    .from('help_documents')
    .select('*')
    .eq('active', true)
    .order('category')
  if (error) throw error
  return data
}

export async function uploadHelpDocument(file, meta) {
  // 1. Upload to Storage
  const path = `help-documents/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('help-documents')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('help-documents')
    .getPublicUrl(path)

  // 3. Insert record
  const { data, error } = await supabase
    .from('help_documents')
    .insert([{
      title:       meta.title,
      description: meta.description,
      category:    meta.category,
      file_url:    publicUrl,
      file_name:   file.name,
      file_size:   file.size,
      mime_type:   file.type,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHelpDocument(id, file, meta) {
  // Replace file in storage + update record
  let file_url = meta.file_url // keep existing if no new file
  if (file) {
    const path = `help-documents/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('help-documents')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage
      .from('help-documents')
      .getPublicUrl(path)
    file_url = publicUrl
  }

  const { error } = await supabase
    .from('help_documents')
    .update({ ...meta, file_url, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteHelpDocument(id) {
  const { error } = await supabase
    .from('help_documents')
    .update({ active: false })
    .eq('id', id)
  if (error) throw error
}

export async function incrementDownloadCount(id) {
  await supabase.rpc('increment_download_count', { doc_id: id }).catch(() => {
    // Fallback: just update directly
    supabase.from('help_documents')
      .update({ download_count: supabase.raw('download_count + 1') })
      .eq('id', id)
  })
}

// ─── WEBHOOK (dual format) ────────────────────────────────────────────────────

async function fireWebhook(client, payload) {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL
  if (!webhookUrl) return // no webhook configured

  const flat = {
    // Client
    client_id:                 client.id,
    client_name:               client.name,
    client_country:            client.country,
    client_city:               client.city,
    client_phone:              client.phone,
    client_activity:           payload.activity_desc,
    client_main_contact_name:  payload.client_main_contact_name,
    client_main_contact_email: payload.client_main_contact_email,
    client_tech_contact_name:  payload.client_tech_contact_name,
    client_tech_contact_email: payload.client_tech_contact_email,
    // Commercial
    am:                        payload.am,
    sales:                     payload.sales,
    setup_fee:                 payload.setup_fee,
    min_billing:               payload.min_billing,
    notes:                     payload.notes,
    // Campaign (first solution)
    solution:                  payload.solutions?.[0],
    all_solutions:             payload.solutions?.join(', '),
    sender_name:               payload.sender_name,
    commission_type:           payload.commission_type,
    commission_value:          payload.commission_value,
    monthly_budget:            payload.monthly_budget,
    // Meta
    created_at:                new Date().toISOString(),
    source:                    'uzerly-onboarding',
  }

  const nested = {
    client: {
      id:      client.id,
      name:    client.name,
      country: client.country,
      city:    client.city,
      phone:   client.phone,
      activity_desc:             payload.activity_desc,
      client_main_contact_name:  payload.client_main_contact_name,
      client_main_contact_email: payload.client_main_contact_email,
      client_tech_contact_name:  payload.client_tech_contact_name,
      client_tech_contact_email: payload.client_tech_contact_email,
      am:        payload.am,
      sales:     payload.sales,
      setup_fee: payload.setup_fee,
      min_billing: payload.min_billing,
      notes:     payload.notes,
    },
    campaigns: (payload.solutions || []).map(sol => ({
      solution:         sol,
      sender_name:      payload.sender_name,
      commission_type:  payload.commission_type,
      commission_value: payload.commission_value,
      monthly_budget:   payload.monthly_budget,
      networks:         payload.networks,
      excluded_networks: payload.excluded_networks,
    })),
    meta: { created_at: new Date().toISOString(), source: 'uzerly-onboarding' },
  }

  try {
    await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ flat, nested }),
    })
  } catch (err) {
    console.warn('Webhook failed (non-blocking):', err.message)
  }
}

// ─── NORMALIZE ────────────────────────────────────────────────────────────────

function normalizeClient(raw) {
  const steps    = (raw.onboarding_steps || []).sort((a, b) => a.step_number - b.step_number)
  const done     = steps.filter(s => s.status === 'done').length
  const total    = steps.length || 9
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0
  const solutions = (raw.campaigns_config || []).map(c => friendlySolution(c.solution))

  let status = 'todo'
  if (steps.some(s => s.status === 'blocked')) status = 'blocked'
  else if (steps.some(s => s.status === 'wait'))  status = 'wait'
  else if (done > 0 && done < total)              status = 'doing'
  else if (done === total && total > 0)            status = 'done'

  return {
    id:                        raw.id,
    name:                      raw.name,
    initials:                  initials(raw.name),
    country:                   raw.country,
    city:                      raw.city,
    phone:                     raw.phone,
    activity_desc:             raw.activity_desc,
    am:                        raw.am,
    sales:                     raw.sales,
    notes:                     raw.notes,
    setup:                     raw.setup_fee,
    min_billing:               raw.min_billing,
    budget:                    raw.campaigns_config?.[0]?.monthly_budget ?? 0,
    client_main_contact_name:  raw.client_main_contact_name,
    client_main_contact_email: raw.client_main_contact_email,
    client_tech_contact_name:  raw.client_tech_contact_name,
    client_tech_contact_email: raw.client_tech_contact_email,
    solutions,
    progress:    pct,
    steps_done:  done,
    steps_total: total,
    status,
    steps,
    campaigns:   raw.campaigns_config || [],
    relance:     raw.relance_rules?.[0] || null,
    created_at:  raw.created_at,
  }
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function friendlySolution(sol = '') {
  if (sol.toLowerCase().includes('email'))   return 'Email'
  if (sol.toLowerCase().includes('display')) return 'Display'
  if (sol.toLowerCase().includes('onsite') || sol.toLowerCase().includes('on-site')) return 'OnSite'
  if (sol.toLowerCase().includes('acqui'))   return 'Acquisition'
  return sol
}
