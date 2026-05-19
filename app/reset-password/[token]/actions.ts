// app/reset-password/[token]/actions.ts
'use server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function updateRecoveredPassword(token: string, newPassword: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({ where: { token } });
    if (!verificationToken || verificationToken.expires < new Date()) {
      return { success: false, error: 'Enlace inválido.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword, forcePasswordChange: false }
    });

    // Eliminar token para que sea de un solo uso
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al actualizar la contraseña.' };
  }
}