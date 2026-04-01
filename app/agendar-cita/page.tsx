import Image from 'next/image';
import GHLCalendarEmbed from '@/app/components/GHLCalendarEmbed';
import LanguageSwitch from '@/app/components/LanguageSwitch';

export async function generateMetadata(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = searchParams?.lang === 'en' ? 'en' : 'es';

  return {
    title: lang === 'en' ? 'Schedule your appointment | Dueño a Dueño' : 'Agenda tu cita | Dueño a Dueño',
    description: lang === 'en' 
      ? 'Take the first step towards your new home. Schedule a call with our team.' 
      : 'Da el primer paso hacia tu nueva casa. Agenda una llamada con nuestro equipo.',
  };
}

export default async function LandingPageAnuncios(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  // MODIFICADO: Dividimos el título en dos partes para colorear selectivamente
  const DICTIONARY = {
    es: {
      titlePart1: "",
      titleAccent: "HABLEMOS SOBRE TUS OPCIONES EN BIENES RAÍCES",
      subtitle: "Selecciona el día y la hora que mejor te acomoden. Nuestro equipo te llamará para asesorarte sin compromiso.",
      benefits: ["Asesoría 100% gratuita", "Respuestas en tu idioma", "Opciones de Dueño a Dueño"]
    },
    en: {
      titlePart1: "",
      titleAccent: "LET'S TALK ABOUT YOUR REAL ESTATE OPTIONS",
      subtitle: "Select the day and time that works best for you. Our team will call you to advise you without commitment.",
      benefits: ["100% free consultation", "Answers in your language", "Owner to Owner options"]
    }
  };

  const t = DICTIONARY[lang];

  return (
    <main className="min-h-screen bg-[#0a0f1c] flex flex-col font-sans">
      
      {/* Header con el estilo exacto de tu proyecto */}
      <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-[60] border-b border-gray-800 h-16 md:h-20">
        <div className="max-w-8xl mx-auto px-4 h-full flex justify-between items-center">
          
          {/* Logo del proyecto */}
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

      {/* Hero Section adaptado al diseño oscuro */}
      <section className="w-full px-4 py-12 md:py-16 text-center max-w-4xl mx-auto">
        {/* MODIFICADO: Título con acento amarillo (#f8ed1a) en la segunda parte */}
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase">
          {t.titlePart1} <span className="text-[#f8ed1a]">{t.titleAccent}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 font-medium max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        
        {/* Beneficios con acento amarillo (#f8ed1a) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 text-sm md:text-base font-bold text-gray-200">
          {t.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-2 bg-[#1a1a1a] px-5 py-2 rounded-full border border-gray-700">
              <span className="text-[#f8ed1a] text-lg">✓</span> {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* Sección del Calendario */}
      <section className="w-full px-4 pb-20 flex-grow">
        <GHLCalendarEmbed lang={lang} />
      </section>
    </main>
  );
}