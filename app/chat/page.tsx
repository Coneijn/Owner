import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ChatClient from "./chat-client"
import { getUserMessages, getChatContacts } from "@/app/actions/chat-actions"
import { prisma } from "@/lib/prisma"
import { sendMessage } from "@/app/actions/chat-actions"

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ initId?: string }> }) {
  const session = await auth()
  const { initId } = await searchParams; 
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  if (initId && initId !== userId) {
    await sendMessage(userId, initId, "--initiate conversation--"); 
  }

  const [messages, contacts] = await Promise.all([
    getUserMessages(userId),
    getChatContacts(userId)
  ])

  // Saber si el usuario actual es ADMIN
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  const isAdmin = currentUser?.role === 'ADMIN';

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

  // --- NUEVA LÓGICA: INYECTAR BUZÓN DE SOPORTE PARA USUARIOS NORMALES ---
  if (!isAdmin) {
    activeContacts.unshift({
      id: 'soporte-general',
      name: 'Soporte de Plataforma',
      email: 'soporte@tuplataforma.com',
      role: 'ADMIN'
    });
  }

  // --- GARANTÍA DE CONTACTO PARA WEB USERS ---
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