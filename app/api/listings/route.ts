// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEstimatedPayment } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'AVAILABLE', 
      },
      select: {
        id: true,
        slug: true,
        lockboxCode: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        price: true,
        downPayment: true,
        taxes: true,
        insurance: true,
        interestRate: true,
        monthlyRent: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        status: true,
        isForSale: true,
        isForRent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const listings = properties.map((p) => {
      // 1. Determinar el Tipo Exacto
      let type = 'owner-finance';
      if (p.isForSale && p.isForRent) {
        type = 'Sale and Rent';
      } else if (p.isForRent && !p.isForSale) {
        type = 'rental';
      }

      // 2. Calcular los pagos individuales
      const monthlyRentValue = Number(p.monthlyRent) || 0;
      
      let financePaymentValue = 0;
      if (p.isForSale && p.price) {
        financePaymentValue = Math.round(
          calculateEstimatedPayment(
            Number(p.price) || 0,
            Number(p.downPayment) || 0,
            Number(p.taxes) || 0,
            Number(p.insurance) || 0,
            Number(p.interestRate) || 0
          )
        );
      }

      // 3. Formatear Dirección
      const fullAddress = [p.address, p.city, p.state, p.zipCode]
        .filter(Boolean)
        .join(', ');

      // 4. Construir la respuesta final enriquecida
      return {
        id: p.id,
        slug: p.slug,
        accessCode: p.lockboxCode || null,
        address: fullAddress,
        price: Number(p.price) || null,
        // Default genérico para el script original de Spencer
        monthly_payment: type === 'rental' ? monthlyRentValue : financePaymentValue,
        // Nuevos campos explícitos por si la propiedad es "both"
        monthly_rent: monthlyRentValue || null,
        monthly_finance: financePaymentValue || null,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqft: p.sqft,
        zip: p.zipCode,
        status: p.status.toLowerCase(),
        type: type, // "owner-finance", "rental", o "both"
        downPayment: Number(p.downPayment) || null,
      };
    });

    return NextResponse.json(listings, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Listings API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error fetching listings.' },
      { status: 500 }
    );
  }
}