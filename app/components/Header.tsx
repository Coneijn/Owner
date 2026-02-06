// app/components/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitch from './LanguageSwitch';

// Diccionario interno solo para el Header
// Así no tienes que pasarlo desde cada página
const HEADER_TEXTS = {
  es: {
    home: "Inicio",
    properties: "Propiedades",
    about: "Nosotros",
    blog: "Blog",
    contact: "Contacto",
    login: "Login"
  },
  en: {
    home: "Home",
    properties: "Properties",
    about: "About Us",
    blog: "Blog",
    contact: "Contact",
    login: "Login"
  }
};

interface HeaderProps {
  lang: 'es' | 'en';
  activePage?: 'home' | 'properties' | 'about' | 'blog' | 'contact';
}

export default function Header({ lang, activePage }: HeaderProps) {
  const t = HEADER_TEXTS[lang];

  // Helper para decidir si el link es el activo o no
  const getLinkClass = (page: string) => {
    return activePage === page 
      ? "text-[#f8ed1a] cursor-default" // Estilo Activo (Amarillo)
      : "hover:text-white transition";  // Estilo Inactivo (Gris/Blanco)
  };

  return (
    <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* --- UBICACIÓN DEL BOTÓN DE IDIOMA --- */}
          <div className="absolute top-25 right-4 sm:right-6 lg:right-8 z-20">
            <div className="scale-75 origin-top-right md:scale-90">
              <LanguageSwitch />
            </div>
          </div>

          <div className="flex justify-between items-center h-16 md:h-20">
            {/* LOGO */}
            <Link href={`/?lang=${lang}`} className="flex items-center gap-2">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
                 <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-sm md:text-xl font-black uppercase text-white">
                DUEÑO A <span className="text-[#f8ed1a]">DUEÑO</span>
              </span>
            </Link>

            {/* NAV LINKS */}
            <div className="flex gap-4 items-center">
                <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-400">
                    <Link href={`/?lang=${lang}`} className={getLinkClass('home')}>
                        {t.home}
                    </Link>
                    <Link href={`/properties?lang=${lang}`} className={getLinkClass('properties')}>
                        {t.properties}
                    </Link>
                    <Link href={`/about-us?lang=${lang}`} className={getLinkClass('about')}>
                        {t.about}
                    </Link>
                    {/* Nuevo enlace al Blog 
                    <Link href={`/blog?lang=${lang}`} className={getLinkClass('blog')}>
                        {t.blog}
                    </Link> */}
                    <Link href={`/contact-us?lang=${lang}`} className={getLinkClass('contact')}>
                        {t.contact}
                    </Link>
                </nav>
                <Link href="/login" className="bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-3 py-2 md:px-4 md:py-2 rounded-md font-bold text-xs md:text-sm transition-colors uppercase">
                  {t.login}
                </Link>
            </div>
          </div>
        </div>
      </header>
  );
}