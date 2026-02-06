import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import Header from '@/app/components/Header';

// --- METADATA (SEO) ---
export const metadata: Metadata = {
  title: 'Owner to Dueño | Real Estate Marketplace in Memphis - No Banks Needed',
  description: 'Bank said no? Owner to Dueño is a real estate marketplace in Memphis for owner-financed homes and cash deals. Skip the bank and buy direct. Browse listings today!',
  keywords: ['real estate marketplace in Memphis', 'real estate marketplace', 'owner financing memphis', 'dueño a dueño'],
};

// --- DICCIONARIO DE CONTENIDO ---
const DICTIONARY = {
  en: {
    hero: {
      title: "ABOUT US",
      subtitle: "YOUR OWN HOME, NO BANKS, NO HASSLE"
    },
    intro: {
        p1: "Welcome to Owner To Dueño. We aren't a traditional real estate agency or a bank; instead, we are a real estate marketplace in Memphis that helps people connect directly about properties. Whether you are seeking to sell your home for cash, locate a rental property, or invest in a new venture, we aim to facilitate these transactions faster, more easily, and hassle-free.",
        p2: "Trust our process; we provide direct owner-to-owner financing. See the available homes in Memphis.",
        highlight: "When bank said No, we say Yes."
    },
    sections: {
      whyStarted: {
        title: "WHY WE STARTED THIS",
        content: [
            "We built Owner To Dueño to put the power back into the hands of the Memphis community. Our platform makes it easy to list your property or browse available homes, complete with estimated monthly payment features so you know exactly where you stand.",
            "With more than a decade of experience assisting families with owner-to-owner real estate, we understand how to cut through the noise. By eliminating unnecessary hurdles, we empower property owners and seekers to communicate with each other and get the ball rolling."
        ]
      },
      role: {
        title: "OUR ROLE: A PLATFORM FOR EVERYONE",
        content: "It is important to understand that we are a technology platform, not a brokerage or a lender. We don't want to get in the middle of your deals. We make it easy to buy, sell, or rent properties directly from the owner. No middlemen. No complicated processes. Just straightforward communication between buyers/renters and property owners.",
        mission: "Our mission is simple: make real estate connections more open, flexible, and human."
      },
      provides: {
        title: "WHAT OUR PLATFORM PROVIDES",
        intro: "Buying a home should be exciting, but the paperwork and bank rules often make it feel impossible. We built this platform to change that. Here is exactly what we offer:",
        items: [
            {
                title: "A way to buy without the bank:",
                desc: "Our platform focuses on \"Dueño a Dueño\" (Owner-to-Owner) sales. This means you can find a home and work out the financing directly with the owner, skipping the long wait times and the \"no\" from big banks."
            },
            {
                title: "A simple, honest list of homes:",
                desc: "Our sales catalog shows you exactly what’s available in the Memphis area right now. You get clear photos, the real address, and the basic details like bedrooms and bathrooms without having to hunt for them."
            },
            {
                title: "FILTER SEARCH:",
                desc: "You can use our filters to narrow things down by Zip Code or your price range. If you need three bedrooms and two bathrooms to accommodate your family, you can use our filters to find only those houses. It’s all about finding the right fit, and fast.",
                hasImage: true 
            }
        ]
      },
      blogCta: {
        title: "STAY INFORMED WITH OUR BLOG",
        text: "Discover the latest real estate news, tips for buyers and sellers, and market updates in Memphis.",
        btn: "VISIT OUR BLOG"
      }
    },
    faq: {
        title: "FREQUENTLY ASKED QUESTIONS",
        items: [
            {
                q: "How can I contact Owner To Dueno?",
                a: "If you would like to get in touch with us, use the Contact Us form on our website, or call us today at 901-660-4100!"
            },
            {
                q: "Can you help me with a specific property or deal in Memphis?",
                a: "We do not take part in property negotiations, pricing, or agreements. For any questions you may have regarding price, availability, funding, and other property issues, it is best to deal directly with the property owner following the given details."
            },
            {
                q: "Do you verify property listings or users?",
                a: "No. All listings and information are submitted by users. Owner To Dueno does not verify property ownership, pricing, terms, or user details. We strongly recommend that users conduct their own research and verification before moving forward with any agreement."
            }
        ]
    }
  },
  es: {
    hero: {
      title: "SOBRE NOSOTROS",
      subtitle: "TU PROPIA CASA, SIN BANCOS, SIN COMPLICACIONES"
    },
    intro: {
        p1: "Bienvenido a Owner To Dueño. No somos una agencia inmobiliaria tradicional ni un banco; somos un mercado inmobiliario en Memphis que ayuda a las personas a conectarse directamente por propiedades. Ya sea que busques vender tu casa por efectivo, encontrar una propiedad en alquiler o invertir en una nueva empresa, nuestro objetivo es facilitar estas transacciones de manera más rápida, fácil y sin complicaciones.",
        p2: "Confía en nuestro proceso; ofrecemos financiamiento directo de dueño a dueño. Mira las casas disponibles en Memphis.",
        highlight: "Cuando el banco dice No, nosotros decimos Sí."
    },
    sections: {
      whyStarted: {
        title: "POR QUÉ COMENZAMOS ESTO",
        content: [
            "Creamos Owner To Dueño para devolver el poder a las manos de la comunidad de Memphis. Nuestra plataforma facilita listar tu propiedad o buscar casas disponibles, con funciones de pago mensual estimado para que sepas exactamente dónde estás parado.",
            "Con más de una década de experiencia ayudando a familias con bienes raíces de dueño a dueño, entendemos cómo ir al grano. Al eliminar obstáculos innecesarios, empoderamos a los propietarios y buscadores para que se comuniquen entre sí y pongan las cosas en marcha."
        ]
      },
      role: {
        title: "NUESTRO ROL: UNA PLATAFORMA PARA TODOS",
        content: "Es importante entender que somos una plataforma tecnológica, no una agencia de corretaje ni un prestamista. No queremos interponernos en tus tratos. Hacemos que sea fácil comprar, vender o alquilar propiedades directamente del dueño. Sin intermediarios. Sin procesos complicados. Solo comunicación directa entre compradores/inquilinos y propietarios.",
        mission: "Nuestra misión es simple: hacer que las conexiones inmobiliarias sean más abiertas, flexibles y humanas."
      },
      provides: {
        title: "LO QUE OFRECE NUESTRA PLATAFORMA",
        intro: "Comprar una casa debería ser emocionante, pero el papeleo y las reglas bancarias a menudo lo hacen sentir imposible. Construimos esta plataforma para cambiar eso. Esto es exactamente lo que ofrecemos:",
        items: [
            {
                title: "Una forma de comprar sin el banco:",
                desc: "Nuestra plataforma se enfoca en ventas \"Dueño a Dueño\". Esto significa que puedes encontrar una casa y acordar el financiamiento directamente con el propietario, saltándote los largos tiempos de espera y el \"no\" de los grandes bancos."
            },
            {
                title: "Una lista simple y honesta de casas:",
                desc: "Nuestro catálogo de ventas te muestra exactamente lo que está disponible en el área de Memphis ahora mismo. Obtienes fotos claras, la dirección real y los detalles básicos como dormitorios y baños sin tener que buscarlos."
            },
            {
                title: "BÚSQUEDA CON FILTROS:",
                desc: "Puedes usar nuestros filtros para reducir las opciones por código postal o tu rango de precio. Si necesitas tres dormitorios y dos baños para acomodar a tu familia, puedes usar nuestros filtros para encontrar solo esas casas. Se trata de encontrar la opción correcta, y rápido.",
                hasImage: true
            }
        ]
      },
      blogCta: {
        title: "MANTENTE INFORMADO CON NUESTRO BLOG",
        text: "Descubre las últimas noticias inmobiliarias, consejos para compradores y vendedores, y actualizaciones del mercado en Memphis.",
        btn: "VISITAR EL BLOG"
      }
    },
    faq: {
        title: "PREGUNTAS FRECUENTES",
        items: [
            {
                q: "¿Cómo puedo contactar a Owner To Dueno?",
                a: "Si desea ponerse en contacto con nosotros, utilice el formulario de Contacto en nuestro sitio web, o llámenos hoy al 901-660-4100."
            },
            {
                q: "¿Pueden ayudarme con una propiedad o trato específico en Memphis?",
                a: "No participamos en negociaciones de propiedades, precios o acuerdos. Para cualquier pregunta que pueda tener sobre precio, disponibilidad, financiamiento y otros temas de propiedad, es mejor tratar directamente con el propietario siguiendo los detalles dados."
            },
            {
                q: "¿Verifican los listados de propiedades o a los usuarios?",
                a: "No. Todos los listados e información son enviados por los usuarios. Owner To Dueno no verifica la propiedad del inmueble, precios, términos o detalles del usuario. Recomendamos encarecidamente que los usuarios realicen su propia investigación y verificación antes de avanzar con cualquier acuerdo."
            }
        ]
    }
  }
};

