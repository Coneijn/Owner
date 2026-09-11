import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

interface NearbyPropertiesProps {
  currentPropertyId: string;
  latitude: number | null;
  longitude: number | null;
  lang: 'es' | 'en';
}

function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 3958.8; // Radio de la Tierra en millas (cambiar a 6371 para km)

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function NearbyProperties({
  currentPropertyId,
  latitude,
  longitude,
  lang,
}: NearbyPropertiesProps) {
  // Condición de guardia por si la propiedad no tiene coordenadas cargadas
  if (latitude === null || longitude === null) return null;

  // Consulta solo las propiedades disponibles, públicas y con coordenadas
  const candidateProperties = await prisma.property.findMany({
    where: {
      id: { not: currentPropertyId },
      status: 'AVAILABLE',
      isOffMarket: false,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleEs: true,
      price: true,
      monthlyRent: true,
      isForSale: true,
      isForRent: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      city: true,
      state: true,
      mainImage: true,
      latitude: true,
      longitude: true,
    },
  });

  if (candidateProperties.length === 0) return null;

  // Ordenar por cercanía y tomar las 2 primeras
  const nearbyProperties = candidateProperties
    .map((prop) => ({
      ...prop,
      distance: calculateDistanceMiles(
        latitude,
        longitude,
        prop.latitude as number,
        prop.longitude as number
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2);

  const labels = {
    es: {
      sectionTitle: 'PROPIEDADES CERCANAS DISPONIBLES',
      sectionSub: 'Explora otras opciones disponibles a pocos minutos de esta ubicación.',
      beds: 'hab',
      baths: 'baños',
      sqft: 'sqft',
      distance: 'a',
      milesAway: 'millas',
      viewProperty: 'VER PROPIEDAD',
    },
    en: {
      sectionTitle: 'NEARBY AVAILABLE PROPERTIES',
      sectionSub: 'Check out other available homes just a few miles away.',
      beds: 'beds',
      baths: 'baths',
      sqft: 'sqft',
      distance: '',
      milesAway: 'miles away',
      viewProperty: 'VIEW PROPERTY',
    },
  }[lang];

  return (
    <section className="mt-16 pt-12 border-t-2 border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] uppercase tracking-tight border-l-8 border-[#f8ed1a] pl-4 mb-2">
          {labels.sectionTitle}
        </h2>
        <p className="text-gray-500 font-medium pl-6 text-sm sm:text-base">
          {labels.sectionSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {nearbyProperties.map((item) => {
          const title = lang === 'en' ? item.titleEn : item.titleEs;
          const displayPrice = item.isForRent && item.monthlyRent
            ? `$${Number(item.monthlyRent).toLocaleString()}/mes`
            : item.price
            ? `$${Number(item.price).toLocaleString()}`
            : 'N/A';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Contenedor de Imagen */}
              <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                {item.mainImage ? (
                  <Image
                    src={item.mainImage}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin Imagen
                  </div>
                )}
                {/* Chip de Distancia */}
                <div className="absolute top-3 left-3 bg-[#1a1a1a]/90 text-white text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                  📍 {labels.distance} {item.distance.toFixed(1)} {labels.milesAway}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-black text-[#1a1a1a] mb-2 tracking-tight">
                    {displayPrice}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1 uppercase mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mb-4">
                    {item.city}, {item.state}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-600 border-t border-gray-100 pt-3 mb-6">
                    <span>🛏 {item.bedrooms} {labels.beds}</span>
                    <span>🛁 {item.bathrooms} {labels.baths}</span>
                    <span>📐 {item.sqft.toLocaleString()} {labels.sqft}</span>
                  </div>
                </div>

                <Link
                  href={`/propiedades/${item.slug}?lang=${lang}`}
                  className="w-full text-center bg-[#f8ed1a] hover:bg-[#e6db15] text-[#1a1a1a] font-black uppercase tracking-wide py-3 px-4 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                >
                  {labels.viewProperty}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}