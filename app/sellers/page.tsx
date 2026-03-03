import { Metadata } from 'next';
import Header from '@/app/components/Header';
import GHLFormEmbed from '@/app/components/GHLFormEmbed';
import { prisma } from '@/lib/prisma';
import MapLoader from '@/app/map/MapLoader';
import { calculateEstimatedPayment } from '@/lib/utils'; 
import ProblemsWeSolve from '@/app/components/ProblemsWeSolve'; 
import SellerCalculator from '../components/SellerCalculator';
import ServiceExplanation from '../components/ServiceExplanation';
import Testimonials from '@/app/components/Testimonials';
import reviewsData from '@/app/data/reviewsData.json';
import MapLegend from '../components/MapLegend';  

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aplicar',
  description: 'Inicia tu proceso de compra o renta directa.',
};

const FORM_URLS = {
  en: "https://api.leadconnectorhq.com/widget/form/UWo0iunefBi9DCl8ChSf", 
  es: "https://api.leadconnectorhq.com/widget/form/TrEhQJm57BTHYeBsUPEy" 
};

// 1. Traemos la data de los Zip Codes para sumar los compradores
const SELLER_DATA: Record<string, number> = {
  "38119": 8, "38116": 3, "38118": 4, "38117": 2, "38135": 3, "38111": 2,
  "38122": 3, "38125": 2, "38018": 2, "38305": 1, "38127": 1, "38114": 1,
  "37130": 1, "38115": 2, "38053": 1, "38134": 3, "38141": 3, "38016": 1,
  "38120": 1, "38130": 1, "38112": 1, "38107": 1
};

// Sumamos todos los valores del objeto
const TOTAL_BUYERS_LOOKING = Object.values(SELLER_DATA).reduce((acc, curr) => acc + curr, 0);

