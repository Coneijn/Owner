import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/prisma/client';
import { SERVICE_FEE } from '@/lib/utils'; // <-- IMPORTAMOS EL SERVICE FEE

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    
    // Obtenemos la URL exacta desde donde el usuario hizo clic en el botón
    const referer = req.headers.get('referer');
    const returnPath = referer ? new URL(referer).pathname : '/buyersDashboard';

    let customerEmail: string | undefined = undefined;
    let productName = '';
    let productDescription = '';
    let unitAmount = 0;
    let paymentType = '';

    // 1. Intentamos buscar primero en la tabla de compradores (Payment)
    const buyerPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { contract: { include: { buyers: { include: { user: true } } } } }
    });

    if (buyerPayment) {
      const primaryBuyer = buyerPayment.contract.buyers?.[0];
      customerEmail = primaryBuyer?.user?.email || undefined;
      productName = `Mensualidad - Contrato ${buyerPayment.contractId.slice(-8)}`;
      productDescription = `Pago de principal, intereses e impuestos`;
      
      // SUMAMOS EL SERVICE_FEE PARA COMPRADORES
      const totalAmountWithFee = Number(buyerPayment.totalDue);
      unitAmount = Math.round(totalAmountWithFee * 100);
      paymentType = 'SALE';
    } else {
      // 2. Si no existe en Payment, buscamos en la tabla de inquilinos (RentalPayment)
      const rentalPayment = await prisma.rentalPayment.findUnique({
        where: { id: paymentId },
        include: { lease: { include: { renters: { include: { user: true } } } } }
      });

      if (rentalPayment) {
        const primaryRenter = rentalPayment.lease.renters?.[0];
        customerEmail = primaryRenter?.user?.email || undefined;
        productName = `Renta Mensual - Contrato ${rentalPayment.leaseId.slice(-8)}`;
        productDescription = `Pago de renta mensual`;
        // Para rentas, de momento usamos el totalDue tal cual
        unitAmount = Math.round(Number(rentalPayment.totalDue) * 100);
        paymentType = 'RENT';
      } else {
        console.error("❌ ERROR 404: Pago no encontrado. ID recibido:", paymentId);
        return NextResponse.json({ error: 'Pago no encontrado en el sistema' }, { status: 404 });
      }
    }

    // 3. Crear la sesión de Stripe Checkout unificada
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      customer_email: customerEmail, 
      line_items: [
        {
          price_data: {
            currency: 'usd', 
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: unitAmount, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnPath}?success=true`,
      cancel_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnPath}?canceled=true`,
      metadata: {
        localPaymentId: paymentId,
        type: paymentType 
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error al crear sesión de Stripe:", error);
    return NextResponse.json({ error: 'Error creando la sesión de pago' }, { status: 500 });
  }
}