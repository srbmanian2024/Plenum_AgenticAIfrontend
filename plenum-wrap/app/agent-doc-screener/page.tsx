'use client'

import { Button } from '@/components/ui/button' // Assuming Shadcn UI Button
import { Input } from '@/components/ui/input' // Assuming Shadcn UI Input
import {
  ArrowUp,
  MessageCircle, // Icon for Send button
  MoreHorizontal, // Icon for the top center "..." // Icon for Search button
  Paperclip, // Icon for GPT model
  Search
} from 'lucide-react' // Lucide React for icons
import { useEffect, useMemo, useRef, useState } from 'react'

import { ChatMessages } from './chat/chat-messages' // Import the updated ChatMessages component

// --- MOCK INTERFACES AND COMPONENTS (TO SIMULATE @ai-sdk/react DEPENDENCIES) ---
// Simplified UIMessage interface for text content
interface UIMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system' // Added 'system' for initial messages
  content: Array<{ type: 'text'; text: string }>
  createdAt?: Date // Added for potential sorting/timestamping
}

// Simplified ChatSection interface
interface ChatSection {
  id: string
  userMessage: UIMessage
  assistantMessages: UIMessage[]
}

// Mock UseChatHelpers status (only relevant parts for this example)
interface MockUseChatHelpers {
  status: 'initial' | 'submitted' | 'streaming' | 'done' | 'error'
}

// --- END MOCK INTERFACES AND COMPONENTS ---

