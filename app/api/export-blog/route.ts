// app/api/export-blog/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ajusta esta ruta si tu cliente Prisma está en otro lado, ej: '@/prisma/client'

export async function GET(request: Request) {
  // Extraemos los parámetros de la URL
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // 1. Una pequeña medida de seguridad para que nadie más descargue tu blog
  if (secret !== 'migracion2024') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // 2. Extraemos los datos de la misma forma que lo hacías en tu script
    const posts = await prisma.post.findMany({
      include: {
        postImages: true, // Incluimos las imágenes
      },
    });

    // 3. Devolvemos los datos como un JSON puro
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error al exportar:', error);
    return NextResponse.json({ error: 'Error interno al exportar' }, { status: 500 });
  }
}