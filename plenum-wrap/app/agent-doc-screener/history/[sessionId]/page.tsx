// app/agent-doc-screener/history/[sessionId]/page.tsx
'use client';

import { AgentChatContainer } from '../../components/AgentChatContainer'; // Adjust path
import { useParams } from 'next/navigation';

export default function HistoryChatPage() {
  const params = useParams();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;

  if (!sessionId) {
    // Handle case where sessionId is not available in URL (e.g., redirect to new chat)
    // You might want to display an error or redirect here
    return <div>Error: Chat session ID not found in URL.</div>;
  }

  // Pass the sessionId from the URL to the AgentChatContainer
  return <AgentChatContainer initialSessionId={sessionId} />;
}