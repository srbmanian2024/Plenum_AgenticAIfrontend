import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat-db'
import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getModels } from '@/lib/config/models'
import { UIMessage } from 'ai'
import { notFound, redirect } from 'next/navigation'

export const maxDuration = 60

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const userId = await getCurrentUserId()

  const chat = await getChat(id, userId)

  if (!chat) {
    return { title: 'Search' }
  }

  return {
    title: chat.title.toString().slice(0, 50) || 'Search'
  }
}

export default async function SearchPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const userId = await getCurrentUserId()

  const chat = await getChat(id, userId)

  if (!chat) {
    notFound()
  }

  if (chat.visibility === 'private' && !userId) {
    redirect('/auth/login')
  }

  const messages: UIMessage[] = chat.messages.map(message => ({
    id: message.id,
    parts: message.parts as UIMessage['parts'],
    role: message.role as UIMessage['role'],
    metadata: {
      createdAt: new Date(message.createdAt)
    }
  }))

  const models = await getModels()
  return <Chat id={id} savedMessages={messages} models={models} />
}
