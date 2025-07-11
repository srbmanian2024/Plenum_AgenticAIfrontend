import { useEffect, useState } from 'react'
import { fetchDomains } from '@/lib/api/domain'
import { Domain } from '@/lib/types/domain'

export function useDomain() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchDomains()
      .then(setDomains)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { domains, loading, error }
}
