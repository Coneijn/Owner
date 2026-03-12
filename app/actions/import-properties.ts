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

    // --- NUEVO: Calcular la fecha de hace exactamente un mes ---
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    for (const row of data) {
      const address = row['Address'];
      const city = row['City'];
      const state = row['State '] || row['State'];
      const zipCode = row['Zip Code'];
      
      if (!address || !city) continue;

      const baseSlug = slugify(`${address.split(',')[0]}-${city}`, { lower: true, strict: true });
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      await prisma.property.create({
        data: {
          slug: uniqueSlug,
          status: 'SOLD', // <-- Cambiado a VENDIDAS
          isForSale: true,
          isForRent: false,
          
          // --- NUEVO: Asignar las fechas retroactivas ---
          createdAt: oneMonthAgo,
          updatedAt: oneMonthAgo,
          
          titleEn: `Property at ${address.split(',')[0]}`,
          titleEs: `Propiedad en ${address.split(',')[0]}`,
          descriptionEn: `Beautiful property located in ${city}.`,
          descriptionEs: `Hermosa propiedad ubicada en ${city}.`,
          
          address: address.split(',')[0], // Guardamos solo la calle limpia si es posible
          city: city,
          state: state,
          zipCode: zipCode ? zipCode.toString() : '',
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