const DICTIONARY = {
  es: {
    title: "INICIA TU PROCESO PARA UNIRTE A NUESTRA COMUNIDAD DE VENDEDORES",
    subtitle: "La mayor parte del proceso es automático. Llena el formulario abajo para que nuestro sistema evalúe tus opciones.",
    mapTitle: "PROPIEDADES VENDIDAS Y COMPRADORES INTERESADOS",
    mapDesc: "Echa un vistazo a las propiedades que hemos cerrado con éxito y las zonas con compradores potenciales.",
    buyersLooking: "Compradores Activos",
    downPayments: "Enganches Recolectados",
    monthlyIncome: "Ingreso Mensual Generado",
    propertiesSold: "Propiedades Vendidas",
    marqueeItems: [
      "🏠 Financiamiento por el Dueño", "🤖 Recorridos con IA", "💸 Flujo de Efectivo Mensual",
      "🔒 Ofertas Fuera del Mercado", "📉 Evita Impuestos de Capital", "🤝 Mercado Ganar-Ganar", "🏡 El Sueño Americano"
    ]
  },
  en: {
    title: "START YOUR PROCESS TO JOIN OUR SELLER COMMUNITY",
    subtitle: "Most of the process is automated. Fill out the form below so our system can evaluate your options.",
    mapTitle: "SOLD PROPERTIES AND INTERESTED BUYERS",
    mapDesc: "Take a look at the properties we have successfully closed and the places we have potential buyers interested in.",
    buyersLooking: "Current Buyers Looking",
    downPayments: "Down Payments Collected",
    monthlyIncome: "Monthly Income Generated",
    propertiesSold: "Properties Sold",
    marqueeItems: [
      "🏠 Seller Financing", "🤖 AI-Powered Showings", "💸 Monthly Cash Flow for Life",
      "🔒 Off-Market Deals", "📉 Avoid Capital Gains Shock", "🤝 Win-Win Marketplace", "🏡 The American Dream"
    ]
  }
};

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export default async function SellersPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];
  
  const formUrl = lang === 'en' ? FORM_URLS.en : FORM_URLS.es;

  // 1. Consulta a Prisma 
  const rawSoldProperties = await prisma.property.findMany({
    where: { status: 'SOLD' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titleEn: true,
      titleEs: true,
      address: true,
      price: true,
      slug: true,
      latitude: true,
      longitude: true,
      mainImage: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      downPayment: true,
      interestRate: true,
      taxes: true,
      insurance: true,
      monthlyRent: true,
      securityDeposit: true,
      createdAt: true,
      lastPriceChangeAt: true,
      isForSale: true, 
      isForRent: true, 
    }
  });

  // 2. Mapeo de datos
  const soldProperties = rawSoldProperties.map(p => ({
    id: p.id,
    title: lang === 'en' ? p.titleEn : p.titleEs,
    address: p.address,
    price: Number(p.price || 0),
    slug: p.slug,
    lat: Number(p.latitude || 0),
    lng: Number(p.longitude || 0),
    image: p.mainImage,
    beds: p.bedrooms,
    baths: p.bathrooms,
    sqft: p.sqft,
    downPayment: Number(p.downPayment || 0),
    interestRate: Number(p.interestRate || 0),
    taxes: Number(p.taxes || 0),
    insurance: Number(p.insurance || 0),
    monthlyRent: Number(p.monthlyRent || 0),
    securityDeposit: Number(p.securityDeposit || 0),
    createdAt: p.createdAt.toISOString(),
    lastPriceChangeAt: p.lastPriceChangeAt ? p.lastPriceChangeAt.toISOString() : null,
    isForSale: p.isForSale,
    isForRent: p.isForRent,
  }));

  // 3. Cálculos de las métricas
  const downPaymentsCollected = soldProperties.reduce((acc, curr) => acc + curr.downPayment, 0);
  
  const monthlyIncomeGenerated = soldProperties.reduce((acc, curr) => {
    let income = 0;
    if (curr.isForRent) {
      income = curr.monthlyRent;
    } else if (curr.isForSale) {
      income = calculateEstimatedPayment(
        curr.price,
        curr.downPayment,
        curr.taxes,
        curr.insurance,
        curr.interestRate
      );
    }
    return acc + income;
  }, 0);

  const totalPropertiesSold = soldProperties.length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      
      <Header lang={lang} />

      <ProblemsWeSolve lang={lang} /> 

      {/* Se pasa el array de items traducidos al Marquee */}
      <Marquee items={t.marqueeItems} />

      {/* SECCIÓN SUPERIOR (Hero + Métricas integradas) */}
      <section className="relative bg-gradient-to-b from-gray-900 to-[#1a1a1a] pt-8 pb-8 px-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
            <StatCard title={t.buyersLooking} value={TOTAL_BUYERS_LOOKING} icon="👥" color="text-white" />
            <StatCard title={t.downPayments} value={formatMoney(downPaymentsCollected)} icon="💵" color="text-[#529e14]" />
            <StatCard title={t.monthlyIncome} value={formatMoney(monthlyIncomeGenerated)} icon="📈" color="text-[#f8ed1a]" />
            <StatCard title={t.propertiesSold} value={totalPropertiesSold} icon="🏠" color="text-white" />
          </div>
        </div>
      </section>

      {/* CONTENEDOR UNIFICADO: VIDEO Y MAPA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-16 mt-16">
        
        <div className="relative mb-12 w-full md:w-[71%] mx-auto aspect-video rounded-xl overflow-hidden border border-gray-700 bg-black shadow-2xl">
          <iframe
            src="https://drive.google.com/file/d/1qIv95lxuvRhCO-5FLfP7e92dtMOweGqg/preview"
            className="absolute top-0 left-0 w-full h-full"
            style={{ border: 0 }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Dueño a Dueño"
          />
        </div>

        {/* --- MAPA (Propiedades Vendidas) --- */}
        <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-2xl mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              {t.mapTitle}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{t.mapDesc}</p>
          </div>

          <div className="h-[450px] w-full rounded-xl overflow-hidden border border-gray-700 relative">
            
            {/* LEYENDA / SIMBOLOGÍA (Ahora colapsable e importada) */}
            <MapLegend lang={lang} />

            <MapLoader properties={soldProperties} lang={lang} searchType="sold" />
          </div>
        </div>

        <SellerCalculator lang={lang} />
      </section>
      
      <ServiceExplanation lang={lang} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 mt-16">
        <GHLFormEmbed src={formUrl} height="850px" />
      </main>

      <Testimonials reviews={reviewsData} lang={lang} />
      
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'text-white' }: any) {
  return (
    <div className="bg-[#1a1a1a] overflow-hidden shadow-lg rounded-xl border border-gray-800 p-5 relative group hover:border-gray-700 transition-colors h-full">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="flex items-center">
            <div className="flex-shrink-0 text-3xl mr-3 opacity-80">{icon}</div>
            <div>
                <dt className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</dt>
                <dd className={`mt-1 text-2xl sm:text-3xl font-black ${color}`}>{value}</dd>
            </div>
        </div>
    </div>
  )
}

// Componente actualizado: Ahora recibe las frases como propiedad `items`
function Marquee({ items }: { items: string[] }) {
  return (
    <div className="bg-[#f8ed1a] py-3.5 overflow-hidden" aria-hidden="true">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((item, index) => (
          <span key={index} className="inline-flex items-center px-7 text-sm font-semibold text-black tracking-widest uppercase opacity-90">
            {item}
            <span className="ml-7 font-bold">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}