import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitch from '@/app/components/LanguageSwitch'; 
import { Metadata } from 'next';

// --- METADATA (SEO) ---
export const metadata: Metadata = {
  title: 'Contact Dueño A Dueño | Owner-to-owner financing in Memphis',
  description: 'Contact Dueño A Dueño for help with our direct owner-to-user property marketplace in Memphis. Call us today 901-660-4100!',
};

// --- URLs DE LOS FORMULARIOS (LEADCONNECTOR) ---
const FORM_URLS = {
  en: "https://api.leadconnectorhq.com/widget/form/TOlzHrFviHrZkwz9wrvG",
  es: "https://api.leadconnectorhq.com/widget/form/KkWBBzaM7k5owkXasbEA"
};

// --- DICCIONARIO ---
const DICTIONARY = {
  en: {
    nav: { home: "Home", properties: "Properties", about: "About Us", contact: "Contact" },
    hero: {
      title: "CONTACT US",
      subtitle: "We are here to help you connect directly."
    },
    intro: {
      p1: "At Dueño A Dueño, we help property owners, buyers, renters, and users to connect and communicate directly. Our team is more than happy to assist you in any way we can.",
      p2: "Dueño A Dueño is a real estate marketplace platform in Memphis, which is not a real estate brokerage, a lending institution, or a legal practice. It is just a platform where people meet, and communication, decision-making, and agreements take place among those who are interested in direct Owner-to-Owner financing."
    },
    help: {
      title: "HOW CAN WE HELP YOU?",
      list: [
        "Questions about using the Dueño A Dueño platform",
        "Support with property listings or user accounts",
        "General inquiries about owner financing, lease options, or rentals",
        "Feedback or partnership inquiries"
      ],
      note: "If your question relates to pricing, property condition, legal terms, or financing details, we recommend contacting the property owner directly or consulting a qualified professional."
    },
    form: {
      title: "SEND US A MESSAGE",
      subtitle: "Please fill out the form below and our team will respond as soon as possible."
    },
    transparency: {
      title: "TRANSPARENCY & TRUST",
      intro: "Dueño A Dueño does not verify or guarantee:",
      list: [
        "Property ownership or title",
        "Pricing, terms, or interest rates",
        "Property condition or availability",
        "Legal compliance of listings"
      ],
      disclaimer: "The respective property owners or users provide all information regarding properties. All users are strongly advised to make proper investigations before entering into any deal or transaction, whether it be a purchase, rental, lease option, or owner financing."
    },
    info: {
      title: "CONTACT INFORMATION",
      hoursLabel: "Business Hours:",
      hours: {
        week: "Monday – Friday: 9:00 AM – 6:00 PM",
        sat: "Saturday: 10:00 AM – 2:00 PM",
        sun: "Sunday: Closed"
      },
      ctaTitle: "Have a question or need help getting started?",
      ctaText: "Reach out to us today — our team is happy to guide you through using the Dueño A Dueño platform."
    },
    faq: {
      title: "FREQUENTLY ASKED QUESTIONS",
      items: [
        {
            q: "What is Dueño A Dueño?",
            a: "Dueño A Dueño, an online platform in Memphis, Tennessee, connects property owners, buyers, renters, and users. We do not act as a real estate broker, lender, or legal advisor."
        },
        {
            q: "Can I ask questions about a specific property through the contact form?",
            a: "You may reach out to us for general platform assistance or any website-related queries. To get more information about a particular real estate property, like its cost, status, or financing options, it is best to communicate with its owner."
        },
        {
            q: "Does Dueño A Dueño verify property listings?",
            a: "No. Dueño A Dueño does not verify or confirm property ownership, prices, terms, or conditions in any way. Information is provided by property owners/users themselves, and it should be confirmed before a decision is made in any way."
        },
        {
            q: "Does Dueño A Dueño offer owner financing or lease options?",
            a: "No. Dueño A Dueño does not provide owner financing or lease options. Some property owners in Memphis and other areas may choose to list properties with these options, but all terms are created, offered, and managed solely by the property owner."
        },
        {
            q: "Is Dueño A Dueño a real estate brokerage or lender?",
            a: "No. Dueño A Dueño is not a real estate brokerage, lender, or law firm. We don’t work for, negotiate, or otherwise engage in transactions on behalf of buyers and/or sellers."
        },
        {
            q: "What should I do before entering into a real estate agreement?",
            a: "Before entering into any agreement, users should conduct their own due diligence. This would involve careful consideration of the property details along with inspection. Moreover, it would be advisable to consult various professionals, such as real estate agents, attorneys, lenders, or tax professionals."
        },
        {
            q: "Who should I approach if I need legal or financial advice?",
            a: "In order to address questions related to law, finance, or taxes, advice should come from qualified professionals. This is because Dueño A Dueño does not and will not render such advice."
        }
      ]
    }
  },
  es: {
    nav: { home: "Inicio", properties: "Propiedades", about: "Nosotros", contact: "Contacto" },
    hero: {
      title: "CONTÁCTANOS",
      subtitle: "Estamos aquí para ayudarte a conectar directamente."
    },
    intro: {
      p1: "En Dueño A Dueño, ayudamos a propietarios, compradores, inquilinos y usuarios a conectarse y comunicarse directamente. Nuestro equipo estará encantado de ayudarle en todo lo que podamos.",
      p2: "Dueño A Dueño es una plataforma de mercado inmobiliario en Memphis, que no es una agencia inmobiliaria, una institución crediticia ni un bufete jurídico. Es simplemente una plataforma donde las personas se encuentran y donde la comunicación, la toma de decisiones y los acuerdos tienen lugar entre aquellos interesados en la financiación directa de Dueño a Dueño."
    },
    help: {
      title: "¿CÓMO PODEMOS AYUDARTE?",
      list: [
        "Preguntas sobre el uso de la plataforma Dueño A Dueño",
        "Soporte con listados de propiedades o cuentas de usuario",
        "Consultas generales sobre financiación del propietario, opciones de arrendamiento o alquileres",
        "Comentarios o consultas de asociación"
      ],
      note: "Si su pregunta se relaciona con precios, condición de la propiedad, términos legales o detalles de financiamiento, recomendamos contactar directamente al propietario de la propiedad o consultar a un profesional calificado."
    },
    form: {
      title: "ENVÍANOS UN MENSAJE",
      subtitle: "Por favor complete el formulario a continuación y nuestro equipo responderá lo antes posible."
    },
    transparency: {
      title: "TRANSPARENCIA Y CONFIANZA",
      intro: "Dueño A Dueño no verifica ni garantiza:",
      list: [
        "Titularidad o título de la propiedad",
        "Precios, términos o tasas de interés",
        "Condición o disponibilidad de la propiedad",
        "Cumplimiento legal de los listados"
      ],
      disclaimer: "Los respectivos propietarios o usuarios proporcionan toda la información sobre las propiedades. Se recomienda encarecidamente a todos los usuarios que realicen las investigaciones adecuadas antes de realizar cualquier trato o transacción, ya sea compra, alquiler, opción de arrendamiento o financiación del propietario."
    },
    info: {
      title: "INFORMACIÓN DE CONTACTO",
      hoursLabel: "Horario de Atención:",
      hours: {
        week: "Lunes – Viernes: 9:00 AM – 6:00 PM",
        sat: "Sábado: 10:00 AM – 2:00 PM",
        sun: "Domingo: Cerrado"
      },
      ctaTitle: "¿Tienes una pregunta o necesitas ayuda para empezar?",
      ctaText: "Contáctanos hoy: nuestro equipo está feliz de guiarte a través del uso de la plataforma Dueño A Dueño."
    },
    faq: {
      title: "PREGUNTAS FRECUENTES",
      items: [
        {
            q: "¿Qué es Dueño A Dueño?",
            a: "Dueño A Dueño, una plataforma en línea en Memphis, Tennessee, conecta a propietarios, compradores, inquilinos y usuarios. No actuamos como corredor de bienes raíces, prestamista o asesor legal."
        },
        {
            q: "¿Puedo hacer preguntas sobre una propiedad específica a través del formulario?",
            a: "Puede comunicarse con nosotros para obtener asistencia general de la plataforma. Para obtener más información sobre una propiedad en particular, como su costo o financiamiento, es mejor comunicarse con su propietario."
        },
        {
            q: "¿Dueño A Dueño verifica los listados de propiedades?",
            a: "No. Dueño A Dueño no verifica ni confirma la propiedad, precios o términos. La información es proporcionada por los usuarios y debe ser confirmada antes de tomar una decisión."
        },
        {
            q: "¿Dueño A Dueño ofrece financiación del propietario?",
            a: "No. Dueño A Dueño no proporciona financiación. Algunos propietarios pueden elegir listar propiedades con estas opciones, pero todos los términos son creados y gestionados únicamente por el propietario."
        },
        {
            q: "¿Es Dueño A Dueño una agencia inmobiliaria o prestamista?",
            a: "No. Dueño A Dueño no es una agencia inmobiliaria, prestamista ni bufete de abogados. No negociamos ni participamos en transacciones en nombre de compradores y/o vendedores."
        },
        {
            q: "¿Qué debo hacer antes de entrar en un acuerdo inmobiliario?",
            a: "Antes de entrar en cualquier acuerdo, los usuarios deben realizar su propia diligencia debida. Esto implicaría una cuidadosa consideración de los detalles de la propiedad junto con la inspección. Además, sería aconsejable consultar a varios profesionales."
        },
        {
            q: "¿A quién debo dirigirme si necesito asesoramiento legal o financiero?",
            a: "Para abordar preguntas relacionadas con leyes, finanzas o impuestos, el asesoramiento debe provenir de profesionales calificados. Dueño A Dueño no presta ni prestará dicho asesoramiento."
        }
      ]
    }
  }
};

