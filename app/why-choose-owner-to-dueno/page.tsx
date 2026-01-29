import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitch from '@/app/components/LanguageSwitch'; 
import { Metadata } from 'next';

// --- METADATA (SEO) ---
export const metadata: Metadata = {
  title: 'Why Choose Dueño A Dueño | Owner-to-owner financing in Memphis',
  description: 'Finding the right home or buyer should not feel complicated. We simplify the process with a transparent real estate marketplace in Memphis.',
};

// --- DICCIONARIO ---
const DICTIONARY = {
  en: {
    nav: { home: "Home", properties: "Properties", about: "About Us", contact: "Contact" },
    hero: {
      title: "WHY CHOOSE Dueño A Dueño",
      subtitle: "OWNER-TO-OWNER FINANCING"
    },
    intro: {
      p1: "Finding the right home or buyer should not feel complicated or stressful. At Dueño A Dueño, we simplify the process by bringing people together through a transparent real estate marketplace platform in Memphis designed for direct communication and flexible opportunities.",
      p2: "Serving in Memphis, TN, Dueño A Dueño is an innovative way for property owners, buyers, and renters to connect without the use of banks, long approvals, or intermediaries. It is designed to help those who prioritize control in their lives through quickness, crystal clarity, and directness in their process.",
      link: "Learn more about the Dueño A Dueño platform"
    },
    sections: {
      difference: {
        title: "WHAT MAKES Dueño A Dueño DIFFERENT?",
        content: "Dueño A Dueño is not a real estate brokerage, lender, or legal service provider. Instead, we operate as a neutral real estate marketplace platform in Memphis where users connect directly and manage discussions, terms, and agreements on their own.",
        subContent: "This structure removes common barriers, reduces delays, and gives users more flexibility than traditional real estate systems, especially for those seeking Memphis owner-to-owner real estate opportunities."
      },
      experience: {
        title: "DECADE OF EXPERIENCE YOU CAN TRUST",
        content: "With more than 10 years of experience helping families, Dueño A Dueño understands the challenges people face when navigating real estate transactions.",
        listTitle: "Our platform was created to:",
        list: [
            "Remove Unnecessary Steps",
            "Eliminate complex approval processes",
            "Promote direct and honest communication"
        ],
        closing: "We strive to give a trustworthy place that allows users a free environment where they can confidently look for opportunities, whether for buying, renting, or listing a property through a direct property marketplace in Memphis."
      },
      bureaucracy: {
        title: "NO BUREAUCRACY, NO BANKS INVOLVED",
        content: "Traditional real estate transactions often involve banks, paperwork, and long waiting periods. Dueño A Dueño offers an alternative by supporting direct owner-to-owner financing conversations.",
        benefitsTitle: "What this means for users:",
        benefits: [
            "No bank approval required",
            "No lengthy loan processes",
            "Faster communication and decision-making"
        ],
        note: "While property owners may offer owner financing or lease options, all terms are discussed and agreed upon directly between users.",
        cta: "Have questions? Contact Dueño A Dueño in Memphis"
      },
      direct: {
        title: "DIRECT ACCESS TO PROPERTY OWNERS",
        content: "One of the biggest advantages of using Dueño A Dueño is direct communication. Unlike traditional platforms where messages pass through multiple parties, our real estate marketplace platform allows users to:",
        list: [
            "Speak directly with property owners",
            "Ask questions without delays",
            "Discuss terms openly and transparently"
        ],
        closing: "This direct access helps build trust and speeds up the process for everyone involved."
      },
      users: {
        title: "BUILT FOR BUYERS, SELLERS, AND RENTERS",
        content: "Dueño A Dueño supports a wide range of users, including:",
        list: [
            "Buyers looking for flexible purchase options",
            "Renters exploring alternative real estate options in Memphis",
            "Property owners seeking direct exposure without agents"
        ],
        closing: "Because we do not represent either side, every user has equal access and control."
      },
      transparency: {
        title: "TRANSPARENCY AND USER RESPONSIBILITY",
        intro: "Dueño A Dueño does not verify:",
        list: [
            "Property ownership or title",
            "Prices, terms, or interest rates",
            "Property condition or legal compliance"
        ],
        closing: "All listings are created by property owners or users. We strongly encourage everyone to conduct proper due diligence, including inspections and professional consultations, before entering into any agreement. This transparency helps users make informed and responsible decisions while using our real estate marketplace platform in Memphis."
      },
      local: {
        title: "LOCAL FOCUS IN MEMPHIS, TN WITH BROADER REACH",
        content: "Rooted in Memphis, built for everyone. \"Owner to Dueño\" leverages our deep understanding of the local market to solve real-world challenges for users nationwide. Our mission is simple: empower communities by making real estate connections effortless and human-centric."
      },
      summary: {
        title: "WHY PEOPLE CHOOSE Dueño A Dueño",
        items: [
            "Real estate marketplace platform with no intermediaries",
            "Over a decade of experience helping families",
            "Direct owner-to-owner communication",
            "No banks or unnecessary bureaucracy",
            "Flexible opportunities for buyers and renters",
            "Transparent, user-driven process"
        ],
        closing: "Serving Memphis and surrounding communities with a transparent, people-first real estate marketplace approach."
      },
      cta: {
        title: "GET STARTED WITH CONFIDENCE IN MEMPHIS, TN",
        content: "If you are looking for a simpler way to explore real estate opportunities in Memphis, Tennessee, Dueño A Dueño provides the tools and access you need—without pressure, hidden steps, or forced commitments.",
        sub: "Explore the platform, connect directly, and move forward at your own pace.",
        finalTitle: "Ready to learn more?",
        linkText: "Visit our Contact Us page or explore current listings to see how Dueño A Dueño can support your real estate journey."
      }
    },
    faq: {
        title: "FREQUENTLY ASKED QUESTIONS",
        items: [
            {
                q: "What is Dueño A Dueño and how does it work?",
                a: "Dueño A Dueño is a real estate marketplace platform located in Memphis, Tennessee, that provides a platform through which property owners, buyers, and renters relate to each other."
            },
            {
                q: "What is owner-to-owner financing on Dueño A Dueño?",
                a: "Owner to owner financing refers to cases in which property owners generate alternatives by choosing to talk to those seeking more favorable conditions directly. At Dueño A Dueño does not offer or manage financing—these conversations and agreements happen solely between users."
            },
            {
                q: "Do I need bank approval to use Dueño A Dueño?",
                a: "No. One of the key benefits of using Dueño A Dueño is that bank approval is not required to communicate with property owners. This makes the process faster and more flexible compared to traditional real estate methods."
            },
            {
                q: "Why choose Dueño A Dueño instead of a traditional real estate platform?",
                a: "Dueño A Dueño offers a simpler, more direct approach. Users benefit from fewer intermediaries, faster communication, and more control over the process, making it ideal for those seeking Memphis owner-to-owner real estate opportunities."
            },
            {
                q: "How do I get started on Dueño A Dueño?",
                a: "You can get started by exploring the platform, reviewing available listings, and reaching out directly to property owners. If you need help using the platform, visit our Contact Us page for assistance."
            }
        ]
    }
  },
  // --- SPANISH (PLACEHOLDERS based on English Structure) ---
  es: {
    nav: { home: "Inicio", properties: "Propiedades", about: "Nosotros", contact: "Contacto" },
    hero: {
      title: "¿POR QUÉ ELEGIR OWNER TO DUEÑO?",
      subtitle: "FINANCIAMIENTO DE DUEÑO A DUEÑO"
    },
    intro: {
      p1: "Encontrar la casa o el comprador adecuado no debería parecer complicado ni estresante. En Dueño A Dueño, simplificamos el proceso uniendo a las personas a través de una plataforma de mercado inmobiliario transparente en Memphis diseñada para la comunicación directa y oportunidades flexibles.",
      p2: "Sirviendo en Memphis, TN, Dueño A Dueño es una forma innovadora para que propietarios, compradores e inquilinos se conecten sin el uso de bancos, largas aprobaciones o intermediarios.",
      link: "Aprenda más sobre la plataforma Dueño A Dueño"
    },
    sections: {
      difference: {
        title: "¿QUÉ HACE DIFERENTE A Dueño A Dueño?",
        content: "Dueño A Dueño no es una agencia inmobiliaria, prestamista ni proveedor de servicios legales. En cambio, operamos como una plataforma de mercado inmobiliario neutral en Memphis donde los usuarios se conectan directamente.",
        subContent: "Esta estructura elimina barreras comunes y brinda a los usuarios más flexibilidad."
      },
      experience: {
        title: "DÉCADA DE EXPERIENCIA EN LA QUE PUEDE CONFIAR",
        content: "Con más de 10 años de experiencia ayudando a familias, Dueño A Dueño comprende los desafíos que enfrentan las personas.",
        listTitle: "Nuestra plataforma fue creada para:",
        list: [
            "Eliminar pasos innecesarios",
            "Eliminar procesos de aprobación complejos",
            "Promover la comunicación directa y honesta"
        ],
        closing: "Nos esforzamos por brindar un lugar confiable donde los usuarios puedan buscar oportunidades con confianza."
      },
      bureaucracy: {
        title: "SIN BUROCRACIA, SIN BANCOS INVOLUCRADOS",
        content: "Las transacciones inmobiliarias tradicionales a menudo implican bancos y largos períodos de espera. Ofrecemos una alternativa apoyando conversaciones directas de financiamiento.",
        benefitsTitle: "Lo que esto significa para los usuarios:",
        benefits: [
            "No se requiere aprobación bancaria",
            "Sin largos procesos de préstamo",
            "Comunicación y toma de decisiones más rápidas"
        ],
        note: "Todos los términos se discuten y acuerdan directamente entre los usuarios.",
        cta: "¿Tiene preguntas? Contacte a Dueño A Dueño"
      },
      direct: {
        title: "ACCESO DIRECTO A PROPIETARIOS",
        content: "Una de las mayores ventajas es la comunicación directa. A diferencia de las plataformas tradicionales, nuestra plataforma permite a los usuarios:",
        list: [
            "Hablar directamente con los propietarios",
            "Hacer preguntas sin demoras",
            "Discutir términos abierta y transparentemente"
        ],
        closing: "Este acceso directo ayuda a generar confianza y acelera el proceso."
      },
      users: {
        title: "CONSTRUIDO PARA COMPRADORES, VENDEDORES E INQUILINOS",
        content: "Dueño A Dueño apoya a una amplia gama de usuarios, incluyendo:",
        list: [
            "Compradores que buscan opciones flexibles",
            "Inquilinos explorando opciones alternativas",
            "Propietarios que buscan exposición directa sin agentes"
        ],
        closing: "Debido a que no representamos a ninguna de las partes, cada usuario tiene el mismo acceso y control."
      },
      transparency: {
        title: "TRANSPARENCIA Y RESPONSABILIDAD DEL USUARIO",
        intro: "Dueño A Dueño no verifica:",
        list: [
            "Propiedad o título del inmueble",
            "Precios, términos o tasas de interés",
            "Condición de la propiedad o cumplimiento legal"
        ],
        closing: "Todos los listados son creados por los usuarios. Recomendamos encarecidamente realizar la debida diligencia antes de entrar en cualquier acuerdo."
      },
      local: {
        title: "ENFOQUE LOCAL EN MEMPHIS, TN CON ALCANCE MÁS AMPLIO",
        content: "Arraigados en Memphis, construidos para todos. Aprovechamos nuestra profunda comprensión del mercado local para resolver desafíos del mundo real."
      },
      summary: {
        title: "¿POR QUÉ LA GENTE ELIGE Dueño A Dueño?",
        items: [
            "Plataforma de mercado inmobiliario sin intermediarios",
            "Más de una década de experiencia",
            "Comunicación directa de dueño a dueño",
            "Sin bancos ni burocracia innecesaria",
            "Oportunidades flexibles",
            "Proceso transparente impulsado por el usuario"
        ],
        closing: "Sirviendo a Memphis y comunidades circundantes con un enfoque transparente."
      },
      cta: {
        title: "COMIENCE CON CONFIANZA EN MEMPHIS, TN",
        content: "Si busca una forma más sencilla de explorar oportunidades inmobiliarias en Memphis, Dueño A Dueño proporciona las herramientas que necesita.",
        sub: "Explore la plataforma, conéctese directamente y avance a su propio ritmo.",
        finalTitle: "¿Listo para saber más?",
        linkText: "Visite nuestra página de Contacto o explore los listados actuales."
      }
    },
    faq: {
        title: "PREGUNTAS FRECUENTES",
        items: [
            { q: "¿Qué es Dueño A Dueño?", a: "Es una plataforma de mercado inmobiliario en Memphis que conecta a propietarios y compradores." },
            { q: "¿Qué es el financiamiento de dueño a dueño?", a: "Se refiere a casos en los que los propietarios eligen hablar directamente con quienes buscan condiciones más favorables." },
            { q: "¿Necesito aprobación bancaria?", a: "No. Uno de los beneficios clave es que no se requiere aprobación bancaria para comunicarse con los propietarios." },
            { q: "¿Por qué elegirnos sobre una plataforma tradicional?", a: "Ofrecemos un enfoque más simple y directo con menos intermediarios." },
            { q: "¿Cómo empiezo?", a: "Puede comenzar explorando la plataforma y contactando a los propietarios." }
        ]
    }
  }
};

