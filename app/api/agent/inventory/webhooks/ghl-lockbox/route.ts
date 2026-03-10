import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extraer los datos del cliente desde GHL
    const contactPhone = body.phone || body.customData?.contactPhone;
    const contactName = body.full_name || body.first_name || body.customData?.contactName || "Cliente";

    if (!contactPhone) {
      return NextResponse.json({ error: 'Falta el número de teléfono.' }, { status: 400 });
    }

    // 2. Generar el Token Seguro y Expiración (1 hora)
    // Usamos randomBytes para generar un token más corto y amigable para URLs que un UUID completo
    const token = crypto.randomBytes(12).toString('hex'); 
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora a partir de ahora

    // 3. Guardar la Sesión en la Base de Datos
    const session = await prisma.selectionSession.create({
      data: {
        token,
        contactPhone,
        contactName,
        expiresAt,
        isUsed: false,
      }
    });
    // --- ESTA ES LA PARTE ACTUALIZADA ---
    await prisma.auditLog.create({
      data: {
        action: 'SELECTION_SESSION_CREATED',
        entityType: 'SESSION',           // <-- NUEVO
        entityId: session.token,         // <-- NUEVO
        contactPhone: session.contactPhone,
        contactName: session.contactName,
        details: `El cliente solicitó el menú de propiedades.`
      }
    });
    // 4. Construir el Enlace Limpio
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Este es el enlace que verá el cliente: limpio y sin parámetros
    const selectionUrl = `${protocol}://${host}/seleccionar/${session.token}`;

    // 5. Enviar el enlace de vuelta a GoHighLevel
    // NOTA: Reemplaza esta URL por el webhook de GHL que recibirá este link para mandarlo por SMS/WhatsApp
    const ghlInboundWebhookUrl = 'https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/51e37de2-f172-4add-a7b7-a3cee6237cd5';

    await fetch(ghlInboundWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactPhone: session.contactPhone,
        selectionUrl: selectionUrl,
        sessionToken: session.token // Por si lo necesitas guardar en un custom field de GHL
      })
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Sesión creada y enviada a GHL',
      url: selectionUrl
    });

  } catch (error) {
    console.error('Error creando Selection Session:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}