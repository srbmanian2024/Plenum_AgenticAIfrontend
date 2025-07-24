// src/components/ClientChatWrapper.tsx
"use client"; // <<< ABSOLUTELY ESSENTIAL: This marks it as a Client Component

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Dynamically import your actual Chat component.
// Adjust the import path if your Chat component is somewhere else,
// e.g., if it's in "@/app/lps-case-v2t/components/Chat" based on your earlier snippet.
// For now, I'll use "@/components/Chat" to match your current page.tsx.
const Chat = dynamic(() => import("@/app/lps-case-v2t/components/Chat"), {
  ssr: false, // This is now allowed because ClientChatWrapper is a Client Component
});

// Define the props that the Chat component expects.
// This interface should match the props that Chat takes (e.g., accessToken).
interface ChatPropsForClientWrapper {
  accessToken: string;
  // Add any other props Chat might accept here
}

export default function ClientChatWrapper(props: ChatPropsForClientWrapper) {
  // Pass all props down to the dynamically imported Chat component
  return <Chat {...props} />;
}