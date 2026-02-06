// app/map/page.tsx
import { prisma } from '@/lib/prisma'; // 1. Importar Prisma
import MapLoader from './MapLoader';

export const dynamic = 'force-dynamic'; // Opcional: Para asegurar que no cachee datos viejos si cambian mucho

export default async function MapaPage() {
  
  // 2. Obtener datos REALES de la base de datos
  // Filtramos para traer solo las que tienen latitud y longitud
  const propertiesRaw = await prisma.property.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      status: 'AVAILABLE', // Opcional: Si solo quieres mostrar las disponibles
    },
    select: {
      id: true,
      titleEn: true,
      address: true,
      price: true,
      latitude: true,
      longitude: true,
      slug: true,
      mainImage: true, // Útil para el popup del mapa
      bedrooms: true,
      bathrooms: true,
      sqft: true,
    }
  });

  // 3. Transformar datos (Mapeo)
  // Convertimos Decimal a Number y renombramos campos si es necesario
  const properties = propertiesRaw.map(p => ({
    id: p.id,
    title: p.titleEn, // Usamos el título en inglés (o el que prefieras)
    address: p.address,
    price: Number(p.price), // IMPORTANTE: Convertir Decimal a Number
    lat: p.latitude as number, // Prisma devuelve Float? (null o number), aquí aseguramos que es number
    lng: p.longitude as number,
    slug: p.slug,
    image: p.mainImage,
    bed: p.bedrooms,
    bath: p.bathrooms,
    sqft: p.sqft
  }));

  return (
    <main className="flex flex-col h-screen">
       <div className="p-4 bg-white shadow-md z-10 relative">
          <h1 className="text-2xl font-black uppercase text-gray-800">Mapa de Propiedades</h1>
          <p className="text-sm text-gray-500">
            Explora las {properties.length} casas disponibles en Memphis.
          </p>
       </div>
       
       <div className="flex-1 relative">
          {/* Pasamos los datos reales */}
          <MapLoader properties={properties} />
       </div>
    </main>
  );
}