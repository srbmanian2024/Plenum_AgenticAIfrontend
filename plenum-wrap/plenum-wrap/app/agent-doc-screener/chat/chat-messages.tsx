'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button' // Assuming Shadcn UI Button
import { Input } from '@/components/ui/input'   // Assuming Shadcn UI Input
import { Skeleton } from '@/components/ui/skeleton' // Import Skeleton
import AnimatedMessage from './animated-message'; // Import the AnimatedMessage component
import { formatChatMessageContent } from '@/lib/utils/message-formatter'; // Import the new formatter

// --- MOCK INTERFACES AND COMPONENTS (TO SIMULATE @ai-sdk/react DEPENDENCIES) ---
interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: Array<{ type: 'text'; text: string; }>;
  createdAt?: Date;
}

interface ChatSection {
  id: string;
  userMessage: UIMessage;
  assistantMessages: UIMessage[];
}

interface MockUseChatHelpers {
  status: 'initial' | 'submitted' | 'streaming' | 'done' | 'error';
}

// Simplified RenderMessage component - Enhanced Styling
// This component now only handles the styling of the message bubble.
// The animation logic is moved to ChatMessages.
const RenderMessage = ({ message, children }: { message: UIMessage; children: React.ReactNode }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  let messageClass = '';
  let contentClass = 'rounded-xl p-3 shadow-sm max-w-[80%]'; // Base styling for content bubble

  if (isUser) {
    messageClass = 'justify-end';
    contentClass += ' bg-blue-500 text-white'; // User message color
  } else if (isSystem) {
    messageClass = 'justify-center'; // Center system messages
    contentClass = 'text-gray-500 text-sm italic bg-transparent shadow-none p-1 max-w-full'; // System message styling
  } else { // Assistant message
    messageClass = 'justify-start';
    contentClass += ' bg-white text-gray-800 border border-gray-200'; // Assistant message color
  }

  return (
    <div className={`flex ${messageClass} mb-3`}>
      <div className={contentClass}>
        {children} {/* Render children (either plain text or AnimatedMessage) */}
        {message.createdAt && !isSystem && ( // Don't show timestamp for system messages
          <p className="text-xs text-gray-300 mt-1 opacity-80">{message.createdAt.toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
};

// Mock DefaultSkeleton component for streaming assistant messages
const DefaultSkeleton = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-gray-100 text-gray-800 self-start rounded-xl p-3 max-w-[80%] animate-pulse border border-gray-200 shadow-sm">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Skeleton for the initial 3-second buffer
const InitialLoadingSkeleton = () => (
  <div className="flex flex-col space-y-4 p-4 w-full max-w-2xl mx-auto">
    <Skeleton className="h-8 w-1/2 rounded-md bg-gray-200" />
    <Skeleton className="h-4 w-3/4 rounded-md bg-gray-200" />
    <Skeleton className="h-4 w-2/3 rounded-md bg-gray-200" />
    <Skeleton className="h-4 w-1/2 rounded-md bg-gray-200" />
    <Skeleton className="h-8 w-full rounded-md bg-gray-200" />
    <Skeleton className="h-4 w-2/3 rounded-md bg-gray-200" />
    <Skeleton className="h-4 w-1/4 rounded-md bg-gray-200" />
  </div>
);


// --- END MOCK INTERFACES AND COMPONENTS ---


// Main ChatMessages component
interface ChatMessagesProps {
  sections: ChatSection[];
  onQuerySelect: (query: string) => void;
  status: MockUseChatHelpers['status'];
  chatId?: string;
  addToolResult?: (params: { toolCallId: string; result: any }) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onUpdateMessage?: (messageId: string, newContent: string) => Promise<void>;
  reload?: (messageId: string) => Promise<void | string | null | undefined>;
}

export function ChatMessages({
  sections,
  onQuerySelect,
  status,
  chatId,
  addToolResult,
  scrollContainerRef,
  onUpdateMessage,
  reload
}: ChatMessagesProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [animatedMessageIndex, setAnimatedMessageIndex] = useState(0); // Tracks which assistant message is currently animating
  const [allMessagesRendered, setAllMessagesRendered] = useState(false); // New state to track if all messages are fully rendered

  // Simulate initial 3-second loading buffer
  useEffect(() => {
    const initialLoadTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // 3-second buffer

    return () => clearTimeout(initialLoadTimer);
  }, []);

  // Effect to manage sequential animation of assistant messages
  useEffect(() => {
    if (isInitialLoading || sections.length === 0) {
      return; // Don't start animating until initial load is done and there are sections
    }

    // Flatten all assistant messages from all sections into a single array for sequential animation
    const allAssistantMessages = sections.flatMap(section =>
      section.assistantMessages.filter(msg => msg.role === 'assistant')
    );

    if (animatedMessageIndex < allAssistantMessages.length) {
      setAllMessagesRendered(false); // More messages to animate
    } else if (allAssistantMessages.length > 0) {
      setAllMessagesRendered(true); // All assistant messages have been animated
    }

  }, [isInitialLoading, sections, animatedMessageIndex]);


  // Callback for when an AnimatedMessage finishes its animation
  const handleAnimationEnd = () => {
    // Increment the index to trigger the next message's animation
    setAnimatedMessageIndex(prevIndex => prevIndex + 1);
  };

  // Scroll to bottom whenever sections change or animation progresses
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [sections, animatedMessageIndex, isInitialLoading]);


  if (isInitialLoading) {
    return <InitialLoadingSkeleton />;
  }

  // Determine if the streaming skeleton should be shown for the *last* assistant message
  const showStreamingSkeleton =
    status === 'streaming' &&
    sections.length > 0 &&
    sections[sections.length - 1].assistantMessages.length > 0 &&
    !allMessagesRendered; // Only show if not all messages are fully rendered yet

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

            {/* Assistant messages - controlled by animation logic */}
            {section.assistantMessages.map((assistantMessage, msgIndex) => {
              // Flattened index for sequential animation across all sections
              // This logic needs to correctly identify the current message's position
              // in the overall sequence of *all* assistant messages.
              let flatAssistantMessages: UIMessage[] = [];
              for (let i = 0; i <= sectionIndex; i++) {
                  flatAssistantMessages = flatAssistantMessages.concat(
                      sections[i].assistantMessages.filter(msg => msg.role === 'assistant')
                  );
              }
              const currentFlatIndex = flatAssistantMessages.findIndex(msg => msg.id === assistantMessage.id);


              // Only render messages up to the current animatedMessageIndex
              if (currentFlatIndex > animatedMessageIndex) {
                return null; // Don't render yet
              }

              // Format the message content before passing to AnimatedMessage
              const formattedContent = formatChatMessageContent(assistantMessage.content[0]?.text || '');

              return (
                <RenderMessage key={assistantMessage.id} message={assistantMessage}>
                  {/* If this is the message currently being animated, use AnimatedMessage */}
                  {currentFlatIndex === animatedMessageIndex && !allMessagesRendered ? (
                    <AnimatedMessage
                      formattedHtmlMessage={formattedContent} // Pass formatted HTML
                      onAnimationEnd={handleAnimationEnd}
                    />
                  ) : (
                    // Otherwise, render content directly (already animated or system message)
                    <div dangerouslySetInnerHTML={{ __html: formattedContent }} /> // Render formatted HTML directly
                  )}
                </RenderMessage>
              );
            })}

            {/* Show streaming skeleton only if the last message is still being streamed */}
            {showStreamingSkeleton && sectionIndex === sections.length - 1 && (
              <DefaultSkeleton />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
