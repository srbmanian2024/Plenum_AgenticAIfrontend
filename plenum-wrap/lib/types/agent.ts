export type Agent = {
  id: string
  name: string
  endpoint: string
  base_url: string
  capabilities: string[]
  supported_languages: string[]
  healthcheck_url: string
  auth_type: string
  auth_credentials: string
  timeout: number
  description: string
  vendor: string
  domain_id: string
  domain_name: string
  created_at: string
}
