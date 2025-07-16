'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import AnimatedMessage from './animated-message';
import { formatChatMessageContent } from '@/lib/utils/message-formatter'; // Import the formatter

// Import shared types
import { UIMessage, ChatSection } from '../types/chat'; // Assuming these are now in types/chat.ts

// Skeleton for dynamically showing placeholder messages
const AutoScalingChatSkeleton = () => (
  <div className="flex flex-col space-y-4 p-4 w-full max-w-2xl mx-auto">
    <div className="flex justify-end">
      <Skeleton className="h-8 w-2/3 rounded-xl bg-gray-200" />
    </div>
    <div className="flex justify-start">
      <Skeleton className="h-12 w-3/4 rounded-xl bg-gray-100 border border-gray-200" />
    </div>
    <div className="flex justify-end">
      <Skeleton className="h-10 w-1/2 rounded-xl bg-gray-200" />
    </div>
    <div className="flex justify-start">
      <Skeleton className="h-16 w-full rounded-xl bg-gray-100 border border-gray-200" />
    </div>
    <div className="flex justify-end">
      <Skeleton className="h-6 w-1/3 rounded-xl bg-gray-200" />
    </div>
  </div>
);

// Simplified RenderMessage component - Enhanced Styling
const RenderMessage = ({ message, children }: { message: UIMessage; children: React.ReactNode }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  let messageClass = '';
  let contentClass = 'rounded-xl p-3 shadow-sm max-w-[80%]';

  if (isUser) {
    messageClass = 'justify-end';
    contentClass += ' bg-amber-500 text-white';
  } else if (isSystem) {
    messageClass = 'justify-center';
    contentClass = 'text-gray-500 text-sm italic bg-transparent shadow-none p-1 max-w-full';
  } else { // Assistant message
    messageClass = 'justify-start';
    contentClass += ' bg-white text-gray-800 border border-gray-200';
  }

  return (
    <div className={`flex ${messageClass} mb-3`}>
      <div className={contentClass}>
        {children}
        {message.createdAt && !isSystem && (
          <p className="text-xs text-gray-300 mt-1 opacity-80">
            {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};


// Main ChatMessages component
interface ChatMessagesProps {
  sections: ChatSection[];
  onQuerySelect: (query: string) => void;
  status: 'initial' | 'submitted' | 'streaming' | 'done' | 'error'; // Directly use the string literal types
  chatId?: string;
  addToolResult?: (params: { toolCallId: string; result: any }) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onUpdateMessage?: (messageId: string, newContent: string) => Promise<void>;
  reload?: (messageId: string) => Promise<void | string | null | undefined>;
  isLoadingHistory: boolean; // New prop to indicate history loading
}

export function ChatMessages({
  sections,
  onQuerySelect,
  status,
  chatId,
  addToolResult,
  scrollContainerRef,
  onUpdateMessage,
  reload,
  isLoadingHistory // Destructure the new prop
}: ChatMessagesProps) {

  // Auto-scroll to bottom whenever sections change or status changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [sections, status, scrollContainerRef]);


  if (isLoadingHistory) {
    return <AutoScalingChatSkeleton />;
  }

  return (
    <div
      id="scroll-container"
      ref={scrollContainerRef}
      role="list"
      aria-roledescription="chat messages"
      className="relative flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pt-4 pb-24"
    >
      <div className="relative w-full">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            id={`section-${section.id}`}
            className="chat-section"
          >
            {/* User message is always rendered directly */}
            <RenderMessage message={section.userMessage}>
              {section.userMessage.content.map((part, index) => (
                <p key={index} className="whitespace-pre-wrap">{part.text}</p>
              ))}
            </RenderMessage>

            {/* Assistant messages */}
            {section.assistantMessages.map((assistantMessage, msgIndex) => {
              const formattedContent = formatChatMessageContent(assistantMessage.content[0]?.text || '');
              const isLastSection = sectionIndex === sections.length - 1;
              const isLastAssistantMessageInLastSection = isLastSection && msgIndex === section.assistantMessages.length - 1;
              const isCurrentlyStreaming = status === 'streaming' && isLastAssistantMessageInLastSection;

              return (
                <RenderMessage key={assistantMessage.id} message={assistantMessage}>
                  {/* If it's the last assistant message AND we are actively streaming, use AnimatedMessage */}
                  {isCurrentlyStreaming ? (
                    <AnimatedMessage
                      formattedHtmlMessage={formattedContent}
                      // onAnimationEnd can be removed or be a no-op as sequential animation is gone
                      onAnimationEnd={() => {}}
                    />
                  ) : (
                    // Otherwise, render content directly (historical or completed messages)
                    <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                  )}
                </RenderMessage>
              );
            })}

            {/* Show a basic skeleton for the *last* assistant message while it's still being streamed */}
            {status === 'streaming' && sectionIndex === sections.length - 1 && sections[sectionIndex].assistantMessages.length === 0 && (
                <DefaultSkeleton />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// The DefaultSkeleton remains the same for live streaming indication
const DefaultSkeleton = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-gray-100 text-gray-800 self-start rounded-xl p-3 max-w-[80%] animate-pulse border border-gray-200 shadow-sm">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);