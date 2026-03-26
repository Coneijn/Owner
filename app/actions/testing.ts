'use server'

import { prisma } from '@/lib/prisma';

export async function generateTestSessionAction() {
  try {
    const dummyPhone = '+1 555-0100'; 
    const dummyName = 'Probador de Desarrollo'; 
    
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    // Generamos un token alfanumérico aleatorio (ej. "a1b2c3d4")
    const randomToken = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);

    const newSession = await prisma.selectionSession.create({
      data: {
        token: randomToken, // <-- ¡Solución! Pasamos el token generado
        contactPhone: dummyPhone,
        contactName: dummyName,
        expiresAt: expirationDate,
        isUsed: false,
      },
    });

    console.log(`✅ Sesión de prueba creada con token: ${newSession.token}`);
    
    return { token: newSession.token };

  } catch (error) {
    console.error('❌ Error creando sesión de prueba:', error);
    return { error: 'No se pudo crear la sesión de prueba.' };
  }
}