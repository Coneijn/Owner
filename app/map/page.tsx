import { prisma } from '@/lib/prisma';
import Header from '@/app/components/Header'; 
import MapSplitView from './MapSplitView';

// Desactiva el caché estático para que los filtros funcionen en tiempo real
export const dynamic = 'force-dynamic';

export default async function MapPage(props: { 
  searchParams: Promise<{ 
    lang?: string; 
    query?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    sqft?: string;
  }> 
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  // --- 1. DICCIONARIO BILINGÜE ---
  const DICTIONARY = {
    es: {
      sidebar: {
        results: "Resultados",
        inventory: "Inventario • Memphis, TN",
        viewList: "Ver Lista"
      },
      status: {
        forSale: "En Venta",
        comingSoon: "Próximamente",
        sold: "Vendido"
      },
      search: {
        placeholder: "Buscar dirección, ciudad o CP..."
      }
    },
    en: {
      sidebar: {
        results: "Results",
        inventory: "Memphis, TN • Inventory",
        viewList: "View List"
      },
      status: {
        forSale: "For Sale",
        comingSoon: "Coming Soon",
        sold: "Sold"
      },
      search: {
        placeholder: "Search address, city or zip..."
      }
    }
  };

  const t = DICTIONARY[lang];

  // --- 2. PARSEO DE FILTROS ---
  const queryText = searchParams?.query || '';
  // Convertimos strings a números seguros
  const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const minBeds = searchParams?.beds ? Number(searchParams.beds) : undefined;
  const minBaths = searchParams?.baths ? Number(searchParams.baths) : undefined;
  const minSqft = searchParams?.sqft ? Number(searchParams.sqft) : undefined;

  // --- 3. CONSTRUCCIÓN DE CONSULTA (WHERE CLAUSE) ---
  const whereClause: any = {
    // A. Estado Base: Solo propiedades activas
    OR: [
        { status: 'AVAILABLE' },
        { status: 'COMING_SOON' }
    ],
    
    // B. Búsqueda de Texto (Search Bar)
    // Busca coincidencias en Dirección, Ciudad o Zip Code
    ...(queryText && {
        AND: [{
            OR: [
                { address: { contains: queryText, mode: 'insensitive' } },
                { city: { contains: queryText, mode: 'insensitive' } },
                { zipCode: { contains: queryText } }
            ]
        }]
    }),

    // C. Filtro de Precio (Rango)
    ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
            ...(minPrice !== undefined && { gte: minPrice }), // Mayor o igual
            ...(maxPrice !== undefined && { lte: maxPrice }), // Menor o igual
        }
    }),

    // D. Filtros de Especificaciones (Mínimos)
    ...(minBeds !== undefined && { bedrooms: { gte: minBeds } }),
    ...(minBaths !== undefined && { bathrooms: { gte: minBaths } }),
    ...(minSqft !== undefined && { sqft: { gte: minSqft } }),
  };

  // --- 4. CONSULTA A LA BASE DE DATOS ---
  const rawProperties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }, // Las más nuevas primero
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
        status: true,
    }
  });

  // --- 5. MAPEO DE DATOS PARA EL CLIENTE ---
  const properties = rawProperties.map(p => ({
    id: p.id,
    title: lang === 'en' ? p.titleEn : p.titleEs,
    address: p.address,
    city: p.city,
    state: p.state,
    price: Number(p.price),
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    slug: p.slug,
    image: p.mainImage,
    beds: p.bedrooms,
    baths: p.bathrooms,
    sqft: p.sqft,
    status: p.status
  }));

  // --- 6. RENDERIZADO ---
  return (
    <div className="flex flex-col h-screen bg-[#0a0f1c] overflow-hidden">
        {/* Header Fijo */}
        <Header lang={lang} activePage="properties" />
        
        {/* Contenedor Principal (Mapa + Sidebar) */}
        <div className="flex-1 relative min-h-0">
            <MapSplitView 
                properties={properties} 
                lang={lang} 
                t={t} 
            />
        </div>
    </div>
  );
}