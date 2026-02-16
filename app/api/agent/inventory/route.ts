import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateEstimatedPayment, 
  DEFAULT_TERM_YEARS, 
  SERVICE_FEE 
} from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'AVAILABLE',
      },
      select: {
        // IDs e info básica
        id: true,
        slug: true,
        titleEn: true,
        titleEs: true,
        
        // Datos Financieros (Venta)
        isForSale: true,
        price: true,
        downPayment: true,
        interestRate: true,
        taxes: true,
        insurance: true,
        
        // Datos Financieros (Renta)
        isForRent: true,
        monthlyRent: true,
        securityDeposit: true,

        // Detalles Físicos
        address: true,
        city: true,
        state: true,
        zipCode: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        features: true,
        
        // Contacto y Media
        calendarLink: true,
        phoneNumber: true,
        mainImage: true,
        
        // --- CORRECCIÓN: Campos directos del modelo Property ---
        sellerName: true,
        sellerImage: true,
        sellerType: true,
        showSeller: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Procesamos la data para el Bot
    const botReadyProperties = properties.map(p => {
      let estimatedMonthlyPayment = 0;
      
      // Lógica de Venta usando utils.ts
      if (p.isForSale && p.price) {
        const priceVal = Number(p.price) || 0;
        const downPaymentVal = Number(p.downPayment) || 0;
        const taxesVal = Number(p.taxes) || 0;
        const insuranceVal = Number(p.insurance) || 0;
        const interestVal = Number(p.interestRate) || 0;

        estimatedMonthlyPayment = calculateEstimatedPayment(
          priceVal,
          downPaymentVal,
          taxesVal,
          insuranceVal,
          interestVal
        );
      }

      // Determinar Tipo de Listado
      let listingType = 'SALE';
      if (p.isForRent && p.isForSale) listingType = 'BOTH';
      else if (p.isForRent) listingType = 'RENT';

      return {
        id: p.id,
        slug: p.slug,
        title: {
            en: p.titleEn,
            es: p.titleEs
        },
        address: {
            full: p.address,
            city: p.city,
            state: p.state,
            zip: p.zipCode
        },
        specs: {
            beds: p.bedrooms,
            baths: p.bathrooms,
            sqft: p.sqft,
            features: p.features
        },
        media: {
            mainImage: p.mainImage,
            calendar: p.calendarLink
        },
        
        // --- CORRECCIÓN: Estructuramos el objeto Seller manualmente ---
        seller: {
            name: p.sellerName || "Dueno a Dueno Team", // Fallback por seguridad
            image: p.sellerImage || null,
            type: p.sellerType || "OWNER",
            phone: p.phoneNumber, // Usamos el teléfono de la propiedad como contacto
            isVisible: p.showSeller
        },

        // LÓGICA CORE PARA EL BOT
        listingType, // 'SALE', 'RENT', 'BOTH'

        // Objeto de Venta
        saleDetails: p.isForSale ? {
          price: Number(p.price),
          downPayment: Number(p.downPayment),
          interestRate: Number(p.interestRate),
          taxes: Number(p.taxes),
          insurance: Number(p.insurance),
          estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment), 
          termYears: DEFAULT_TERM_YEARS,
          serviceFeeIncluded: SERVICE_FEE
        } : null,

        // Objeto de Renta
        rentDetails: p.isForRent ? {
          monthlyPrice: Number(p.monthlyRent),
          securityDeposit: Number(p.securityDeposit)
        } : null
      };
    });

    return NextResponse.json(botReadyProperties);

  } catch (error) {
    console.error('Agent API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}