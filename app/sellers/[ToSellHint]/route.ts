import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ToSellHint: string }> }
) {
  // 1. Obtener y limpiar la dirección de la URL
  const resolvedParams = await params;
  const rawHint = resolvedParams.ToSellHint;

  // Ignorar archivos estáticos
  if (rawHint.includes('.')) {
    return NextResponse.next();
  }

  // Convertir guiones a espacios (ej. "123-main-st" -> "123 main st")
  const addressQuery = rawHint.replace(/-/g, ' ');

  // URL base
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  try {
    // 2. Llamar a la API de análisis interna que usa el Widget
    // Nota: Como estamos en el servidor, usamos el baseUrl absoluto.
    const analyzeUrl = `${baseUrl}/api/analyze`;
    
    const response = await fetch(analyzeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Valor estándar 3 de condición, tal como solicitaste
      body: JSON.stringify({ address: addressQuery, conditionScale: 3 }) 
    });

    if (!response.ok) {
        // Si la API falla, significa que no pudo validar la dirección
        throw new Error('Dirección no validada por la API');
    }

    const data = await response.json();

    // Validar que la API realmente nos dio un ARV o coordenadas (indicador de éxito)
    if (!data.arv && !data.repairCosts) {
       throw new Error('Sin datos suficientes');
    }

    // 3. Dirección validada: Redirigir a /sellers/offer enviando la data por query params
    // Pasamos la dirección limpia y los datos para pre-llenar el funnel
    const targetUrl = new URL(`${baseUrl}/sellers/offer`);
    targetUrl.searchParams.set('address', addressQuery);
    targetUrl.searchParams.set('arv', data.arv?.toString() || '0');
    targetUrl.searchParams.set('rehabCosts', data.repairCosts?.toString() || '0');
    targetUrl.searchParams.set('rent', data.estimatedRent?.toString() || '0');
    targetUrl.searchParams.set('condition', '3'); // Condición estática
    
    // 308 redirección permanente o 302 temporal, dependiendo del caso de uso SEO
    return NextResponse.redirect(targetUrl.toString(), 302);

  } catch (error) {
    console.error("Error resolviendo la dirección en ToSellHint:", error);
    
    // 4. Si no existe o falla: redirigir a /sellers (con un parámetro opcional de error)
    return NextResponse.redirect(`${baseUrl}/sellers?error=not_found`, 302);
  }
}