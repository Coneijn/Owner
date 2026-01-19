import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; 
import PropertyImage from './components/PropertyImage'; 
import SearchFilters from './components/SearchFilters'; 
import LanguageSwitch from './components/LanguageSwitch'; 
import { Prisma } from '@prisma/client';

// --- CONFIGURACIÓN DE COLORES ---
// Primary Yellow: #f8ed1a | Primary Green: #529e14 | Dark: #1a1a1a

// --- CONSTANTES GLOBALES (Solo lo que es fijo para todos) ---
const DEFAULT_TERM_YEARS = 30; // El plazo suele ser estándar
const SERVICE_FEE = 39;        // Fee de servicio fijo

// --- LÓGICA DE CÁLCULO MEJORADA ---
// Ahora recibe todos los parámetros específicos de la propiedad
const calculateEstimatedPayment = (
  price: number, 
  downPayment: number, 
  annualTaxes: number, 
  annualInsurance: number, 
  interestRate: number
) => {
  const loanAmount = price - downPayment;
  
  // Usamos el interés específico de la propiedad
  const monthlyRate = (interestRate / 100) / 12;
  const numberOfPayments = DEFAULT_TERM_YEARS * 12;

  let principalAndInterest = 0;
  if (monthlyRate > 0) {
    principalAndInterest = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } else {
    principalAndInterest = loanAmount / numberOfPayments;
  }

  // Dividimos los valores anuales reales entre 12
  const monthlyTaxes = annualTaxes / 12;
  const monthlyInsurance = annualInsurance / 12;

  return principalAndInterest + monthlyTaxes + monthlyInsurance + SERVICE_FEE;
};

