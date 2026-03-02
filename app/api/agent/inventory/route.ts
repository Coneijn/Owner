import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateEstimatedPayment, 
  DEFAULT_TERM_YEARS, 
  SERVICE_FEE 
} from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Función auxiliar para formatear números a moneda (USD)
const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0 // Lo mantenemos en números cerrados para mayor claridad del bot
  }).format(amount);
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
        calendarLink: true,
        phoneNumber: true,
        mainImage: true,
        lockboxCode: true,
        showSeller: true,
        sellerProfile: {
          select: {
            sellerName: true,
            sellerImage: true,
            sellerType: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Procesamos la data para generar bloques de texto amigables en español
    const textSummaries = properties.map(p => {
      let estimatedMonthlyPayment = 0;
      
      // Cálculo financiero si es venta
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

      // Título en español prioritario
      const title = p.titleEs || p.titleEn || "Propiedad sin título";
      const sellerName = p.sellerProfile?.sellerName || "Dueño a Dueño Team";

      // CONSTRUCCIÓN DEL RESUMEN EN TEXTO PARA EL BOT
      // Usamos ### para que el bot entienda que aquí empieza un nuevo "nodo" de información
      let summary = `### Propiedad: ${title}\n`;
      summary += `- **Identificador / Slug:** ${p.slug}\n`;
      summary += `- **Dirección:** ${p.address || 'No especificada'}, ${p.city || ''}, ${p.state || ''} ${p.zipCode || ''}\n`;
      summary += `- **Distribución:** ${p.bedrooms || 0} recámaras, ${p.bathrooms || 0} baños, y ${p.sqft || 0} pies cuadrados (sqft).\n`;
      
      if (p.features) {
        summary += `- **Características especiales:** ${p.features}\n`;
      }

      // Usamos #### para sub-secciones dentro de la misma propiedad
      summary += `\n#### Condiciones Financieras\n`;
      
      if (p.isForSale) {
        summary += `Esta propiedad está disponible para VENTA (Dueño a Dueño).\n`;
        summary += `- Precio total: ${formatCurrency(Number(p.price))}\n`;
        summary += `- Enganche requerido (Down Payment): ${formatCurrency(Number(p.downPayment))}\n`;
        summary += `- Pago mensual estimado: ${formatCurrency(Math.round(estimatedMonthlyPayment))}\n`;
      }

      if (p.isForRent) {
        summary += `Esta propiedad está disponible para RENTA.\n`;
        summary += `- Renta mensual: ${formatCurrency(Number(p.monthlyRent))}\n`;
        summary += `- Depósito requerido: ${formatCurrency(Number(p.securityDeposit))}\n`;
      }

      return summary;
    });

    // Unir todos los bloques usando un Header 1 para el título principal
    const finalDocument = `#  CATÁLOGO DE PROPIEDADES DISPONIBLES \n` + 
                          `Aquí se encuentra la lista actualizada de propiedades disponibles para ofrecer a los clientes.\n\n` + 
                          `---\n\n` +
                          textSummaries.join('\n\n---\n\n');
                          
   // Envolvemos el texto en un esqueleto HTML básico para que el Crawler de GHL lo acepte
    const htmlDocument = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Catálogo de Propiedades - Dueño a Dueño</title>
          <meta name="robots" content="index, follow">
      </head>
      <body>
          <pre style="white-space: pre-wrap; font-family: sans-serif;">
${finalDocument}
          </pre>
      </body>
      </html>
    `;

    // Retornamos como HTML
    return new NextResponse(htmlDocument, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    return new NextResponse('Error interno del servidor al cargar las propiedades.', { status: 500 });
  }
}