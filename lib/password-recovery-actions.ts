// lib/password-recovery-actions.ts
'use server';

import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function requestPasswordRecovery(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'El correo electrónico es obligatorio.' };
  }

  try {
    // 1. Verificar si el usuario realmente existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Por seguridad, si no existe no le avisamos al atacante, 
    // pero detenemos el proceso simulando éxito.
    if (!user) {
      return { success: true, message: 'Si el correo existe, se ha enviado un enlace.' };
    }

    // 2. Generar el token de seguridad (Expiración en 2 horas para mayor seguridad)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); 

    // Guardar el token en la base de datos
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: token,
        expires: expiresAt
      }
    });

    // 3. Construir la nueva URL apuntando a la ruta de recuperación
    const recoveryUrl = `${process.env.AUTH_URL}/reset-password/${token}`;

    // 4. Enviar a GHL (Se recomienda usar un webhook dedicado para recuperación en tu CRM)
    const ghlRecoveryWebhookUrl = "https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/91a3c262-5ff7-4a96-9699-2a47ad3c2d7d"; 
    
    await fetch(ghlRecoveryWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        magic_link: recoveryUrl,
        action_type: 'PASSWORD_RECOVERY'
      }),
    });

    return { success: true, message: 'Se ha enviado un enlace de recuperación a tu correo.' };

  } catch (error) {
    console.error("Error en recuperar contraseña:", error);
    return { error: 'Ocurrió un error interno. Intenta más tarde.' };
  }
}