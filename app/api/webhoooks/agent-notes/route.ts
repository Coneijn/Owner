import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instanciamos Prisma fuera del handler para reutilizar la conexión
const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Validación de seguridad
  const secret = req.headers.get("x-webhook-secret");
  // Te sugiero crear una nueva variable de entorno específica para este agente, 
  // o puedes reutilizar process.env.OPENCLAW_ADMIN_SECRET si comparten el mismo nivel de acceso.
  if (!secret || secret !== process.env.AGENT_NOTES_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Extraemos solo lo que necesitamos
    const { propertyId, condition } = body;

    // 2. Validación estricta de los datos de entrada
    if (!propertyId || condition === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: 'propertyId' y 'condition' son obligatorios." },
        { status: 400 }
      );
    }

    // 3. Operacion en la base de datos
    // Usamos prisma.property.update para modificar unicamente el campo condition
    const updatedProperty = await prisma.property.update({
      where: { 
        id: propertyId 
      },
      data: { 
        condition: condition 
      }
    });

    // 4. Respuesta de éxito
    return NextResponse.json({
      success: true,
      message: "Condición de la propiedad actualizada correctamente.",
      data: {
        propertyId: updatedProperty.id,
        newCondition: updatedProperty.condition
      }
    });

  } catch (error: any) {
    console.error("Error en Webhook Agent Notes:", error);
    
    // Manejo de error si la propiedad no existe en la base de datos
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "No se encontró ninguna propiedad con el propertyId proporcionado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor al actualizar la propiedad." },
      { status: 500 }
    );
  }
}