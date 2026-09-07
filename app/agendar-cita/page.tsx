import Image from 'next/image';
import LanguageSwitch from '@/app/components/LanguageSwitch';
import PropertyTourScheduler from '@/app/components/PropertyTourScheduler';
import { prisma } from '@/lib/prisma'; // Ajusta la ruta a tu instancia de Prisma

export async function generateMetadata(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = searchParams?.lang === 'en' ? 'en' : 'es';

  return {
    title: lang === 'en' ? 'Schedule a Tour | Dueño a Dueño' : 'Agenda tu visita | Dueño a Dueño',
    description: lang === 'en' 
      ? 'Choose a home and schedule an in-person tour with our team.' 
      : 'Elige una casa y agenda una visita presencial con nuestro equipo.',
  };
}

export default async function LandingPageAnuncios(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  // Obtenemos propiedades disponibles en base de datos
  const dbProperties = await prisma.property.findMany({
    where: {
      status: 'AVAILABLE',
      isOffMarket: false,
    },
    select: {
      id: true,
      titleEs: true,
      titleEn: true,
      address: true,
      city: true,
      state: true,
      price: true,
      bedrooms: true,
      bathrooms: true,
      mainImage: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const properties = dbProperties.map((p) => ({
    id: p.id,
    title: lang === 'en' ? p.titleEn : p.titleEs,
    address: p.address,
    city: p.city,
    state: p.state,
    price: p.price ? Number(p.price) : null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    mainImage: p.mainImage,
  }));

  const DICTIONARY = {
    es: {
      titlePart1: "AGENDA TU VISITA",
      titleAccent: "A TU PRÓXIMA CASA",
      subtitle: "Selecciona la propiedad que quieres conocer, elige el horario y déjanos tus datos para coordinar el acceso.",
      benefits: ["Recorridos presenciales", "Atención personalizada", "Opciones de Dueño a Dueño"]
    },
    en: {
      titlePart1: "SCHEDULE A TOUR",
      titleAccent: "TO YOUR NEXT HOME",
      subtitle: "Choose the property you'd like to see, pick a date & time, and provide your details to confirm access.",
      benefits: ["In-person showings", "Personalized advice", "Owner to Owner options"]
    }
  };

  const t = DICTIONARY[lang];

  return (
    <main className="min-h-screen bg-[#0a0f1c] flex flex-col font-sans">
      <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-[60] border-b border-gray-800 h-16 md:h-20">
        <div className="max-w-8xl mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-sm md:text-xl font-black uppercase text-white tracking-tighter">
              DUEÑO A <span className="text-[#f8ed1a]">DUEÑO</span>
            </span>
          </div>

          <div className="scale-90 origin-right">
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <section className="w-full px-4 py-10 md:py-14 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
          {t.titlePart1} <span className="text-[#f8ed1a]">{t.titleAccent}</span>
        </h1>
        <p className="text-base md:text-lg text-gray-300 mb-8 font-medium max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-8 text-sm font-bold text-gray-200">
          {t.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-700">
              <span className="text-[#f8ed1a] text-lg">✓</span> {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* Componente Custom de Agendamiento */}
      <section className="w-full px-4 pb-20 flex-grow">
        <PropertyTourScheduler properties={properties} lang={lang} />
      </section>
    </main>
  );
}