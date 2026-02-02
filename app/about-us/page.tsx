import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitch from '@/app/components/LanguageSwitch'; 
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Dueño A Dueño - Real Estate Marketplace in Memphis',
  description: 'Dueño A Dueño makes property connections simpler, faster, and more transparent in Memphis. Connect directly without banks or intermediaries.',
};

// --- DICCIONARIO DE CONTENIDO ---
const DICTIONARY = {
  en: {
    nav: { home: "Home", properties: "Properties", about: "About Us", contact: "Contact" },
    hero: {
      title: "ABOUT US",
      subtitle: "Dueño A Dueño is a people-first real estate marketplace in Memphis designed to make property connections simpler, faster, and more transparent."
    },
    intro: "We connect property owners, buyers, and renters directly, bypassing banks, agents, and other unnecessary barriers. We are a Memphis-based real estate marketplace that supports people who want to explore real estate opportunities in Memphis hassle-free.",
    sections: {
      purpose: {
        title: "OUR PURPOSE",
        content: [
            "The traditional method of dealing with property may come across as complex and slow. It is hard for people to move forward who are looking for long approval processes and third-party involvement.",
            "Dueño A Dueño was created to offer a simpler alternative.",
            "We operate as a neutral real estate marketplace, not as a brokerage, lender, or legal service. Our role is to provide the platform; users handle the conversations, decisions, and agreements themselves."
        ]
      },
      whatWeDo: {
        title: "WHAT WE DO (AND WHAT WE DON’T)",
        doTitle: "What We Do:",
        doList: [
            "Discover owner-to-owner real estate opportunities.",
            "Communicate directly with property owners or interested parties.",
            "Explore flexible options such as rentals, lease options, or owner discussions."
        ],
        dontTitle: "What We Don't Do:",
        dontList: [
            "We do not verify property ownership, pricing, or terms.",
            "We do not negotiate deals or represent either side.",
            "We don’t engage in any activity of giving legal, financial, or property-related advice."
        ],
        note: "Information exchange is done by all users, and it is always important to research as an individual before any agreement is reached."
      },
      memphis: {
        title: "BUILT WITH MEMPHIS IN MIND",
        content: "Memphis has a strong community of homeowners, investors, and renters looking for alternatives to traditional real estate paths. Dueño A Dueño was designed with these real needs in mind—direct communication, fewer obstacles, and more flexibility. Although our roots are located within Memphis, our real estate marketing platform is available to those outside this local area. We aim to support genuine connections that feel human, not transactional."
      },
      responsibility: {
        title: "USER RESPONSIBILITY AND TRANSPARENCY",
        content: "Transparency is central to our platform. Because users interact directly, everyone must take responsibility for their decisions.",
        recommendationsTitle: "We strongly recommend:",
        recommendations: [
            "Inspecting properties personally.",
            "Reviewing all agreements carefully.",
            "Consulting licensed professionals when needed."
        ],
        closing: "Dueño A Dueño exists to connect people—not to replace professional guidance."
      },
      vision: {
        title: "OUR VISION",
        content: "Our fundamental belief is that real estate doesn’t have to be mysterious, complex, or intimidating. By removing unnecessary layers and focusing on direct access, Dueño A Dueño aims to empower individuals to move forward with confidence.",
        mission: "Our mission is simple: make real estate connections more open, flexible, and human."
      }
    },
    faq: {
        title: "FREQUENTLY ASKED QUESTIONS",
        items: [
            {
                q: "How can I contact Dueño A Dueño?",
                a: "If you would like to get in touch with us, use the Contact Us form on our website, or call us today at 901-660-4100!"
            },
            {
                q: "Can you help me with a specific property or deal in Memphis?",
                a: "We do not take part in property negotiations, pricing, or agreements. For any questions you may have regarding price, availability, funding, and other property issues, it is best to deal directly with the property owner following the given details."
            },
            {
                q: "Do you verify property listings or users?",
                a: "No. All listings and information are submitted by users. Dueño A Dueño does not verify property ownership, pricing, terms, or user details. We strongly recommend that users conduct their own research and verification before moving forward with any agreement."
            }
        ]
    }
  },
  es: {
    nav: { home: "Inicio", properties: "Propiedades", about: "Nosotros", contact: "Contacto" },
    hero: {
      title: "SOBRE NOSOTROS",
      subtitle: "Dueño A Dueño es un mercado inmobiliario centrado en las personas en Memphis, diseñado para hacer las conexiones inmobiliarias más simples, rápidas y transparentes."
    },
    intro: "Conectamos a propietarios, compradores e inquilinos directamente, evitando bancos, agentes y otras barreras innecesarias. Somos un mercado inmobiliario con sede en Memphis que apoya a las personas que desean explorar oportunidades inmobiliarias en Memphis sin complicaciones.",
    sections: {
      purpose: {
        title: "NUESTRO PROPÓSITO",
        content: [
            "El método tradicional de tratar con propiedades puede parecer complejo y lento. Es difícil avanzar para las personas que buscan evitar largos procesos de aprobación y la participación de terceros.",
            "Dueño A Dueño fue creado para ofrecer una alternativa más simple.",
            "Operamos como un mercado inmobiliario neutral, no como una correduría, prestamista o servicio legal. Nuestro papel es proporcionar la plataforma; los usuarios manejan las conversaciones, decisiones y acuerdos ellos mismos."
        ]
      },
      whatWeDo: {
        title: "LO QUE HACEMOS (Y LO QUE NO)",
        doTitle: "Lo Que Hacemos:",
        doList: [
            "Descubrir oportunidades inmobiliarias de dueño a dueño.",
            "Comunicarse directamente con propietarios o partes interesadas.",
            "Explorar opciones flexibles como alquileres, opciones de arrendamiento o discusiones con propietarios."
        ],
        dontTitle: "Lo Que No Hacemos:",
        dontList: [
            "No verificamos la propiedad del inmueble, precios o términos.",
            "No negociamos tratos ni representamos a ninguna de las partes.",
            "No participamos en ninguna actividad de asesoramiento legal, financiero o relacionado con la propiedad."
        ],
        note: "El intercambio de información lo realizan todos los usuarios, y siempre es importante investigar como individuo antes de llegar a cualquier acuerdo."
      },
      memphis: {
        title: "CONSTRUIDO PENSANDO EN MEMPHIS",
        content: "Memphis tiene una fuerte comunidad de propietarios, inversores e inquilinos que buscan alternativas a los caminos inmobiliarios tradicionales. Dueño A Dueño fue diseñado teniendo en cuenta estas necesidades reales: comunicación directa, menos obstáculos y más flexibilidad. Aunque nuestras raíces se encuentran en Memphis, nuestra plataforma de marketing inmobiliario está disponible para aquellos fuera de esta área local. Nuestro objetivo es apoyar conexiones genuinas que se sientan humanas, no transaccionales."
      },
      responsibility: {
        title: "RESPONSABILIDAD DEL USUARIO Y TRANSPARENCIA",
        content: "La transparencia es fundamental en nuestra plataforma. Debido a que los usuarios interactúan directamente, todos deben asumir la responsabilidad de sus decisiones.",
        recommendationsTitle: "Recomendamos encarecidamente:",
        recommendations: [
            "Inspeccionar las propiedades personalmente.",
            "Revisar todos los acuerdos cuidadosamente.",
            "Consultar a profesionales con licencia cuando sea necesario."
        ],
        closing: "Dueño A Dueño existe para conectar personas, no para reemplazar la orientación profesional."
      },
      vision: {
        title: "NUESTRA VISIÓN",
        content: "Nuestra creencia fundamental es que los bienes raíces no tienen que ser misteriosos, complejos o intimidantes. Al eliminar capas innecesarias y enfocarse en el acceso directo, Dueño A Dueño tiene como objetivo empoderar a las personas para avanzar con confianza.",
        mission: "Nuestra misión es simple: hacer que las conexiones inmobiliarias sean más abiertas, flexibles y humanas."
      }
    },
    faq: {
        title: "PREGUNTAS FRECUENTES",
        items: [
            {
                q: "¿Cómo puedo contactar a Dueño A Dueño?",
                a: "Si desea ponerse en contacto con nosotros, utilice el formulario de Contacto en nuestro sitio web, o llámenos hoy al 901-660-4100."
            },
            {
                q: "¿Pueden ayudarme con una propiedad o trato específico en Memphis?",
                a: "No participamos en negociaciones de propiedades, precios o acuerdos. Para cualquier pregunta que pueda tener sobre precio, disponibilidad, financiamiento y otros temas de propiedad, es mejor tratar directamente con el propietario siguiendo los detalles dados."
            },
            {
                q: "¿Verifican los listados de propiedades o a los usuarios?",
                a: "No. Todos los listados e información son enviados por los usuarios. Dueño A Dueño no verifica la propiedad del inmueble, precios, términos o detalles del usuario. Recomendamos encarecidamente que los usuarios realicen su propia investigación y verificación antes de avanzar con cualquier acuerdo."
            }
        ]
    }
  }
};

