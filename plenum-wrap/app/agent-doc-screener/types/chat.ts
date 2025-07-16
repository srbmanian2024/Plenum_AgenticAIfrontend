// types/chat.ts

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
  size?: number;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system'; // <--- MODIFIED: Added 'system'
  content: Array<{ type: 'text'; text: string; }>;
  createdAt?: Date;
  attachments?: Attachment[];
}

export interface ChatSection {
  id: string;
  userMessage: UIMessage;
  assistantMessages: UIMessage[];
}