import { NextResponse } from 'next/server';

// Función para calcular las reparaciones base
function calculateRepairs(sqft: number, yearBuilt: number, propertyType: string, conditionLevel: number = 3) {
  let baseCost = 15;
  if (yearBuilt > 0) {
    if (yearBuilt < 1950) baseCost = 75;
    else if (yearBuilt < 1978) baseCost = 60;
    else if (yearBuilt < 1990) baseCost = 40;
    else if (yearBuilt < 2000) baseCost = 25;
  }

  const typeMultipliers: Record<string, number> = {
    "Single Family": 1.0, "Multi-Family": 1.3, "Apartment": 1.3,
    "Condo": 0.6, "Townhouse": 0.8, "Mobile Home": 1.5, "Land": 0.0,
  };
  const conditionMultipliers: Record<number, number> = { 1: 0.40, 2: 0.70, 3: 1.00, 4: 1.35, 5: 1.75 };

  const typeMult = typeMultipliers[propertyType] || 1.0;
  const conditionMult = conditionMultipliers[conditionLevel] || 1.0;

  const repairPerSqft = baseCost * typeMult * conditionMult;
  return { 
    total: Math.round(sqft * repairPerSqft), 
    perSqft: Number(repairPerSqft.toFixed(2)) 
  };
}

// NUEVA FUNCIÓN: Calcula el ARV basado en los mejores comparables (Casas Remodeladas)
function calculateTopTierARV(comparables: any[], subjectSqft: number, fallbackPrice: number) {
  if (!comparables || comparables.length === 0 || subjectSqft === 0) return fallbackPrice;

  // Filtrar comps válidos y calcular precio por pie cuadrado
  const validComps = comparables
    .filter(c => c.price > 0 && c.squareFootage > 0)
    .map(c => ({
      ...c,
      pricePerSqft: c.price / c.squareFootage
    }));

  if (validComps.length === 0) return fallbackPrice;

  // Ordenar de mayor a menor precio por pie cuadrado
  validComps.sort((a, b) => b.pricePerSqft - a.pricePerSqft);

  // Tomar el Top 25% de los comparables (o máximo los 3 mejores)
  const topCount = Math.max(1, Math.min(3, Math.ceil(validComps.length * 0.25)));
  const topComps = validComps.slice(0, topCount);

  // Promediar el precio por pie cuadrado del Top Tier
  const avgTopPricePerSqft = topComps.reduce((acc, curr) => acc + curr.pricePerSqft, 0) / topComps.length;

  // Multiplicar por los pies cuadrados de la propiedad objetivo
  return Math.round(avgTopPricePerSqft * subjectSqft);
}

// NUEVA FUNCIÓN: Calcula la Renta Promedio usando comparables directos
function calculateAverageRent(comparables: any[], fallbackRent: number) {
  if (!comparables || comparables.length === 0) return fallbackRent;

  const validRents = comparables.filter(c => c.price > 0).map(c => c.price);
  if (validRents.length === 0) return fallbackRent;

  const totalRent = validRents.reduce((acc, curr) => acc + curr, 0);
  return Math.round(totalRent / validRents.length);
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Por favor ingresa una dirección.' }, { status: 400 });
    }

    const RENTCAST_KEY = process.env.RENTCAST_API_KEY;
    if (!RENTCAST_KEY) {
      return NextResponse.json({ error: 'Falta la clave de API de RentCast.' }, { status: 500 });
    }

    const headers = { 
      'X-Api-Key': RENTCAST_KEY, 
      'accept': 'application/json' 
    };

    const encodedAddress = encodeURIComponent(address);

    // 1. Ejecutar llamadas a la API en PARALELO
    const propPromise = fetch(`https://api.rentcast.io/v1/properties?address=${encodedAddress}`, { headers });
    const avmPromise = fetch(`https://api.rentcast.io/v1/avm/value?address=${encodedAddress}`, { headers });
    const rentPromise = fetch(`https://api.rentcast.io/v1/avm/rent/long-term?address=${encodedAddress}`, { headers });

    const [propRes, avmRes, rentRes] = await Promise.all([propPromise, avmPromise, rentPromise]);

    const propData = propRes.ok ? await propRes.json() : {};
    const avmData = avmRes.ok ? await avmRes.json() : {};
    const rentData = rentRes.ok ? await rentRes.json() : {};

    // 2. Procesar datos físicos de la propiedad
    const record = Array.isArray(propData) ? propData[0] : (propData.property || propData.properties?.[0] || {});
    
    const sqft = record.squareFootage || 1500;
    const yearBuilt = record.yearBuilt || 0;
    const propertyType = record.propertyType || "Single Family";
    const bedrooms = record.bedrooms || 3;
    const bathrooms = record.bathrooms || 2;
    
    const annualTaxes = record.propertyTaxes || 0;
    const taxesMonthly = annualTaxes > 0 ? Math.round(annualTaxes / 12) : 250;

    // 3. Extraer Valores Base de AVM
    const baseAvmPrice = avmData.price || 0;
    const baseAvmRent = rentData.rent || 0;

    // 4. Calcular Valores Mejorados usando Comparables
    const salesComps = avmData.comparables || [];
    const rentComps = rentData.comparables || [];

    const arv = calculateTopTierARV(salesComps, sqft, baseAvmPrice);
    const estimatedRent = calculateAverageRent(rentComps, baseAvmRent);

    // 5. Calcular costos de reparación y estado de la propiedad
    const repairs = calculateRepairs(sqft, yearBuilt, propertyType, 3);
    const lastSalePrice = record.lastSalePrice || null;
    const isDistressed = (lastSalePrice && arv > 0 && lastSalePrice < arv * 0.65) || (yearBuilt > 0 && yearBuilt < 1978);

    // 6. Retornar al frontend
    // 6. Retornar al frontend
    return NextResponse.json({
      address: record.formattedAddress || address,
      propertyType,
      bedrooms,
      bathrooms,
      sqft,
      yearBuilt,
      arv, // ARV Optimizado
      baseAvmPrice, // Mandamos el original por si queremos comparar
      estimatedRent, // Renta Optimizada
      repairCosts: repairs.total,
      taxesMonthly,
      isDistressed,
      salesCompsCount: salesComps.length,
      rentCompsCount: rentComps.length,
      // NUEVO: Enviamos la lista de comparables filtrados al frontend
      recentSales: salesComps
        .filter((c: any) => c.price > 0)
        .map((c: any) => ({
          address: c.formattedAddress || c.addressLine1 || 'Dirección no disponible',
          price: c.price
        }))
        .slice(0, 10) // Limitamos a los 10 mejores para no saturar la UI
    });

  } catch (error) {
    console.error("Error en la API de análisis:", error);
    return NextResponse.json({ error: 'Ocurrió un error al analizar la propiedad desde el servidor.' }, { status: 500 });
  }
}