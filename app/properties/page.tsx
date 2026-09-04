import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Header from '@/app/components/Header';
import { calculateEstimatedPayment, formatMoney, normalizeProperty } from '@/lib/utils';
import WhatsAppButton from '@/app/components/WhatsAppButton';
import { ZIP_COORDS } from '@/app/map/MapClient';

// Diccionario de coordenadas para nombres de vecindarios y ciudades
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "berclair": { lat: 35.1554, lng: -89.9142 },
  "bartlett": { lat: 35.2045, lng: -89.8737 },
  "cordova": { lat: 35.1663, lng: -89.7364 },
  "raleigh": { lat: 35.2132, lng: -89.9231 },
  "frayser": { lat: 35.2285, lng: -90.0076 },
  "germantown": { lat: 35.0935, lng: -89.7915 },
  "collierville": { lat: 35.0454, lng: -89.6806 },
  "midtown": { lat: 35.1311, lng: -89.9961 },
  "downtown": { lat: 35.1487, lng: -90.0519 },
};

function getDistanceFromLatLonInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Radio de la Tierra en millas
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- DICCIONARIO ---
const DICTIONARY = { 
   es: {
        filters: {
            title: "FILTRAR BÚSQUEDA",
            listingType: "Tipo de Oferta",
            allTypes: "Todos (Venta y Renta)",
            forSale: "Comprar",
            forRent: "Rentar",
            location: "Código Postal o Área",
            radius: "Distancia",
            exactArea: "Solo Área Exacta",
            withinHalfMile: "Dentro de 0.5 millas",
            within1Mile: "Dentro de 1 milla",
            within3Miles: "Dentro de 3 millas",
            within5Miles: "Dentro de 5 millas",
            priceRange: "Rango de Precio",
            minPrice: "Min $",
            maxPrice: "Max $",
            beds: "Dormitorios (Min)",
            baths: "Baños (Min)",
            btnFilter: "APLICAR FILTROS",
            reset: "Limpiar Filtros"
        },
        catalog: {
            titleSale: "CATÁLOGO DE VENTA",
            titleRent: "CATÁLOGO DE RENTA",
            titleAll: "CATÁLOGO DE PROPIEDADES",
            subtitle: "Encuentra tu próximo hogar sin bancos.",
            count: "propiedades encontradas",
            empty: "No hay propiedades que coincidan con tu búsqueda.",
            price: "Precio Total",
            deposit: "Depósito de Seguridad",
            monthly: "Mensualidad Est.",
            rentMonthly: "Renta Mensual",
            details: "Ver Detalles"
        },
        status: {
            available: "DISPONIBLE",
            comingSoon: "PRÓXIMAMENTE",
            underContract: "PENDIENTE"
        },
        specs: {
            beds: "Habitaciones",
            baths: "Baños",
            sqft: "Sqft"
        }
    },
    en: {
        filters: {
            title: "FILTER SEARCH",
            listingType: "Listing Type",
            allTypes: "All (Sale & Rent)",
            forSale: "Buy",
            forRent: "Rent",
            location: "Zip Code or Area",
            radius: "Distance",
            exactArea: "Exact Area Only",
            withinHalfMile: "Within 0.5 miles",
            within1Mile: "Within 1 mile",
            within3Miles: "Within 3 miles",
            within5Miles: "Within 5 miles",
            priceRange: "Price Range",
            minPrice: "Min $",
            maxPrice: "Max $",
            beds: "Bedrooms (Min)",
            baths: "Bathrooms (Min)",
            btnFilter: "APPLY FILTERS",
            reset: "Clear Filters"
        },
        catalog: {
            titleSale: "SALES CATALOG",
            titleRent: "RENTAL CATALOG",
            titleAll: "PROPERTY CATALOG",
            subtitle: "Find your next home without banks.",
            count: "properties found",
            empty: "No properties match your search.",
            price: "Total Price",
            deposit: "Security Deposit",
            monthly: "Est. Monthly",
            rentMonthly: "Monthly Rent",
            details: "View Details"
        },
        status: {
            available: "AVAILABLE",
            comingSoon: "COMING SOON",
            underContract: "PENDING"
        },
        specs: {
            beds: "Beds",
            baths: "Baths",
            sqft: "Sqft"
        }
    }
};

