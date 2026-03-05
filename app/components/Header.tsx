'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitch from './LanguageSwitch';
import MapFloatingButtons from '@/app/map/ui/MapFloatingButtons';

// 1. Añadimos las traducciones para "Casos de Estudio"
const HEADER_TEXTS = {
  es: { home: "Inicio", properties: "Propiedades", about: "Nosotros", blog: "Blog", caseStudies: "Casos de Estudio", contact: "Contacto", login: "Login" },
  en: { home: "Home", properties: "Properties", about: "About Us", blog: "Blog", caseStudies: "Case Studies", contact: "Contact", login: "Login" }
};

interface HeaderProps {
  lang: 'es' | 'en';
  activePage?: string;
}

export default function Header({ lang, activePage }: HeaderProps) {
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
          
            {/* 1. LOGO */}
            <Link href={`/?lang=${lang}`} className="flex items-center gap-2 z-50">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
                 <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-sm md:text-xl font-black uppercase text-white tracking-tighter">
                DUEÑO A <span className="text-[#f8ed1a]">DUEÑO</span>
              </span>
            </Link>

            {/* 2. ACTIONS GROUP (Desktop: Nav + Login | Mobile: Lang + Burger) */}
            <div className="flex items-center gap-4">
                
                {/* Desktop Nav */}
                <nav className="hidden lg:flex gap-6 text-sm">
                    <Link href={`/?lang=${lang}`} className={getLinkClass('home')}>{t.home}</Link>
                    <Link href={`/properties?lang=${lang}`} className={getLinkClass('properties')}>{t.properties}</Link>
                    <Link href={`/about-us?lang=${lang}`} className={getLinkClass('about')}>{t.about}</Link>
                    <Link href={`/blog?lang=${lang}`} className={getLinkClass('blog')}>{t.blog}</Link> 
                    {/* 2. Añadimos el enlace para escritorio */}
                    <Link href={`/case-studies?lang=${lang}`} className={getLinkClass('case-studies')}>{t.caseStudies}</Link>
                    <Link href={`/contact-us?lang=${lang}`} className={getLinkClass('contact')}>{t.contact}</Link>
                </nav>

                {/* Desktop Login */}
                <Link href="/login" className="hidden lg:block bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300 px-4 py-2 rounded-md font-bold text-sm uppercase">
                  {t.login}
                </Link>

                {/* Mobile: Language Switch (Mantener visible por petición cliente) */}
                <div className="lg:hidden scale-90 origin-right">
                    <LanguageSwitch />
                </div>

                {/* Mobile: Hamburger Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden text-white p-2 focus:outline-none"
                >
                    <span className="text-2xl">☰</span>
                </button>
            </div>

            {/* Desktop: Language Switch (Posición original ajustada) */}
            <div className="hidden lg:block absolute top-1/2 translate-y-14 right-4">
                 <div className="scale-90"><LanguageSwitch /></div>
            </div>
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center gap-8 transition-all">
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 text-white text-4xl"
            >
                &times;
            </button>
            
      <MapFloatingButtons lang={lang} />
            <nav className="flex flex-col items-center gap-6 text-xl">
                <Link href={`/?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('home')}>{t.home}</Link>
                <Link href={`/properties?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('properties')}>{t.properties}</Link>
                <Link href={`/about-us?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('about')}>{t.about}</Link>
                <Link href={`/blog?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('blog')}>{t.blog}</Link>
                {/* 3. Añadimos el enlace para móvil */}
                <Link href={`/case-studies?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('case-studies')}>{t.caseStudies}</Link>
                <Link href={`/contact-us?lang=${lang}`} onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('contact')}>{t.contact}</Link>
            </nav>

            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#f8ed1a] text-black px-8 py-3 rounded-full font-black text-lg uppercase shadow-[0_0_20px_rgba(248,237,26,0.4)]">
                {t.login}
            </Link>
        </div>
      )}
    </>
  );
}