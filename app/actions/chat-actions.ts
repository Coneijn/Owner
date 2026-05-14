'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from "next/cache"
import { chatEmitter } from "@/lib/chat-events"

const prisma = new PrismaClient()

export async function getUserMessages(userId: string) {
  // 1. Verificamos si el usuario que está pidiendo los mensajes es ADMIN
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  const isAdmin = user?.role === 'ADMIN';

  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { recipientId: userId },
        // Si es admin, inyectamos la condición para traer también los nulos
        ...(isAdmin ? [{ recipientId: null }] : [])
      ]
    },
    include: {
      // Agregamos role: true para poder identificar respuestas de soporte
      sender: { select: { id: true, name: true, email: true, role: true } },
      recipient: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'asc' }
  })
}

// Permitimos que recipientId sea null
export async function sendMessage(senderId: string, recipientId: string | null, content: string) {
  try {
    const newMessage = await prisma.message.create({
      data: { senderId, recipientId, content },
      include: {
        // Agregamos role: true aquí también
        sender: { select: { id: true, name: true, email: true, role: true } },
        recipient: { select: { id: true, name: true, email: true, role: true } }
      }
    })
    
    // Disparamos evento al emisor
    chatEmitter.emit(`message-${senderId}`, newMessage)

    // Si hay receptor específico, avisamos a ese usuario. Si es nulo, avisamos a admins.
    if (recipientId) {
      chatEmitter.emit(`message-${recipientId}`, newMessage)
    } else {
      chatEmitter.emit(`message-admins`, newMessage) 
    }

    revalidatePath('/chat')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error al enviar mensaje" }
  }
}

export async function markAsRead(messageIds: string[]) {
  await prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: { isRead: true }
  })
  revalidatePath('/chat')
}

export async function getChatContacts(currentUserId: string) {
  return await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: { id: true, name: true, email: true, role: true }
  })
}