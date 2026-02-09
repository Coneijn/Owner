import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; 
import SearchFilters from './components/SearchFilters'; 
import PropertiesCarousel from './components/PropertiesCarousel'; 
import { Prisma } from '@prisma/client';
import Script from 'next/script';
import Header from '@/app/components/Header'; 
import MapLoader from '@/app/map/MapLoader'; 

// --- DICCIONARIO ---
const DICTIONARY = { 
   es: {
        heroTitle: "TU CASA PROPIA, SIN BANCOS NI COMPLICACIONES",
        heroSub: "Explora el mapa y encuentra tu nuevo hogar. Financiamiento directo de Dueño a Dueño.",
        btnProps: "Ver casas disponibles",
        availableTitle: "PROPIEDADES DESTACADAS",
        monthlyPayment: "Pago Mensual Est.",
        totalPrice: "Precio Total",
        availability: "DISPONIBLE",
        offMarket: "FUERA DEL MERCADO",
        noResults: "No se encontraron propiedades con esos filtros.",
        details: "Ver Detalles",
        beds: "Hab",
        baths: "Baños",
        downPayment: "Enganche",
        location: "Ubicación",
        footerContact: "Contáctanos",
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
        },
        trust: {
          title: "¿POR QUÉ CONFIAR EN NOSOTROS?",
          items: [
            { title: "EXPERIENCIA PROBADA", desc: "Más de 10 años ayudando familias.", icon: "/house.png" },
            { title: "SIN BUROCRACIA", desc: "Proceso rápido y sencillo, sin bancos.", icon: "/handshake.png" },
            { title: "ACCESO DIRECTO", desc: "Trato directo con los dueños.", icon: "/key.png" }
          ]
        },
        mapBtn: "Ver Pantalla Completa"
    },
    en: {
        heroTitle: "YOUR OWN HOME, NO BANKS, NO HASSLE",
        heroSub: "Explore the map and find your new home. Direct Owner-to-Owner financing.",
        btnProps: "See Available Homes",
        availableTitle: "FEATURED PROPERTIES",
        monthlyPayment: "Est. Monthly Pmt",
        totalPrice: "Total Price",
        availability: "AVAILABLE",
        offMarket: "OFF MARKET",
        noResults: "No properties found matching your filters.",
        details: "View Details",
        beds: "Beds",
        baths: "Baths",
        downPayment: "Down Payment",
        location: "Location",
        footerContact: "Contact Us",
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
        },
        trust: {
          title: "WHY TRUST US?",
          items: [
            { title: "PROVEN EXPERIENCE", desc: "Over 10 years helping families.", icon: "/house.png" },
            { title: "NO BUREAUCRACY", desc: "Fast and simple process, no banks.", icon: "/handshake.png" },
            { title: "DIRECT ACCESS", desc: "Direct deal with owners.", icon: "/key.png" }
          ]
        },
        mapBtn: "View Full Map"
    }
};