export default async function HomePage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'es' ? 'es' : 'en') as 'es' | 'en';
  const t = DICTIONARY[lang];

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      
      {/* --- HEADER IMPLEMENTADO --- */}
      {/* CAMBIO: activePage="about" para reflejar que el contenido es "Sobre Nosotros" */}
      <Header lang={lang} activePage="about" />

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1a1a1a] to-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-[#f8ed1a] uppercase tracking-tight">
                {t.hero.title}
            </h1>
            <h2 className="text-xl md:text-3xl text-white font-black uppercase leading-tight tracking-wide">
                {t.hero.subtitle}
            </h2>
        </div>
      </section>

      {/* --- INTRO --- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-8">
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {t.intro.p1}
            </p>
            <p className="text-lg text-gray-300 leading-relaxed font-medium">
                {t.intro.p2}
            </p>
            <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-2xl md:text-3xl font-black text-[#529e14] uppercase tracking-tight">
                    {t.intro.highlight}
                </p>
            </div>
        </div>
      </section>

      {/* --- WHY STARTED & ROLE (Grid) --- */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
            
            {/* Why Started */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-white uppercase border-l-4 border-[#f8ed1a] pl-4">
                    {t.sections.whyStarted.title}
                </h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                    {t.sections.whyStarted.content.map((p, idx) => (
                        <p key={idx}>{p}</p>
                    ))}
                </div>
            </div>

            {/* Role */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-white uppercase border-l-4 border-[#529e14] pl-4">
                    {t.sections.role.title}
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    {t.sections.role.content}
                </p>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-[#f8ed1a] font-bold uppercase text-center italic">
                        "{t.sections.role.mission}"
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- WHAT WE PROVIDE --- */}
      <section className="py-16 bg-[#121212] px-4 sm:px-6 lg:px-8 mt-8 border-y border-gray-800">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white uppercase mb-4">{t.sections.provides.title}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{t.sections.provides.intro}</p>
            </div>

            <div className="space-y-12">
                {t.sections.provides.items.map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`flex flex-col ${item.hasImage ? 'md:flex-row md:items-stretch gap-8' : 'items-start'} bg-[#1a1a1a] p-8 rounded-xl border border-gray-700 hover:border-[#f8ed1a] transition-colors shadow-lg`}
                    >
                        {/* Columna de Texto */}
                        <div className={item.hasImage ? 'flex-1 flex flex-col justify-center' : ''}>
                            <h3 className="text-xl md:text-2xl font-black text-[#529e14] uppercase mb-4">
                                {item.title}
                            </h3>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                {item.desc}
                            </p>
                        </div>
                        
                        {/* IMAGEN FILTER SEARCH (Columna Derecha) */}
                        {item.hasImage && (
                            <div className="w-full md:w-auto flex justify-center md:justify-end mt-4 md:mt-0">
                                <Image 
                                    src="/filtersearch.png" 
                                    alt="Filter Search Preview" 
                                    width={314} 
                                    height={570}
                                    className="rounded-lg border-2 border-gray-700 shadow-2xl object-contain max-w-full h-auto"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- BLOG CALL TO ACTION --- */}
      <section className="py-16 px-4 bg-[#1a1a1a] text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 p-10 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden group hover:border-[#f8ed1a] transition-colors">
            {/* Decoración Superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#529e14] to-[#f8ed1a]"></div>
            
            {/* Decoración de fondo */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#f8ed1a] opacity-5 rounded-full blur-3xl pointer-events-none group-hover:opacity-10 transition-opacity"></div>

            <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-4 tracking-tight relative z-10">
                {t.sections.blogCta.title}
            </h2>
            <p className="text-gray-300 mb-8 text-lg md:text-xl max-w-2xl mx-auto relative z-10">
                {t.sections.blogCta.text}
            </p>
            
            <Link 
                href={`/blog?lang=${lang}`}
                className="inline-block bg-[#f8ed1a] text-[#1a1a1a] font-black uppercase px-8 py-4 rounded-lg hover:bg-white hover:scale-105 transition-all shadow-lg relative z-10"
            >
                {t.sections.blogCta.btn}
            </Link>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
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