import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── CLIENTS ────────────────────────────────────────────────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('uz_clients')
    .select(`*, uz_campaigns_config(*), uz_onboarding_steps(*), uz_relance_rules(*)`)
    .eq('archived', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeClient)
}

export async function getArchivedClients() {
  const { data, error } = await supabase
    .from('uz_clients')
    .select(`*, uz_campaigns_config(*), uz_onboarding_steps(*), uz_relance_rules(*)`)
    .eq('archived', true)
    .order('archived_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeClient)
}

export async function getClientById(id) {
  const { data, error } = await supabase
    .from('uz_clients')
    .select(`*, uz_campaigns_config(*), uz_onboarding_steps(*), uz_relance_rules(*)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeClient(data)
}

export async function archiveClient(clientId, reason = '') {
  const { error } = await supabase
    .from('uz_clients')
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
      archived_reason: reason,
    })
    .eq('id', clientId)
  if (error) throw error
}

export async function unarchiveClient(clientId) {
  const { error } = await supabase
    .from('uz_clients')
    .update({
      archived: false,
      archived_at: null,
      archived_reason: null,
    })
    .eq('id', clientId)
  if (error) throw error
}

export async function createClient_(payload) {
  const template = await getStepTemplate()

  const { data: client, error: clientError } = await supabase
    .from('uz_clients')
    .insert([{
      name: payload.name,
      country: payload.country,
      city: payload.city,
      phone: payload.phone,
      activity_desc: payload.activity_desc,
      setup_fee: payload.setup_fee ? Number(payload.setup_fee) : null,
      min_billing: payload.min_billing ? Number(payload.min_billing) : null,
      am: payload.am,
      sales: payload.sales,
      notes: payload.notes,
      client_main_contact_name: payload.client_main_contact_name,
      client_main_contact_email: payload.client_main_contact_email,
      client_tech_contact_name: payload.client_tech_contact_name,
      client_tech_contact_email: payload.client_tech_contact_email,
      archived: false,
    }])
    .select()
    .single()
  if (clientError) throw clientError

  if (payload.solutions?.length) {
    const campaigns = payload.solutions.map(sol => ({
      client_id: client.id,
      solution: sol,
      sender_name: payload.sender_name,
      commission_type: payload.commission_type,
      commission_value: payload.commission_value ? Number(payload.commission_value) : null,
      monthly_budget: payload.monthly_budget ? Number(payload.monthly_budget) : null,
      networks: payload.networks,
      excluded_networks: payload.excluded_networks,
    }))
    const { error: campError } = await supabase.from('uz_campaigns_config').insert(campaigns)
    if (campError) throw campError
  }

  const steps = template.map(t => ({
    client_id: client.id,
    step_number: t.step_number,
    title: t.title,
    owner: t.owner,
    status: 'todo',
    duration_label: t.duration_label,
    description: t.description,
    step_data: {},
  }))

  if (steps[0]) {
    steps[0].status = 'done'
    steps[0].step_data = {
      contact_info: {
        main_name:  payload.client_main_contact_name  || '',
        main_email: payload.client_main_contact_email || '',
        tech_name:  payload.client_tech_contact_name  || '',
        tech_email: payload.client_tech_contact_email || '',
      },
      business_terms: {
        setup_fee:   payload.setup_fee   || '',
        min_billing: payload.min_billing || '',
        solutions:   payload.solutions   || [],
      },
      campaign_details: {
        sender:     payload.sender_name       || '',
        budget:     payload.monthly_budget    || '',
        commission: `${payload.commission_value || ''} ${payload.commission_type || ''}`.trim(),
        networks:   payload.networks          || '',
        excluded:   payload.excluded_networks || '',
      },
      assigned_team: {
        am:    payload.am    || '',
        sales: payload.sales || '',
      },
      notes:       payload.notes         || '',
      activity:    payload.activity_desc || '',
      client_name: payload.name          || '',
      country:     payload.country       || '',
      city:        payload.city          || '',
      phone:       payload.phone         || '',
    }
  }

  const { error: stepsError } = await supabase.from('uz_onboarding_steps').insert(steps)
  if (stepsError) throw stepsError

  const { error: relanceError } = await supabase.from('uz_relance_rules').insert([{
    client_id: client.id,
    paused: false,
    delay_e2: 3,
    delay_e3: 7,
    delay_e4: 10,
    delay_e5: 14,
  }])
  if (relanceError) console.warn('uz_relance_rules insert warn:', relanceError)

  await fireWebhook(client, payload)

  return client
}

export async function updateStepStatus(stepId, status) {
  const { error } = await supabase
    .from('uz_onboarding_steps')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', stepId)
  if (error) throw error
}

export async function updateClientField(clientId, fields) {
  const { error } = await supabase.from('uz_clients').update(fields).eq('id', clientId)
  if (error) throw error
}

// ─── TEAM MEMBERS ────────────────────────────────────────────────────────────

export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('uz_team_members')
    .select('*')
    .eq('active', true)
    .order('role')
  if (error) throw error
  return data
}

export async function createTeamMember(payload) {
  const { data, error } = await supabase
    .from('uz_team_members')
    .insert([{ ...payload, active: true }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTeamMember(id) {
  const { error } = await supabase
    .from('uz_team_members')
    .update({ active: false })
    .eq('id', id)
  if (error) throw error
}

// ─── GLOBAL CONFIG / STEP TEMPLATE ──────────────────────────────────────────

export async function getStepTemplate() {
  const { data, error } = await supabase
    .from('uz_global_config')
    .select('config_value')
    .eq('config_key', 'step_template')
    .single()
  if (error) throw error
  return data.config_value
}

export async function saveStepTemplate(steps) {
  const { error } = await supabase
    .from('uz_global_config')
    .update({ config_value: steps, updated_at: new Date().toISOString() })
    .eq('config_key', 'step_template')
  if (error) throw error
}

// ─── RELANCE RULES ───────────────────────────────────────────────────────────

export async function getRelanceRules(clientId) {
  const { data, error } = await supabase
    .from('uz_relance_rules')
    .select('*')
    .eq('client_id', clientId)
    .single()
  if (error) return null
  return data
}

export async function upsertRelanceRules(clientId, rules) {
  const { error } = await supabase
    .from('uz_relance_rules')
    .upsert({ client_id: clientId, ...rules, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ─── HANDOVER ────────────────────────────────────────────────────────────────

export async function logHandover(payload) {
  const { data, error } = await supabase
    .from('uz_handover_log')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getHandoverLog(clientId) {
  const { data, error } = await supabase
    .from('uz_handover_log')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── HELP DOCUMENTS ──────────────────────────────────────────────────────────

export async function getHelpDocuments() {
  const { data, error } = await supabase
    .from('uz_help_documents')
    .select('*')
    .eq('active', true)
    .order('category')
  if (error) throw error
  return data
}

export async function uploadHelpDocument(file, meta) {
  const path = `help-documents/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('help-documents')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('help-documents')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('uz_help_documents')
    .insert([{
      title: meta.title,
      description: meta.description,
      category: meta.category,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHelpDocument(id, file, meta) {
  let file_url = meta.file_url
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
    .from('uz_help_documents')
    .update({ ...meta, file_url, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteHelpDocument(id) {
  const { error } = await supabase
    .from('uz_help_documents')
    .update({ active: false })
    .eq('id', id)
  if (error) throw error
}

export async function incrementDownloadCount(id) {
  await supabase.rpc('increment_download_count', { doc_id: id }).catch(() => {
    supabase.from('uz_help_documents')
      .update({ download_count: supabase.raw('download_count + 1') })
      .eq('id', id)
  })
}

// ─── CLIENTS simple (RelanceRules) ───────────────────────────────────────────

export async function getClients_simple() {
  const { data, error } = await supabase
    .from('uz_clients')
    .select(`*, uz_relance_rules(*)`)
    .eq('archived', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(c => ({
    id: c.id,
    name: c.name,
    relance: c.uz_relance_rules?.[0] || null,
  }))
}

// ─── WEBHOOK ─────────────────────────────────────────────────────────────────

async function fireWebhook(client, payload) {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL
  if (!webhookUrl) return

  const flat = {
    client_id: client.id,
    client_name: client.name,
    client_country: client.country,
    client_city: client.city,
    client_phone: client.phone,
    client_activity: payload.activity_desc,
    client_main_contact_name: payload.client_main_contact_name,
    client_main_contact_email: payload.client_main_contact_email,
    client_tech_contact_name: payload.client_tech_contact_name,
    client_tech_contact_email: payload.client_tech_contact_email,
    am: payload.am,
    sales: payload.sales,
    setup_fee: payload.setup_fee,
    min_billing: payload.min_billing,
    notes: payload.notes,
    solution: payload.solutions?.[0],
    all_solutions: payload.solutions?.join(', '),
    sender_name: payload.sender_name,
    commission_type: payload.commission_type,
    commission_value: payload.commission_value,
    monthly_budget: payload.monthly_budget,
    created_at: new Date().toISOString(),
    source: 'uzerly-onboarding',
  }

  const nested = {
    client: {
      id: client.id,
      name: client.name,
      country: client.country,
      city: client.city,
      phone: client.phone,
      activity_desc: payload.activity_desc,
      client_main_contact_name: payload.client_main_contact_name,
      client_main_contact_email: payload.client_main_contact_email,
      client_tech_contact_name: payload.client_tech_contact_name,
      client_tech_contact_email: payload.client_tech_contact_email,
      am: payload.am,
      sales: payload.sales,
      setup_fee: payload.setup_fee,
      min_billing: payload.min_billing,
      notes: payload.notes,
    },
    campaigns: (payload.solutions || []).map(sol => ({
      solution: sol,
      sender_name: payload.sender_name,
      commission_type: payload.commission_type,
      commission_value: payload.commission_value,
      monthly_budget: payload.monthly_budget,
      networks: payload.networks,
      excluded_networks: payload.excluded_networks,
    })),
    meta: { created_at: new Date().toISOString(), source: 'uzerly-onboarding' },
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flat, nested }),
    })
  } catch (err) {
    console.warn('Webhook failed (non-blocking):', err.message)
  }
}

// ─── NORMALIZE ───────────────────────────────────────────────────────────────

function normalizeClient(raw) {
  const steps = (raw.uz_onboarding_steps || []).sort((a, b) => a.step_number - b.step_number)
  const done = steps.filter(s => s.status === 'done').length
  const total = steps.length || 9
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const solutions = (raw.uz_campaigns_config || []).map(c => friendlySolution(c.solution))

  let status = 'todo'
  if (steps.some(s => s.status === 'blocked')) status = 'blocked'
  else if (steps.some(s => s.status === 'wait')) status = 'wait'
  else if (done > 0 && done < total) status = 'doing'
  else if (done === total && total > 0) status = 'done'

  return {
    id: raw.id,
    name: raw.name,
    initials: initials(raw.name),
    country: raw.country,
    city: raw.city,
    phone: raw.phone,
    activity_desc: raw.activity_desc,
    am: raw.am,
    sales: raw.sales,
    notes: raw.notes,
    setup: Number(raw.setup_fee) || 0,
    min_billing: Number(raw.min_billing) || 0,
    budget: Number(raw.uz_campaigns_config?.[0]?.monthly_budget) || 0,
    client_main_contact_name: raw.client_main_contact_name,
    client_main_contact_email: raw.client_main_contact_email,
    client_tech_contact_name: raw.client_tech_contact_name,
    client_tech_contact_email: raw.client_tech_contact_email,
    solutions,
    progress: pct,
    steps_done: done,
    steps_total: total,
    status,
    steps,
    campaigns: raw.uz_campaigns_config || [],
    relance: raw.uz_relance_rules?.[0] || null,
    archived: raw.archived || false,
    archived_at: raw.archived_at || null,
    archived_reason: raw.archived_reason || '',
    created_at: raw.created_at,
  }
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function friendlySolution(sol = '') {
  if (sol.toLowerCase().includes('email')) return 'Email'
  if (sol.toLowerCase().includes('display')) return 'Display'
  if (sol.toLowerCase().includes('onsite') || sol.toLowerCase().includes('on-site')) return 'OnSite'
  if (sol.toLowerCase().includes('acqui')) return 'Acquisition'
  return sol
}