export default async function CatalogPage(props: {
  searchParams?: Promise<{
    zip?: string;
    location?: string;
    radius?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    lang?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];

  const typeParam = searchParams?.type;
  const searchType = typeParam === 'rent' ? 'rent' : typeParam === 'buy' ? 'buy' : '';
  const locationText = (searchParams?.location || searchParams?.zip || '').trim();
  const radius = searchParams?.radius ? Number(searchParams.radius) : undefined;

  const catalogName = lang === 'es' ? 'el Catálogo General' : 'the General Catalog';

  // Determinación de coordenadas del centro de búsqueda
  const locationLower = locationText.toLowerCase();
  let searchCenter: { lat: number; lng: number } | null = null;
  if (locationText) {
    if (ZIP_COORDS[locationText]) {
      searchCenter = ZIP_COORDS[locationText];
    } else if (AREA_COORDINATES[locationLower]) {
      searchCenter = AREA_COORDINATES[locationLower];
    }
  }

  const isRadiusSearch = Boolean(searchCenter && radius);

  // --- 1. LÓGICA DE FILTRADO PRISMA ---
  const whereClause: Prisma.PropertyWhereInput = {
    status: {
      in: ['AVAILABLE', 'COMING_SOON', 'UNDER_CONTRACT']
    },
    // Filtro Venta vs Renta
    ...(searchType === 'rent' ? { isForRent: true } : searchType === 'buy' ? { isForSale: true } : {}),
  };

  // Si NO es búsqueda por radio, se hace match textual en zip, ciudad o dirección
  if (locationText && !isRadiusSearch) {
    whereClause.OR = [
      { zipCode: { contains: locationText } },
      { city: { contains: locationText, mode: 'insensitive' } },
      { address: { contains: locationText, mode: 'insensitive' } },
    ];
  }

  if (searchParams?.minPrice || searchParams?.maxPrice) {
    const min = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
    const max = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;

    if (searchType === 'rent') {
      whereClause.monthlyRent = {
        ...(min !== undefined && { gte: min }),
        ...(max !== undefined && { lte: max }),
      };
    } else {
      whereClause.price = {
        ...(min !== undefined && { gte: min }),
        ...(max !== undefined && { lte: max }),
      };
    }
  }

  if (searchParams?.beds) {
    whereClause.bedrooms = { gte: Number(searchParams.beds) };
  }
  if (searchParams?.baths) {
    whereClause.bathrooms = { gte: Number(searchParams.baths) };
  }

  // --- 2. CONSULTA DB ---
  let rawProperties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { images: true } 
  });

  // --- 3. FILTRADO POR RADIO (0.5 millas, 1 milla, etc.) ---
  if (isRadiusSearch && searchCenter && radius) {
    rawProperties = rawProperties.filter(p => {
      if (!p.latitude || !p.longitude) return false;
      const dist = getDistanceFromLatLonInMiles(
        searchCenter!.lat,
        searchCenter!.lng,
        Number(p.latitude),
        Number(p.longitude)
      );
      return dist <= radius;
    });
  }

  // --- 4. CONVERSIÓN DE DATOS USANDO UTILS ---
  const properties = rawProperties.map(p => {
    const normalizedProperty = normalizeProperty(p);
    const mainImg = p.images.find(img => img.isMain)?.url || p.images[0]?.url || p.mainImage || '/placeholder.png';

    return {
        ...normalizedProperty,
        mainImageDisplay: mainImg,
        features: (p.features as string[]) || [],
        isForRent: p.isForRent,
        isForSale: p.isForSale,
        monthlyRent: Number(p.monthlyRent || 0),
        securityDeposit: Number(p.securityDeposit || 0),
    };
  });

  // Título del catálogo dinámico
  const catalogTitle = searchType === 'rent'
    ? t.catalog.titleRent
    : searchType === 'buy'
    ? t.catalog.titleSale
    : t.catalog.titleAll;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      
      {/* --- HEADER --- */}
      <Header lang={lang} activePage="properties" />

      {/* --- LAYOUT PRINCIPAL --- */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* === COLUMNA IZQUIERDA: FILTROS === */}
        <aside className="w-full lg:w-80 bg-[#121212] border-r border-gray-800 p-6 flex-shrink-0">
            <div className="sticky top-24">
                <h2 className="text-xl font-black text-[#f8ed1a] uppercase mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    {t.filters.title}
                </h2>
                
                <form className="space-y-6">
                    <input type="hidden" name="lang" value={lang} />

                    {/* Venta o Renta */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.listingType}</label>
                        <select name="type" defaultValue={searchType} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:outline-none">
                            <option value="">{t.filters.allTypes}</option>
                            <option value="buy">{t.filters.forSale}</option>
                            <option value="rent">{t.filters.forRent}</option>
                        </select>
                    </div>
                    
                    {/* Zip Code o Área */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.location}</label>
                        <input 
                          type="text" 
                          name="location" 
                          defaultValue={locationText} 
                          placeholder="Ex: 38016, Berclair, Cordova..." 
                          className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:outline-none focus:ring-1 focus:ring-[#f8ed1a] transition" 
                        />
                    </div>

                    {/* Selector de Distancia / Radio */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.radius}</label>
                        <select name="radius" defaultValue={searchParams?.radius || ''} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:outline-none">
                            <option value="">{t.filters.exactArea}</option>
                            <option value="0.5">{t.filters.withinHalfMile}</option>
                            <option value="1">{t.filters.within1Mile}</option>
                            <option value="3">{t.filters.within3Miles}</option>
                            <option value="5">{t.filters.within5Miles}</option>
                        </select>
                    </div>

                    {/* Precio */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.priceRange}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" name="minPrice" defaultValue={searchParams?.minPrice} placeholder={t.filters.minPrice} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white text-sm focus:border-[#f8ed1a] focus:outline-none" />
                            <input type="number" name="maxPrice" defaultValue={searchParams?.maxPrice} placeholder={t.filters.maxPrice} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white text-sm focus:border-[#f8ed1a] focus:outline-none" />
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.beds}</label>
                            <select name="beds" defaultValue={searchParams?.beds} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:outline-none">
                                <option value="">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.baths}</label>
                            <select name="baths" defaultValue={searchParams?.baths} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:outline-none">
                                <option value="">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                            </select>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="pt-4 space-y-3">
                        <button type="submit" className="w-full bg-[#f8ed1a] hover:bg-yellow-300 text-[#1a1a1a] font-black uppercase py-3 rounded shadow-lg transition-transform active:scale-95">
                            {t.filters.btnFilter}
                        </button>
                        <Link href={`/properties?lang=${lang}`} className="block w-full text-center text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider">
                            {t.filters.reset}
                        </Link>
                    </div>
                </form>
            </div>
        </aside>

        {/* === COLUMNA DERECHA: GRID DE PROPIEDADES === */}
        <main className="flex-1 p-6 lg:p-10 bg-[#1a1a1a]">
            
            {/* Título y Contador */}
            <div className="flex flex-col sm:flex-row justify-between items-end border-b border-gray-800 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                        {catalogTitle}
                    </h1>
                    <p className="text-gray-400">{t.catalog.subtitle}</p>
                </div>
                <div className="text-right">
                    <span className="text-[#f8ed1a] font-black text-xl">{properties.length}</span>
                    <span className="text-gray-500 font-bold uppercase text-sm ml-2">{t.catalog.count}</span>
                </div>
            </div>

            {/* Grid */}
            {properties.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl">
                    <p className="text-gray-500 text-xl font-bold">{t.catalog.empty}</p>
                    <Link href={`/properties?lang=${lang}`} className="mt-4 inline-block text-[#f8ed1a] underline font-bold">
                        {t.filters.reset}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {properties.map((property) => {
                        const isRentListing = searchType === 'rent' || (property.isForRent && !property.isForSale);
                        
                        // Cálculo estimado o renta fija según el tipo
                        const monthlyDisplay = isRentListing
                            ? property.monthlyRent
                            : calculateEstimatedPayment(
                                property.price,
                                property.downPayment,
                                property.taxes,
                                property.insurance,
                                property.interestRate
                              );

                        const totalDisplay = isRentListing
                            ? property.securityDeposit
                            : property.price;

                        // Lógica de Etiquetas de Estado
                        let statusLabel = t.status.available;
                        let statusColor = 'bg-[#529e14] text-white';

                        if (property.status === 'COMING_SOON') {
                            statusLabel = t.status.comingSoon;
                            statusColor = 'bg-blue-600 text-white';
                        } else if (property.status === 'UNDER_CONTRACT') {
                            statusLabel = t.status.underContract;
                            statusColor = 'bg-orange-500 text-white';
                        }

                        const firstFeature = property.features && property.features.length > 0 ? property.features[0] : null;

                        return (
                            <div key={property.id} className="group bg-[#242424] rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-[#f8ed1a] transition-all duration-300 hover:shadow-[0_0_20px_rgba(248,237,26,0.15)] flex flex-col">
                                
                                {/* Imagen */}
                                <div className="relative h-64 overflow-hidden">
                                    <Image 
                                        src={property.mainImageDisplay} 
                                        alt={lang === 'es' ? property.titleEs : property.titleEn} 
                                        fill 
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    
                                    {/* Etiqueta Dinámica */}
                                    <div className={`absolute top-4 left-4 text-xs font-black px-3 py-1 rounded uppercase shadow-md ${statusColor}`}>
                                        {statusLabel}
                                    </div>

                                    {firstFeature && (
                                        <div className="absolute top-4 right-4 bg-[#f8ed1a] text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-wider transform rotate-1 group-hover:rotate-0 transition-transform z-10">
                                            {firstFeature}
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                                        <h3 className="text-white font-bold text-lg leading-tight truncate">
                                            {property.address}
                                        </h3>
                                        <p className="text-gray-300 text-sm">{property.city}, {property.state} {property.zipCode}</p>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase mb-4 line-clamp-2 min-h-[3.5rem]">
                                            {lang === 'es' ? property.titleEs : property.titleEn}
                                        </h2>

                                        {/* Specs */}
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <span className="text-[#f8ed1a]">🛏</span>
                                                <span className="font-bold">{property.bedrooms}</span> <span className="text-xs uppercase">{t.specs.beds}</span>
                                            </div>
                                            <div className="h-4 w-px bg-gray-700"></div>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <span className="text-[#f8ed1a]">🛁</span>
                                                <span className="font-bold">{property.bathrooms}</span> <span className="text-xs uppercase">{t.specs.baths}</span>
                                            </div>
                                            <div className="h-4 w-px bg-gray-700"></div>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <span className="text-[#f8ed1a]">📏</span>
                                                <span className="font-bold">{property.sqft}</span> <span className="text-xs uppercase">{t.specs.sqft}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Precios Adaptativos */}
                                        <div className="space-y-1 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 font-bold uppercase">
                                                    {isRentListing ? t.catalog.deposit : t.catalog.price}
                                                </span>
                                                <span className="text-white font-bold">{formatMoney(totalDisplay)}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                                <span className="text-[#f8ed1a] font-bold uppercase text-xs">
                                                    {isRentListing ? t.catalog.rentMonthly : t.catalog.monthly}
                                                </span>
                                                <span className="text-[#f8ed1a] font-black text-lg">
                                                    {formatMoney(monthlyDisplay)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link */}
                                    <Link 
                                        href={`/propiedades/${property.slug}?lang=${lang}`} 
                                        className="block w-full text-center bg-white text-black font-black uppercase py-3 rounded hover:bg-[#f8ed1a] transition-colors"
                                    >
                                        {t.catalog.details}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
      </div>
      <WhatsAppButton lang={lang} propertyName={catalogName} />
    </div>
  );
}