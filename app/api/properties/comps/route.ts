import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface NormalizedComp {
  id: string;
  address: string;
  price: number;
  sqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  lat?: number | null;
  lng?: number | null;
  saleDate?: string | null;
  isInternalOtd: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode')?.trim();
    const city = searchParams.get('city')?.trim();
    const targetPrice = Number(searchParams.get('price')) || 0;

    if (!zipCode && !city) {
      return NextResponse.json({ comps: [] });
    }

    const locationConditions: any[] = [];
    if (zipCode) {
      locationConditions.push({ zipCode });
      locationConditions.push({ titleEn: { contains: zipCode, mode: 'insensitive' } });
    } else if (city) {
      locationConditions.push({ city: { equals: city, mode: 'insensitive' } });
    }

    const soldProperties = await prisma.property.findMany({
      where: {
        status: 'SOLD',
        OR: locationConditions,
      },
      orderBy: { updatedAt: 'desc' },
      take: 15,
    });

    const normalizedAll: NormalizedComp[] = soldProperties
      .map((prop: any) => {
        const resolvedPrice = Number(prop.salePrice ?? prop.price ?? 0);
        const streetOrTitle = (
          prop.address ||
          prop.titleEs ||
          prop.titleEn ||
          ''
        ).trim();

        const cityStateZip = [
          prop.city,
          [prop.state, prop.zipCode].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(', ');

        const hasZipInTitle =
          prop.zipCode &&
          streetOrTitle.toLowerCase().includes(prop.zipCode.toLowerCase());

        const fullAddress =
          streetOrTitle && cityStateZip && !hasZipInTitle
            ? `${streetOrTitle}, ${cityStateZip}`
            : streetOrTitle || cityStateZip;

        return {
          id: prop.id,
          address: fullAddress,
          price: resolvedPrice,
          sqft: prop.sqft ?? prop.squareFeet ?? null,
          bedrooms: prop.bedrooms ?? null,
          bathrooms: prop.bathrooms ?? null,
          lat: prop.latitude ?? null,
          lng: prop.longitude ?? null,
          saleDate: (prop.publishedAt || prop.updatedAt)?.toISOString() ?? null,
          isInternalOtd: true,
        };
      })
      .filter((item) => item.price > 0 && item.address.length > 0);

    // 1. Priorizar comparables dentro de ±15% del precio objetivo (RF-23)
    const strictMatches =
      targetPrice > 0
        ? normalizedAll.filter(
            (c) => c.price >= targetPrice * 0.85 && c.price <= targetPrice * 1.15
          )
        : normalizedAll;

    // 2. Fallback: completar hasta 4 con otras vendidas en el mismo ZIP/ciudad
    const selectedComps =
      strictMatches.length >= 3
        ? strictMatches.slice(0, 4)
        : [
            ...strictMatches,
            ...normalizedAll.filter((c) => !strictMatches.some((s) => s.id === c.id)),
          ].slice(0, 4);

    return NextResponse.json({ comps: selectedComps });
  } catch (error) {
    console.error('Error fetching internal OTD comps:', error);
    return NextResponse.json({ comps: [] }, { status: 200 });
  }
}