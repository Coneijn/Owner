import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/prisma/client';
import { SERVICE_FEE } from '@/lib/utils'; // <-- IMPORTAMOS EL SERVICE FEE

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(req: Request) {
  try {
    const { paymentId, propertyId, isPublishFee, isBalancePayment, amount, agentId } = await req.json();
    
    // Obtenemos la URL exacta desde donde el usuario hizo clic en el botón
    const referer = req.headers.get('referer');
    const returnPath = referer ? new URL(referer).pathname : '/buyersDashboard';

    let customerEmail: string | undefined = undefined;
    let productName = '';
    let productDescription = '';
    let unitAmount = 0;
    let paymentType = '';
    let finalAgentProfileId = agentId;

    if (isBalancePayment && agentId && amount) {
      // 1. Convertimos el userId de la sesión en el ID real del Perfil del Agente
      const agentProfile = await prisma.agentProfile.findUnique({ where: { userId: agentId } });
      if (!agentProfile) return NextResponse.json({ error: 'Perfil de agente no encontrado' }, { status: 404 });
      
      finalAgentProfileId = agentProfile.id; // Asignamos la llave primaria correcta
      
      productName = `Agent Balance Settlement`;
      productDescription = `Payment to settle outstanding referral balance`;
      unitAmount = Math.round(amount * 100);
      paymentType = 'AGENT_BALANCE';
    } else if (isPublishFee && propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
      
      productName = `Publicación de Propiedad`;
      productDescription = `Tarifa única de publicación`;
      unitAmount = 1900; // $19.00 USD en centavos
      paymentType = 'PUBLISH_FEE';
    } else if (paymentId) {
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

    } else {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
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
        localPaymentId: paymentId || '',
        propertyId: propertyId || '',
        agentId: finalAgentProfileId || '', 
        type: paymentType 
       },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error al crear sesión de Stripe:", error);
    return NextResponse.json({ error: 'Error creando la sesión de pago' }, { status: 500 });
  }
}