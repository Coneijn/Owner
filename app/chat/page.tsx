import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ChatClient from "./chat-client"
import { getUserMessages, getChatContacts } from "@/app/actions/chat-actions"

export default async function ChatPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id
  const [messages, contacts] = await Promise.all([
    getUserMessages(userId),
    getChatContacts(userId)
  ])

  // 1. Obtener los IDs de los usuarios con los que ya hay mensajes
  const activeContactIds = new Set(
    messages.map((m: any) => 
      m.senderId === userId ? m.recipientId : m.senderId
    )
  )

  // 2. Filtrar la lista de contactos para dejar solo los activos
  const activeContacts = contacts.filter((c: any) => activeContactIds.has(c.id))

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
      <ChatClient 
        currentUserId={userId} 
        initialMessages={messages} 
        contacts={activeContacts} 
      />
    </div>
  )
}