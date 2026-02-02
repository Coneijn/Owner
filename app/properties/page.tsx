import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; 
import LanguageSwitch from '@/app/components/LanguageSwitch'; 
import { Prisma } from '@prisma/client';

// --- DICCIONARIO EXTENDIDO ---
const DICTIONARY = { 
   es: {
        nav: { home: "Inicio", properties: "Propiedades", about: "Nosotros", contact: "Contacto" },
        filters: {
            title: "FILTRAR BÚSQUEDA",
            zip: "Código Postal",
            priceRange: "Rango de Precio",
            minPrice: "Min $",
            maxPrice: "Max $",
            beds: "Dormitorios (Min)",
            baths: "Baños (Min)",
            btnFilter: "APLICAR FILTROS",
            reset: "Limpiar Filtros"
        },
        catalog: {
            title: "CATÁLOGO DE VENTA",
            subtitle: "Encuentra tu próximo hogar sin bancos.",
            count: "propiedades encontradas",
            empty: "No hay propiedades que coincidan con tu búsqueda.",
            price: "Precio Total",
            monthly: "Mensualidad Est.",
            details: "Ver Detalles"
        }
    },
    en: {
        nav: { home: "Home", properties: "Properties", about: "About Us", contact: "Contact" },
        filters: {
            title: "FILTER SEARCH",
            zip: "Zip Code",
            priceRange: "Price Range",
            minPrice: "Min $",
            maxPrice: "Max $",
            beds: "Bedrooms (Min)",
            baths: "Bathrooms (Min)",
            btnFilter: "APPLY FILTERS",
            reset: "Clear Filters"
        },
        catalog: {
            title: "SALES CATALOG",
            subtitle: "Find your next home without banks.",
            count: "properties found",
            empty: "No properties match your search.",
            price: "Total Price",
            monthly: "Est. Monthly",
            details: "View Details"
        }
    }
};

