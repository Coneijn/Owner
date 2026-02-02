'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

// --- 1. CAMBIAR MI CONTRASEÑA ---
export async function updateOwnPassword(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autorizado' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { message: 'Las nuevas contraseñas no coinciden.' };
  }

  if (newPassword.length < 6) {
    return { message: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  // Buscar usuario en BD para obtener el hash actual
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { message: 'Usuario no encontrado.' };

  // Verificar contraseña actual
  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) {
    return { message: 'La contraseña actual es incorrecta.' };
  }

  // Hashear y guardar nueva
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashedPassword },
  });

  revalidatePath('/admin/user_settings');
  return { message: 'Contraseña actualizada correctamente.', success: true };
}

// --- 2. CREAR NUEVO USUARIO ---
export async function createNewUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || !name) return { message: 'Todos los campos son obligatorios.' };

  // Verificar si ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { message: 'El correo ya está registrado.' };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN', // Por defecto todos admin como solicitaste
      },
    });
  } catch (error) {
    return { message: 'Error al crear usuario.' };
  }

  revalidatePath('/admin/user_settings');
  return { message: 'Usuario creado exitosamente.', success: true };
}

// --- 3. RESTABLECER CONTRASEÑA (ADMIN OVERRIDE) ---
export async function adminResetPassword(userId: string) {
  // Generar contraseña aleatoria de 8 caracteres
  const newRawPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
  
  const hashedPassword = await bcrypt.hash(newRawPassword, 10);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    revalidatePath('/admin/user_settings');
    // Devolvemos la contraseña cruda para mostrarla al admin UNA SOLA VEZ
    return { success: true, newPassword: newRawPassword };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al restablecer.' };
  }
}