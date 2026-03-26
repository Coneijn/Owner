import { NextResponse } from 'next/server';

// Función para calcular las reparaciones base
// Se agregó conditionScale donde 0 = Sin reparaciones, 5 = Reparaciones mayores
function calculateRepairs(sqft: number, yearBuilt: number, propertyType: string, conditionScale: number = 3) {
  let baseCost = 15; // Costo base por pie cuadrado
  
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
  
  // Nueva escala de condición (0 a 5)
  const conditionMultipliers: Record<number, number> = { 
    0: 0.00, // 0: Lista para mudarse / Recién remodelada (Sin costo)
    1: 0.30, // 1: Detalles cosméticos mínimos (Pintura ligera)
    2: 0.60, // 2: Reparaciones menores (Alfombras, retoques)
    3: 1.00, // 3: Promedio / Desgaste normal de los años (Multiplicador base)
    4: 1.50, // 4: Necesita trabajo considerable (Cocina/baños viejos, techo)
    5: 2.00  // 5: Reparaciones mayores / Rehabilitación profunda (Estructural, destripado)
  };

  const typeMult = typeMultipliers[propertyType] || 1.0;
  // Asegurarnos de que el multiplicador exista, si no, usar el de nivel 3
  const conditionMult = conditionMultipliers[conditionScale] !== undefined ? conditionMultipliers[conditionScale] : 1.0;

  const repairPerSqft = baseCost * typeMult * conditionMult;
  
  return { 
    total: Math.round(sqft * repairPerSqft), 
    perSqft: Number(repairPerSqft.toFixed(2)) 
  };
}

// Añadimos subjectType como parámetro
function calculateTopTierARV(comparables: any[], subjectSqft: number, fallbackPrice: number, subjectType: string) {
  if (!comparables || comparables.length === 0 || subjectSqft === 0) return fallbackPrice;

  // 1. Establecer límites de tamaño (Ej: +/- 20% de los pies cuadrados objetivo)
  const minSqft = subjectSqft * 0.8;
  const maxSqft = subjectSqft * 1.2;

  // 2. Filtrar por tamaño similar y tipo de propiedad (opcional pero muy recomendado)
  let validComps = comparables
    .filter(c => 
      c.price > 0 && 
      c.squareFootage > 0 &&
      c.squareFootage >= minSqft && 
      c.squareFootage <= maxSqft
      // && c.propertyType === subjectType // Descomenta esto si el API te devuelve propertyType en los comps
    )
    .map(c => ({
      ...c,
      pricePerSqft: c.price / c.squareFootage
    }));

  // Si el filtro de tamaño fue muy estricto y nos quedamos sin comps, 
  // podríamos relajarlo o simplemente usar el fallback.
  if (validComps.length === 0) return fallbackPrice;

  // 3. Ahora sí, ordenar de mayor a menor precio por pie cuadrado
  validComps.sort((a, b) => b.pricePerSqft - a.pricePerSqft);

  // 4. Tomar el Top 25% (máximo 3)
  const topCount = Math.max(1, Math.min(3, Math.ceil(validComps.length * 0.25)));
  const topComps = validComps.slice(0, topCount);

  // 5. Promediar y calcular
  const avgTopPricePerSqft = topComps.reduce((acc, curr) => acc + curr.pricePerSqft, 0) / topComps.length;

  return Math.round(avgTopPricePerSqft * subjectSqft);
}

function calculateAverageRent(comparables: any[], fallbackRent: number) {
  if (!Array.isArray(comparables) || comparables.length === 0) return fallbackRent;

  const validRents = comparables
    .map(c => Number(c?.price)) 
    .filter(price => !isNaN(price) && price > 0); 

  if (validRents.length === 0) return fallbackRent;

  const totalRent = validRents.reduce((acc, curr) => acc + curr, 0);
  return Math.round(totalRent / validRents.length);
}

