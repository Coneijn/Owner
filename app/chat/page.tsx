import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ChatClient from "./chat-client"
import { getUserMessages, getChatContacts } from "@/app/actions/chat-actions"
import { prisma } from "@/lib/prisma"
import { sendMessage } from "@/app/actions/chat-actions" // Asegúrate de importar esto

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ initId?: string }> }) {
  const session = await auth()
  const { initId } = await searchParams; // Obtenemos el ID del dueño si viene de una propiedad
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  // --- INICIALIZACIÓN DE CONVERSACIÓN ---
  if (initId && initId !== userId) {
    // Enviamos un texto clave para inicializar en BD
    await sendMessage(userId, initId, "--initiate conversation--"); 
  }

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

  // 1.5 FORZAR CONTACTO: Aseguramos que el dueño aparezca en la barra lateral
  if (initId) {
    activeContactIds.add(initId);
  }

  // 2. Filtrar la lista de contactos para dejar solo los activos
  let activeContacts = contacts.filter((c: any) => activeContactIds.has(c.id))

  // --- GARANTÍA DE CONTACTO PARA WEB USERS ---
  // Si venimos de una propiedad y el dueño no está en la lista "activa", lo inyectamos manualmente
  if (initId && !activeContacts.find(c => c.id === initId)) {
    const targetUser = await prisma.user.findUnique({ 
      where: { id: initId },
      include: { sellerProfile: true }
    });
    
    if (targetUser) {
      activeContacts.push({
        id: targetUser.id,
        email: targetUser.email, 
        name: targetUser.sellerProfile?.sellerName || targetUser.name,
        role: targetUser.role
      });
    }
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
      <ChatClient 
        currentUserId={userId} 
        initialMessages={messages} 
        contacts={activeContacts} 
        isWebUser={session?.user?.profiles?.includes('WEB_USER')} 
      />
    </div>
  )
}