export default async function CatalogPage(props: {
  searchParams?: Promise<{
    zip?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    lang?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];

  // --- 1. LÓGICA DE FILTRADO (Query Dinámica) ---
  const whereClause: Prisma.PropertyWhereInput = {
    status: 'AVAILABLE', // Solo mostramos disponibles
  };

  // Filtro: Código Postal
  if (searchParams?.zip) {
    whereClause.zipCode = { contains: searchParams.zip };
  }

  // Filtro: Rango de Precio
  if (searchParams?.minPrice || searchParams?.maxPrice) {
    whereClause.price = {};
    if (searchParams.minPrice) whereClause.price.gte = Number(searchParams.minPrice);
    if (searchParams.maxPrice) whereClause.price.lte = Number(searchParams.maxPrice);
  }

  // Filtro: Habitaciones y Baños
  if (searchParams?.beds) {
    whereClause.bedrooms = { gte: Number(searchParams.beds) };
  }
  if (searchParams?.baths) {
    whereClause.bathrooms = { gte: Number(searchParams.baths) };
  }

  // --- 2. CONSULTA A BASE DE DATOS ---
  const rawProperties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { images: true } 
  });

  // --- 3. CONVERSIÓN DE DATOS (Decimal -> Number) ---
  const properties = rawProperties.map(p => {
    const mainImg = p.images.find(img => img.isMain)?.url || p.images[0]?.url || p.mainImage || '/placeholder.png';

    return {
        ...p,
        mainImageDisplay: mainImg,
        price: p.price.toNumber(),
        downPayment: p.downPayment.toNumber(),
        interestRate: p.interestRate.toNumber(),
        taxes: p.taxes ? p.taxes.toNumber() : 0,
        insurance: p.insurance ? p.insurance.toNumber() : 0,
    };
  });

  // Helper para formato de moneda
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      
      {/* --- HEADER ESTANDARIZADO --- */}
      <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* --- UBICACIÓN DEL BOTÓN DE IDIOMA --- */}
          <div className="absolute top-25 right-4 sm:right-6 lg:right-8 z-20">
            <div className="scale-75 origin-top-right md:scale-90">
              <LanguageSwitch />
            </div>
          </div>
          {/* ------------------------------------------- */}

          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href={`/?lang=${lang}`} className="flex items-center gap-2">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
                 <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-sm md:text-xl font-black uppercase text-white">
                DUEÑO A <span className="text-[#f8ed1a]">DUEÑO</span>
              </span>
            </Link>

            <div className="flex gap-4 items-center">
                <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-400">
                    <Link href={`/?lang=${lang}`} className="hover:text-white transition">{t.nav.home}</Link>
                    
                    {/* Propiedades Activo (Amarillo y sin link) */}
                    <span className="text-[#f8ed1a]">{t.nav.properties}</span>
                    
                    <Link href={`/about-us?lang=${lang}`} className="hover:text-white transition">{t.nav.about}</Link>
                    <Link href={`/contact-us?lang=${lang}`} className="hover:text-white transition">{t.nav.contact}</Link>
                </nav>
                <Link href="/login" className="bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-3 py-2 md:px-4 md:py-2 rounded-md font-bold text-xs md:text-sm transition-colors uppercase">
                  Login
                </Link>
            </div>
          </div>
        </div>
      </header>

      {/* --- LAYOUT PRINCIPAL (Dos Columnas) --- */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* === COLUMNA IZQUIERDA: FILTROS === */}
        <aside className="w-full lg:w-80 bg-[#121212] border-r border-gray-800 p-6 flex-shrink-0">
            <div className="sticky top-24">
                <h2 className="text-xl font-black text-[#f8ed1a] uppercase mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    {t.filters.title}
                </h2>
                
                {/* Formulario GET estándar */}
                <form className="space-y-6">
                    <input type="hidden" name="lang" value={lang} />

                    {/* Zip Code */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.filters.zip}</label>
                        <input type="text" name="zip" defaultValue={searchParams?.zip} placeholder="Ex: 28205" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:outline-none focus:ring-1 focus:ring-[#f8ed1a] transition" />
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
                        {/* RESET APUNTA A /properties */}
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
                        {t.catalog.title}
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
                    {properties.map((property) => (
                        <div key={property.id} className="group bg-[#242424] rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-[#f8ed1a] transition-all duration-300 hover:shadow-[0_0_20px_rgba(248,237,26,0.15)] flex flex-col">
                            
                            {/* Imagen */}
                            <div className="relative h-64 overflow-hidden">
                                <Image 
                                    src={property.mainImageDisplay} 
                                    alt={lang === 'es' ? property.titleEs : property.titleEn} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-[#529e14] text-white text-xs font-black px-3 py-1 rounded uppercase shadow-md">
                                    AVAILABLE
                                </div>
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
                                            <span className="font-bold">{property.bedrooms}</span> <span className="text-xs uppercase">Beds</span>
                                        </div>
                                        <div className="h-4 w-px bg-gray-700"></div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <span className="text-[#f8ed1a]">🚿</span>
                                            <span className="font-bold">{property.bathrooms}</span> <span className="text-xs uppercase">Baths</span>
                                        </div>
                                        <div className="h-4 w-px bg-gray-700"></div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <span className="text-[#f8ed1a]">📐</span>
                                            <span className="font-bold">{property.sqft}</span> <span className="text-xs uppercase">Sqft</span>
                                        </div>
                                    </div>
                                    
                                    {/* Precios */}
                                    <div className="space-y-1 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold uppercase">{t.catalog.price}</span>
                                            <span className="text-white font-bold">{formatMoney(property.price)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                            <span className="text-[#f8ed1a] font-bold uppercase text-xs">{t.catalog.monthly}</span>
                                            {/* Cálculo simple de hipoteca estimada (Placeholder) */}
                                            <span className="text-[#f8ed1a] font-black text-lg">
                                                {formatMoney((property.price - property.downPayment) * ((property.interestRate / 100) / 12))}*
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link 
                                    href={`/propiedades/${property.slug}?lang=${lang}`} 
                                    className="block w-full text-center bg-white text-black font-black uppercase py-3 rounded hover:bg-[#f8ed1a] transition-colors"
                                >
                                    {t.catalog.details}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
      </div>
    </div>
  );
}