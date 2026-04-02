import { useState } from 'react'
import { createClient_ } from '../lib/supabase'

export function useCreateClient() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(false)

  async function submit(payload) {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const client = await createClient_(payload)
      setSuccess(true)
      return client
    } catch (err) {
      console.error('createClient error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error, success }
}
