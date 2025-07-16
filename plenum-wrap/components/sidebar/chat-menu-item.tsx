// components/sidebar/chat-menu-item.tsx (or wherever your ChatMenuItem is located)
'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { Chat as DBChat } from '@/lib/db/schema' // Assuming DBChat is defined here
import { cn } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSelectedLayoutSegment } from 'next/navigation'
interface ChatMenuItemProps {
  chat: {
    title: string
    id: string
    input: string
    createdAt: Date
    sender?: string
    sessionId?: string
  }
}

export function ChatMenuItem({ chat }: ChatMenuItemProps) {
  const { id } = useParams() // Get the current session ID from the URL if navigating within a chat
  const segment = useSelectedLayoutSegment(); // Get the current segment to check if we're on the chat page

  // Determine if this chat item corresponds to the currently active chat session
  // This assumes `chat.id` is the session_id
  const isActive = id === chat.id || (segment === 'agent-doc-screener' && !id && chat.id === localStorage.getItem('session_id'));

  return (
    <SidebarMenuButton asChild>
      {/* Link to the chat page with the chat's ID as a query parameter */}
      {/* Or directly as a path parameter if your routing allows: /agent-doc-screener/[sessionId] */}
      <Link
        href={`/agent-doc-screener?session_id=${chat.id}`}
        className={cn(
          'group flex items-center justify-between rounded-md p-2 text-sm',
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageCircle className="size-4 shrink-0" />
          <span className="truncate">
            {/* Display the chat title or a truncated version of the first message */}
            {chat.title || `Chat Session ${chat.id.substring(0, 8)}...`}
          </span>
        </div>
        {/* You can add a button for more actions here, like delete or rename */}
        {/* <div className="ml-2 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="size-4" />
        </div> */}
      </Link>
    </SidebarMenuButton>
  )
}