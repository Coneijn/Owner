// lib/user-actions.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateTwoFactorSecret, generateQrFromSecret, verifyTwoFactorToken } from '@/lib/otp'; // <--- Importa la nueva función
import { revalidatePath } from 'next/cache';

export async function setupTwoFactor() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  // 1. Verificar si ya existe un secreto "pendiente" en la DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { twoFactorSecret: true }
  });

  let secret = user?.twoFactorSecret;
  let qrCodeUrl = '';

  if (secret) {
    // 2A. Si YA existe, NO generamos uno nuevo. Reutilizamos el existente.
    // Esto evita que el "doble render" cambie el secreto mientras escaneas.
    console.log("♻️ Reutilizando secreto existente para evitar desajuste.");
    qrCodeUrl = await generateQrFromSecret(session.user.email, secret);
  } else {
    // 2B. Si NO existe, generamos uno nuevo.
    console.log("🆕 Generando nuevo secreto.");
    const generated = await generateTwoFactorSecret(session.user.email);
    secret = generated.secret;
    qrCodeUrl = generated.qrCodeUrl;

    await prisma.user.update({
      where: { email: session.user.email },
      data: { twoFactorSecret: secret }
    });
  }

  return { secret, qrCodeUrl };
}
// lib/user-actions.ts
// ... imports existentes

// --- DISABLE 2FA ---
export async function disableTwoFactor() {
    const session = await auth();
    if (!session?.user?.email) return { error: "No autorizado" };
  
    try {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { 
          isTwoFactorEnabled: false,
          twoFactorSecret: null // Borramos el secreto para obligar a escanear uno nuevo si lo reactivan
        }
      });
  
      revalidatePath('/admin/user_settings');
      return { success: true };
    } catch (error) {
      return { error: "Error al desactivar 2FA." };
    }
  }
export async function confirmTwoFactor(token: string) {
    // ... (Tu código de confirmTwoFactor queda igual)
    const session = await auth();
    if (!session?.user?.email) return { error: "No autorizado" };
  
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
  
    if (!user?.twoFactorSecret) return { error: "Configuración no iniciada" };
  
    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
  
    if (isValid) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { isTwoFactorEnabled: true }
      });
      revalidatePath('/admin/user_settings');
      return { success: true };
    } else {
      return { error: "Código inválido. Intenta de nuevo." };
    }
}