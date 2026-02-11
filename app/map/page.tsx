import { prisma } from '@/lib/prisma';
import Header from '@/app/components/Header'; 
import { Prisma } from '@prisma/client';
import SearchFilters from '@/app/components/SearchFilters'; 
// Importamos el nuevo componente split
import MapSplitView from './MapSplitView';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ 
    lang?: string;
    zip?: string;      
    feature?: string; 
  }>;
};

// ... (DICTIONARY se mantiene igual, no hace falta cambiarlo) ...
const DICTIONARY = {
  es: {
    title: 'Propiedades',
    listTitle: 'Resultados',
    viewDetails: 'Ver Detalles',
    beds: 'Hab',
    baths: 'Baños',
    sqft: 'Sqft',
    search: {
      zipLabel: "Zip",
      placeholder: "Ej: 28205",
      featureLabel: "Filtros",
      allOption: "Todas",
      searchBtn: "Buscar",
      garage: "Garage",
      pool: "Piscina",
      garden: "Jardín",
      fireplace: "Chimenea"
    }
  },
  en: {
    title: 'Properties',
    listTitle: 'Results',
    viewDetails: 'View Details',
    beds: 'Beds',
    baths: 'Baths',
    sqft: 'Sqft',
    search: {
      zipLabel: "Zip",
      placeholder: "Ex: 28205",
      featureLabel: "Filters",
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

  // --- LÓGICA DE FILTRADO (Igual) ---
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

  const propertiesRaw = await prisma.property.findMany({
    where: whereClause,
    select: {
      id: true,
      titleEn: true,
      titleEs: true,
      address: true,
      city: true,
      state: true,
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
    city: p.city,
    state: p.state,
    price: Number(p.price),
    lat: p.latitude as number,
    lng: p.longitude as number,
    slug: p.slug,
    image: p.mainImage,
    beds: p.bedrooms,
    baths: p.bathrooms,
    sqft: p.sqft
  }));

  const subtitle = lang === 'en' ? `${properties.length} found` : `${properties.length} encontradas`;

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] overflow-hidden font-sans text-gray-200">
       
       <Header lang={lang} activePage="properties" /> 

       <main className="flex-1 flex flex-col relative min-h-0">
           
           {/* 1. BARRA SUPERIOR (Filters) */}
           <div className="z-30 bg-[#121212] border-b border-gray-800 shadow-md flex-shrink-0">
               <div className="max-w-7xl mx-auto px-3 py-2 pr-32">
                   <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                       <div className="flex items-baseline justify-between sm:justify-start gap-3 border-b sm:border-b-0 border-gray-800 pb-1 sm:pb-0 mb-1 sm:mb-0">
                           <h1 className="text-sm font-black uppercase text-white tracking-wide">
                               {t.title}
                           </h1>
                           <span className="text-[10px] text-[#f8ed1a] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                               {subtitle}
                           </span>
                       </div>
                       <div className="flex-1">
                            <SearchFilters texts={t.search} variant="compact" />
                       </div>
                   </div>
               </div>
           </div>
           
           {/* 2. CONTENIDO INTERACTIVO (Split View) */}
           {/* Aquí cargamos el Client Component que maneja el estado del mapa */}
           <MapSplitView 
              properties={properties} 
              lang={lang} 
              t={t} 
           />

       </main>
    </div>
  );
}