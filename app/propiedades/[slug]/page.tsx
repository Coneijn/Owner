import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/Header';
import PropertyGallery from '@/app/components/PropertyGallery';
import MortgageCalculator from '@/app/components/MortgageCalculator';
import VideoModal from '@/app/components/video-modal';
import PropertyShare from '@/app/components/PropertyShare';

// --- HELPER PARA FORMATO DE MONEDA ---
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- DICCIONARIO DE TRADUCCIONES ---
const DICTIONARY = {
  es: {
    back: "Volver al catálogo",
    available: "Disponible",
    unavailable: "No Disponible",
    underContract: "Bajo Contrato",
    sold: "Vendido",
    draft: "Borrador",
    comingSoon: "Próximamente",
    aboutTitle: "SOBRE ESTA PROPIEDAD",
    featuresTitle: "CARACTERÍSTICAS",
    beds: "Habitaciones",
    baths: "Baños",
    sqft: "Pies Cuadrados",
    year: "Año",
    interestedTitle: "¿TE INTERESA ESTA CASA?",
    interestedSub: "Agenda una visita hoy mismo, aplica en línea o habla con nuestro equipo.",
    btnSchedule: "AGENDAR RECORRIDO",
    btnApply: "APLICAR AHORA", // <--- NUEVO
    btnCall: "LLAMAR AHORA",
    videoTitle: "VIDEO RECORRIDO",
    calcTitle: "CALCULADORA",
    locationTitle: "UBICACIÓN",
    price: "Precio Total",
    down: "Enganche"
  },
  en: {
    back: "Back to catalog",
    available: "Available",
    unavailable: "Unavailable",
    underContract: "Under Contract",
    sold: "Sold",
    draft: "Draft",
    comingSoon: "Coming Soon",
    aboutTitle: "ABOUT THIS PROPERTY",
    featuresTitle: "FEATURES",
    beds: "Bedrooms",
    baths: "Bathrooms",
    sqft: "Sq Ft",
    year: "Year Built",
    interestedTitle: "INTERESTED IN THIS HOME?",
    interestedSub: "Schedule a visit today, apply online, or talk to our team.",
    btnSchedule: "SCHEDULE HOME TOUR",
    btnApply: "APPLY NOW", // <--- NUEVO
    btnCall: "CALL NOW",
    videoTitle: "VIDEO TOUR",
    calcTitle: "CALCULATOR",
    locationTitle: "LOCATION",
    price: "Total Price",
    down: "Down Payment"
  }
};

