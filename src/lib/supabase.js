import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      campaigns_config (*),
      onboarding_steps (*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeClient)
}

export async function getClientById(id) {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      campaigns_config (*),
      onboarding_steps (*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeClient(data)
}

export async function createClient_(payload) {
  // 1. Insert client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([{
      name:          payload.name,
      country:       payload.country,
      city:          payload.city,
      phone:         payload.phone,
      activity_desc: payload.activity_desc,
      setup_fee:     payload.setup_fee,
      min_billing:   payload.min_billing,
      am:            payload.am,
      sales:         payload.sales,
      notes:         payload.notes,
    }])
    .select()
    .single()
  if (clientError) throw clientError

  // 2. Insert campaigns
  if (payload.solutions?.length) {
    const campaigns = payload.solutions.map(sol => ({
      client_id:        client.id,
      solution:         sol,
      sender_name:      payload.sender_name,
      commission_type:  payload.commission_type,
      commission_value: payload.commission_value,
      monthly_budget:   payload.monthly_budget,
    }))
    const { error: campError } = await supabase.from('campaigns_config').insert(campaigns)
    if (campError) throw campError
  }

  // 3. Create default onboarding steps
  const defaultSteps = [
    { step_number: 1, title: 'Création du client',             owner: 'Sales',    status: 'done',   duration_label: 'J0',     description: 'Fiche client, upload BDC obligatoire, frais de setup' },
    { step_number: 2, title: 'Création de la campagne',         owner: 'Sales/AM', status: 'todo',   duration_label: 'J1',     description: 'URL site, nom campagne, solutions, commission' },
    { step_number: 3, title: 'Informations commerciales',       owner: 'Sales',    status: 'todo',   duration_label: 'J1',     description: 'Guide intégration technique, requis graphiques' },
    { step_number: 4, title: 'Création des serveurs',           owner: 'Tech',     status: 'todo',   duration_label: 'J2',     description: 'Mise en place infrastructure technique' },
    { step_number: 5, title: 'Accès plateforme & plan taggage', owner: 'AM',       status: 'todo',   duration_label: 'J3',     description: 'Email 1 – bienvenue + checklist envoyé' },
    { step_number: 6, title: 'Récupération plan taggage',       owner: 'Client',   status: 'todo',   duration_label: 'J3–J10', description: 'Relances E2 J+3, E3 J+7, E4 J+10, E5 J+14' },
    { step_number: 7, title: 'Setup éléments de campagne',      owner: 'AM/Tech',  status: 'todo',   duration_label: 'J7',     description: 'Flux, tags, matériel créa, check technique' },
    { step_number: 8, title: 'Call de setup',                   owner: 'Sales/AM', status: 'todo',   duration_label: 'J8',     description: 'Validation finale + email récap client' },
    { step_number: 9, title: 'Lancement campagne',              owner: 'AM/Tech',  status: 'todo',   duration_label: 'J14',    description: 'Go live + remontée stats sur la plateforme' },
  ].map(s => ({ ...s, client_id: client.id }))

  const { error: stepsError } = await supabase.from('onboarding_steps').insert(defaultSteps)
  if (stepsError) throw stepsError

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
  const { error } = await supabase
    .from('clients')
    .update(fields)
    .eq('id', clientId)
  if (error) throw error
}

// ─── NORMALIZE ────────────────────────────────────────────────────────────────
// Maps raw Supabase rows → shape the UI expects

function normalizeClient(raw) {
  const steps   = raw.onboarding_steps || []
  const done    = steps.filter(s => s.status === 'done').length
  const total   = steps.length || 9
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0
  const solutions = (raw.campaigns_config || []).map(c => friendlySolution(c.solution))

  // Derive overall status from steps
  let status = 'todo'
  if (steps.some(s => s.status === 'blocked')) status = 'blocked'
  else if (steps.some(s => s.status === 'wait'))    status = 'wait'
  else if (steps.some(s => s.status === 'doing'))   status = 'doing'
  else if (done > 0 && done < total)                status = 'doing'
  else if (done === total && total > 0)              status = 'done'

  return {
    id:          raw.id,
    name:        raw.name,
    initials:    initials(raw.name),
    country:     raw.country,
    city:        raw.city,
    phone:       raw.phone,
    am:          raw.am,
    sales:       raw.sales,
    setup:       raw.setup_fee,
    min_billing: raw.min_billing,
    budget:      raw.campaigns_config?.[0]?.monthly_budget ?? 0,
    solutions,
    progress:    pct,
    steps_done:  done,
    steps_total: total,
    status,
    steps:       steps.sort((a, b) => a.step_number - b.step_number),
    campaigns:   raw.campaigns_config || [],
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
