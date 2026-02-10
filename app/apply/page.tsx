import { Metadata } from 'next';
import Header from '@/app/components/Header';
import GHLFormEmbed from '@/app/components/GHLFormEmbed';

export const metadata: Metadata = {
  title: 'Aplicar | Dueño a Dueño',
  description: 'Inicia tu proceso de compra o renta directa.',
};

const FORM_URLS = {
  en: "https://api.leadconnectorhq.com/widget/form/fscUXJGwgYYp24WLNybT", 
  es: "https://api.leadconnectorhq.com/widget/form/N2fzye0vWAVtmsRMq057" 
};

const DICTIONARY = {
  es: {
    title: "INICIA TU PROCESO",
    subtitle: "La mayor parte del proceso es automático. Llena el formulario abajo para que nuestro sistema evalúe tus opciones.",
    // Eliminé la sección "steps" del diccionario ya que no se usará
  },
  en: {
    title: "START YOUR PROCESS",
    subtitle: "Most of the process is automated. Fill out the form below so our system can evaluate your options.",
    // Eliminé la sección "steps" del diccionario ya que no se usará
  }
};

export default async function ApplyPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const t = DICTIONARY[lang];
  
  const formUrl = lang === 'en' ? FORM_URLS.en : FORM_URLS.es;

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      
      <Header lang={lang} />

      {/* SECCIÓN SUPERIOR */}
      <section className="relative bg-gradient-to-b from-gray-900 to-[#1a1a1a] pt-16 pb-32 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-[#f8ed1a] uppercase tracking-tighter">
            {t.title}
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
          
          {/* AQUÍ ESTABA EL DIV DE LOS PASOS, HA SIDO ELIMINADO */}

        </div>
      </section>

      {/* SECCIÓN DEL FORMULARIO GHL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-20 relative z-10">
        <GHLFormEmbed src={formUrl} height="850px" />
      </main>

      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}