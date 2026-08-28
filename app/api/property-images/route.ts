import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instancia de Prisma basada en tu configuración
const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Extraer los parámetros de la URL
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  const imageId = searchParams.get('imageId');
  try {
    // 1. Extraer una imagen específica por su ID
    if (imageId) {
      const image = await prisma.propertyImage.findUnique({
        where: { id: imageId },
      });
      if (!image) {
        return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
      }
      return NextResponse.json(image);
    }
    // 2. Consultar las imágenes asociadas al ID de una propiedad
    if (propertyId) {
      const images = await prisma.propertyImage.findMany({
        where: { propertyId: propertyId },
        select: {
          id: true,
          altText: true,
        },
      });
      return NextResponse.json(images);
    }
    // 3. Manejo de error si no se envían parámetros válidos
    return NextResponse.json(
      { error: "Debes proporcionar un 'propertyId' o un 'imageId'" }, 
      { status: 400 }
    );
  } catch (error) {
    console.error("Error consultando imágenes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}