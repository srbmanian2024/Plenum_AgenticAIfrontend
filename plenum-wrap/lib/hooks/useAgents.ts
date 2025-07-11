import { useEffect, useState } from 'react'
import { Agent } from '@/lib/types/agent'
import { fetchAgents } from '@/lib/api/agent'

export function useAgents(domainId?: string) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchAgents(domainId)
      .then(setAgents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [domainId])

  return { agents, loading, error }
}
