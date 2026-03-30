import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image'; 
import { Metadata, ResolvingMetadata } from 'next';
import Header from '@/app/components/Header'; 
import PropertyGallery from '@/app/components/PropertyGallery';
import VideoModal from '@/app/components/video-modal';
import PropertyShare from '@/app/components/PropertyShare';
import PropertyFinancials from '@/app/components/PropertyFinancials';
import WhatsAppButton from '@/app/components/WhatsAppButton';
import StaticPropertyMap from '@/app/components/StaticPropertyMap';
import DOMPurify from 'isomorphic-dompurify';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const DICTIONARY = {
  es: {
    back: "Volver al catálogo",
    available: "Disponible",
    unavailable: "No Disponible",
    underContract: "Pendiente",
    sold: "Vendido",
    draft: "Borrador",
    comingSoon: "Próximamente", 
    aboutTitle: "SOBRE ESTA PROPIEDAD",
    featuresTitle: "CARACTERÍSTICAS",
    beds: "Habitaciones",
    baths: "Baños",
    sqft: "Sq Ft",
    year: "Año",
    interestedTitle: "¿TE INTERESA ESTA CASA?",
    interestedSub: "Agenda una visita hoy mismo o habla con nuestro asistente virtual.",
    btnSchedule: "AGENDAR RECORRIDO",
    btnApply: "APLICAR AHORA",
    btnCall: "LLAMAR AHORA",
    location: "Ubicación",
    meetSeller: "CONOCE AL DUEÑO",
    sellerRole: "Vendedor",
    videoBtn: "VER VIDEO TOUR", 
    ownerTitle: "Dueño de la Propiedad", 
    agentTitle: "Asesor de Ventas",
    perMonth: "/mes",
    // Nuevas traducciones
    listPropertyTitle: "¿Eres dueño de una casa?",
    listPropertyBtn: "Publica tu Propiedad",
    getPaidTitle: "Programa de Agentes",
    getPaidSub: "Refiere compradores o dueños de propiedades y gana comisiones por cada cierre exitoso.",
    getPaidBtn: "UNETE y GANA COMISIONES CON NOSOTROS",
  },
  en: {
    back: "Back to catalog",
    available: "Available",
    unavailable: "Not Available",
    underContract: "Pending",
    sold: "Sold",
    draft: "Draft",
    comingSoon: "Coming Soon", 
    aboutTitle: "ABOUT THIS PROPERTY",
    featuresTitle: "FEATURES",
    beds: "Bedrooms",
    baths: "Baths",
    sqft: "Sq Ft",
    year: "Year Built",
    interestedTitle: "INTERESTED IN THIS HOME?",
    interestedSub: "Schedule a visit today or talk to our AI assistant.",
    btnSchedule: "SCHEDULE HOME TOUR",
    btnApply: "APPLY NOW",
    btnCall: "CALL NOW",
    location: "Location",
    meetSeller: "MEET YOUR OWNER",
    sellerRole: "Seller",
    videoBtn: "WATCH VIDEO TOUR", 
    ownerTitle: "Property Owner", 
    agentTitle: "Sales Agent", 
    perMonth: "/mo",
    // Nuevas traducciones
    listPropertyTitle: "Do you own a home?",
    listPropertyBtn: "List your property",
    getPaidTitle: "Agent Program",
    getPaidSub: "Refer buyers or property owners and earn commissions for every successful closing.",
    getPaidBtn: "JOIN & EARN COMMISSIONS WITH US",
  }
};

const DEFAULT_CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/bookings/scheduleanappointmentcallwithus-230ad544-8f6f-4125-9d14-f1b202f0becc-7fdb3832-39a9-4c80-a146-60233fb444a1-aaa07f1f-456b-4ccc-81e4-adb0ad437aa3-0b2d0529-cb48-461f-b8b5-712b398e91eb-fcbf65a8-70d2-4009-b786-ac4166822f0b-0f63997e-5577-46ae-9f21-00d7deb09698-e6c21248-3365-4355-9454-17fdbd70ec1e-8b95828a-650c-41a7-9b5b-453855dce734-8dda7b22-1142-4021-8dfc-111b3ef84155-f97c6afe-ae0a-48f4-a6cb-868f7ec9020c-5c4b1d30-8e32-4a3d-9142-617df2faa33d-15d6fb8b-f278-4503-98e4-f435ca7bb65e-1cb0ec42-d374-4a1a-b923-59c59dcc4791-c04f60e7-15a7-4cfc-a977-30d02f1c83fe-9e2a0269-9b69-4caa-95c7-327b47eef86a-ffac1d68-518e-4dc2-9bf7-90a8acd0b85d-bb726c61-15c6-4b11-b190-55d7c217c1a3"; 

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // ... (Tu metadata se mantiene idéntica)
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
        titleEn: true, titleEs: true, descriptionEn: true, descriptionEs: true,
        seoTitleEn: true, seoTitleEs: true, seoDescriptionEn: true, seoDescriptionEs: true,
        mainImage: true, focusKeywordEn: true, focusKeywordEs: true,
    }
  });

  if (!property) return { title: 'Propiedad no encontrada' };

  const title = lang === 'en' ? (property.seoTitleEn || property.titleEn) : (property.seoTitleEs || property.titleEs);
  const description = lang === 'en' ? (property.seoDescriptionEn || property.descriptionEn) : (property.seoDescriptionEs || property.descriptionEs);
  const focusKeyword = lang === 'en' ? property.focusKeywordEn : property.focusKeywordEs;
  const metaDescription = description?.length && description.length > 160 ? description.substring(0, 157) + '...' : description;

  return {
    title: title,
    description: metaDescription || '',
    keywords: focusKeyword ? [focusKeyword] : [],
    openGraph: {
      title: title || '',
      description: metaDescription || '',
      images: [property.mainImage],
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
  };
}