export async function POST(req: Request) {
  try {
    
    const { address, conditionScale = 3 } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Por favor ingresa una dirección.' }, { status: 400 });
    }

    // Validamos que conditionScale sea un número entre 0 y 5
    const validCondition = Math.max(0, Math.min(5, Number(conditionScale)));

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
    
    const sqft = Number(record.squareFootage) || 1500;
    const yearBuilt = Number(record.yearBuilt) || 0;
    const propertyType = record.propertyType || "Single Family";
    const bedrooms = Number(record.bedrooms) || 3;
    const bathrooms = Number(record.bathrooms) || 2;
    const ownerName = record.owner?.names?.[0] || 'Desconocido';
    const lastSaleDate = record.lastSaleDate ? new Date(record.lastSaleDate).toLocaleDateString() : 'N/A';
    const county = record.county || 'Condado N/A';
    const city = record.city || 'Ciudad N/A';
    const lotSize = Number(record.lotSize) || 0;
    const garage = Number(record.garageSpaces) || 0;

    const baseAvmPrice = Number(avmData.price) || 0;
    const baseAvmRent = Number(rentData.rent) || 0;
    
    const salesComps = avmData.comparables || [];
    const rentComps = rentData.comparables || [];

const arv = calculateTopTierARV(salesComps, sqft, baseAvmPrice, propertyType);    
const estimatedRent = calculateAverageRent(rentComps, baseAvmRent);


    // 5. LÓGICA DE IMPUESTOS Y SEGUROS (Requisito del Ticket)
    let annualTaxes = Number(record.propertyTaxes) || 0;

    // Fallback de Impuestos: Si no hay datos, usar el 2% del precio de venta estimado (ARV)
    if (annualTaxes === 0 && arv > 0) {
      annualTaxes = arv * 0.02;
    }
    const taxesMonthly = Math.round(annualTaxes / 12);

    // Fallback de Seguros: Si no hay, estimamos un 0.5% del ARV anual por defecto
    let insuranceAnnual = Number(record.propertyInsurance) || 0;
    if (insuranceAnnual === 0 && arv > 0) {
      insuranceAnnual = arv * 0.005;
    }

    // 5. Calcular costos de reparación y estado de la propiedad usando la NUEVA escala
    const repairs = calculateRepairs(sqft, yearBuilt, propertyType, validCondition);
    const lastSalePrice = Number(record.lastSalePrice) || null;
    const isDistressed = (lastSalePrice && arv > 0 && lastSalePrice < arv * 0.65) || (yearBuilt > 0 && yearBuilt < 1978);

    // 6. Retornar al frontend
    return NextResponse.json({
      address: record.formattedAddress || address,
      propertyType,
      bedrooms,
      bathrooms,
      sqft,
      yearBuilt,
      lotSize,
      garage,
      arv, 
      baseAvmPrice, 
      estimatedRent, 
      repairCosts: repairs.total,
      taxesMonthly,
      annualTaxes,
      insuranceAnnual,
      isDistressed,
      ownerName,
      lastSaleDate,
      lastSalePrice,
      county,
      city,
      conditionScale: validCondition, // Devolvemos la escala usada para validación
      salesCompsCount: salesComps.length,
      rentCompsCount: rentComps.length,

      recentSales: salesComps
        .filter((c: any) => c.price > 0)
        .map((c: any) => ({
          address: c.formattedAddress || c.addressLine1 || 'Dirección no disponible',
          price: c.price,
          lat: Number(c.latitude) || 0,
          lng: Number(c.longitude) || 0,
          saleDate: c.removedDate || c.listedDate || null,
          bedrooms: c.bedrooms || null, 
          bathrooms: c.bathrooms || null,
          sqft: c.squareFootage || c.squareFeet || 0 // ¡Aquí estaba el missing link!
        }))
        .slice(0, 10),
        recentRents: rentComps
        .filter((c: any) => c.price > 0)
        .map((c: any) => ({
          address: c.formattedAddress || c.addressLine1 || 'Dirección no disponible',
          price: c.price,
          lat: Number(c.latitude) || 0,
          lng: Number(c.longitude) || 0,
          listedDate: c.listedDate || null,
          bedrooms: c.bedrooms || null,
          bathrooms: c.bathrooms || null,
          sqft: c.squareFootage || c.squareFeet || 0
        }))
        .slice(0, 10)
    });

  } catch (error) {
    console.error("Error en la API de análisis:", error);
    return NextResponse.json({ error: 'Ocurrió un error al analizar la propiedad desde el servidor.' }, { status: 500 });
  }
}