const formatMoney = (amount: number | unknown) => {
  const value = Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// ... (TU DICCIONARIO DICTIONARY SE QUEDA IGUAL, LO OMITO PARA AHORRAR ESPACIO) ...
const DICTIONARY = { 
    // ... copia tu diccionario aquí ...
    es: {
        // ...
        heroTitle: "TU CASA PROPIA, SIN BANCOS NI COMPLICACIONES", 
        heroSub: "Financiamiento directo de Dueño a Dueño. Si el banco te dijo que no, nosotros te decimos que SÍ.",
        btnProps: "Ver casas disponibles",
        btnApply: "Login",
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
        }
    },
    en: {
        // ...
        heroTitle: "YOUR OWN HOME, NO BANKS, NO HASSLE",
        heroSub: "Direct Owner-to-Owner financing. If the bank said no, we say YES.",
        btnProps: "See Available Homes",
        btnApply: "Login",
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
        }
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

  const whereClause: Prisma.PropertyWhereInput = {
    status: 'AVAILABLE',
  };

  if (searchParams?.zip) {
    whereClause.zipCode = { contains: searchParams.zip };
  }

  if (searchParams?.feature) {
    whereClause.features = { has: searchParams.feature };
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-800 scroll-smooth">
      
      {/* HEADER  */}
      <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
                 <Image src="/logo.png" alt="Dueño a Dueño Logo" fill className="object-cover" />
              </div>
              <span className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-none whitespace-nowrap">
                DUEÑO A <span className="text-[#f8ed1a]">DUEÑO</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
              <nav className="hidden md:flex gap-6 text-white font-medium text-sm">
                 <Link href="/" className="hover:text-[#f8ed1a] transition">Inicio</Link>
                 <Link href="#properties" className="hover:text-[#f8ed1a] transition">Propiedades</Link>
                 <Link href="#trust" className="hover:text-[#f8ed1a] transition">Nosotros</Link>
                 <Link href="#contact" className="hover:text-[#f8ed1a] transition">Contacto</Link>
              </nav>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="scale-90 md:scale-100 origin-right">
                    <LanguageSwitch />
                </div>
                <Link href="/login" className="bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-2.5 py-2 md:px-5 md:py-2 rounded-md font-bold text-[10px] sm:text-xs md:text-sm transition-colors uppercase shadow-md whitespace-nowrap">
                  {t.btnApply}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION  */}
      <div className="relative bg-[#1a1a1a] pt-10 pb-20 md:pt-24 md:pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="w-full h-full bg-[url('/casa.png')] bg-cover bg-center" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 uppercase tracking-tighter leading-tight md:leading-none shadow-black drop-shadow-lg ">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-6 md:mb-8 font-medium shadow-black drop-shadow-md leading-relaxed">
              {t.heroSub}
            </p>
            <Link href="#properties" className="block w-full sm:w-auto text-center bg-[#529e14] text-white text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-[#458510] transition shadow-lg hover:scale-105 transform duration-200">
              {t.btnProps}
            </Link>
          </div>
        </div>
      </div>

      {/* TRUST SECTION y FILTERS  */}
      <section id="trust" className="bg-[#1a1a1a] py-12 md:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-8 md:mb-12">
            {t.trust.title}
          </h2>
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

      <div className="bg-[#1a1a1a] py-6 border-b border-gray-800">
         <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <SearchFilters texts={t.search} />
            </div>
         </div>
      </div>

      {/* --- FEATURED PROPERTIES --- */}
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

          {properties.length === 0 ? (
            <div className="text-center py-20 bg-black/10 rounded-xl border-2 border-dashed border-black/20">
              <p className="text-[#1a1a1a] text-xl font-bold">{t.noResults}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => {
                
                const estimatedPayment = calculateEstimatedPayment(
                    Number(property.price), 
                    Number(property.downPayment),
                    Number(property.taxes),      
                    Number(property.insurance),  
                    Number(property.interestRate) 
                );

                return (
                  <div key={property.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
                    <div className="relative h-64 bg-gray-800">
                        <PropertyImage 
                            src={property.mainImage || ''} 
                            alt={lang === 'en' ? property.titleEn : property.titleEs} 
                        />
                        {/* Etiqueta dinámica Off Market vs Available */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded text-xs font-black uppercase tracking-wider shadow-sm 
                            ${property.isOffMarket ? 'bg-[#f8ed1a] text-[#1a1a1a]' : 'bg-[#529e14] text-white'}`}>
                          {property.isOffMarket 
                             ? (lang === 'en' ? t.offMarket : t.offMarket) 
                             : (lang === 'en' ? t.availability : t.availability) 
                          }
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight" title={lang === 'en' ? property.titleEn : property.titleEs}>
                                {lang === 'en' ? property.titleEn : property.titleEs}
                            </h3>
                            <div className="text-gray-400 text-sm mt-1 uppercase font-semibold tracking-wide">
                                {property.city}, {property.state}
                            </div>
                        </div>
                        
                        {/* PAGO MENSUAL REAL CALCULADO */}
                        <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                            <p className="text-gray-400 text-xs uppercase font-bold mb-1">{t.monthlyPayment}</p>
                            <p className="text-[#f8ed1a] text-3xl font-black tracking-tight">
                                {formatMoney(estimatedPayment)}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-gray-700 pt-4 mb-6 text-center text-white">
                            <div>
                                <span className="block text-lg font-bold">{property.bedrooms}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t.beds}</span>
                            </div>
                            <div className="border-l border-gray-700">
                                <span className="block text-lg font-bold">{property.bathrooms}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t.baths}</span>
                            </div>
                            <div className="border-l border-gray-700">
                                <span className="block text-lg font-bold">{property.sqft}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Sqft</span>
                            </div>
                        </div>
                        <div className="mt-auto space-y-3">
                            <div className="flex justify-between items-center text-sm text-gray-300">
                                <span>{t.totalPrice}:</span>
                                <span className="font-bold text-white">{formatMoney(property.price)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-300">
                                <span>{t.downPayment}:</span>
                                <span className="font-bold text-[#f8ed1a]">{formatMoney(property.downPayment)}</span>
                            </div>
                            <Link 
                                href={`/propiedades/${property.slug}?lang=${lang}`}
                                className="block w-full text-center bg-[#529e14] text-white py-3 rounded-lg font-bold uppercase tracking-wide hover:bg-[#458510] transition-colors mt-4"
                            >
                                {t.details}
                            </Link>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER  */}
      <footer id="contact" className="bg-[#1a1a1a] text-white py-12 md:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden bg-gray-800 border-2 border-[#f8ed1a] hidden md:block">
                 <div className="absolute inset-0 bg-[url('/foot.png')] bg-cover bg-fit opacity-80" />
            </div>
            <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 md:mb-8 text-white">{t.footerContact}</h2>
                <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <Image src="/phone.png" alt="Phone" width={36} height={36} />
                    </div>
                    <span className="text-xl md:text-2xl font-bold tracking-wide">901-660-4100</span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Image src="/facebook.png" alt="Facebook" width={24} height={24} />
                        <span className="font-medium">Dueño A Dueño</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
                        <span className="font-medium">@duenoaduenoo</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Image src="/tiktok.png" alt="TikTok" width={24} height={24} />
                        <span className="font-medium">@duenoaduenoo</span>
                    </div>
                </div>
            </div>
           
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center mt-8 md:mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm">
          <p>© 2026 Dueño a Dueño. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}