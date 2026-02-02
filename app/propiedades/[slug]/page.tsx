import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image'; 
import { Metadata, ResolvingMetadata } from 'next'; // <--- 1. Importar tipos de Next
import PropertyGallery from '@/app/components/PropertyGallery';
import MortgageCalculator from '@/app/components/MortgageCalculator';
import LanguageSwitch from '@/app/components/LanguageSwitch'; 
import VideoModal from '@/app/components/video-modal';

// --- COLORES CORPORATIVOS ---
// Yellow: #f8ed1a | Green: #529e14 | Dark: #1a1a1a

// Helper para dinero
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// DICCIONARIO DE TRADUCCIONES
const DICTIONARY = {
  es: {
    back: "Volver al catálogo",
    available: "Disponible",
    unavailable: "No Disponible",
    aboutTitle: "SOBRE ESTA PROPIEDAD",
    featuresTitle: "CARACTERÍSTICAS",
    beds: "Habitaciones",
    baths: "Baños",
    sqft: "Sq Ft",
    year: "Año",
    interestedTitle: "¿TE INTERESA ESTA CASA?",
    interestedSub: "Agenda una visita hoy mismo o habla con nuestro asistente virtual.",
    btnSchedule: "AGENDAR VISITA",
    btnCall: "LLAMAR A AGENTE (IA)",
    location: "Ubicación",
    meetSeller: "CONOCE A TU VENDEDOR",
    sellerRole: "Vendedor",
    videoBtn: "VER VIDEO TOUR", 
    ownerTitle: "Dueño de la Propiedad", 
    agentTitle: "Asesor de Ventas",    
  },
  en: {
    back: "Back to catalog",
    available: "Available",
    unavailable: "Not Available",
    aboutTitle: "ABOUT THIS PROPERTY",
    featuresTitle: "FEATURES",
    beds: "Bedrooms",
    baths: "Baths",
    sqft: "Sq Ft",
    year: "Year Built",
    interestedTitle: "INTERESTED IN THIS HOME?",
    interestedSub: "Schedule a visit today or talk to our AI assistant.",
    btnSchedule: "SCHEDULE VISIT",
    btnCall: "CALL AGENT (AI)",
    location: "Location",
    meetSeller: "MEET YOUR SELLER",
    sellerRole: "Seller",
    videoBtn: "WATCH VIDEO TOUR", 
    ownerTitle: "Property Owner", 
    agentTitle: "Sales Agent",    
  }
};

const DEFAULT_CALENDAR_LINK = "https://cal.com/duenodueno/susie"; 

// 2. Definimos el tipo de Props para reutilizarlo en metadata y en la página
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

// 3. FUNCIÓN GENERATE METADATA
export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Leer parámetros
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  // Buscar propiedad (Next.js deduplica esta petición automáticamente si usas fetch, 
  // pero con Prisma es buena práctica cachear o simplemente confiar en la rapidez de la DB por ID)
  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
        titleEn: true,
        titleEs: true,
        descriptionEn: true,
        descriptionEs: true,
        seoTitleEn: true,
        seoTitleEs: true,
        seoDescriptionEn: true,
        seoDescriptionEs: true,
        mainImage: true,
    }
  });

  if (!property) {
    return {
      title: 'Propiedad no encontrada',
    };
  }

  // Lógica de fallback: Si no hay SEO title, usa el título normal
  const title = lang === 'en' 
    ? (property.seoTitleEn || property.titleEn)
    : (property.seoTitleEs || property.titleEs);

  const description = lang === 'en'
    ? (property.seoDescriptionEn || property.descriptionEn)
    : (property.seoDescriptionEs || property.descriptionEs);

  // Recortar descripción si es muy larga (opcional, Google lo hace solo, pero es buena práctica)
  const metaDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;

  return {
    title: `${title} | Dueño a Dueño`,
    description: metaDescription,
    openGraph: {
      title: title,
      description: metaDescription,
      images: [property.mainImage], // Usa la imagen principal para compartir en redes
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
  };
}

