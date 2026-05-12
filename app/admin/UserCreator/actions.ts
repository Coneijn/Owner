'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Definimos los tipos basados en tu schema.prisma
export type UserProfileType = 'SELLER' | 'AGENT' | 'RENTER' | 'BUYER' | 'ADMIN' | 'STAFF';

export async function createTestUser(testCode: string, userType: UserProfileType) {
  if (!testCode || testCode.trim() === '') {
    return { error: 'El código identificador es requerido' };
  }

  // Dar formato al tipo para el email y la contraseña
  const typeLower = userType.toLowerCase();
  const typeCapitalized = typeLower.charAt(0).toUpperCase() + typeLower.slice(1);

  // Nueva estructura de Email y Password
  const email = `tester-${typeLower}-${testCode.trim()}@testmail.com`.toLowerCase();
  const rawPassword = `Testing${typeCapitalized}${testCode.trim()}`;

  try {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 1. Verificamos y eliminamos si ya existe
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (existingUser) {
      await prisma.user.delete({ where: { email } });
    }

    // 2. Preparamos los datos base del usuario
    let userData: any = {
      email,
      password: hashedPassword,
      role: 'USER', // Por defecto todos son USER a menos que se cambie abajo
      forcePasswordChange: false,
      isTwoFactorEnabled: false,
    };

    // 3. Inyectamos el perfil o rol adecuado según la selección
    switch (userType) {
      case 'ADMIN':
        userData.role = 'ADMIN';
        userData.name = `Admin Prueba ${testCode}`;
        break;
      case 'STAFF':
        userData.role = 'STAFF';
        userData.name = `Staff Prueba ${testCode}`;
        break;
      case 'SELLER':
        userData.name = `Vendedor Prueba ${testCode}`;
        userData.sellerProfile = {
          create: {
            sellerName: `Vendedor Prueba ${testCode}`,
            sellerType: "OWNER"
          }
        };
        break;
      case 'AGENT':
        userData.name = `Agente Prueba ${testCode}`;
        userData.agentProfile = {
          create: {
            agentName: `Agente Prueba ${testCode}`
          }
        };
        break;
      case 'RENTER':
        userData.name = `Rentero Prueba ${testCode}`;
        userData.renterProfile = {
          create: {
            RenterName: `Rentero Prueba ${testCode}`
          }
        };
        break;
      case 'BUYER':
        userData.name = `Comprador Prueba ${testCode}`;
        userData.buyerProfile = {
          create: {
            // Nota: En tu schema, BuyerProfile exige firstName y lastName obligatoriamente
            firstName: `Comprador`,
            lastName: `Prueba ${testCode}`
          }
        };
        break;
      default:
        return { error: 'Tipo de usuario no válido' };
    }

    // 4. Ejecutamos la creación
    await prisma.user.create({
      data: userData
    });

    return { 
      success: true, 
      email, 
      password: rawPassword 
    };

  } catch (error: any) {
    console.error("Error creando usuario de prueba:", error);
    return { error: 'Ocurrió un error al crear el usuario en la base de datos' };
  }
}