import { useState, useEffect, useCallback } from 'react'
import { getClients, updateStepStatus as dbUpdateStep } from '../lib/supabase'

export function useClients() {
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getClients()
      setClients(data)
    } catch (err) {
      console.error('useClients fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  // Optimistic update: change a step status locally + persist to Supabase
  async function updateStep(clientId, stepId, newStatus) {
    // 1. Optimistic local update
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c
      const steps = c.steps.map(s => s.id === stepId ? { ...s, status: newStatus } : s)
      const done  = steps.filter(s => s.status === 'done').length
      const pct   = Math.round((done / steps.length) * 100)
      return { ...c, steps, steps_done: done, progress: pct }
    }))

    // 2. Persist
    try {
      await dbUpdateStep(stepId, newStatus)
    } catch (err) {
      console.error('updateStep error:', err)
      // Rollback on failure
      fetchClients()
    }
  }

  return { clients, loading, error, refetch: fetchClients, updateStep }
}
