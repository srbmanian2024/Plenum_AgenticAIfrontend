// app/agent-docs-screener/components/AgentChatContainer.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Import PDF libraries
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react'; // Import Download icon for the button

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
  const scrollContainerRef = useRef<HTMLDivElement>(null); // This is the ref for your scrollable chat area

  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);
  const [previewAttachments, setPreviewAttachments] = useState<Attachment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId);

  // --- Session ID Management and localStorage persistence ---
  useEffect(() => {
    let sessionIdToUse: string;

    if (initialSessionId) {
      sessionIdToUse = initialSessionId;
      localStorage.setItem('session_id', initialSessionId);
    } else {
      sessionIdToUse = uuidv4();
      localStorage.setItem('session_id', sessionIdToUse);
      setSections([]);
    }
    setCurrentSessionId(sessionIdToUse);

    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const key = `user_sessions_${userId}`;
        const storedSessionsJson = localStorage.getItem(key);
        let storedSessions: string[] = storedSessionsJson ? JSON.parse(storedSessionsJson) : [];

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

  }, [initialSessionId]);


  const logChatMessage = useCallback(async (message: UIMessage) => {
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

      if (message.role === 'user' && message.content[0].text.trim() !== '') {
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
      const uploadToastId = toast.loading(`Uploading "${file.name}"...`, {
        duration: Infinity,
        id: `upload-${file.name}-${Date.now()}`
      });

      const formData = new FormData();
      formData.append('file', file);

      try {
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

        toast.success(`"${file.name}" uploaded successfully!`, { id: uploadToastId, duration: 3000 });

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          // socketRef.current?.send(`Document "${file.name}" uploaded and processed for session ${currentSessionId}. Please summarize or answer questions based on it.`);
        } else {
            toast.warning('WebSocket not connected. Document uploaded, but communication with agent might be delayed.', { duration: 5000 });
            console.error('WebSocket is not open, cannot send file message to agent.');
        }

      } catch (error) {
        console.error(`Error uploading file "${file.name}":`, error);
        toast.error(`Failed to upload "${file.name}".`, { id: uploadToastId, description: error instanceof Error ? error.message : String(error), duration: 5000 });
      }
    }
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


  // New function to handle PDF export
  const handleExportPdf = useCallback(async () => {
    if (!scrollContainerRef.current) {
      toast.error("Chat content not found for export.");
      return;
    }

    const exportToastId = toast.loading("Generating PDF...", { duration: Infinity });

    // Declare variables to store original styles and scroll position
    let originalOverflow = '';
    let originalScrollTop = 0;

    try {
      // Temporarily remove overflow-y to capture full content without scrollbars
      // Make sure to restore it in finally block
      originalOverflow = scrollContainerRef.current.style.overflowY;
      scrollContainerRef.current.style.overflowY = 'visible';
      // Adjust scroll position to top if needed to ensure all content is rendered correctly by html2canvas
      originalScrollTop = scrollContainerRef.current.scrollTop;
      scrollContainerRef.current.scrollTop = 0;


      const canvas = await html2canvas(scrollContainerRef.current, {
        scale: 2, // Increase scale for better quality (e.g., 2 for retina screens)
        useCORS: true, // Important if you have images from other domains
        // windowWidth: document.documentElement.offsetWidth, // Can help with scaling
        // windowHeight: document.documentElement.offsetHeight,
        logging: false, // Set to true for debugging html2canvas issues
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' size
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Handle multiple pages for long chats
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `chat-export-${currentSessionId?.substring(0, 8) || 'new-session'}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      toast.success("PDF generated successfully!", { id: exportToastId, duration: 3000 });

    } catch (error) {
      console.error('Failed to export chat to PDF:', error);
      toast.error('Failed to generate PDF.', { id: exportToastId, description: error instanceof Error ? error.message : String(error), duration: 5000 });
    } finally {
        // Restore original styles and scroll position
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.overflowY = originalOverflow;
            scrollContainerRef.current.scrollTop = originalScrollTop;
        }
    }
  }, [currentSessionId]); // Depend on currentSessionId for filename


  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gradient-to-b from-white to-pink-50/50 p-4 font-inter">
      <div className="absolute top-4 right-4 z-10 flex space-x-2"> {/* Added flex and space-x-2 */}
        <button
          onClick={handleExportPdf}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition"
          title="Export chat to PDF"
        >
          <Download className="w-6 h-6" />
        </button>
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
          scrollContainerRef={scrollContainerRef} // Pass the ref to ChatMessages
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