import { Domain } from '@/lib/types/domain'

export async function fetchDomains(): Promise<Domain[]> {
  const res = await fetch(`${process.env.AZURE_API_BASE_URL}/v1/domains/`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`, // optional if your API requires auth
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch domains')
  }

  return res.json()
}
