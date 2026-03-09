// app/api/webhooks/ghl-lockbox/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extracción de datos con soporte para GHL
    const messageBody = body.customData?.messageBody || body.message?.body || "";
    const contactPhone = body.customData?.contactPhone || body.phone;
    const contactName = body.customData?.contactName || body.full_name;
    
    // Campo donde GHL suele poner la dirección o nombre de la propiedad
    const propertyOfInterest = body.customData?.["Property of Interest"] || body.customData?.propertyAddress || "";

    if (!messageBody && !propertyOfInterest) {
      return NextResponse.json({ error: 'Faltan datos de la propiedad.' }, { status: 400 });
    }

    let property = null;

    // ==========================================
    // ESTRATEGIA A: URL / SLUG (Prioridad Máxima)
    // ==========================================
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = messageBody.match(urlRegex);

    if (urls && urls.length > 0) {
      let propertyUrl = urls[0].replace(/[.,;!?]+$/, '');
      const urlObj = new URL(propertyUrl);
      const slug = urlObj.pathname.split('/').filter(Boolean).pop(); 

      if (slug) {
        property = await prisma.property.findUnique({ where: { slug: slug } });
      }
    }

    // ==========================================
    // ESTRATEGIA B: BÚSQUEDA BILINGÜE DIRECTA (OR Logic)
    // ==========================================
    // Buscamos en titleEn, titleEs y address al mismo tiempo
    if (!property && propertyOfInterest) {
      property = await prisma.property.findFirst({
        where: {
          OR: [
            { titleEn: { contains: propertyOfInterest, mode: 'insensitive' } },
            { titleEs: { contains: propertyOfInterest, mode: 'insensitive' } },
            { address: { contains: propertyOfInterest, mode: 'insensitive' } }
          ]
        }
      });
    }

    // ==========================================
    // ESTRATEGIA C: ESCANEO "FUZZY" MULTILINGÜE
    // ==========================================
    // Si el cliente escribió el nombre de la casa dentro de una oración
    if (!property && messageBody) {
       const allProps = await prisma.property.findMany({ 
         select: { id: true, titleEn: true, titleEs: true, address: true } 
       });
       
       const found = allProps.find(p => 
         messageBody.toLowerCase().includes(p.titleEn.toLowerCase()) || 
         messageBody.toLowerCase().includes(p.titleEs.toLowerCase()) ||
         (p.address && messageBody.toLowerCase().includes(p.address.toLowerCase()))
       );

       if (found) {
         property = await prisma.property.findUnique({ where: { id: found.id } });
       }
    }

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no identificada.' }, { status: 404 });
    }

    // ==========================================
    // GENERACIÓN DE TOKEN (Seguridad de 5 min)
    // ==========================================
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

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

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const magicLink = `${protocol}://${host}/access/${token}`;

    // 7. Feedback a GHL (Confirmamos usando el título bilingüe)
    const ghlInboundWebhookUrl = 'https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/acca4ef0-9f58-43f7-8b25-13b69e52fbb6';

    await fetch(ghlInboundWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactPhone,
        magicLink,
        propertyId: property.id,
        // Enviamos ambos títulos para que GHL decida cuál usar
        titleEn: property.titleEn,
        titleEs: property.titleEs,
        address: property.address
      })
    });

    return NextResponse.json({ success: true, message: 'Propiedad encontrada y link enviado' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}