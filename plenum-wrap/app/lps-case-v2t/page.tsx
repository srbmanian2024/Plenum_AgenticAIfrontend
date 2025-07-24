// app/lps-case-v2t/page.tsx
import { getHumeAccessToken } from "@/app/lps-case-v2t/utils/getHumeAccessToken";
// Remove the direct dynamic import of Chat
// import dynamic from "next/dynamic"; // No longer needed here if only used for Chat
// const Chat = dynamic(() => import("@/components/Chat"), { ssr: false, });

// Import your new ClientChatWrapper instead
import ClientChatWrapper from "@/app/lps-case-v2t/components/ClientChatWrapper"; // Adjust path if you put ClientChatWrapper elsewhere

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error('Unable to get access token');
  }

  return (
    <div className={"grow flex flex-col"}>
      {/* Render the ClientChatWrapper, passing the accessToken */}
      {/* The ClientChatWrapper will then handle the dynamic import of Chat */}
      <ClientChatWrapper accessToken={accessToken} />
    </div>
  );
}