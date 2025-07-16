'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu
} from '@/components/ui/sidebar'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChatHistorySkeleton } from './chat-history-skeleton'
import { ChatMenuItem } from './chat-menu-item'
import { ClearHistoryAction } from './clear-history-action'

interface ChatHistoryItem {
  id: string
  session_id: string
  agent_id: string
  sender: 'user' | 'assistant'
  message: string
  timestamp: string
}

export function ChatHistoryClient() {
  const [chats, setChats] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchChatHistory = useCallback(async () => {
    const sessionId = localStorage.getItem('session_id')

    if (!sessionId) {
      toast.error('No session ID found in localStorage.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(
        `https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/chat/history/${sessionId}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const history: ChatHistoryItem[] = await response.json()
      setChats(history.reverse()) // Show latest first (optional)
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
      toast.error('Failed to load chat history.')
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChatHistory()
  }, [fetchChatHistory])

  const isHistoryEmpty = !isLoading && !chats.length && !hasError

  return (
    <div className="flex flex-col flex-1 h-full">
      <SidebarGroup>
        <div className="flex items-center justify-between w-full">
          <SidebarGroupLabel className="p-0">History</SidebarGroupLabel>
          <ClearHistoryAction empty={isHistoryEmpty} />
        </div>
      </SidebarGroup>

      <div className="flex-1 overflow-y-auto mb-2 relative">
        {isHistoryEmpty ? (
          <div className="px-2 text-foreground/30 text-sm text-center py-4">
            No chat history
          </div>
        ) : (
          <SidebarMenu>
            {chats.map(chat => (
              <ChatMenuItem
                key={chat.id}
                chat={{
                  title: chat.message.slice(0, 30) || 'No Title',
                  id: chat.id,
                  input: chat.sender === 'user' ? chat.message : '',
                  createdAt: new Date(chat.timestamp),
                  sender: chat.sender,
                  sessionId: chat.session_id
                }}
              />
            ))}
          </SidebarMenu>
        )}

        {isLoading && (
          <div className="py-2">
            <ChatHistorySkeleton />
          </div>
        )}
      </div>
    </div>
  )
}
