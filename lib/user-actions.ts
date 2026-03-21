// lib/user-actions.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { 
  generateTwoFactorSecret, 
  generateQrFromSecret, 
  verifyTwoFactorToken 
} from '@/lib/otp'; 

export async function updateAgentProfile(id: string, data: { agentImage: string }) {
  await prisma.agentProfile.update({
    where: { id },
    data: {
      agentImage: data.agentImage,
    },
  });
}
// ==========================================
// 1. CAMBIAR MI CONTRASEÑA
// ==========================================
export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: 'No autorizado' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Las nuevas contraseñas no coinciden.' };
  }

  if (newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { error: 'Usuario no encontrado.' };

  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) {
    return { error: 'La contraseña actual es incorrecta.' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email: session.user.email },
    data: { 
      password: hashedPassword,
      forcePasswordChange: false // <-- AÑADIDO: Libera al usuario del primer paso de Onboarding
    },
  });

  revalidatePath('/admin/user_settings');
  return { success: true };
}

// ==========================================
// 2. CREAR USUARIO 
// ==========================================
export async function createUser(formData: FormData) {
  const session = await auth();
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Obtenemos el valor exacto del select ('admin', 'seller', 'agent')
  const rawRole = formData.get('role') as string; 
  
  // A nivel base de datos (modelo User), el rol sigue siendo ADMIN o USER
  const baseRole = (rawRole === 'admin' ? 'ADMIN' : 'USER') as Role;

  if (!email || !password || !name) return { error: 'Todos los campos son obligatorios.' };

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: 'El correo ya está registrado.' };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: baseRole, 
        
        // 👇 CREACIÓN CONDICIONAL DE PERFILES (El Admin queda exento)
        ...(rawRole === 'agent' && {
          agentProfile: {
            create: { agentName: name }
          }
        }),
        ...(rawRole === 'seller' && {
          sellerProfile: {
            create: { 
              sellerName: name,
              sellerType: 'OWNER' // Por defecto lo asignamos como OWNER
            }
          }
        }),
        // Si rawRole === 'admin', simplemente no se ejecuta ninguna de las dos 
        // y se crea un User normal con role: ADMIN.
        ...(rawRole === 'buyer' && {
          buyerProfile: {
            create: {
              firstName: name.trim().split(' ')[0] || 'buyer', // Toma la primera palabra
              lastName: name.trim().split(' ').slice(1).join(' ') || ''
            }
          }
        }),

      },
    });
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear usuario en base de datos.' };
  }

  revalidatePath('/admin/user_settings');
  return { success: true, tempPassword: password }; 
}
// ==========================================
// 3. ELIMINAR USUARIO
// ==========================================
export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: 'No autorizado' };

  try {
    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
    if (userToDelete?.email === session.user.email) {
        return { error: 'No puedes eliminar tu propia cuenta desde aquí.' };
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    
    revalidatePath('/admin/user_settings');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar usuario.' };
  }
}

// ==========================================
// 4. RESETEAR PASSWORD 
// ==========================================
export async function resetUserPassword(userId: string) {
  const newRawPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
  const hashedPassword = await bcrypt.hash(newRawPassword, 10);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        forcePasswordChange: true // <-- AÑADIDO: Lo obliga a cambiarla cuando vuelva a entrar
      },
    });
    
    revalidatePath('/admin/user_settings');
    return { success: true, newPassword: newRawPassword };
  } catch (error) {
    console.error(error);
    return { error: 'Error al restablecer la contraseña.' };
  }
}

// ==========================================
// 5. GESTIÓN 2FA 
// ==========================================
export async function setupTwoFactor() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { twoFactorSecret: true }
  });

  let secret = user?.twoFactorSecret;
  let qrCodeUrl = '';

  if (secret) {
    qrCodeUrl = await generateQrFromSecret(session.user.email, secret);
  } else {
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

export async function confirmTwoFactor(token: string) {
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

export async function disableTwoFactor() {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autorizado" };

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        isTwoFactorEnabled: false,
        twoFactorSecret: null 
      }
    });

    revalidatePath('/admin/user_settings');
    return { success: true };
  } catch (error) {
    return { error: "Error al desactivar 2FA." };
  }
}