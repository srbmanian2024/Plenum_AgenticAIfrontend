import { Agent } from '@/lib/types/agent'

export async function fetchAgents(domainId?: string): Promise<Agent[]> {
  const query = domainId ? `?domain_id=${domainId}` : ''
  const res = await fetch(`https://agent-api.livelywave-29b8c618.uaenorth.azurecontainerapps.io/v1/agents/${query}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch agents: ${res.status}`)
  }

  return res.json()
}