export default async function HomePage(props: {
  searchParams?: Promise<{
    zip?: string;
    feature?: string;
    lang?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];

  // --- Lógica de Búsqueda ---
  const whereClause: Prisma.PropertyWhereInput = {
    status: 'AVAILABLE',
  };

  if (searchParams?.zip) {
    whereClause.zipCode = { contains: searchParams.zip };
  }

  if (searchParams?.feature) {
    whereClause.features = { has: searchParams.feature };
  }

  // --- Consulta 1: Propiedades para el Carrusel/Lista ---
  const rawProperties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  const properties = rawProperties.map(p => ({
    ...p,
    price: p.price.toNumber(),
    downPayment: p.downPayment.toNumber(),
    interestRate: p.interestRate.toNumber(),
    taxes: p.taxes ? p.taxes.toNumber() : 0,
    insurance: p.insurance ? p.insurance.toNumber() : 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  // --- 2. Consulta 2: DATOS PARA EL MAPA ---
  const mapPropertiesRaw = await prisma.property.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      status: 'AVAILABLE',
    },
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

  const mapProperties = mapPropertiesRaw.map(p => ({
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

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-800 scroll-smooth">
      
      {/* --- HEADER --- */}
      <Header lang={lang} activePage="home" />

      {/* --- HERO MAP SECTION --- */}
      <section className="relative bg-[#1a1a1a] pt-8 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
              
              {/* Bloque de Texto + Botón "Arribita" */}
              <div className="text-center mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter leading-tight md:leading-none">
                      {t.heroTitle}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-300 font-medium max-w-3xl mx-auto mb-8">
                      {t.heroSub}
                  </p>

                  {/* --- BOTÓN MOVIDO AQUÍ (ARRIBA DEL MAPA) --- */}
                  <div className="flex justify-center">
                    <Link 
                        href={`/properties?lang=${lang}`} 
                        className="
                            bg-[#f8ed1a] text-[#1a1a1a] 
                            px-8 py-3 
                            rounded-full 
                            font-black uppercase tracking-wider text-sm
                            shadow-[4px_4px_0px_rgba(255,255,255,0.2)] border-2 border-transparent
                            hover:scale-105 hover:bg-white hover:border-[#f8ed1a]
                            transition-all duration-300
                            flex items-center gap-3
                        "
                    >
                        {t.btnProps} {/* "Ver casas disponibles" */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                  </div>
              </div>

              {/* CONTENEDOR DEL MAPA (LIMPIO) */}
              <div className="w-full h-[550px] md:h-[650px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#529e14] ring-4 ring-white/10 relative z-0">
                  <MapLoader properties={mapProperties} />
                  
                  {/* Botón flotante inferior solo para Pantalla Completa (dentro del mapa) */}
                  <a 
                    href={`/map?lang=${lang}`} 
                    className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm text-[#1a1a1a] px-5 py-2 rounded-full font-bold text-xs shadow-lg z-[1000] border border-gray-200 hover:bg-[#f8ed1a] transition-colors uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>{t.mapBtn}</span>
                    <span>↗</span>
                  </a>
              </div>
          </div>
      </section>

      {/* --- TRUST SECTION --- */}
      <section id="trust" className="bg-[#1a1a1a] py-12 md:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <Link href={`/why-choose-owner-to-dueno?lang=${lang}`}>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-8 md:mb-12 hover:text-[#f8ed1a] transition-colors cursor-pointer decoration-2 underline-offset-8 hover:underline">
                {t.trust.title}
            </h2>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {t.trust.items.map((item, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="mb-4 md:mb-6 relative w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110">
                   <Image 
                     src={item.icon} 
                     alt={item.title} 
                     width={80} 
                     height={80}
                     className="object-contain drop-shadow-[0_0_10px_rgba(181,255,120,0.5)]"
                   />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 uppercase font-black tracking-wide">{item.title}</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FILTROS DE BÚSQUEDA --- */}
      <div className="bg-[#1a1a1a] py-6 border-b border-gray-800">
         <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <SearchFilters texts={t.search} />
            </div>
         </div>
      </div>

      {/* --- FEATURED PROPERTIES (CARRUSEL) --- */}
      <main id="properties" className="bg-[#f8ed1a] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 border-b-4 border-black pb-4 gap-4">
            <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1a] uppercase tracking-tighter leading-none">
                {t.availableTitle}
            </h2>
            <span className="text-lg font-bold text-[#1a1a1a] bg-white px-3 py-1 rounded-full border-2 border-black self-start md:self-auto">
                {properties.length} Props
            </span>
          </div>

          <PropertiesCarousel properties={properties} t={t} lang={lang} />
          
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-[#1a1a1a] text-white py-12 md:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            
            {/* Imagen Footer */}
            <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden bg-gray-800 border-2 border-[#f8ed1a] hidden md:block">
                 <div className="absolute inset-0 bg-[url('/foot.png')] bg-cover bg-fit opacity-80" />
            </div>

            {/* Info Contacto */}
            <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 md:mb-8 text-white">{t.footerContact}</h2>
                <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <Image src="/phone.png" alt="Phone" width={36} height={36} />
                    </div>
                    <span className="text-xl md:text-2xl font-bold tracking-wide">901-660-4100</span>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                        {/* Facebook */}
                        <a href="https://www.facebook.com/duenoaduenoo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 justify-center md:justify-start hover:opacity-75 transition-opacity">
                          <Image src="/facebook.png" alt="Facebook" width={24} height={24} />
                          <span className="font-medium">Dueño A Dueño</span>
                        </a>

                        {/* Instagram */}
                        <a href="https://www.instagram.com/duenoaduenoo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 justify-center md:justify-start hover:opacity-75 transition-opacity">
                          <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
                          <span className="font-medium">@duenoaduenoo</span>
                        </a>

                        {/* TikTok */}
                        <a href="https://www.tiktok.com/@duenoaduenoo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 justify-center md:justify-start hover:opacity-75 transition-opacity">
                          <Image src="/tiktok.png" alt="TikTok" width={24} height={24} />
                          <span className="font-medium">@duenoaduenoo</span>
                        </a>
                    </div>
                </div>
            </div>
           
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center mt-8 md:mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">
          <p>© 2026 Dueño a Dueño. </p>
        </div>
        
        {/* Chat Widget Script */}
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="6982bc477cd1e65428cc69fe"
          strategy="afterInteractive"
        />
      </footer>
    </div>
  );
}