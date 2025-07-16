// app/sidebar/chat-history-section.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner'; // Import toast for error messages

interface ChatMessage {
  id: string;
  session_id: string;
  agent_id: string;
  sender: string;
  message: string;
  timestamp: string;
  response_time: number;
}

interface SessionPreview {
  session_id: string;
  first_user_message: string;
  last_activity_timestamp?: string; // We'll infer this or try to get it from the last message
}

export default function ChatHistorySection() {
  const [sessions, setSessions] = useState<SessionPreview[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to get known session IDs for the current user from localStorage
  const getKnownSessionIds = useCallback(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!userId) {
      console.warn('No user_id found in localStorage. Cannot get known sessions.');
      return [];
    }
    const key = `user_sessions_${userId}`;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse user sessions from localStorage:', e);
      return [];
    }
  }, []);

  // Main function to fetch chat session details
  const fetchChatSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    const knownSessionIds: string[] = getKnownSessionIds();

    if (knownSessionIds.length === 0) {
      setSessions([]);
      setIsLoadingSessions(false);
      return;
    }

    const fetchedSessionPreviews: SessionPreview[] = [];
    const errors: string[] = [];

    // Fetch details for each session ID
    for (const sessionId of knownSessionIds) {
      try {
        const res = await fetch(
          `https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/chat/history/${sessionId}`,
          {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          }
        );

        if (!res.ok) {
          // If a specific session's history isn't found (e.g., 404), skip it
          // or log an error for that specific session
          console.warn(`Failed to fetch history for session ${sessionId}: ${res.status} ${res.statusText}`);
          errors.push(`Session ${sessionId.substring(0, 4)}... failed to load.`);
          continue; // Skip to the next session
        }

        const messages: ChatMessage[] = await res.json();
        if (messages.length > 0) {
          // Find the first user message
          const firstUserMessageObj = messages.find(msg => msg.sender === 'user');
          const lastMessageTimestamp = messages[messages.length - 1]?.timestamp; // Get timestamp of the last message

          fetchedSessionPreviews.push({
            session_id: sessionId,
            first_user_message: firstUserMessageObj?.message || `No user message yet`,
            last_activity_timestamp: lastMessageTimestamp // Add last activity for sorting
          });
        } else {
            // If session exists but has no messages, still add it
            fetchedSessionPreviews.push({
                session_id: sessionId,
                first_user_message: `New Chat`,
                last_activity_timestamp: new Date().toISOString() // Default to now if no messages
            });
        }
      } catch (error) {
        console.error(`Error fetching history for session ${sessionId}:`, error);
        errors.push(`Error loading session ${sessionId.substring(0, 4)}...`);
      }
    }

    // Sort sessions by last activity timestamp (newest first)
    fetchedSessionPreviews.sort((a, b) => {
        if (a.last_activity_timestamp && b.last_activity_timestamp) {
            return new Date(b.last_activity_timestamp).getTime() - new Date(a.last_activity_timestamp).getTime();
        }
        return 0; // Maintain original order if timestamps are missing
    });

    setSessions(fetchedSessionPreviews);
    setIsLoadingSessions(false);

    if (errors.length > 0) {
        toast.error(`Some sessions could not be loaded: ${errors.join(', ')}`, { duration: 3000 });
    }
  }, [getKnownSessionIds]); // Depend on getKnownSessionIds (which is stable)


  useEffect(() => {
    fetchChatSessions();

    const handleChatSessionUpdated = () => {
      fetchChatSessions();
    };
    // Re-fetch sessions when a new message is logged (indicating a new/updated session)
    window.addEventListener('chatSessionUpdated', handleChatSessionUpdated);

    return () => {
      window.removeEventListener('chatSessionUpdated', handleChatSessionUpdated);
    };
  }, [fetchChatSessions]);


  const handleSessionClick = (session_id: string) => {
    // Set the clicked session as current in localStorage for AgentChatContainer
    localStorage.setItem('session_id', session_id);
    router.push(`/agent-doc-screener/history/${session_id}`);
  };

  const handleNewChat = () => {
    localStorage.removeItem('session_id'); // Clear current session ID to force a new chat
    router.push('/agent-doc-screener'); // Navigate to the new chat entry point
    // Manually trigger a re-fetch for the sidebar to ensure it knows the "new" chat might appear soon
    // Or, more robustly, rely on the `chatSessionUpdated` event when the first message is sent in the new chat.
    fetchChatSessions(); // Still useful to trigger immediately.
  };

  const currentActiveSessionId = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;

  return (
    <div className="p-4 space-y-2">
      <h2 className="font-bold text-md mb-3 flex items-center justify-between">
        📜 Past Sessions
        <button
          onClick={handleNewChat}
          className="ml-2 p-1 rounded-full hover:bg-gray-200 text-gray-600 transition flex items-center"
          title="Start a new chat"
        >
          <PlusCircle size={20} /> <span className="sr-only">New Chat</span>
        </button>
      </h2>

      {isLoadingSessions ? (
        <div className="text-gray-500 text-sm">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-gray-500 text-sm">No past sessions. Start a new chat!</div>
      ) : (
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => handleSessionClick(session.session_id)}
              className={`w-full text-left py-2 px-3 rounded transition ${
                // Highlight if this session ID matches the one in localStorage AND the current path is a history path
                session.session_id === currentActiveSessionId && pathname.startsWith('/agent-doc-screener/history/')
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-sm truncate">
                {session.first_user_message || `Session ${session.session_id.substring(0, 4)}...`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}