export default async function PropertyDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const { slug } = params;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];

  // 1. Obtener datos de la BD
  const property = await prisma.property.findUnique({
    where: { slug },
    include: { images: true }
  });

  if (!property) {
    notFound();
  }

  // 2. Preparar imágenes para la galería
  let galleryImages: string[] = [];
  if (property.images && property.images.length > 0) {
    const sorted = property.images.sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1));
    galleryImages = sorted.map(img => img.url);
  } else {
    if (property.mainImage) galleryImages.push(property.mainImage);
    if (property.galleryImages) galleryImages.push(...property.galleryImages);
  }
  if (galleryImages.length === 0) galleryImages.push('/placeholder.png');

  // 3. Datos de texto
  const title = lang === 'en' ? property.titleEn : property.titleEs;
  const description = lang === 'en' ? property.descriptionEn : property.descriptionEs;
  
  // Links de acción
  const bookingLink = property.calendarLink || "https://calendly.com/"; 
  const phoneHref = `tel:${property.phoneNumber || '9016604115'}`;

  // Estado
  const isComingSoon = property.status === 'COMING_SOON';
  const statusLabel = isComingSoon ? t.comingSoon : t.available;
  const statusColor = isComingSoon ? 'bg-blue-600' : 'bg-[#529e14]';

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      
      {/* HEADER */}
      <Header lang={lang} activePage="properties" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <Link 
          href={`/properties?lang=${lang}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f8ed1a] transition-colors mb-6 text-sm font-bold uppercase tracking-wide"
        >
          <span>←</span> {t.back}
        </Link>

        {/* CONTENIDO PRINCIPAL (GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLUMNA IZQUIERDA (Galería e Info) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Galería */}
            <PropertyGallery images={galleryImages} title={title} />

            {/* Header Propiedad (Título y Dirección) */}
            <div>
               <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
                    {title}
                  </h1>
                  <span className={`${statusColor} text-white px-4 py-2 rounded-lg font-black uppercase text-sm shadow-lg tracking-wider`}>
                    {statusLabel}
                  </span>
               </div>
               <p className="text-xl text-gray-400 flex items-center gap-2">
                 <span className="text-[#529e14]">📍</span>
                 {property.address}, {property.city}, {property.state} {property.zipCode}
               </p>
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-4 gap-4 border-y border-gray-700 py-6">
                <div className="text-center border-r border-gray-700 last:border-0">
                    <span className="block text-2xl font-black text-white">{property.bedrooms}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">{t.beds}</span>
                </div>
                <div className="text-center border-r border-gray-700 last:border-0">
                    <span className="block text-2xl font-black text-white">{property.bathrooms}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">{t.baths}</span>
                </div>
                <div className="text-center border-r border-gray-700 last:border-0">
                    <span className="block text-2xl font-black text-white">{property.sqft}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">{t.sqft}</span>
                </div>
                <div className="text-center">
                    <span className="block text-2xl font-black text-white">{property.yearBuilt || 'N/A'}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">{t.year}</span>
                </div>
            </div>

            {/* Descripción */}
            <div>
                <h2 className="text-xl font-black text-[#f8ed1a] uppercase mb-4 border-l-4 border-[#f8ed1a] pl-3">
                  {t.aboutTitle}
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                    {description}
                </div>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div>
                  <h2 className="text-xl font-black text-[#529e14] uppercase mb-6 border-l-4 border-[#529e14] pl-3">
                    {t.featuresTitle}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {property.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-[#242424] p-3 rounded-lg border border-gray-800">
                              <span className="text-[#529e14] text-lg">✓</span>
                              <span className="font-medium text-gray-200">{feature}</span>
                          </div>
                      ))}
                  </div>
              </div>
            )}

            {/* Video (Si existe) */}
            {property.videoUrl && (
               <div>
                  <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
                    <span>🎬</span> {t.videoTitle}
                  </h2>
                  <div className="bg-black rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-gray-800">
                      <VideoModal videoUrl={property.videoUrl} label={t.videoTitle} />
                  </div>
               </div>
            )}

          </div>

          {/* COLUMNA DERECHA (Sticky Sidebar) */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-8">
                
                {/* 1. Tarjeta de Precio y Compartir */}
                <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border-2 border-[#529e14] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <PropertyShare title={title} slug={slug} lang={lang} />
                    </div>
                    
                    <div className="mb-6 mt-8">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">{t.price}</p>
                        <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                            {formatMoney(Number(property.price))}
                        </p>
                    </div>

                    <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-gray-300 font-bold uppercase text-sm">{t.down}</span>
                        <span className="text-[#f8ed1a] font-black text-xl">
                            {formatMoney(Number(property.downPayment))}
                        </span>
                    </div>
                </div>

                {/* 2. Calculadora (RESTAURADO EL ORDEN ANTERIOR) */}
                <div className="border-t border-gray-800 pt-8">
                    <h3 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-widest text-center">{t.calcTitle}</h3>
                    <MortgageCalculator 
                        price={Number(property.price)}
                        defaultDownPayment={Number(property.downPayment)}
                        interestRate={Number(property.interestRate)}
                        taxes={Number(property.taxes)}
                        insurance={Number(property.insurance)}
                        lang={lang}
                    />
                </div>

                {/* 3. SECCIÓN CTA / INTERESADO (AL FINAL, CON EL NUEVO BOTÓN) */}
                <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl text-center space-y-6 relative overflow-hidden border border-gray-800">
                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8ed1a] rounded-bl-full opacity-10 pointer-events-none"></div>

                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{t.interestedTitle}</h3>
                        <p className="text-sm text-gray-400 font-medium">{t.interestedSub}</p>
                    </div>
                    
                    <div className="space-y-3 relative z-10">
                        {/* A. Botón Agendar */}
                        <a 
                            href={bookingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-[#529e14] hover:bg-[#458510] text-white font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
                        >
                            <span>📅</span> {t.btnSchedule}
                        </a>

                        {/* B. NUEVO BOTÓN: APLICAR */}
                        <Link 
                            href={`/apply?lang=${lang}`}
                            className="w-full bg-[#f8ed1a] hover:bg-yellow-400 text-[#1a1a1a] font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
                        >
                            <span>📝</span> {t.btnApply}
                        </Link>
                        
                        {/* C. Botón Llamar */}
                        <a 
                            href={phoneHref} 
                            className="w-full flex items-center justify-center bg-transparent border-2 border-[#f8ed1a] text-[#f8ed1a] hover:bg-[#f8ed1a] hover:text-[#1a1a1a] font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all duration-300"
                        >
                            {t.btnCall}: {property.phoneNumber || '901-660-4115'}
                        </a>
                    </div>
                </div>

             </div>
          </div>

        </div>
      </main>

      {/* Footer simple para consistencia */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center mt-12">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}