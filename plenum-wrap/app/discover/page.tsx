'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, UserPlus, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Domain } from '@/lib/types/domain'
import { useRouter } from 'next/navigation'

type Agent = {
  id: string
  name: string
  description: string
  domain_id: string
  domain_name: string | null
  endpoint_url: string
  capabilities: string[]
  supported_languages: string[]
  created_at: string
  vendor_name: string
}

export default function DiscoverPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingDomains, setLoadingDomains] = useState(true)
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDomain, setActiveDomain] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Fetch domains
  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch(
          'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/domains/',
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setDomains(data)
      } catch (err: any) {
        setError('Failed to fetch domains')
        console.error(err)
      } finally {
        setLoadingDomains(false)
      }
    }
    fetchDomains()
  }, [])

  // Fetch agents
  useEffect(() => {
    async function fetchAgents() {
      setLoadingAgents(true)
      try {
        const url = new URL('https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/agents/')
        url.searchParams.set('limit', '100')
        url.searchParams.set('skip', '0')
        if (activeDomain !== 'All') {
          const domainObj = domains.find(d => d.name === activeDomain)
          if (domainObj) {
            url.searchParams.set('domain_id', domainObj.id)
          }
        }

        const res = await fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setAgents(data)
      } catch (err: any) {
        setError('Failed to fetch agents')
        console.error(err)
      } finally {
        setLoadingAgents(false)
      }
    }

    if (activeDomain === 'All' || domains.length > 0) {
      fetchAgents()
    }
  }, [activeDomain, domains])

  const handleAgentClick = (agent: Agent) => {
    if (agent.domain_id && agent.id) {
      console.log('✅ Domain ID:', agent.domain_id)
      console.log('✅ Agent ID:', agent.id)
      localStorage.setItem('selected_domain_id', agent.domain_id)
      localStorage.setItem('selected_agent_id', agent.id)
      router.push('/agent-doc-screener')
    } else {
      console.error('❌ Missing domain_id or agent id')
    }
  }

  const filteredAgents = agents.filter((agent) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      agent.name.toLowerCase().includes(searchLower) ||
      agent.description?.toLowerCase().includes(searchLower) ||
      agent.domain_name?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex h-full pt-16">
      {/* Sidebar: Domains */}
      <aside className="w-60 border-r border-gray-200 bg-muted/40 px-4 py-6 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Domains</h2>
        {loadingDomains && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <nav className="space-y-2">
          <Button
            key="all"
            variant={activeDomain === 'All' ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2 transition-colors',
              activeDomain === 'All'
                ? 'bg-[#eb5931] text-white hover:bg-[#f9755a]'
                : 'text-black hover:bg-[#F9866F] hover:text-white'
            )}
            onClick={() => setActiveDomain('All')}
          >
            <Globe className="w-4 h-4" />
            <span>All Domains</span>
          </Button>
          {domains.map((domain) => (
            <Button
              key={domain.id}
              variant={activeDomain === domain.name ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start gap-2 transition-colors',
                activeDomain === domain.name
                  ? 'bg-[#eb5931] text-white hover:bg-[#f9755a]'
                  : 'text-black hover:bg-[#F9866F] hover:text-white'
              )}
              onClick={() => setActiveDomain(domain.name)}
              title={domain.description}
            >
              <span>{domain.name}</span>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main: Agent Cards */}
      <main className="flex-1 overflow-y-auto p-6 border-l border-gray-200 md:border-l-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold text-gray-800">Discover Agents</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-auto">
            <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0 max-w-xs">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search agents..."
                className="pl-8 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="border-gray-300 text-black hover:bg-[#eb5931]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        {loadingAgents ? (
          <p className="text-gray-500">Loading agents...</p>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                onClick={() => handleAgentClick(agent)}
                className="cursor-pointer border hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-col items-start space-y-1 pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {agent.name}
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {agent.domain_name}
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p className="mb-2 line-clamp-3">{agent.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Published on {new Date(agent.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No agents found.</div>
        )}
      </main>
    </div>
  )
}