export default async function WhyChoosePage(props: {
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
                    {/* CAMBIO APLICADO: PROPERTIES */}
                    <Link href={`/properties?lang=${lang}`} className="hover:text-white transition">{t.nav.properties}</Link>
                    <Link href={`/about-us?lang=${lang}`} className="hover:text-white transition">{t.nav.about}</Link>
                    <Link href={`/contact-us?lang=${lang}`} className="hover:text-white transition">{t.nav.contact}</Link>
                </nav>
                <div className="scale-90"><LanguageSwitch /></div>
            </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#121212] border-b border-gray-800 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase mb-4 tracking-tight">
            {t.hero.title}
        </h1>
        <h3 className="text-xl md:text-2xl text-[#f8ed1a] font-black uppercase tracking-wide">
            {t.hero.subtitle}
        </h3>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* 1. INTRO */}
        <section className="text-center space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">{t.intro.p1}</p>
            <p className="text-lg text-gray-300 leading-relaxed">{t.intro.p2}</p>
            <Link href={`/about-us?lang=${lang}`} className="inline-block text-[#529e14] font-bold uppercase hover:underline mt-4">
                👉 {t.intro.link}
            </Link>
        </section>

        {/* 2. DIFFERENCE */}
        <section className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-black text-white uppercase mb-4">{t.sections.difference.title}</h2>
            <p className="text-gray-300 mb-4">{t.sections.difference.content}</p>
            <p className="text-gray-400 italic">{t.sections.difference.subContent}</p>
        </section>

        {/* 3. EXPERIENCE */}
        <section className="grid md:grid-cols-1 gap-10 items-center">
            <div>
                <h2 className="text-2xl font-black text-[#f8ed1a] uppercase mb-4">{t.sections.experience.title}</h2>
                <p className="text-gray-300 mb-6">{t.sections.experience.content}</p>
                
                <h3 className="font-bold text-white uppercase text-sm mb-3">{t.sections.experience.listTitle}</h3>
                <ul className="space-y-2 mb-6">
                    {t.sections.experience.list.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                            <span className="text-[#529e14] font-bold">✓</span> {item}
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-gray-400">{t.sections.experience.closing}</p>
            </div>
        </section>

        {/* 4. NO BUREAUCRACY */}
        <section>
            <h2 className="text-3xl font-black text-white uppercase mb-6 text-center">{t.sections.bureaucracy.title}</h2>
            <div className="bg-[#1a1a1a] border border-gray-700 p-8 rounded-2xl shadow-xl">
                <p className="text-gray-300 mb-6 text-center">{t.sections.bureaucracy.content}</p>
                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-[#f8ed1a] uppercase mb-4 text-center">{t.sections.bureaucracy.benefitsTitle}</h3>
                    <ul className="grid md:grid-cols-3 gap-4 text-center">
                        {t.sections.bureaucracy.benefits.map((item, i) => (
                            <li key={i} className="bg-[#1a1a1a] p-3 rounded border border-gray-700 text-white font-medium shadow">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-gray-400 text-center mb-6">{t.sections.bureaucracy.note}</p>
                <div className="text-center">
                    <Link href={`/contact-us?lang=${lang}`} className="text-[#529e14] font-bold uppercase hover:text-white transition">
                        👉 {t.sections.bureaucracy.cta}
                    </Link>
                </div>
            </div>
        </section>

        {/* 5. DIRECT ACCESS & USERS */}
        <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-gray-800/30 p-8 rounded-xl border-l-4 border-[#529e14]">
                <h2 className="text-xl font-black text-white uppercase mb-4">{t.sections.direct.title}</h2>
                <p className="text-gray-300 mb-4 text-sm">{t.sections.direct.content}</p>
                <ul className="space-y-2 mb-4">
                    {t.sections.direct.list.map((item, i) => (
                        <li key={i} className="flex gap-2 text-gray-200 text-sm">
                            <span className="text-[#529e14]">•</span> {item}
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-gray-500 font-bold uppercase">{t.sections.direct.closing}</p>
            </section>

            <section className="bg-gray-800/30 p-8 rounded-xl border-l-4 border-[#f8ed1a]">
                <h2 className="text-xl font-black text-white uppercase mb-4">{t.sections.users.title}</h2>
                <p className="text-gray-300 mb-4 text-sm">{t.sections.users.content}</p>
                 <ul className="space-y-2 mb-4">
                    {t.sections.users.list.map((item, i) => (
                        <li key={i} className="flex gap-2 text-gray-200 text-sm">
                            <span className="text-[#f8ed1a]">•</span> {item}
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-gray-500 font-bold uppercase">{t.sections.users.closing}</p>
            </section>
        </div>

        {/* 6. TRANSPARENCY */}
        <section className="bg-red-900/10 border border-red-900/30 p-8 rounded-xl">
             <h2 className="text-2xl font-black text-white uppercase mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {t.sections.transparency.title}
             </h2>
             <p className="text-white font-bold mb-4">{t.sections.transparency.intro}</p>
             <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
                {t.sections.transparency.list.map((item, i) => <li key={i}>{item}</li>)}
             </ul>
             <p className="text-sm text-gray-400">{t.sections.transparency.closing}</p>
        </section>

        {/* 7. LOCAL & SUMMARY */}
        <section className="text-center space-y-12">
            <div>
                <h2 className="text-2xl font-black text-[#f8ed1a] uppercase mb-4">{t.sections.local.title}</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">{t.sections.local.content}</p>
            </div>

            <div className="bg-[#f8ed1a] text-[#1a1a1a] p-10 rounded-2xl">
                <h2 className="text-3xl font-black uppercase mb-8">{t.sections.summary.title}</h2>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
                    {t.sections.summary.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/20 p-3 rounded backdrop-blur-sm border border-black/10">
                            <span className="font-bold text-xl">★</span>
                            <span className="font-bold">{item}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-8 font-medium italic">{t.sections.summary.closing}</p>
            </div>
        </section>

        {/* 8. CTA */}
        <section className="text-center py-10 border-t border-gray-800">
            <h2 className="text-3xl font-black text-white uppercase mb-4">{t.sections.cta.title}</h2>
            <p className="text-gray-300 mb-2">{t.sections.cta.content}</p>
            <p className="text-white font-bold text-lg mb-8">{t.sections.cta.sub}</p>
            
            <div className="bg-gray-800 p-6 rounded-lg inline-block">
                <h3 className="text-[#f8ed1a] font-bold uppercase mb-2">{t.sections.cta.finalTitle}</h3>
                <p className="text-gray-300 text-sm mb-4 max-w-md mx-auto">{t.sections.cta.linkText}</p>
                <div className="flex gap-4 justify-center">
                    <Link href={`/contact-us?lang=${lang}`} className="bg-[#529e14] hover:bg-[#458510] text-white px-6 py-3 rounded font-black uppercase transition">
                        Contact Us
                    </Link>
                    <Link href={`/properties?lang=${lang}`} className="bg-white hover:bg-gray-200 text-[#1a1a1a] px-6 py-3 rounded font-black uppercase transition">
                        Explore Properties
                    </Link>
                </div>
            </div>
        </section>

        {/* 9. FAQ */}
        <section>
             <h2 className="text-3xl font-black text-center text-white uppercase mb-12">{t.faq.title}</h2>
             <div className="space-y-4">
                {t.faq.items.map((item, idx) => (
                    <div key={idx} className="bg-[#242424] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-[#f8ed1a] font-bold uppercase text-sm mb-2">{item.q}</h3>
                        <p className="text-gray-300 text-sm">{item.a}</p>
                    </div>
                ))}
             </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}