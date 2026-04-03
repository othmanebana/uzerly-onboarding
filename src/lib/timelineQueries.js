import { supabase } from './supabase'

// ─── Activity log ──────────────────────────────────────────────────────────────

export async function getActivityLog(clientId) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return data
}

export async function logActivity(entry) {
  const { error } = await supabase
    .from('activity_log')
    .insert([{
      client_id:   entry.client_id,
      step_id:     entry.step_id   || null,
      step_number: entry.step_number || null,
      user_name:   entry.user_name || 'Système',
      user_role:   entry.user_role || null,
      action:      entry.action,
      old_value:   entry.old_value || null,
      new_value:   entry.new_value || null,
      meta:        entry.meta      || {},
    }])
  if (error) console.warn('logActivity error:', error)
}

// ─── Step date updates ────────────────────────────────────────────────────────

export async function updateStepDates(stepId, dates, clientId, stepNumber, userName = 'Système') {
  const updates = {}
  if (dates.planned_start !== undefined) updates.planned_start = dates.planned_start
  if (dates.planned_end   !== undefined) updates.planned_end   = dates.planned_end
  if (dates.due_date      !== undefined) updates.due_date      = dates.due_date
  if (dates.started_at    !== undefined) updates.started_at    = dates.started_at
  if (dates.completed_at  !== undefined) updates.completed_at  = dates.completed_at
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('onboarding_steps')
    .update(updates)
    .eq('id', stepId)
  if (error) throw error

  // Log
  if (dates.due_date !== undefined) {
    await logActivity({
      client_id: clientId, step_id: stepId, step_number: stepNumber,
      user_name: userName, action: 'due_date_change',
      new_value: dates.due_date,
    })
  }
  if (dates.planned_start !== undefined) {
    await logActivity({
      client_id: clientId, step_id: stepId, step_number: stepNumber,
      user_name: userName, action: 'field_update',
      old_value: 'planned_start', new_value: dates.planned_start,
    })
  }
}

export async function markStepStarted(stepId, clientId, stepNumber, userName) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('onboarding_steps')
    .update({ started_at: now, status: 'doing', updated_at: now })
    .eq('id', stepId)
  if (error) throw error
  await logActivity({
    client_id: clientId, step_id: stepId, step_number: stepNumber,
    user_name: userName || 'Système', action: 'status_change',
    old_value: 'todo', new_value: 'doing',
  })
}

export async function markStepCompleted(stepId, clientId, stepNumber, userName) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('onboarding_steps')
    .update({ completed_at: now, status: 'done', updated_at: now })
    .eq('id', stepId)
  if (error) throw error
  await logActivity({
    client_id: clientId, step_id: stepId, step_number: stepNumber,
    user_name: userName || 'Système', action: 'status_change',
    old_value: 'doing', new_value: 'done',
  })
}
