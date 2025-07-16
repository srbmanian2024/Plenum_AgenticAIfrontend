// app/agent-doc-screener/hooks/use-chat-socket.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { UIMessage, ChatSection, Attachment } from '../types/chat'; // Import types

interface UseChatSocketProps {
  logChatMessage: (message: UIMessage) => Promise<void>;
  generateId: () => string;
  sessionId: string | null; // NEW: Session ID is now a prop
}

interface UseChatSocketReturn {
  sections: ChatSection[];
  setSections: React.Dispatch<React.SetStateAction<ChatSection[]>>;
  chatStatus: 'initial' | 'submitted' | 'streaming' | 'done' | 'error';
  socketRef: React.MutableRefObject<WebSocket | null>;
  currentStreamingSectionIdRef: React.MutableRefObject<string | null>;
  currentStreamingMessageIdRef: React.MutableRefObject<string | null>;
}

export const useChatSocket = ({ logChatMessage, generateId, sessionId }: UseChatSocketProps): UseChatSocketReturn => {
  const [sections, setSections] = useState<ChatSection[]>([]);
  const [chatStatus, setChatStatus] = useState<'initial' | 'submitted' | 'streaming' | 'done' | 'error'>('initial');
  const socketRef = useRef<WebSocket | null>(null);

  const currentStreamingSectionIdRef = useRef<string | null>(null);
  const currentStreamingMessageIdRef = useRef<string | null>(null);
  const currentMessageContentRef = useRef<string>('');

  const chatStatusRef = useRef(chatStatus);
  useEffect(() => {
    chatStatusRef.current = chatStatus;
  }, [chatStatus]);

  useEffect(() => {
    if (!sessionId) { // Only proceed if a sessionId is provided
      console.warn('🟡 useChatSocket: No session ID provided, skipping WebSocket initialization.');
      setChatStatus('initial'); // Reset status if session becomes null
      // Clear any existing socket reference if sessionId becomes null
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    // --- WebSocket Initialization ---
    // Ensure to close any existing socket before opening a new one
    if (socketRef.current) {
      console.log('🔄 Closing existing WebSocket before re-initializing for new session ID:', sessionId);
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket(
      `wss://doc-screener-rag.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/websocket/ws/chat?session_id=${sessionId}`
    );
    socketRef.current = socket; // Store the socket instance in a ref

    // --- Event Handlers ---
    socket.onopen = () => {
      console.log('✅ WebSocket Connected with session ID:', sessionId);
      setChatStatus('done'); // Set to done or ready after successful connection
    };

    socket.onmessage = (event) => {
      let chunk = event.data;

      if (typeof chunk !== 'string' || chunk.length === 0) {
        console.warn('Received empty or non-string chunk. Skipping.', chunk);
        return;
      }

      let metadata = null;
      const jsonIndex = chunk.indexOf('{"type":"final_response"');
      if (jsonIndex !== -1) {
        const jsonPart = chunk.slice(jsonIndex);
        chunk = chunk.slice(0, jsonIndex).trim();
        try {
          metadata = JSON.parse(jsonPart);
          console.log('📘 Final JSON Metadata:', metadata);
        } catch (e) {
          console.warn('❌ Failed to parse final_response JSON:', e);
        }
      }

      setChatStatus('streaming');
      currentMessageContentRef.current += chunk;

      setSections((prevSections) => {
        const updatedSections = [...prevSections];
        const lastSection = updatedSections[updatedSections.length - 1];

        if (!lastSection) {
            // This case should ideally be rare if logic in page.tsx is correct
            console.warn('No last section found for streaming. Creating new placeholder section.');
            const newSectionId = generateId();
            const newAssistantMessageId = generateId();
            currentStreamingSectionIdRef.current = newSectionId;
            currentStreamingMessageIdRef.current = newAssistantMessageId;
            currentMessageContentRef.current = chunk; // Start content accumulation with this chunk
            updatedSections.push({
                id: newSectionId,
                userMessage: { id: generateId(), role: 'user', content: [{ type: 'text', text: '' }], createdAt: new Date() },
                assistantMessages: [{
                    id: newAssistantMessageId,
                    role: 'assistant',
                    content: [{ type: 'text', text: currentMessageContentRef.current }],
                    createdAt: new Date(),
                }],
            });
            return updatedSections;
        }

        let lastAssistantMsg = lastSection.assistantMessages[lastSection.assistantMessages.length - 1];

        // If it's the first chunk for this assistant response, create the message object
        if (!lastAssistantMsg || lastAssistantMsg.role !== 'assistant' || currentStreamingMessageIdRef.current === null) {
            const newAssistantMessageId = generateId();
            lastAssistantMsg = {
                id: newAssistantMessageId,
                role: 'assistant',
                content: [{ type: 'text', text: currentMessageContentRef.current }], // Use accumulated content
                createdAt: new Date(),
            };
            lastSection.assistantMessages.push(lastAssistantMsg);
            currentStreamingMessageIdRef.current = newAssistantMessageId;
        } else {
            // Update the content of the existing streaming message with the accumulated content
            lastAssistantMsg.content[0].text = currentMessageContentRef.current;
        }

        if (metadata && currentStreamingMessageIdRef.current) {
          const finalAssistantMessage = lastSection.assistantMessages.find(
            (msg) => msg.id === currentStreamingMessageIdRef.current
          );
          if (finalAssistantMessage) {
            logChatMessage(finalAssistantMessage);
          }
          currentStreamingMessageIdRef.current = null;
          currentStreamingSectionIdRef.current = null;
          currentMessageContentRef.current = ''; // Clear accumulated content for next message
          setChatStatus('done');
        }

        return updatedSections;
      });
    };

    socket.onclose = () => {
      console.log('🔌 WebSocket Disconnected.');
      if (chatStatusRef.current === 'streaming' || chatStatusRef.current === 'submitted') {
        setSections(prevSections => {
            const updatedSections = [...prevSections];
            const lastSection = updatedSections[updatedSections.length - 1];
            const lastAssistantMessageContent = lastSection?.assistantMessages[lastSection.assistantMessages.length - 1]?.content[0]?.text || '';
            if (lastAssistantMessageContent.includes('❌ Disconnected from assistant.')) {
                return prevSections;
            }

            const newMessage: UIMessage = {
                id: generateId(),
                role: 'system',
                content: [{ type: 'text', text: '❌ Disconnected from assistant.' }],
                createdAt: new Date(),
            };

            if (lastSection && lastSection.userMessage.content[0].text !== '') {
                lastSection.assistantMessages.push(newMessage);
            } else {
                 updatedSections.push({
                    id: generateId(),
                    userMessage: { id: generateId(), role: 'user', content: [{ type: 'text', text: '' }] },
                    assistantMessages: [newMessage]
                });
            }
            return updatedSections;
        });
      }
      setChatStatus('done');
      currentStreamingSectionIdRef.current = null;
      currentStreamingMessageIdRef.current = null;
      currentMessageContentRef.current = '';
    };

    socket.onerror = (err) => {
      console.error('⚠️ WebSocket error:', err);
      setChatStatus('error');
      // toast.error('WebSocket connection error.', { description: String(err) });
      currentStreamingMessageIdRef.current = null;
      currentStreamingSectionIdRef.current = null;
      currentMessageContentRef.current = '';
    };

    // --- Cleanup Function ---
    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection during cleanup...');
        socketRef.current.close();
        socketRef.current = null;
      }
      currentStreamingSectionIdRef.current = null;
      currentStreamingMessageIdRef.current = null;
      currentMessageContentRef.current = '';
      setChatStatus('initial'); // Reset status on unmount/cleanup
    };
  }, [logChatMessage, generateId, sessionId]); // DEPEND ON sessionId to re-connect if it changes

  return { sections, setSections, chatStatus, socketRef, currentStreamingSectionIdRef, currentStreamingMessageIdRef };
};