export default async function AboutPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'es' ? 'es' : 'en') as 'es' | 'en';
  const t = DICTIONARY[lang];

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      
      {/* --- HEADER --- */}
      <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* --- UBICACIÓN DEL BOTÓN DE IDIOMA --- */}
          <div className="absolute top-25 right-4 sm:right-6 lg:right-8 z-20">
            <div className="scale-75 origin-top-right md:scale-90">
              <LanguageSwitch />
            </div>
          </div>
          {/* ------------------------------------------- */}

          <div className="flex justify-between items-center h-16 md:h-20">
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
                    {/* About Activo (Amarillo y sin enlace) */}
                    <span className="text-[#f8ed1a]">{t.nav.about}</span>
                    <Link href={`/contact-us?lang=${lang}`} className="hover:text-white transition">{t.nav.contact}</Link>
                </nav>
                <Link href="/login" className="bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-3 py-2 md:px-4 md:py-2 rounded-md font-bold text-xs md:text-sm transition-colors uppercase">
                  Login
                </Link>
            </div>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1a1a1a] to-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-[#f8ed1a] uppercase mb-6 tracking-tight">
                {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                {t.hero.subtitle}
            </p>
        </div>
      </section>

      {/* --- INTRO & PURPOSE --- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
        
        {/* Intro */}
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
            <p className="text-lg text-gray-300 leading-relaxed text-center">
                {t.intro}
            </p>
        </div>

        {/* Purpose */}
        <div className="grid md:grid-cols-1 gap-10 items-center">
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase mb-6 border-l-4 border-[#529e14] pl-4">
                    {t.sections.purpose.title}
                </h2>
                <div className="space-y-4 text-gray-400">
                    {t.sections.purpose.content.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* --- WHAT WE DO (DO vs DON'T) --- */}
      <section className="py-16 bg-[#121212] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center text-white uppercase mb-12">
                {t.sections.whatWeDo.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* DO */}
                <div className="bg-[#1a1a1a] p-8 rounded-xl border border-[#529e14] shadow-[0_0_15px_rgba(82,158,20,0.2)]">
                    <h3 className="text-xl font-black text-[#529e14] uppercase mb-6 flex items-center gap-2">
                        <span className="text-2xl">✓</span> {t.sections.whatWeDo.doTitle}
                    </h3>
                    <ul className="space-y-4">
                        {t.sections.whatWeDo.doList.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-300">
                                <span className="text-[#529e14] mt-1">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* DON'T */}
                <div className="bg-[#1a1a1a] p-8 rounded-xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <h3 className="text-xl font-black text-red-500 uppercase mb-6 flex items-center gap-2">
                        <span className="text-2xl">✕</span> {t.sections.whatWeDo.dontTitle}
                    </h3>
                    <ul className="space-y-4">
                         {t.sections.whatWeDo.dontList.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-300">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <p className="mt-8 text-center text-gray-500 text-sm italic max-w-2xl mx-auto">
                {t.sections.whatWeDo.note}
            </p>
        </div>
      </section>

      {/* --- MEMPHIS & RESPONSIBILITY --- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-16">
         {/* Memphis */}
         <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#f8ed1a] uppercase mb-6">
                {t.sections.memphis.title}
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
                {t.sections.memphis.content}
            </p>
         </div>

         {/* Responsibility */}
         <div className="bg-gray-800 p-8 rounded-xl border-l-8 border-[#f8ed1a]">
            <h2 className="text-xl font-black text-white uppercase mb-4">
                {t.sections.responsibility.title}
            </h2>
            <p className="text-gray-300 mb-6">{t.sections.responsibility.content}</p>
            
            <h4 className="font-bold text-[#f8ed1a] uppercase text-sm mb-3">
                {t.sections.responsibility.recommendationsTitle}
            </h4>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6 ml-2">
                {t.sections.responsibility.recommendations.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
            <p className="font-bold text-white border-t border-gray-700 pt-4">
                {t.sections.responsibility.closing}
            </p>
         </div>
      </section>

      {/* --- VISION --- */}
      <section className="py-20 bg-[#f8ed1a] text-[#1a1a1a] px-4">
          <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">{t.sections.vision.title}</h2>
             <p className="text-xl font-medium mb-8 max-w-2xl mx-auto">{t.sections.vision.content}</p>
             <div className="inline-block border-2 border-black px-6 py-4 rounded-lg bg-white/50 backdrop-blur-sm">
                <p className="text-2xl font-black uppercase tracking-tight">
                    "{t.sections.vision.mission}"
                </p>
             </div>
          </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
         <h2 className="text-3xl font-black text-center text-white uppercase mb-12">
            {t.faq.title}
         </h2>
         <div className="space-y-6">
            {t.faq.items.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-[#f8ed1a] mb-3 uppercase">
                        {item.q}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                        {item.a}
                    </p>
                </div>
            ))}
         </div>
      </section>

      {/* --- FOOTER SIMPLIFICADO --- */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>

    </div>
  );
}