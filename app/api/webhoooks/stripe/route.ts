import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/prisma/client';

// 1. Corrección: Usar la versión de API que exige TypeScript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // 2. Corrección: await en headers() porque en Next.js 15+ es asíncrono
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Error de firma de webhook: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Manejar el evento de pago exitoso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Recuperar el ID del pago local que enviamos en los metadatos
    const localPaymentId = session.metadata?.localPaymentId;

    if (localPaymentId) {
      try {
        // Actualizar el estado en Prisma
        await prisma.payment.update({
          where: { id: localPaymentId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string,
          },
        });
      } catch (dbError) {
        console.error("Error al actualizar el pago en la base de datos:", dbError);
        return NextResponse.json({ error: "Error actualizando base de datos" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}