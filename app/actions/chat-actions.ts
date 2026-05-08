'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function getUserMessages(userId: string) {
  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { recipientId: userId }
      ]
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'asc' }
  })
}

export async function sendMessage(senderId: string, recipientId: string, content: string) {
  try {
    await prisma.message.create({
      data: { senderId, recipientId, content }
    })
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
  // Aquí puedes filtrar qué usuarios puede ver cada quién si lo deseas
  return await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: { id: true, name: true, email: true, role: true }
  })
}