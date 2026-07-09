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
    
    const localPaymentId = session.metadata?.localPaymentId;
    const propertyId = session.metadata?.propertyId;
    const agentUserId = session.metadata?.agentId;
    const paymentType = session.metadata?.type;

    try {
      if (paymentType === 'PUBLISH_FEE' && propertyId) {
        await prisma.property.update({
          where: { id: propertyId },
          data: {
            publishFeePaid: true,
            status: 'AVAILABLE',
          },
        });
      } else if (paymentType === 'SALE' && localPaymentId) {
        await prisma.payment.update({
          where: { id: localPaymentId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentIntentID: session.payment_intent as string,
          },
        });
      } else if (paymentType === 'RENT' && localPaymentId) {
        await prisma.rentalPayment.update({
          where: { id: localPaymentId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentIntentID: session.payment_intent as string,
          },
        });
      } else if (paymentType === 'AGENT_BALANCE' && agentUserId) {
        await prisma.agentProfile.update({
          where: { id: agentUserId }, 
          data: {
            balance: 0,
          },
        });
      }
    } catch (dbError) {
      console.error("Error al actualizar la base de datos desde webhook:", dbError);
      return NextResponse.json({ error: "Error actualizando base de datos" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}