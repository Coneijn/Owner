'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/app/components/Header';
import WhatsAppButton from '@/app/components/WhatsAppButton';

type Lang = 'en' | 'es';

export default function BuyerLandingPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const resolvedSearchParams = props.searchParams ? use(props.searchParams) : undefined;
  const lang: Lang = resolvedSearchParams?.lang === 'es' ? 'es' : 'en';

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    zipCode: '',
    downPayment: '10k',
  });

  const DICTIONARY = {
    es: {
      hero: {
        badge: "🏡 DUEÑO A DUEÑO • FINANCIAMIENTO DIRECTO",
        title: "ENCUENTRA TU PRÓXIMA CASA",
        subtitle: "Aprende a buscar en nuestra plataforma y déjanos tus datos para enviarte las mejores opciones directamente a tu teléfono."
      },
      steps: {
        step1: "PASO 1: MIRA EL VIDEO TUTORIAL",
        step2: "PASO 2: RECIBE LAS CASAS DISPONIBLES"
      },
      form: {
        title: "COMPLETA TUS DATOS",
        subtitle: "Te enviaremos un mensaje de texto de inmediato con el inventario disponible.",
        firstName: "NOMBRE",
        lastName: "APELLIDO",
        phone: "TELÉFONO / WHATSAPP",
        zip: "CÓDIGO POSTAL PREFERIDO",
        downPayment: "ENGANCHE DISPONIBLE (DOWN PAYMENT)",
        submit: "ENVIAR Y RECIBIR CASAS",
        submitting: "ENVIANDO...",
        disclaimer: "🔒 Tus datos están protegidos. Te enviaremos un SMS de inmediato.",
      },
      success: {
        title: "¡INFORMACIÓN ENVIADA!",
        desc: "Te acabamos de enviar un mensaje de texto con las propiedades disponibles en tu zona seleccionada.",
      },
      benefits: [
        {
          title: "RESPUESTA INMEDIATA",
          desc: "Recibe un mensaje de texto al instante con las casas que coinciden con tu código postal."
        },
        {
          title: "TRATO DIRECTO",
          desc: "Sin intermediarios ni complicaciones bancarias. Financiamiento directo de dueño a dueño."
        },
        {
          title: "A TU PRESUPUESTO",
          desc: "Propiedades accesibles con opciones de enganche desde $10,000."
        }
      ],
      footer: "© 2026 Dueño a Dueño."
    },
    en: {
      hero: {
        badge: "🏡 OWNER TO OWNER • DIRECT FINANCING",
        title: "FIND YOUR NEXT HOME",
        subtitle: "Watch the video guide to see how to browse our marketplace, then enter your info to receive available listings right away."
      },
      steps: {
        step1: "STEP 1: WATCH THE TUTORIAL",
        step2: "STEP 2: GET MATCHING HOMES"
      },
      form: {
        title: "ENTER YOUR DETAILS",
        subtitle: "We will send you an instant text message with matching properties.",
        firstName: "FIRST NAME",
        lastName: "LAST NAME",
        phone: "PHONE / WHATSAPP NUMBER",
        zip: "PREFERRED ZIP CODE",
        downPayment: "AVAILABLE DOWN PAYMENT",
        submit: "SUBMIT & GET PROPERTIES",
        submitting: "SUBMITTING...",
        disclaimer: "🔒 Your info is protected. You will receive an SMS immediately.",
      },
      success: {
        title: "ALL SET!",
        desc: "We just sent you an instant text message with properties in your preferred area.",
      },
      benefits: [
        {
          title: "INSTANT TEXT ALERTS",
          desc: "Get an immediate SMS with properties that match your target zip code and budget."
        },
        {
          title: "DIRECT FINANCING",
          desc: "Direct owner terms without traditional bank brokerages or lending institutions."
        },
        {
          title: "FITS YOUR BUDGET",
          desc: "Explore owner-financed properties starting from $10k down payment."
        }
      ],
      footer: "© 2026 Dueño a Dueño."
    }
  };

  const t = DICTIONARY[lang];
  const contactName = lang === 'es' ? 'la landing de compradores' : 'the buyer landing page';

  const VIDEO_URLS = {
    en: {
      web: "https://ownerproduction.s3.us-east-2.amazonaws.com/videos/0820.mp4",
      mobile: "https://ownerproduction.s3.us-east-2.amazonaws.com/videos/0820mob.mp4"
    },
    es: {
      web: "https://ownerproduction.s3.us-east-2.amazonaws.com/videos/0820espan%CC%83ol.mp4",
      mobile: "https://ownerproduction.s3.us-east-2.amazonaws.com/videos/0820mspa.mp4"
    }
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentVideoSrc = isMobile ? VIDEO_URLS[lang].mobile : VIDEO_URLS[lang].web;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/a1a5e638-fe60-4843-a571-6d71ec2e079e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language: lang,
          source: 'buyer_landing_page'
        }),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200 flex flex-col justify-between">
      <div>
        <Header lang={lang} activePage="buyers" />

        <section className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] py-14 px-4 text-center border-b border-gray-800">
          <span className="inline-block text-[#529e14] font-black tracking-widest text-xs uppercase mb-3">
            {t.hero.badge}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#f8ed1a] uppercase mb-4 tracking-tight">
            {t.hero.title}
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
        </section>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
          
          {/* Paso 1: Video Adaptativo (Vertical 9:16 en móvil, Horizontal 16:9 en desktop) */}
          <div className="space-y-3 flex flex-col items-center">
            <h2 className="text-sm font-black text-[#f8ed1a] uppercase tracking-wider flex items-center gap-2 self-center">
              <span className="text-[#529e14]">▶</span> {t.steps.step1}
            </h2>
            
            <div className="w-full max-w-[320px] md:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
              {mounted ? (
                <video
                  key={currentVideoSrc}
                  controls
                  playsInline
                  className="w-full aspect-[9/16] md:aspect-video object-contain bg-black"
                >
                  <source src={currentVideoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full aspect-[9/16] md:aspect-video bg-[#121212] animate-pulse" />
              )}
            </div>
          </div>

          {/* Paso 2: Formulario */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-[#f8ed1a] uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#529e14]">✓</span> {t.steps.step2}
            </h2>

            <div className="bg-[#121212] p-6 sm:p-10 rounded-2xl border border-gray-800 shadow-2xl">
              {isSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-[#529e14]/20 text-[#529e14] rounded-full flex items-center justify-center mx-auto ring-4 ring-[#529e14]/10">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase">{t.success.title}</h3>
                  <p className="text-gray-300 text-sm max-w-md mx-auto">{t.success.desc}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase">{t.form.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{t.form.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{t.form.firstName}</label>
                      <input
                        required
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{t.form.lastName}</label>
                      <input
                        required
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{t.form.phone}</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(901) 000-0000"
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{t.form.zip}</label>
                      <input
                        required
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="38115"
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{t.form.downPayment}</label>
                      <div className="relative">
                        <select
                          name="downPayment"
                          value={formData.downPayment}
                          onChange={handleInputChange}
                          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors text-sm appearance-none cursor-pointer"
                        >
                          <option value="10k">$10,000</option>
                          <option value="20k">$20,000</option>
                          <option value="30k+">$30,000+</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#f8ed1a] hover:bg-yellow-400 text-black font-black uppercase tracking-wide py-4 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? t.form.submitting : t.form.submit}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    {t.form.disclaimer}
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Tarjetas de Beneficios */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
            {t.benefits.map((b, idx) => (
              <div key={idx} className="bg-[#242424] p-5 rounded-lg border border-gray-700 hover:border-[#f8ed1a] transition-colors">
                <h3 className="text-[#f8ed1a] font-black uppercase text-sm mb-2">{b.title}</h3>
                <p className="text-gray-300 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="bg-[#1a1a1a] text-white py-8 border-t border-gray-800 text-center mt-12">
        <p className="text-gray-500 text-sm">{t.footer}</p>
      </footer>

      <WhatsAppButton lang={lang} propertyName={contactName} />
    </div>
  );
}