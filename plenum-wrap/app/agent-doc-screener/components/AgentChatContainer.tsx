// app/agent-doc-screener/components/AgentChatContainer.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Import shared types
import { Attachment, UIMessage, ChatSection } from '../types/chat';

// Import new components and hooks
import { ChatMessages } from '../chat/chat-messages';
import { ChatInputBar } from '../chat/chat-input-bar';
import { useChatSocket } from '../hooks/use-chat-socket';

interface AgentChatContainerProps {
  initialSessionId: string | null;
}

export function AgentChatContainer({ initialSessionId }: AgentChatContainerProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);
  const [previewAttachments, setPreviewAttachments] = useState<Attachment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId);

  // --- Session ID Management and localStorage persistence ---
  useEffect(() => {
    let sessionIdToUse: string;

    if (initialSessionId) {
      // If an initialSessionId is provided (from history URL)
      sessionIdToUse = initialSessionId;
      localStorage.setItem('session_id', initialSessionId); // Ensure localStorage reflects current session
    } else {
      // If no initialSessionId, it's a new chat, generate a new UUID
      sessionIdToUse = uuidv4();
      localStorage.setItem('session_id', sessionIdToUse);
      setSections([]); // Ensure sections are empty for a new chat
    }
    setCurrentSessionId(sessionIdToUse);

    // Persist this session ID in the global list of known sessions for the current user
    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const key = `user_sessions_${userId}`;
        const storedSessionsJson = localStorage.getItem(key);
        let storedSessions: string[] = storedSessionsJson ? JSON.parse(storedSessionsJson) : [];

        // Add the new session ID if it's not already in the list
        if (!storedSessions.includes(sessionIdToUse)) {
          storedSessions.push(sessionIdToUse);
          localStorage.setItem(key, JSON.stringify(storedSessions));
        }
      } catch (e) {
        console.error('Failed to update localStorage for user sessions:', e);
      }
    } else {
        console.warn('Cannot persist session ID: user_id not found in localStorage.');
    }

  }, [initialSessionId]); // Depend on initialSessionId to re-run when changing from new to historical chat


  const logChatMessage = useCallback(async (message: UIMessage) => {
    // currentSessionId is now guaranteed to be a UUID if set
    const sessionIdToLog = currentSessionId;
    const userId = localStorage.getItem('user_id');
    const agentId = localStorage.getItem('selected_agent_id');

    if (!sessionIdToLog || !userId || !agentId) {
      console.warn('❌ Missing session_id, user_id, or agent_id. Cannot log chat message.', { sessionIdToLog, userId, agentId });
      return;
    }

    try {
      const response = await fetch(
        'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/chat/log',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionIdToLog,
            user_id: userId,
            sender: message.role,
            message: message.content[0].text,
            agent_id: agentId
          })
        }
      );

      if (!response.ok) {
        let errorDetails = `HTTP error! Status: ${response.status}`;
        try {
          const errorBody = await response.json();
          errorDetails += ` - ${JSON.stringify(errorBody)}`;
        } catch {
          errorDetails += ` - ${await response.text()}`;
        }
        throw new Error(errorDetails);
      }

      const result = await response.json();
      console.log(`✅ Chat message logged: ${message.role} - "${message.content[0].text.substring(0, 50)}..."`, result);

      // Trigger sidebar update ONLY if it's a user message and a new session's first message
      // or if an existing session's first message gets updated (less common, but possible if initial message was empty)
      if (message.role === 'user' && message.content[0].text.trim() !== '') {
          // You might need more sophisticated logic here if your backend API for history
          // only logs the first user message when the *first* message is logged.
          // For now, we'll assume dispatching this on every user message is fine for re-fetching.
          window.dispatchEvent(new CustomEvent('chatSessionUpdated', { detail: { sessionId: sessionIdToLog, firstUserMessage: message.content[0].text } }));
      }


    } catch (error) {
      console.error('❌ Failed to log chat message:', error);
      toast.error('Failed to log chat message.', { description: error instanceof Error ? error.message : String(error) });
    }
  }, [currentSessionId]);

  const generateId = useCallback(() => Math.random().toString(36).substring(2, 11), []);

  const {
    sections,
    setSections,
    chatStatus,
    socketRef,
    currentStreamingSectionIdRef,
    currentStreamingMessageIdRef,
  } = useChatSocket({
    logChatMessage,
    generateId,
    sessionId: currentSessionId,
  });

  // Fetch past chat history on load IF an initialSessionId is provided
  useEffect(() => {
    if (currentSessionId && initialSessionId === currentSessionId) {
      setIsLoadingHistory(true);

      const fetchPastMessages = async () => {
        try {
          const res = await fetch(
            `https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/chat/history/${currentSessionId}`,
            {
              headers: { Accept: 'application/json' },
              cache: 'no-store',
            }
          );
          if (!res.ok) throw new Error('Failed to fetch chat history');

          const messages = await res.json();

          const groupedSections: ChatSection[] = [];
          let currentSection: ChatSection | null = null;

          for (const msg of messages) {
            const formattedMsg: UIMessage = {
              id: msg.id,
              role: msg.sender,
              content: [{ type: 'text', text: msg.message }],
              createdAt: new Date(msg.timestamp),
            };

            if (msg.sender === 'user') {
              currentSection = {
                id: msg.id,
                userMessage: formattedMsg,
                assistantMessages: [],
              };
              groupedSections.push(currentSection);
            } else if (msg.sender === 'assistant' && currentSection) {
              currentSection.assistantMessages.push(formattedMsg);
            }
          }
          setSections(groupedSections);
        } catch (error) {
          console.error('❌ Error fetching past chats:', error);
          toast.error('Failed to load chat history.', { description: error instanceof Error ? error.message : String(error) });
        } finally {
          setIsLoadingHistory(false);
        }
      };

      fetchPastMessages();
    } else if (!currentSessionId) {
      setIsLoadingHistory(false);
      setSections([]);
    } else {
      setIsLoadingHistory(false);
      setSections([]);
    }
  }, [currentSessionId, initialSessionId, setSections]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFilesForUpload(files);

    const newPreviewAttachments: Attachment[] = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      contentType: file.type,
    }));
    setPreviewAttachments(newPreviewAttachments);

    if (files.length > 0) {
      toast.info(`${files.length} file(s) ready to be sent.`, { duration: 1000 });
    }
  }, []);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0 || !currentSessionId) return;

    for (const file of files) {
      // 1. Show a loading toast for the current file being uploaded
      const uploadToastId = toast.loading(`Uploading "${file.name}"...`, {
        duration: Infinity, // Keep open until manually updated
        id: `upload-${file.name}-${Date.now()}` // Unique ID for updating this specific toast
      });

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Add a user message to the chat indicating upload started (optional, but good for chat history)
        const uploadUserMessage: UIMessage = {
          id: generateId(),
          role: 'user',
          content: [{ type: 'text', text: `Uploading document: "${file.name}"...` }],
          createdAt: new Date(),
          attachments: [{ name: file.name, url: URL.createObjectURL(file), contentType: file.type }],
        };
        setSections(prevSections => [
          ...prevSections,
          { id: generateId(), userMessage: uploadUserMessage, assistantMessages: [] }
        ]);
        logChatMessage(uploadUserMessage);

        const response = await fetch(
          'https://doc-screener-rag.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/screener/v1/screener/analyze',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`File "${file.name}" upload success:`, result);

        // 2. Update the toast to a success message
        toast.success(`"${file.name}" uploaded successfully!`, { id: uploadToastId, duration: 3000 });

        // Send a message via WebSocket about the processed document (this goes to the agent)
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          // socketRef.current?.send(`Document "${file.name}" uploaded and processed for session ${currentSessionId}. Please summarize or answer questions based on it.`);
        } else {
            // Fallback warning if WebSocket isn't ready
            toast.warning('WebSocket not connected. Document uploaded, but communication with agent might be delayed.', { duration: 5000 });
            console.error('WebSocket is not open, cannot send file message to agent.');
        }

      } catch (error) {
        console.error(`Error uploading file "${file.name}":`, error);
        // 3. Update the toast to an error message
        toast.error(`Failed to upload "${file.name}".`, { id: uploadToastId, description: error instanceof Error ? error.message : String(error), duration: 5000 });
      }
    }
    // Clear selected files and previews after all attempts
    setSelectedFilesForUpload([]);
    setPreviewAttachments([]);
  }, [currentSessionId, setSections, generateId, logChatMessage, socketRef]);


  const handleSend = useCallback(() => {
    if ((input.trim() || selectedFilesForUpload.length > 0) && currentSessionId) {
      if (selectedFilesForUpload.length > 0) {
        uploadFiles(selectedFilesForUpload);
        if (!input.trim()) {
          setSelectedFilesForUpload([]);
          setPreviewAttachments([]);
          return;
        }
      }

      if (input.trim()) {
        const userMessageId = generateId();
        const newSectionId = generateId();
        const newUserMessage: UIMessage = {
          id: userMessageId,
          role: 'user',
          content: [{ type: 'text', text: input.trim() }],
          createdAt: new Date(),
          attachments: selectedFilesForUpload.length > 0 ? [...previewAttachments] : undefined,
        };

        setSections((prevSections) => {
          const newSection: ChatSection = {
            id: newSectionId,
            userMessage: newUserMessage,
            assistantMessages: [],
          };
          return [...prevSections, newSection];
        });

        logChatMessage(newUserMessage);

        currentStreamingSectionIdRef.current = newSectionId;
        currentStreamingMessageIdRef.current = null;

        const sendMessage = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current?.send(input.trim());
            } else {
                console.warn('WebSocket not open yet, retrying send...');
                toast.warning('Connecting to chat service, please wait a moment.', { duration: 2000 });
                setTimeout(sendMessage, 500);
            }
        }
        sendMessage();

        setInput('');
        setSelectedFilesForUpload([]);
        setPreviewAttachments([]);
      }
    } else if (!currentSessionId) {
        toast.error("Session not initialized. Please refresh the page.");
    }
  }, [input, selectedFilesForUpload, uploadFiles, currentSessionId, generateId, setSections, logChatMessage, currentStreamingSectionIdRef, socketRef, previewAttachments]);


  useEffect(() => {
    return () => {
      previewAttachments.forEach((att) => {
        if (att.url.startsWith('blob:')) {
          URL.revokeObjectURL(att.url);
        }
      });
    };
  }, [previewAttachments]);

  const showInitialGreeting = useMemo(() => {
    return !isLoadingHistory && sections.length === 0;
  }, [isLoadingHistory, sections]);

  const isSendButtonDisabled = input.trim() === '' && selectedFilesForUpload.length === 0;

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gradient-to-b from-white to-pink-50/50 p-4 font-inter">
      <div className="absolute top-4 right-4 z-10">
        <MoreHorizontal className="w-6 h-6 text-gray-500" />
      </div>

      {showInitialGreeting ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8">
            How can I help you today?
          </h1>
        </div>
      ) : (
        <ChatMessages
          sections={sections}
          onQuerySelect={() => {}}
          status={chatStatus}
          scrollContainerRef={scrollContainerRef}
          isLoadingHistory={isLoadingHistory}
        />
      )}

      <ChatInputBar
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleFilesSelected={handleFilesSelected}
        selectedFilesForUpload={selectedFilesForUpload}
        previewAttachments={previewAttachments}
        isSendButtonDisabled={isSendButtonDisabled}
      />
    </div>
  );
}