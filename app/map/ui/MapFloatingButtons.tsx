'use client';

import Link from 'next/link';
import Image from 'next/image';

const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/bookings/scheduleanappointmentcallwithus-230ad544-8f6f-4125-9d14-f1b202f0becc-7fdb3832-39a9-4c80-a146-60233fb444a1-aaa07f1f-456b-4ccc-81e4-adb0ad437aa3-0b2d0529-cb48-461f-b8b5-712b398e91eb-fcbf65a8-70d2-4009-b786-ac4166822f0b-0f63997e-5577-46ae-9f21-00d7deb09698-e6c21248-3365-4355-9454-17fdbd70ec1e-8b95828a-650c-41a7-9b5b-453855dce734-8dda7b22-1142-4021-8dfc-111b3ef84155-f97c6afe-ae0a-48f4-a6cb-868f7ec9020c-5c4b1d30-8e32-4a3d-9142-617df2faa33d-15d6fb8b-f278-4503-98e4-f435ca7bb65e-1cb0ec42-d374-4a1a-b923-59c59dcc4791-c04f60e7-15a7-4cfc-a977-30d02f1c83fe-9e2a0269-9b69-4caa-95c7-327b47eef86a-ffac1d68-518e-4dc2-9bf7-90a8acd0b85d-bb726c61-15c6-4b11-b190-55d7c217c1a3";

const TEXTS = {
  es: { call: "WhatsApp", apply: "Aplicar", tour: "Agendar" },
  en: { call: "WhatsApp", apply: "Apply", tour: "Schedule" }
};

const FlipButtonContent = ({ imgSrc, text, bgColor }: { imgSrc: string, text: string, bgColor: string }) => {
  const faceCommonClasses = `absolute inset-0 w-full h-full flex items-center justify-center rounded-full [backface-visibility:hidden] shadow-xl`;

  return (
    <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
      <div className={`${faceCommonClasses} bg-transparent overflow-hidden`}>
         <Image 
           src={imgSrc} 
           alt={text} 
           fill 
           sizes="(max-width: 70px) 100vw"
           className="object-cover"
           priority
         />
      </div>
      <div className={`${faceCommonClasses} ${bgColor} [transform:rotateY(180deg)]`}>
        <span className="text-[10px] font-black uppercase text-center leading-tight px-1 tracking-wider">
          {text}
        </span>
      </div>
    </div>
  );
};

export default function MapFloatingButtons({ lang }: { lang: 'es' | 'en' }) {
  const t = TEXTS[lang];
  // Cambiamos "block" por "hidden lg:block" para que las ranitas no salgan en celular
  const btnContainerClass = "hidden lg:block w-17 h-17 rounded-full group perspective-[1000px] hover:scale-105 transition-all z-[1000] cursor-pointer";

  // Definición del mensaje y URL para WhatsApp
  const waMessage = lang === 'en' 
    ? "Hi, I'm interested in the property: the map page" 
    : "Hola, me interesa la propiedad: la página del mapa";
  const waUrl = `https://wa.me/19016604115?text=${encodeURIComponent(waMessage)}`;
  return (
  
  <div className="fixed top-[76px] right-4 lg:top-[88px] lg:right-auto lg:left-2/3 lg:-translate-x-1/2 flex gap-3 items-center z-[1000]">      
      
      {/* 3. WhatsApp Clásico (Solo móvil) */}
      <a 
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 shrink-0 bg-[#25D366] rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform lg:hidden"
        title={t.call}
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
        <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
      
      {/* 1. AGENDAR RECORRIDO */}
      <a href={CALENDAR_LINK} target="_blank" rel="noopener noreferrer" className={btnContainerClass} title={t.tour}>
        <FlipButtonContent imgSrc="/frog-show.png" text={t.tour} bgColor="bg-[#FFEC00] text-[#1a1a1a]" />
      </a>

      {/* 2. APLICAR */}
      <Link href={`/apply?lang=${lang}`} className={btnContainerClass} title={t.apply}>
        <FlipButtonContent imgSrc="/frog-apply.png" text={t.apply} bgColor="bg-white text-[#1a1a1a]" />
      </Link>


    </div>
  );
}