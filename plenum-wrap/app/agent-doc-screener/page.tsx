// app/agent-doc-screener/page.tsx
'use client';

import { AgentChatContainer } from './components/AgentChatContainer';

export default function NewChatPage() {
  // This page will always initiate a new chat by passing null for initialSessionId
  return <AgentChatContainer initialSessionId={null} />;
}