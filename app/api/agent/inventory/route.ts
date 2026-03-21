import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateEstimatedPayment 
} from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Función para escapar correctamente los valores del CSV (comas, comillas, saltos de línea)
const escapeCSV = (value: any) => {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  // Reemplazar comillas dobles por dos comillas dobles y envolver en comillas
  return `"${stringValue.replace(/"/g, '""')}"`;
};

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
        isForSale: true,
        price: true,
        downPayment: true,
        interestRate: true,
        taxes: true,
        insurance: true,
        isForRent: true,
        monthlyRent: true,
        securityDeposit: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        features: true,
        // Algunos campos no se usan en el CSV final pero se mantienen en el select original
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Definición de las cabeceras del CSV
    const headers = [
      'Título',
      'Slug',
      'Dirección',
      'Recámaras',
      'Baños',
      'Pies Cuadrados (sqft)',
      'Características Especiales',
      'Precio de Venta (USD)',
      'Enganche Requerido (USD)',
      'Pago Mensual Estimado (USD)',
      'Renta Mensual (USD)',
      'Depósito de Renta (USD)'
    ];

    // Iniciamos el contenido CSV con el BOM (\uFEFF) para forzar UTF-8 en Excel
    let csvContent = '\uFEFF' + headers.join(',') + '\n';

    properties.forEach(p => {
      let estimatedMonthlyPayment = '';
      
      // Cálculo financiero si es venta
      if (p.isForSale && p.price) {
        const priceVal = Number(p.price) || 0;
        const downPaymentVal = Number(p.downPayment) || 0;
        const taxesVal = Number(p.taxes) || 0;
        const insuranceVal = Number(p.insurance) || 0;
        const interestVal = Number(p.interestRate) || 0;

        const payment = calculateEstimatedPayment(
          priceVal,
          downPaymentVal,
          taxesVal,
          insuranceVal,
          interestVal
        );
        estimatedMonthlyPayment = Math.round(payment).toString();
      }

      const title = p.titleEs || p.titleEn || "Propiedad sin título";
      // Construir la dirección completa y limpiar espacios extra
      const address = [p.address, p.city, p.state, p.zipCode].filter(Boolean).join(', ');

      const row = [
        escapeCSV(title),
        escapeCSV(p.slug),
        escapeCSV(address),
        escapeCSV(p.bedrooms || 0),
        escapeCSV(p.bathrooms || 0),
        escapeCSV(p.sqft || 0),
        escapeCSV(p.features || ''),
        escapeCSV(p.isForSale && p.price ? p.price : ''),
        escapeCSV(p.isForSale && p.downPayment ? p.downPayment : ''),
        escapeCSV(estimatedMonthlyPayment),
        escapeCSV(p.isForRent && p.monthlyRent ? p.monthlyRent : ''),
        escapeCSV(p.isForRent && p.securityDeposit ? p.securityDeposit : '')
      ];

      csvContent += row.join(',') + '\n';
    });

    // Retornamos como un archivo CSV descargable
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="propiedades.csv"',
      },
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    return new NextResponse('Error interno del servidor al cargar las propiedades.', { status: 500 });
  }
}