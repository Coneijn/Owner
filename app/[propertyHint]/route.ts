import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import stringSimilarity from 'string-similarity';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ propertyHint: string }> }
) {
  // 1. En Next.js 15+, los params de las rutas dinámicas son promesas.
  const resolvedParams = await params;
  const rawHint = resolvedParams.propertyHint;

  // Ignorar peticiones automáticas del navegador a archivos estáticos
  if (rawHint.includes('.')) {
    return NextResponse.next();
  }

  // 2. Limpiar el texto: quitamos guiones, espacios y lo pasamos a minúsculas
  const hint = rawHint.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Extraer parámetros de la URL (ej. ?lang=es) para conservarlos
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';

  try {
    // 3. Consultar la BD trayendo solo lo estrictamente necesario
    const properties = await prisma.property.findMany({
      select: { 
        id: true, 
        slug: true, 
        address: true 
      },
    });

    let bestMatch = null;
    let highestScore = 0;

    // 4. Comparar el texto ingresado con los datos de cada propiedad
    for (const property of properties) {
      const cleanId = property.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSlug = property.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanAddress = property.address.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Calculamos qué tanto se parece (devuelve un valor de 0 a 1)
      const scoreId = stringSimilarity.compareTwoStrings(hint, cleanId);
      const scoreSlug = stringSimilarity.compareTwoStrings(hint, cleanSlug);
      const scoreAddress = stringSimilarity.compareTwoStrings(hint, cleanAddress);

      // Nos quedamos con la puntuación más alta de esta propiedad
      const maxScoreForProperty = Math.max(scoreId, scoreSlug, scoreAddress);

      if (maxScoreForProperty > highestScore) {
        highestScore = maxScoreForProperty;
        bestMatch = property;
      }
    }

    // 5. Redirección basada en la coincidencia
    if (bestMatch && highestScore >= 0.75) {
      // 308 es una redirección permanente (bueno para SEO)
      return NextResponse.redirect(new URL(`/propiedades/${bestMatch.slug}${queryString}`, request.url), 308);
    }

    // Si no alcanza el 75%, lo mandamos al catálogo de propiedades
    return NextResponse.redirect(new URL(`/properties${queryString}`, request.url), 302);

  } catch (error) {
    console.error("Error resolviendo URL amigable:", error);
    // Redirección de seguridad en caso de falla de conexión a BD
    return NextResponse.redirect(new URL(`/properties${queryString}`, request.url), 302);
  }
}