// // lib/apiCalls.ts
// import { apiCall } from './api'

// export async function fetchAgents({ domain_id, domain_name, skip = 0, limit = 100 }) {
//   const params = new URLSearchParams()

//   if (domain_id) params.append('domain_id', domain_id)
//   if (domain_name) params.append('domain_name', domain_name)
//   params.append('skip', skip.toString())
//   params.append('limit', limit.toString())

//   // Note the apiCall now calls the proxy api instead of the real API directly
//   return apiCall(`/api/agents?${params.toString()}`, 'GET')
// }
