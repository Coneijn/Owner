import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/prisma/client'; // Ajusta la ruta a tu cliente de prisma si es diferente

// 1. Corrección: Usar la versión exacta que te exige TypeScript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    
    // Obtenemos la URL exacta desde donde el usuario hizo clic en el botón
    const referer = req.headers.get('referer');
    const returnPath = referer ? new URL(referer).pathname : '/buyersDashboard';

    // 2. Corrección Prisma: Incluir la cadena completa contract -> buyer -> user
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { 
        contract: { 
          include: { 
            buyer: {
              include: {
                user: true // <-- Esto soluciona el error del 'user'
              }
            } 
          } 
        } 
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    // 3. Crear la sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      // Como ya incluimos 'user', TypeScript ya reconoce que 'email' existe
      customer_email: payment.contract.buyer.user?.email || undefined, 
      line_items: [
        {
          price_data: {
            currency: 'usd', 
            product_data: {
              name: `Mensualidad - Contrato ${payment.contractId}`,
              description: `Pago de principal, intereses e impuestos`,
            },
            // Multiplicamos por 100 porque Stripe procesa todo en centavos
            unit_amount: Math.round(Number(payment.totalDue) * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnPath}?success=true`,
      cancel_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnPath}?canceled=true`,
      // Metadatos para que el Webhook sepa qué registro actualizar en tu base de datos
      metadata: {
        localPaymentId: payment.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error al crear sesión de Stripe:", error);
    return NextResponse.json({ error: 'Error creando la sesión de pago' }, { status: 500 });
  }
}