export default async function PropertyDetailPage(props: Props) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];
  
  const property = await prisma.property.findUnique({
    where: { slug },
    include: { sellerProfile: true }
  });

  if (!property) notFound();

  const price = property.price?.toNumber() ?? 0;
  const downPayment = property.downPayment?.toNumber() ?? 0;
  const interestRate = property.interestRate?.toNumber() ?? 0;
  const taxes = property.taxes?.toNumber() ?? 0;
  const insurance = property.insurance?.toNumber() ?? 0;
  const monthlyRent = property.monthlyRent?.toNumber() ?? 0;
  const securityDeposit = property.securityDeposit?.toNumber() ?? 0;

  const financialProps = {
      price, downPayment, interestRate, taxes, insurance,
      isForSale: property.isForSale ?? true, 
      isForRent: property.isForRent ?? false,
      monthlyRent, securityDeposit,
  };

  const displayPrice = (property.isForRent && !property.isForSale) ? monthlyRent : price;
  const priceSuffix = (property.isForRent && !property.isForSale) ? t.perMonth : '';
  const allImages = [property.mainImage, ...property.galleryImages].filter(Boolean);
  const phoneHref = `tel:${property.phoneNumber || '9016-604-115'}`;
  
  const bookingLink = property.calendarLink && property.calendarLink.length > 0 ? property.calendarLink : DEFAULT_CALENDAR_LINK;
  const propertyTitle = lang === 'en' ? property.titleEn : property.titleEs;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1a1a1a]">
      <Header lang={lang} activePage="properties" />

      {/* --- ESTRUCTURA TIPO CATÁLOGO CON SIDEBAR IZQUIERDO --- */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-start lg:min-h-[calc(100vh-80px)]">
        
        

        {/* === COLUMNA DERECHA: CONTENIDO DE LA PROPIEDAD === */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-10 lg:pb-32 order-1 lg:order-2">
            <div className="max-w-6xl mx-auto">
                
                {/* Botón Volver */}
                <div className="mb-8">
                <Link href={`/properties?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#529e14] uppercase tracking-wide transition-colors">
                    <span className="text-lg">←</span> {t.back}
                </Link>
                </div>

                {/* Encabezado */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-10 pb-6 border-b-4 border-[#1a1a1a] gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-3 uppercase tracking-tighter leading-none">
                            {propertyTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 flex items-center gap-2 font-medium">
                            📍 {property.address}, {property.city}, {property.state} {property.zipCode}
                        </p>
                    </div>
                    <div className="text-left lg:text-right">
                        <p className="text-4xl md:text-5xl font-black text-[#529e14] tracking-tight">
                            {formatMoney(displayPrice)}{priceSuffix}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 items-center justify-start lg:justify-end">
                            <div className="shrink-0">
                                <PropertyShare title={propertyTitle} slug={slug} lang={lang} />
                            </div>
                            {(() => {
                                let statusColor = "bg-gray-200 text-gray-600";
                                let statusText = "N/A";
                                switch (property.status) {
                                    case 'AVAILABLE': statusColor = "bg-[#f8ed1a] text-[#1a1a1a]"; statusText = t.available; break;
                                    case 'UNDER_CONTRACT': statusColor = "bg-orange-500 text-white"; statusText = t.underContract; break;
                                    case 'SOLD': statusColor = "bg-red-600 text-white"; statusText = t.sold; break;
                                    case 'DRAFT': statusColor = "bg-gray-600 text-white"; statusText = t.draft; break;
                                    case 'COMING_SOON': statusColor = "bg-blue-600 text-white"; statusText = t.comingSoon; break;
                                    default: statusText = property.status; 
                                }
                                return (
                                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider shadow-sm ${statusColor}`}>
                                        {statusText}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Sección Izquierda (Detalles y Fotos) */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 group">
                            <PropertyGallery images={allImages} title={propertyTitle} address={`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`}/>
                            
                            {/* Mini-mapa superpuesto en la esquina inferior izquierda */}
                            {property.latitude && property.longitude && (
                                <div className="hidden sm:block absolute bottom-6 left-6 w-38 h-38 rounded-xl overflow-hidden shadow-2xl border-4 border-white z-10 transition-transform duration-300 hover:scale-105">
                                    {/* El mapa original es de 350px de alto, el contenedor lo recorta manteniéndolo centrado */}
                                    <StaticPropertyMap lat={property.latitude} lng={property.longitude} />
                                </div>
                            )}
                        </div>

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
                              
                        <div>
                            <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight mb-6 border-l-8 border-[#f8ed1a] pl-4">
                                {t.aboutTitle}
                            </h2>
                            <div className="prose prose-lg text-gray-700 max-w-none whitespace-pre-line leading-relaxed mb-8">
                                {lang === 'en' ? property.descriptionEn : property.descriptionEs}
                            </div>
                            {property.videoUrl && (
                              <div className="relative center z-20">
                                  <VideoModal videoUrl={property.videoUrl} label={t.videoBtn} />
                              </div>
                            )}
                            
                            {property.showSeller && property.sellerProfile && (
                              <div className="mt-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#529e14]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                                   <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-[#f8ed1a]">
                                      {property.sellerProfile.sellerImage ? (
                                        <Image src={property.sellerProfile.sellerImage} alt={property.sellerProfile.sellerName || 'Seller'} fill className="object-cover"/>
                                      ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500"><span className="text-2xl">👤</span></div>
                                      )}
                                   </div>
                                </div>
                                <div className="z-10">
                                   <h3 className="text-sm font-bold text-[#529e14] uppercase tracking-wide mb-1">{t.meetSeller}</h3>
                                   <p className="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase leading-none mb-1">{property.sellerProfile.sellerName || 'N/A'}</p>
                                   <p className="text-sm text-gray-500 font-medium">{property.sellerProfile.sellerType === 'AGENT' ? t.agentTitle : t.ownerTitle}</p>
                                </div>
                              </div>
                            )}
                        </div>

                        {property.features.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                                <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight mb-6 border-l-8 border-[#529e14] pl-4">{t.featuresTitle}</h2>
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

                    {/* Sección Derecha (Precios y CTAs) */}
                    <div className="space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {property.status !== 'COMING_SOON' && (
                                <div className="shadow-xl rounded-xl overflow-hidden border border-gray-100 bg-[#1a1a1a]">
                                     <PropertyFinancials property={financialProps} lang={lang} />
                                </div>
                            )}

                            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl text-center space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#f8ed1a] rounded-bl-full opacity-20"></div>

                                <div>
                                     <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{t.interestedTitle}</h3>
                                     <p className="text-sm text-gray-400 font-medium">{t.interestedSub}</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#529e14] hover:bg-[#458510] text-white font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3">
                                        📅 {t.btnSchedule}
                                    </a>
                                    <Link href={`/apply?lang=${lang}`} className="w-full bg-[#f8ed1a] hover:bg-[#e6db15] text-[#1a1a1a] font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3">
                                        📝 {t.btnApply}
                                    </Link>
                                    <a href={phoneHref} className="w-full flex items-center justify-center bg-transparent border-2 border-[#f8ed1a] text-[#f8ed1a] hover:bg-[#f8ed1a] hover:text-[#1a1a1a] font-black uppercase tracking-wide py-4 px-4 rounded-lg transition-all duration-300">
                                        📞 {t.btnCall}: {property.phoneNumber || '(901) 660-4115'}
                                    </a>
                                </div>

                                {/* CTA: LIST YOUR PROPERTY (Se queda aquí del lado derecho) */}
                                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                                    <p className="text-sm text-gray-400 font-medium mb-3">{t.listPropertyTitle}</p>
                                    <Link 
                                        href={`/sellers?lang=${lang}`}
                                        className="w-full inline-flex items-center justify-center bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-400 font-bold uppercase tracking-wide py-3 px-4 rounded-lg transition-all gap-2"
                                    >
                                        🏡 {t.listPropertyBtn}
                                    </Link>
                                </div>

                                {/* CTA: AGENTES */}
                            <div>
                                <p className="text-sm text-gray-400 font-medium mb-3">{t.getPaidTitle}</p>
                                <Link 
                                    href={`/agents?lang=${lang}`}
                                    className="w-full inline-flex items-center justify-center bg-transparent border border-[#529e14] text-[#529e14] hover:bg-[#529e14] hover:text-white font-bold uppercase tracking-wide py-3 px-4 rounded-lg transition-all gap-2"
                                >
                                    💰 {t.getPaidBtn}
                                </Link>
                            </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>

      <footer className="bg-[#1a1a1a] text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium">© 2026 Dueño a Dueño.</p>
        </div>
      </footer>
      
      <WhatsAppButton lang={lang} propertyName={propertyTitle} />
    </div>
  );
}