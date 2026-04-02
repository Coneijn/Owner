'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface WhatsAppButtonProps {
  lang: string;
  propertyName: string;
  position?: 'left' | 'right';
}

const DICTIONARY: Record<string, { label: string; template: string }> = {
  en: { label: 'Contact us', template: "Hi, I'm interested in the property: " },
  es: { label: 'Contáctanos', template: 'Hola, me interesa la propiedad: ' }
};

export default function WhatsAppButton({ 
  lang, 
  propertyName, 
  position = 'right' 
}: WhatsAppButtonProps) {
  const [isLabelVisible, setIsLabelVisible] = useState(true);

  const content = DICTIONARY[lang] || DICTIONARY.en;
  
  const waUrl = useMemo(() => {
    const message = `${content.template}${propertyName}`;
    return `https://wa.me/19016604115?text=${encodeURIComponent(message)}`;
  }, [propertyName, content]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLabelVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // LÓGICA DE POSICIONAMIENTO
  const isRight = position === 'right';

  // Ajustamos el bottom: 
  // En móvil ambos quedan en 100px.
  // En escritorio (md:), si es 'right' baja a 100px, si es 'left' sube a 195px.
  const verticalClass = isRight 
    ? 'bottom-[100px] md:bottom-[100px]' 
    : 'bottom-[100px] md:bottom-[210px]';

  const horizontalClass = isRight 
    ? 'right-4 md:right-6' 
    : 'left-4 lg:left-[450px] flex-row-reverse';
    
  const translateClass = isRight ? 'translate-x-4' : '-translate-x-4';

  return (
    <div className={`fixed ${verticalClass} ${horizontalClass} z-[55] flex items-center gap-3 group transition-all duration-300`}>
      
      <span className={`
        bg-white/90 backdrop-blur text-[#1a1a1a] px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide 
        shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-gray-200 pointer-events-none hidden sm:block
        transition-all duration-700 ease-in-out
        ${isLabelVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${translateClass}`} 
        group-hover:opacity-100 group-hover:translate-x-0
      `}>
        {content.label}
      </span>
      
      <Link 
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={content.label}
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-transform"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
        <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </Link>
    </div>
  );
}