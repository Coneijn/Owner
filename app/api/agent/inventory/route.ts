import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
        titleEn: true,
        titleEs: true,
        price: true,
        downPayment: true,
        interestRate: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        features: true, 
        calendarLink: true,
        phoneNumber: true,
        sellerName: true,
        mainImage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(properties);

  } catch (error) {
    console.error('Agent API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}