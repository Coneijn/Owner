// app/api/webhooks/ghl-lockbox/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageBody, contactPhone, contactName } = body;

    if (!messageBody) {
      return NextResponse.json(
        { error: 'El cuerpo del mensaje (messageBody) es obligatorio.' }, 
        { status: 400 }
      );
    }

    // 1. Aislar la URL dentro del texto del SMS usando Regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = messageBody.match(urlRegex);

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'No se detectó ninguna URL en el mensaje.' }, 
        { status: 400 }
      );
    }

    // 2. Limpieza de SMS: Quitamos puntos, comas o signos al final
    let propertyUrl = urls[0].replace(/[.,;!?]+$/, '');

    // 3. Extraer el slug (Ignorando parámetros bilingües)
    const urlObj = new URL(propertyUrl);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const slug = pathSegments[pathSegments.length - 1]; 

    if (!slug) {
      return NextResponse.json(
        { error: 'No se pudo extraer el identificador (slug) de la URL.' }, 
        { status: 400 }
      );
    }

    // 4. Buscar la propiedad en Prisma usando el slug extraído
    const property = await prisma.property.findUnique({
      where: { slug: slug } 
    });

    if (!property) {
        return NextResponse.json(
            { error: `Propiedad no encontrada para el slug: ${slug}` }, 
            { status: 404 }
        );
    }

    // 5. Generar el Token (Magic Link) de 5 minutos
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    // 6. Guardar el acceso temporal en la Base de Datos
    await prisma.lockboxAccess.create({
      data: {
        token,
        propertyId: property.id,
        contactPhone: contactPhone || null,
        contactName: contactName || null,
        expiresAt,
        isUsed: false,
      }
    });

    // 7. Construir la URL del Magic Link
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const magicLink = `${baseUrl}/access/${token}`;

    // ==========================================
    // 8. ENVIAR RESPUESTA AL WORKFLOW 2 DE GHL
    // ==========================================
    const ghlInboundWebhookUrl = 'https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/acca4ef0-9f58-43f7-8b25-13b69e52fbb6';

    try {
      await fetch(ghlInboundWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactPhone: contactPhone, // GHL usará esto para saber a quién enviarle el SMS
          contactName: contactName,
          magicLink: magicLink,
          propertyId: property.id,
          slugFound: slug
        })
      });
      console.log('✅ Magic Link enviado exitosamente a GHL:', magicLink);
    } catch (ghlError) {
      console.error('❌ Error enviando el webhook de regreso a GHL:', ghlError);
    }

    // 9. Devolver un 200 OK al Workflow 1 (solo para cerrar la conexión)
    return NextResponse.json({
      success: true,
      message: 'Magic link generado y enviado al Inbound Webhook de GHL'
    });

  } catch (error) {
    console.error('Error en GHL Lockbox Webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' }, 
      { status: 500 }
    );
  }
}