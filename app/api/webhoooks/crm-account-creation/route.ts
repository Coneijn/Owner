// app/api/webhooks/crm-account-creation/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizePhone } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(req: Request) {
  // 1. Verificación de Seguridad
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRM_WEBHOOK_SECRET;

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone } = body;

    if (!phone || !email) {
      return NextResponse.json({ error: 'Missing phone or email' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // 2. Buscar duplicados
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { sellerProfile: { phone: normalizedPhone } }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const randomInitialPassword = crypto.randomBytes(32).toString('hex');

    // 3. Crear el Usuario y su Perfil de Vendedor
    const newUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email: email,
        password: randomInitialPassword,
        role: 'USER',
        forcePasswordChange: true,
        sellerProfile: {
          create: {
            sellerName: `${firstName} ${lastName}`.trim(),
            phone: normalizedPhone,
            sellerType: 'OWNER'
          }
        }
      },
      include: {
        sellerProfile: true
      }
    });

    // 4. Asignar las Propiedades en Borrador
    if (newUser.sellerProfile) {
      await prisma.property.updateMany({
        where: {
          phoneNumber: normalizedPhone, 
          sellerProfileId: null         
        },
        data: {
          sellerProfileId: newUser.sellerProfile.id,
        }
      });
    }

    // 5. Generar Enlace Seguro (Magic Link)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token,
        expires: expiresAt
      }
    });
const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/welcome/${token}`;

    // --- 6. NUEVO: Enviar los datos de vuelta a GoHighLevel ---
    const ghlWebhookUrl = "https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/77744d13-2a6b-48ae-afbb-ebcee7376565";
    
    try {
      await fetch(ghlWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,               // GHL usará esto para encontrar al contacto
          phone: phone,               // Respaldo para encontrar al contacto
          magic_link: accessUrl,      // El link que GHL enviará por email/SMS
          website_user_id: newUser.id // (Opcional) Por si quieres guardar su ID en GHL
        }),
      });
      console.log("Webhook enviado exitosamente de regreso a GHL");
    } catch (ghlError) {
      console.error("Error haciendo el POST de regreso a GHL:", ghlError);
      // No detenemos el flujo porque el usuario ya se creó en la BD, 
      // pero queda registrado en los logs por si falla la red.
    }

    // 7. Retorno al llamador original (solo para dejar un log de status 200)
    return NextResponse.json({ 
      success: true, 
      userId: newUser.id,
      message: "User created and webhook sent back to GHL"
    }, { status: 200 });

  } catch (error) {
    console.error("Error in CRM Webhook:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}