// Main AgentChat Component
export default function AgentChat() {
  // State to manage chat sections (user message + assistant responses for a turn)
  const [sections, setSections] = useState<ChatSection[]>([])
  // State for the current input message
  const [input, setInput] = useState('')
  // Ref for the scroll container to enable scrolling to the bottom
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  // Ref for the WebSocket connection
  const socketRef = useRef<WebSocket | null>(null)
  // State for the chat status (mimicking UseChatHelpers['status'])
  const [chatStatus, setChatStatus] =
    useState<MockUseChatHelpers['status']>('initial')

  // Refs to track the current section and message being streamed
  const currentStreamingSectionIdRef = useRef<string | null>(null)
  const currentStreamingMessageIdRef = useRef<string | null>(null)

  // Helper to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 11)

  // useEffect for WebSocket connection setup and teardown
  useEffect(() => {
    setChatStatus('initial')
    const socket = new WebSocket(
      'wss://doc-screener-rag.livelywave-29b8c618.uaenorth.azurecontainerapps.io/v1/websocket/ws/chat'
    )
    socketRef.current = socket

    socket.onopen = () => {
      console.log('WebSocket Connected.')
      // Add a system message to the chat history when connected
      appendMessageToSections({
        role: 'system',
        text: '✅ Connected to GPT-4o mini assistant.'
      })
      setChatStatus('done') // Set to done after initial system message
    }

    socket.onmessage = event => {
      const chunk = event.data

      setChatStatus('streaming')

      setSections(prevSections => {
        let updatedSections = [...prevSections]

        let lastSection = updatedSections[updatedSections.length - 1]

        if (!lastSection) return updatedSections

        let assistantMessages = lastSection.assistantMessages

        let lastAssistantMsg = assistantMessages[assistantMessages.length - 1]

        if (!lastAssistantMsg || lastAssistantMsg.role !== 'assistant') {
          // Create only one assistant message per section

          const newAssistantMessageId = generateId()

          assistantMessages.push({
            id: newAssistantMessageId,

            role: 'assistant',

            content: [{ type: 'text', text: chunk }],

            createdAt: new Date()
          })

          currentStreamingMessageIdRef.current = newAssistantMessageId
        } else {
          // Append only if not duplicate

          if (!lastAssistantMsg.content[0].text.endsWith(chunk)) {
            lastAssistantMsg.content[0].text += chunk
          }
        }

        return updatedSections
      })
    }

    socket.onclose = () => {
      console.log('WebSocket Disconnected.')
      appendMessageToSections({
        role: 'system',
        text: '❌ Disconnected from assistant.'
      })
      setChatStatus('done')
      currentStreamingSectionIdRef.current = null
      currentStreamingMessageIdRef.current = null
    }

    socket.onerror = err => {
      console.error('WebSocket error:', err)
      appendMessageToSections({
        role: 'system',
        text: '⚠️ WebSocket error occurred.'
      })
      setChatStatus('error')
      currentStreamingSectionIdRef.current = null
      currentStreamingMessageIdRef.current = null
    }

    return () => {
      socket.close()
    }
  }, [])

  // Helper to append a generic message (used for system messages)
  const appendMessageToSections = ({
    role,
    text
  }: {
    role: 'user' | 'assistant' | 'system'
    text: string
  }) => {
    setSections(prevSections => {
      const newId = generateId()
      if (role === 'system') {
        return [
          ...prevSections,
          {
            id: newId,
            userMessage: {
              id: generateId(),
              role: 'user',
              content: [{ type: 'text', text: '' }]
            }, // Dummy user message for system message section
            assistantMessages: [
              {
                id: newId,
                role: 'system',
                content: [{ type: 'text', text: text }],
                createdAt: new Date()
              }
            ]
          }
        ]
      }
      return prevSections // Should not be hit for user/assistant messages handled by handleSend/onmessage
    })
  }

  // Handle sending a message
  const handleSend = () => {
    if (input.trim()) {
      const userMessageId = generateId()
      const newSectionId = generateId()

      // Create a new section for the user's turn
      setSections(prevSections => [
        ...prevSections,
        {
          id: newSectionId,
          userMessage: {
            id: userMessageId,
            role: 'user',
            content: [{ type: 'text', text: input.trim() }],
            createdAt: new Date()
          },
          assistantMessages: [] // Assistant messages will be streamed into this
        }
      ])

      // Set current streaming context
      currentStreamingSectionIdRef.current = newSectionId
      currentStreamingMessageIdRef.current = null // Reset for new AI message

      // Send message via WebSocket
      socketRef.current?.send(input.trim())
      setChatStatus('submitted') // Indicate that a message has been sent

      // Clear the input field
      setInput('')
    }
  }

  // Determine if the initial greeting ("How can I help you today?") should be shown
  const showInitialGreeting = useMemo(() => {
    // Show greeting if there are no user messages (excluding dummy user messages for system sections)
    return sections.every(
      section =>
        section.userMessage.content[0].text === '' ||
        section.userMessage.content[0].text === '...'
    )
  }, [sections])

  return (
    // Main container for the entire page, with background gradient and centering
    // h-screen ensures it takes full viewport height, flex-col for vertical layout
    <div className="flex flex-col items-center justify-between h-screen bg-gradient-to-b from-white to-pink-50/50 p-4 font-inter">
      {/* Top right "..." icon */}
      <div className="absolute top-4 right-4 z-10">
        <MoreHorizontal className="w-6 h-6 text-gray-500" />
      </div>

      {/* Conditional rendering of initial greeting or ChatMessages */}
      {showInitialGreeting ? (
        // Initial greeting centered in the available space
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8">
            How can I help you today?
          </h1>
        </div>
      ) : (
        // Render ChatMessages when there's actual chat history
        // flex-1 makes it take all available space between header and input
        <ChatMessages
          sections={sections}
          onQuerySelect={() => {}} // Placeholder
          status={chatStatus}
          scrollContainerRef={scrollContainerRef}
          // Other props are optional for this basic setup
        />
      )}

      {/* Input Box Area - styled to match the image, fixed at bottom */}
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-lg flex items-center p-2 gap-2 mb-4 relative z-10">
        {/* GPT Model Selector (Mimicking the image) */}
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-gray-700 px-3 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Agent Doc Summarizer</span>
        </Button>

        {/* Main Message Input */}
        <Input
          id="message"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-500 text-base"
        />

        {/* Action Buttons */}
        <Button
          variant="ghost"
          className="p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-200"
        >
          <Search className="w-4 h-4" />
          <span className="ml-1 text-sm hidden sm:inline">Search</span>{' '}
          {/* Hide text on small screens */}
        </Button>
        <Button
          variant="ghost"
          className="p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-200"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleSend}
          className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
