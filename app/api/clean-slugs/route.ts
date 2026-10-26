import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET() {
  try {
    const properties = await prisma.property.findMany({ 
      select: { id: true, slug: true } 
    });
    
    let updatedCount = 0;
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
        } catch (updateError) {
          console.error(`❌ Falló al actualizar la propiedad ${prop.id} a "${newSlug}":`, updateError);
          failedCount++;
        }
      }
    }
    return NextResponse.json({ 
      message: `Proceso terminado. Actualizados: ${updatedCount} | Fallidos: ${failedCount}`,
      note: "Si hubo fallos, revisa la terminal de tu servidor local para ver el motivo exacto."
    });
  } catch (error) {
    console.error('Error general del script:', error);
    return NextResponse.json({ error: 'Error ejecutando el script', details: String(error) }, { status: 500 });
  }
}