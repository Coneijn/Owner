'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function createTestSeller(testCode: string) {
  if (!testCode || testCode.trim() === '') {
    return { error: 'El código identificador es requerido' };
  }

  const email = `Tester-${testCode.trim()}@testmail.com`.toLowerCase();
  const rawPassword = `Testing${testCode.trim()}`;

  try {
    // Hasheamos la contraseña con bcryptjs al igual que en tu sistema principal
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 1. Verificamos si ya existe para evitar errores de unicidad
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });

    // Si ya existe, lo eliminamos para que el testeo sea idempotente (puedas recrearlo)
    if (existingUser) {
      await prisma.user.delete({ where: { email } });
    }

    // 2. Creamos el usuario junto con su perfil de vendedor
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
        forcePasswordChange: false, // Evita el flujo de cambio de contraseña
        isTwoFactorEnabled: false,  // Permitirá que entre al flujo de configuración 2FA si así está en tu login/dashboard
        sellerProfile: {
          create: {
            sellerName: `Vendedor Prueba ${testCode}`,
            sellerType: "OWNER"
          }
        }
      }
    });

    return { 
      success: true, 
      email, 
      password: rawPassword 
    };

  } catch (error: any) {
    console.error("Error creando seller de prueba:", error);
    return { error: 'Ocurrió un error al crear el usuario en la base de datos' };
  }
}