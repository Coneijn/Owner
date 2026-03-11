'use server'

import prisma from '@/lib/prisma'
import Papa from 'papaparse'
import slugify from 'slugify'

const parseNumber = (value: string | undefined): number | null => {
  if (!value) return null;
  const cleaned = value.replace(/[$,% ]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

// Función mejorada para obtener coordenadas
const getCoordinates = async (fullAddressString: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error("FALTA API KEY: No se ha configurado GOOGLE_MAPS_API_KEY en el .env");
    return { lat: null, lng: null };
  }

  const encodedAddress = encodeURIComponent(fullAddressString);
  
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`);
    const data = await res.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      // Mostrará en la terminal el motivo exacto si Google rechaza la petición
      console.error(`Google API falló para "${fullAddressString}":`, data.status, data.error_message || '');
    }
  } catch (error) {
    console.error("Error de conexión al obtener coordenadas:", error);
  }
  return { lat: null, lng: null };
};

export async function importPropertiesFromCSV(csvContent: string) {
  try {
    const { data, errors } = Papa.parse<any>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return { success: false, error: 'Error al leer el formato del CSV' };
    }

    let importedCount = 0;

    for (const row of data) {
      const address = row['Address'];
      const city = row['City'];
      const state = row['State '] || row['State'];
      const zipCode = row['Zip Code'];
      
      if (!address || !city) continue;

      // Usamos directamente la columna Address porque el CSV ya trae el formato completo
      const coords = await getCoordinates(address);
      console.log(`Obteniendo coordenadas para: ${address} -> Lat: ${coords.lat}, Lng: ${coords.lng}`);
      const baseSlug = slugify(`${address.split(',')[0]}-${city}`, { lower: true, strict: true });
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      await prisma.property.create({
        data: {
          slug: uniqueSlug,
          status: 'SOLD', // <-- Cambiado a VENDIDAS
          isForSale: true,
          isForRent: false,
          
          titleEn: `Property at ${address.split(',')[0]}`,
          titleEs: `Propiedad en ${address.split(',')[0]}`,
          descriptionEn: `Beautiful property located in ${city}.`,
          descriptionEs: `Hermosa propiedad ubicada en ${city}.`,
          
          address: address.split(',')[0], // Guardamos solo la calle limpia si es posible
          city: city,
          state: state,
          zipCode: zipCode ? zipCode.toString() : '',
          latitude: coords.lat,  // <-- Coordenadas inyectadas aquí
          longitude: coords.lng,
          
          bedrooms: parseInt(row['Bed']) || 0,
          bathrooms: parseFloat(row['Bath ']) || parseFloat(row['Bath']) || 0,
          sqft: parseNumber(row['Sqft']) || 0,
          yearBuilt: parseInt(row['Year of Built']) || null,
          
          price: parseNumber(row['Total Asking Price']),
          downPayment: parseNumber(row['Down Payment ']),
          interestRate: parseNumber(row['Interest rate']),
          taxes: parseNumber(row['Tenant Tax']),
          insurance: parseNumber(row['Tenant Insurance']),
          
          mainImage: '/casa.png', 
        }
      });
      importedCount++;
    }

    return { success: true, count: importedCount };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, error: 'Ocurrió un error al procesar la base de datos' };
  }
}