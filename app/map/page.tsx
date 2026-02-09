import { prisma } from '@/lib/prisma';
import MapLoader from './MapLoader';
import Header from '@/app/components/Header'; 
import { Prisma } from '@prisma/client';
// 1. RECUPERAMOS EL IMPORT DE FILTROS
import SearchFilters from '@/app/components/SearchFilters'; 

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ 
    lang?: string;
    zip?: string;      
    feature?: string; 
  }>;
};

// Diccionario de textos para los filtros
const DICTIONARY = {
  es: {
    title: 'Mapa de Propiedades',
    search: {
      zipLabel: "Código Postal",
      placeholder: "Ej: 28205",
      featureLabel: "Características",
      allOption: "Todas",
      searchBtn: "Buscar",
      garage: "Garage",
      pool: "Piscina",
      garden: "Jardín",
      fireplace: "Chimenea"
    }
  },
  en: {
    title: 'Property Map',
    search: {
      zipLabel: "Zip Code",
      placeholder: "Ex: 28205",
      featureLabel: "Features",
      allOption: "All",
      searchBtn: "Search",
      garage: "Garage",
      pool: "Pool",
      garden: "Garden",
      fireplace: "Fireplace"
    }
  }
};

export default async function MapaPage(props: Props) {
  
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];

  // --- LÓGICA DE FILTRADO ---
  const whereClause: Prisma.PropertyWhereInput = {
    latitude: { not: null },
    longitude: { not: null },
    status: 'AVAILABLE',
  };

  if (searchParams?.zip) {
    whereClause.zipCode = { contains: searchParams.zip };
  }

  if (searchParams?.feature) {
    whereClause.features = { has: searchParams.feature };
  }

  // --- CONSULTA ---
  const propertiesRaw = await prisma.property.findMany({
    where: whereClause,
    select: {
      id: true,
      titleEn: true,
      titleEs: true,
      address: true,
      price: true,
      latitude: true,
      longitude: true,
      slug: true,
      mainImage: true, 
      bedrooms: true,
      bathrooms: true,
      sqft: true,
    }
  });

  const properties = propertiesRaw.map(p => ({
    id: p.id,
    title: lang === 'en' ? p.titleEn : p.titleEs,
    address: p.address,
    price: Number(p.price),
    lat: p.latitude as number,
    lng: p.longitude as number,
    slug: p.slug,
    image: p.mainImage,
    beds: p.bedrooms,
    baths: p.bathrooms,
    sqft: p.sqft
  }));

  const subtitle = lang === 'en' ? `${properties.length} properties found` : `${properties.length} propiedades encontradas`;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
       
       <Header lang={lang} activePage="properties" /> 

       <main className="flex-1 flex flex-col relative min-h-0">
           
           {/* 1. BARRA DE TÍTULO */}
           <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center shrink-0">
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase text-[#1a1a1a] tracking-tight">
                    {t.title}
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    {subtitle}
                </p>
              </div>
           </div>

           {/* 2. CONTENEDOR DE FILTROS 
               Usamos 'pt-12' (padding top) para neutralizar el '-mt-10' (margen negativo)
               que tiene el componente SearchFilters internamente.
           */}
           <div className="bg-gray-100 relative z-20 px-4 pt-12 pb-2">
                <div className="max-w-5xl mx-auto">
                    <SearchFilters texts={t.search} />
                </div>
           </div>
           
           {/* 3. MAPA (Ocupa el resto del espacio) */}
           <div className="flex-1 relative w-full h-full bg-gray-100 z-0 border-t border-gray-200">
              <MapLoader properties={properties} />
           </div>

       </main>
    </div>
  );
}