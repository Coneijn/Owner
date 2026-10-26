import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      select: { id: true, slug: true }
    });

    let updatedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;

    for (const prop of properties) {
      if (!prop.slug) continue;

      const newSlug = prop.slug.replace(/^\d+-/, '');

      if (newSlug !== prop.slug) {
        try {
          await prisma.property.update({
            where: { id: prop.id },
            data: { slug: newSlug }
          });
          updatedCount++;
        } catch (updateError: any) {
          // P2002 es el código de Prisma para "Unique constraint failed"
          if (updateError.code === 'P2002') {
            try {
              // Agrega los últimos 4 caracteres del ID para hacerlo único
              const uniqueSuffix = prop.id.slice(-4);
              const uniqueSlug = `${newSlug}-${uniqueSuffix}`;
              
              await prisma.property.update({
                where: { id: prop.id },
                data: { slug: uniqueSlug }
              });
              updatedCount++;
              duplicateCount++;
            } catch (fallbackError) {
              console.error(`❌ Falló el intento de hacer único el slug para ${prop.id}:`, fallbackError);
              failedCount++;
            }
          } else {
            console.error(`❌ Error al actualizar ${prop.id}:`, updateError);
            failedCount++;
          }
        }
      }
    }
    return NextResponse.json({
      message: `Proceso terminado. Actualizados normales: ${updatedCount - duplicateCount} | Actualizados modificados por duplicado: ${duplicateCount} | Fallidos: ${failedCount}`,
    });
  } catch (error) {
    console.error('Error general del script:', error);
    return NextResponse.json({ error: 'Error ejecutando el script' }, { status: 500 });
  }
}