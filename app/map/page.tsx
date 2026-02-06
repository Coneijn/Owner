import { prisma } from '@/lib/prisma';
import MapLoader from './MapLoader';

export const dynamic = 'force-dynamic';

export default async function MapaPage() {
  
  // 1. Obtener datos (Asegurando traer el SLUG)
  const propertiesRaw = await prisma.property.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      status: 'AVAILABLE',
    },
    select: {
      id: true,
      titleEn: true,
      address: true,
      price: true,
      latitude: true,
      longitude: true,
      slug: true, // <--- Importante: Seleccionar slug
    }
  });

  // 2. Transformar datos para el cliente
  const properties = propertiesRaw.map(p => ({
    id: p.id,
    title: p.titleEn,
    address: p.address,
    price: Number(p.price),
    lat: p.latitude as number,
    lng: p.longitude as number,
    slug: p.slug // <--- Importante: Pasar slug
  }));

  return (
    <main className="flex flex-col h-[calc(100vh-80px)]">
       {/* Barra superior flotante o fija */}
       <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase text-[#1a1a1a]">Mapa de Propiedades</h1>
            <p className="text-xs text-gray-500">
                Mostrando {properties.length} ubicaciones disponibles
            </p>
          </div>
       </div>
       
       {/* Contenedor del mapa */}
       <div className="flex-1 relative w-full">
          <MapLoader properties={properties} />
       </div>
    </main>
  );
}