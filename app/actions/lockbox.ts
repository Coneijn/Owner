// app/actions/lockbox.ts
'use server'

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function processPropertySelection(formData: FormData) {
  const sessionToken = formData.get('sessionToken') as string;
  const propertyId = formData.get('propertyId') as string;

  if (!sessionToken || !propertyId) {
    return { error: 'Faltan datos requeridos.' };
  }

  try {
    const session = await prisma.selectionSession.findUnique({
      where: { token: sessionToken }
    });

    if (!session || session.isUsed || session.expiresAt < new Date()) {
      return { error: 'La sesión es inválida o ha expirado.' };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) return { error: 'Propiedad no encontrada.' };

    const lockboxToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    // AQUÍ ESTÁ EL CAMBIO: Agregamos el AuditLog a la transacción
    await prisma.$transaction([
      prisma.selectionSession.update({
        where: { id: session.id },
        data: { isUsed: true }
      }),
      prisma.lockboxAccess.create({
        data: {
          token: lockboxToken,
          propertyId: property.id,
          contactPhone: session.contactPhone,
          contactName: session.contactName,
          expiresAt,
          isUsed: false,
        }
      }),
      // NUEVO: Creamos el registro de auditoría
      prisma.auditLog.create({
        data: {
          action: 'MAGIC_LINK_GENERATED',
          entityType: 'LOCKBOX',         // <-- NUEVO: Identifica qué tipo de registro es
          entityId: lockboxToken,        // <-- NUEVO: El ID o token de lo que se creó
          contactPhone: session.contactPhone,
          contactName: session.contactName,
          propertyId: property.id,
          address: property.address,
          details: 'Enlace de 5 minutos generado con éxito.'
        }
      })
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/access/${lockboxToken}`;
    
    const ghlInboundWebhookUrl = 'https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/acca4ef0-9f58-43f7-8b25-13b69e52fbb6';

    await fetch(ghlInboundWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactPhone: session.contactPhone,
        magicLink,
        propertyId: property.id,
        titleEn: property.titleEn,
        titleEs: property.titleEs,
        address: property.address
      })
    });

    return { success: true };

  } catch (error) {
    console.error('Error procesando selección:', error);
    return { error: 'Ocurrió un error al generar el acceso.' };
  }
}