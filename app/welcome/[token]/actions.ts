'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Definimos explícitamente lo que devuelve esta función
export async function setupNewPassword(
  token: string, 
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { success: false, error: 'El enlace ha expirado o es inválido.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        password: hashedPassword,
        forcePasswordChange: false 
      }
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return { success: true };
  } catch (error) {
    console.error("Error setting up password:", error);
    return { success: false, error: 'Ocurrió un error interno al guardar la contraseña.' };
  }
}