'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitch from './LanguageSwitch';
import MapFloatingButtons from '@/app/map/ui/MapFloatingButtons';

const HEADER_TEXTS = {
  es: { home: "Inicio", properties: "Propiedades", sellers: "Listar Mi Casa", about: "Nosotros", blog: "Blog", caseStudies: "Casos de Estudio", contact: "Contacto", login: "Login", apply: "Aplicar", schedule: "Agendar" },
  en: { home: "Home", properties: "Properties", sellers: "List My Home", about: "About Us", blog: "Blog", caseStudies: "Case Studies", contact: "Contact", login: "Login", apply: "Apply", schedule: "Schedule" }
};

// Componente para el efecto Flip de las ranitas
const FlipButtonContent = ({ imgSrc, text, bgColor }: { imgSrc: string, text: string, bgColor: string }) => {
  const faceCommonClasses = `absolute inset-0 w-full h-full flex items-center justify-center rounded-full [backface-visibility:hidden] shadow-md`;
  return (
    <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
      <div className={`${faceCommonClasses} bg-transparent overflow-hidden`}>
         <Image src={imgSrc} alt={text} fill sizes="48px" className="object-cover" priority />
      </div>
      <div className={`${faceCommonClasses} ${bgColor} [transform:rotateY(180deg)]`}>
        <span className="text-[9px] font-black uppercase text-center leading-tight px-1 tracking-wider text-black">
          {text}
        </span>
      </div>
    </div>
  );
};

interface HeaderProps {
  lang: 'es' | 'en';
  activePage?: string;
}

export default function HomeHeader({ lang, activePage }: HeaderProps) {
  const t = HEADER_TEXTS[lang];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (page: string) => {
    return activePage === page 
      ? "text-[#f8ed1a] cursor-default font-black" 
      : "text-gray-300 hover:text-white transition font-medium";
  };

  return (
    <>
    <header className="bg-[#1a1a1a] shadow-lg sticky top-0 z-[60] border-b border-gray-800 h-16 md:h-20">
        <div className="max-w-8xl mx-auto px-4 h-full relative flex justify-between items-center">
            <Link href={`/?lang=${lang}`} className="flex items-center gap-2 z-50">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
                 <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-sm md:text-xl font-black uppercase text-white tracking-tighter">
                DUEÑO A <span className="text-[#f8ed1a]">DUEÑO</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
                <nav className="hidden lg:flex gap-4 xl:gap-6 text-sm items-center">
                    
                    {/* Botones de Ranitas con Flip al principio de los links */}
                    <div className="flex gap-3 mr-2">
                        <Link href={`/apply?lang=${lang}`} className="w-10 h-10 xl:w-12 xl:h-12 rounded-full group perspective-[1000px] hover:scale-105 transition-all cursor-pointer" title={t.apply}>
                            <FlipButtonContent imgSrc="/frog-apply.png" text={t.apply} bgColor="bg-white" />
                        </Link>
                        <Link href={`/agendar-cita?lang=${lang}`} className="w-10 h-10 xl:w-12 xl:h-12 rounded-full group perspective-[1000px] hover:scale-105 transition-all cursor-pointer" title={t.schedule}>
                            <FlipButtonContent imgSrc="/frog-show4.png" text={t.schedule} bgColor="bg-[#FFEC00]" />
                        </Link>
                    </div>

                    <Link href={`/?lang=${lang}`} className={getLinkClass('home')}>{t.home}</Link>
                    <Link href={`/properties?lang=${lang}`} className={getLinkClass('properties')}>{t.properties}</Link>
                    <Link href={`/sellers?lang=${lang}`} className={getLinkClass('sellers')}>{t.sellers}</Link>
                    <Link href={`/about-us?lang=${lang}`} className={getLinkClass('about')}>{t.about}</Link>
                    <Link href={`/blog?lang=${lang}`} className={getLinkClass('blog')}>{t.blog}</Link> 
                    <Link href={`/case-studies?lang=${lang}`} className={getLinkClass('case-studies')}>{t.caseStudies}</Link>
                    <Link href={`/contact-us?lang=${lang}`} className={getLinkClass('contact')}>{t.contact}</Link>
                </nav>

                <Link href="/login" className="hidden lg:block bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-4 py-2 rounded-md font-bold text-sm uppercase ml-2">
                  {t.login}
                </Link>

                <div className="lg:hidden scale-90 origin-right">
                    <LanguageSwitch />
                </div>

                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden text-white p-2 focus:outline-none"
                >
                    <span className="text-2xl">☰</span>
                </button>
            </div>
            
            <div className="hidden lg:block absolute top-1/2 translate-y-14 right-4 z-[70]">
                 <div className="scale-90"><LanguageSwitch /></div>
            </div>
        </div>
      </header>

      {/* --- MENÚ MÓVIL --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center gap-6 transition-all overflow-y-auto py-10">
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 text-white text-4xl"
            >
                &times;
            </button>
            
            <nav className="flex flex-col items-center gap-6 text-xl">
                <Link href={`/?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('home')}>{t.home}</Link>
                <Link href={`/properties?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('properties')}>{t.properties}</Link>
                <Link href={`/sellers?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('sellers')}>{t.sellers}</Link>
                <Link href={`/about-us?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('about')}>{t.about}</Link>
                <Link href={`/blog?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('blog')}>{t.blog}</Link>
                <Link href={`/case-studies?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('case-studies')}>{t.caseStudies}</Link>
                <Link href={`/contact-us?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('contact')}>{t.contact}</Link>
                
                {/* Botones móviles para el Home */}
                <div className="flex flex-col gap-4 w-full mt-2">
                  <Link href={`/apply?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className="border-2 border-[#f8ed1a] text-[#f8ed1a] px-8 py-3 rounded-full font-black text-lg uppercase text-center">
                    {t.apply}
                  </Link>
                  <Link href={`/agendar-cita?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className="bg-[#f8ed1a] text-black px-8 py-3 rounded-full font-black text-lg uppercase shadow-[0_0_20px_rgba(248,237,26,0.4)] text-center">
                    {t.schedule}
                  </Link>
                </div>

                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold text-lg uppercase mt-2">
                    {t.login}
                </Link>
            </nav>
        </div>
      )}
    </>
  );
}