// 4. COMPONENTE DE PÁGINA
export default async function PropertyDetailPage(props: Props) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];
  
  const property = await prisma.property.findUnique({
    where: { slug },
  });

  if (!property) {
    notFound();
  }

  const price = property.price.toNumber();
  const downPayment = property.downPayment.toNumber();
  const interestRate = property.interestRate.toNumber();
  const taxes = property.taxes.toNumber();
  const insurance = property.insurance.toNumber();
  const allImages = [property.mainImage, ...property.galleryImages].filter(Boolean);
  const phoneHref = `tel:${property.phoneNumber || '+19016604100'}`;
  
  const bookingLink = property.calendarLink && property.calendarLink.length > 0 
    ? property.calendarLink 
    : DEFAULT_CALENDAR_LINK;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1a1a1a]">
      
      {/* --- NAVBAR --- */}
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
                    <Link href={`/?lang=${lang}`} className="hover:text-white transition">Home</Link>
                    <span className="text-[#f8ed1a]">Properties</span>
                    <Link href={`/about-us?lang=${lang}`} className="hover:text-white transition">About</Link>
                    <Link href={`/contact-us?lang=${lang}`} className="hover:text-white transition">Contact</Link>
                </nav>
                <Link href="/login" className="bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-3 py-2 md:px-4 md:py-2 rounded-md font-bold text-xs md:text-sm transition-colors uppercase">
                  Login
                </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <div className="mb-8">
        <Link href={`/properties?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#529e14] uppercase tracking-wide transition-colors">
            <span className="text-lg">←</span> {t.back}
          </Link>
        </div>

        {/* HEADER: Título y Precio */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-10 pb-6 border-b-4 border-[#1a1a1a] gap-6">
            <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-3 uppercase tracking-tighter leading-none">
                    {lang === 'en' ? property.titleEn : property.titleEs}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 flex items-center gap-2 font-medium">
                    📍 {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
            </div>
            <div className="text-left lg:text-right">
                <p className="text-4xl md:text-5xl font-black text-[#529e14] tracking-tight">{formatMoney(price)}</p>
                <div className="mt-2">
                    <span className={`inline-block px-4 py-1 rounded text-sm font-black uppercase tracking-wider
                        ${property.status === 'AVAILABLE' ? 'bg-[#f8ed1a] text-[#1a1a1a]' : 'bg-red-100 text-red-800'}`}>
                        {property.status === 'AVAILABLE' ? t.available : t.unavailable}
                    </span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* Galería */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                    <PropertyGallery 
                        images={allImages} 
                        title={lang === 'en' ? property.titleEn : property.titleEs} 
                    />
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg">
                    <div className="text-center p-6 border-r border-gray-700 hover:bg-gray-800 transition-colors">
                        <span className="block text-3xl font-black text-white">{property.bedrooms}</span>
                        <span className="text-xs text-[#f8ed1a] uppercase font-bold tracking-wider">{t.beds}</span>
                    </div>
                    <div className="text-center p-6 border-r border-gray-700 hover:bg-gray-800 transition-colors">
                        <span className="block text-3xl font-black text-white">{property.bathrooms}</span>
                        <span className="text-xs text-[#f8ed1a] uppercase font-bold tracking-wider">{t.baths}</span>
                    </div>
                    <div className="text-center p-6 border-r border-gray-700 hover:bg-gray-800 transition-colors">
                        <span className="block text-3xl font-black text-white">{property.sqft}</span>
                        <span className="text-xs text-[#f8ed1a] uppercase font-bold tracking-wider">{t.sqft}</span>
                    </div>
                    <div className="text-center p-6 hover:bg-gray-800 transition-colors">
                        <span className="block text-3xl font-black text-white">{property.yearBuilt || 'N/A'}</span>
                        <span className="text-xs text-[#f8ed1a] uppercase font-bold tracking-wider">{t.year}</span>
                    </div>
        
                </div>
                      
                {/* Descripción y Vendedor */}
                <div>
                    <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight mb-6 border-l-8 border-[#f8ed1a] pl-4">
                        {t.aboutTitle}
                    </h2>
                    <div className="prose prose-lg text-gray-700 max-w-none whitespace-pre-line leading-relaxed mb-8">
                        {lang === 'en' ? property.descriptionEn : property.descriptionEs}
                    </div>
                    {property.videoUrl && (
                      <div className="relative center z-20">
                         <VideoModal 
                           videoUrl={property.videoUrl} 
                           label={t.videoBtn} 
                         />
                      </div>
                    )}
                    {property.showSeller && (
                      <div className="mt-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-6 relative overflow-hidden group">
                        {/* Decoración */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#529e14]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>

                        {/* Foto */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                           <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-[#f8ed1a]">
                              {property.sellerImage ? (
                                <Image 
                                  src={property.sellerImage} 
                                  alt={property.sellerName || 'Seller'} 
                                  fill 
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                                   <span className="text-2xl">👤</span>
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Info con ROL DINÁMICO */}
                        <div className="z-10">
                           <h3 className="text-sm font-bold text-[#529e14] uppercase tracking-wide mb-1">
                              {t.meetSeller}
                           </h3>
                           <p className="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase leading-none mb-1">
                              {property.sellerName}
                           </p>
                           <p className="text-sm text-gray-500 font-medium">
                              {property.sellerType === 'AGENT' ? t.agentTitle : t.ownerTitle}
                           </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Características */}
                {property.features.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                        <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight mb-6 border-l-8 border-[#529e14] pl-4">
                            {t.featuresTitle}
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {property.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-gray-800 font-medium">
                                    <span className="mr-3 text-[#529e14] text-xl font-bold">✓</span> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-8">
                
                <div className="sticky top-24 space-y-8">
                    
                    {/* Calculadora */}
                    <div className="shadow-xl rounded-xl overflow-hidden border border-gray-100">
                         <MortgageCalculator 
                            price={price}
                            defaultDownPayment={downPayment}
                            interestRate={interestRate}
                            taxes={taxes}
                            insurance={insurance}
                            lang={lang}
                        />
                    </div>

                    {/* Botones de Acción */}
                    <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl text-center space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#f8ed1a] rounded-bl-full opacity-20"></div>

                        <div>
                             <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{t.interestedTitle}</h3>
                             <p className="text-sm text-gray-400 font-medium">{t.interestedSub}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <a 
                                href={bookingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full bg-[#529e14] hover:bg-[#458510] text-white font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
                            >
                                📅 {t.btnSchedule}
                            </a>
                            
                            <a 
                                href={phoneHref} 
                                className="w-full flex items-center justify-center bg-transparent border-2 border-[#f8ed1a] text-[#f8ed1a] hover:bg-[#f8ed1a] hover:text-[#1a1a1a] font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all duration-300"
                            >
                                📞 {t.btnCall}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-gray-400 py-12 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium">© 2026 Dueño a Dueño.</p>
        </div>
      </footer>
    </div>
  );
}