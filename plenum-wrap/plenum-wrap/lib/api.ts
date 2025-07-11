// lib/api.ts

export async function apiCall<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<T> {
  const isServerAPI = endpoint.startsWith('/api')

  const url = isServerAPI
    ? endpoint
    : `${process.env.AZURE_API_BASE_URL}${endpoint}`

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  // 🔍 Temporary logging of token
  console.log('🔐 Using access token:', token)

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Something went wrong')
  }

  return res.json()
}

export interface AgentsParams {
  domain_id?: string
  domain_name?: string
  skip?: number
  limit?: number
}

// Helper function to build query string from params
function toQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return query ? `?${query}` : ''
}

/**
 * Fetch agents list from /v1/agents API
 * Accepts optional parameters domain_id, domain_name, skip, limit
 */
export async function fetchAgents(params: AgentsParams = {}) {
  const queryString = toQueryString(params)
  const endpoint = `/v1/agents${queryString}`
  return apiCall(endpoint, 'GET')
}
