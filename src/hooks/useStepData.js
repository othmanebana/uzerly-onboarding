import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Persists the step_data JSONB field for a given onboarding_steps row
export function useStepData(stepId, initialData = {}) {
  const [data,   setData]   = useState(initialData)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const update = useCallback(async (key, value) => {
    // 1. Optimistic local update
    const next = { ...data, [key]: value }
    setData(next)

    // 2. Persist to Supabase — merge with existing JSONB using ||
    setSaving(true)
    setSaved(false)
    try {
      const { error } = await supabase
        .from('onboarding_steps')
        .update({
          step_data:  next,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stepId)

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('useStepData save error:', err)
    } finally {
      setSaving(false)
    }
  }, [stepId, data])

  return { data, update, saving, saved }
}
