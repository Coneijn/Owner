import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Obtener todos los IDs de las propiedades para optimizar memoria
    const properties = await prisma.property.findMany({
      select: { id: true }, // Asegúrate de que tu llave primaria se llame 'id'
    });

    let successCount = 0;
    const fallos: { id: any; error: string }[] = [];

    // 2. Iterar uno por uno para capturar fallos sin detener el proceso
    for (const prop of properties) {
      try {
        await prisma.property.update({
          where: { id: prop.id },
          data: { showSeller: false },
        });
        successCount++;
      } catch (error) {
        // Registrar el fallo y continuar con el siguiente
        fallos.push({
          id: prop.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 3. Devolver un reporte al navegador
    return NextResponse.json({
      mensaje: 'Proceso de actualización finalizado',
      totalEncontrados: properties.length,
      exitosos: successCount,
      fallidos: fallos.length,
      detalleFallos: fallos,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Fallo crítico al leer la base de datos', detalle: String(error) },
      { status: 500 }
    );
  }
}