export default async function ContactPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'es' ? 'es' : 'en') as 'es' | 'en';
  const t = DICTIONARY[lang];

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      
      {/* --- HEADER --- */}
      <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex justify-between items-center">
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
                    <Link href={`/?lang=${lang}`} className="hover:text-white transition">{t.nav.home}</Link>
                    <Link href={`/properties?lang=${lang}`} className="hover:text-white transition">{t.nav.properties}</Link>
                    <Link href={`/about-us?lang=${lang}`} className="hover:text-white transition">{t.nav.about}</Link>
                    {/* Contacto Activo (Amarillo y sin link) */}
                    <span className="text-[#f8ed1a]">{t.nav.contact}</span>
                </nav>
                <div className="scale-90"><LanguageSwitch /></div>
            </div>
        </div>
      </header>

      {/* --- HERO --- */}
      <section className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] py-16 px-4 text-center border-b border-gray-800">
        <h1 className="text-4xl md:text-6xl font-black text-[#f8ed1a] uppercase mb-4">{t.hero.title}</h1>
        <p className="text-xl text-white max-w-2xl mx-auto">{t.hero.subtitle}</p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
            <div className="space-y-12">
                
                {/* Intro */}
                <div className="prose prose-invert">
                    <p className="text-gray-300 text-lg leading-relaxed">{t.intro.p1}</p>
                    <p className="text-gray-400 text-sm italic border-l-4 border-gray-700 pl-4">{t.intro.p2}</p>
                </div>

                {/* How can we help */}
                <div>
                    <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-2">
                        <span className="text-[#529e14] text-3xl">?</span> {t.help.title}
                    </h2>
                    <ul className="space-y-3 mb-6">
                        {t.help.list.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-[#529e14] mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-yellow-900/20 p-4 rounded border border-yellow-700/50">
                        <p className="text-yellow-200 text-sm">{t.help.note}</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-[#242424] p-8 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-black text-[#f8ed1a] uppercase mb-6">{t.info.title}</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-gray-800 p-3 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                <a href="mailto:support@ownertodueno.com" className="text-lg font-bold text-white hover:text-[#f8ed1a] transition">support@ownertodueno.com</a>
                            </div>
                        </div>

                         <div className="flex items-start gap-4">
                            <div className="bg-gray-800 p-3 rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t.info.hoursLabel}</p>
                                <p className="text-gray-300 text-sm">{t.info.hours.week}</p>
                                <p className="text-gray-300 text-sm">{t.info.hours.sat}</p>
                                <p className="text-gray-500 text-sm">{t.info.hours.sun}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-600">
                        <h3 className="font-bold text-white mb-2">{t.info.ctaTitle}</h3>
                        <p className="text-sm text-gray-400">{t.info.ctaText}</p>
                        <p className="text-2xl font-black text-[#529e14] mt-2">901-660-4100</p>
                    </div>
                </div>

            </div>

            {/* COLUMNA DERECHA: FORMULARIO EMBEBIDO */}
            <div className="bg-[#121212] p-6 md:p-10 rounded-2xl border border-gray-800 shadow-2xl h-fit sticky top-24">
                <h2 className="text-2xl font-black text-white uppercase mb-2">{t.form.title}</h2>
                <p className="text-gray-400 text-sm mb-6">{t.form.subtitle}</p>

                {/* IFRAME DE LEADCONNECTOR */}
                <div className="w-full h-[650px] bg-[#1a1a1a] rounded overflow-hidden">
                  <iframe
                    src={FORM_URLS[lang]}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      overflow: 'scroll',
                    }}
                    id={`inline-${lang === 'en' ? 'TOlzHrFviHrZkwz9wrvG' : 'KkWBBzaM7k5owkXasbEA'}`} 
                    title="Contact Form"
                  />
                </div>
            </div>
        </div>

        {/* --- TRANSPARENCY SECTION --- */}
        <section className="mt-20 border-t border-gray-800 pt-16">
            <div className="bg-gradient-to-r from-red-900/20 to-transparent p-8 rounded-xl border-l-8 border-red-800">
                <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
                     <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     {t.transparency.title}
                </h2>
                <p className="text-white font-bold mb-4">{t.transparency.intro}</p>
                <ul className="grid md:grid-cols-2 gap-2 mb-6 text-gray-300 list-disc list-inside">
                    {t.transparency.list.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
                <p className="text-gray-400 text-sm leading-relaxed border-t border-red-900/30 pt-4">
                    {t.transparency.disclaimer}
                </p>
            </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="mt-20">
            <h2 className="text-3xl font-black text-center text-white uppercase mb-12 tracking-tight">{t.faq.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {t.faq.items.map((item, idx) => (
                    <div key={idx} className="bg-[#242424] p-6 rounded-lg border border-gray-700 hover:border-[#f8ed1a] transition-colors group">
                        <h3 className="text-[#f8ed1a] font-bold uppercase text-sm mb-3 group-hover:text-white transition-colors">{item.q}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>
        </section>

      </main>

      {/* FOOTER SIMPLE */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}