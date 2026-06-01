'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma'; // Verifica que la ruta a tu instancia de Prisma sea esta

export async function getImpersonationData(targetUserId: string) {
  const session = await auth();

  // 1. Bloqueo de seguridad: Solo los administradores reales pueden ejecutar esto
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No autorizado. Solo los administradores pueden usar Login As.');
  }

  // 2. Buscamos al usuario objetivo y sus perfiles conectados
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      sellerProfile: true,
      buyerProfile: true,
      agentProfile: true,
      renterProfile: true,
      webuserProfile: true,
    },
  });

  if (!targetUser) {
    throw new Error('El usuario no existe.');
  }

  // 3. Evaluamos sus perfiles usando la misma lógica que ya tienes en auth.ts
  const userProfiles: string[] = [];
  if (targetUser.sellerProfile) userProfiles.push('SELLER');
  if (targetUser.buyerProfile) userProfiles.push('BUYER');
  if (targetUser.agentProfile) userProfiles.push('AGENT');
  if (targetUser.renterProfile) userProfiles.push('RENTER');
  if (targetUser.webuserProfile) userProfiles.push('WEB_USER');

  // 4. Retornamos la carga útil que sobreescribirá la sesión en el cliente
  return {
    id: targetUser.id,
    email: targetUser.email,
    name: targetUser.name,
    role: targetUser.role,
    profiles: userProfiles,
    // La clave maestra: Guardamos tu ID de Admin para que puedas regresar luego
    originalUserId: session.user.originalUserId || session.user.id, 
    isImpersonating: true,
  };
}
export async function getRestoreAdminData(originalUserId: string) {
  // 1. Verificamos que tengamos un ID válido para volver
  if (!originalUserId) {
    throw new Error('No se encontró el ID original del administrador.');
  }

  // 2. Buscamos la info completa del Admin en la base de datos
  const adminUser = await prisma.user.findUnique({
    where: { id: originalUserId },
    include: {
      sellerProfile: true,
      buyerProfile: true,
      agentProfile: true,
      renterProfile: true,
      webuserProfile: true,
    },
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    throw new Error('El usuario original no es un administrador válido.');
  }

  // 3. Evaluamos sus perfiles (misma lógica)
  const userProfiles: string[] = [];
  if (adminUser.sellerProfile) userProfiles.push('SELLER');
  if (adminUser.buyerProfile) userProfiles.push('BUYER');
  if (adminUser.agentProfile) userProfiles.push('AGENT');
  if (adminUser.renterProfile) userProfiles.push('RENTER');
  if (adminUser.webuserProfile) userProfiles.push('WEB_USER');

  // 4. Retornamos la sesión limpia y apagamos el modo "impersonating"
  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    profiles: userProfiles,
    originalUserId: null, // Limpiamos el rastro
    isImpersonating: false, // Apagamos la alerta
  };
}