
'use client';

import Link from 'next/link';


const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/bookings/scheduleanappointmentcallwithus-230ad544-8f6f-4125-9d14-f1b202f0becc-7fdb3832-39a9-4c80-a146-60233fb444a1-aaa07f1f-456b-4ccc-81e4-adb0ad437aa3-0b2d0529-cb48-461f-b8b5-712b398e91eb-fcbf65a8-70d2-4009-b786-ac4166822f0b-0f63997e-5577-46ae-9f21-00d7deb09698-e6c21248-3365-4355-9454-17fdbd70ec1e-8b95828a-650c-41a7-9b5b-453855dce734-8dda7b22-1142-4021-8dfc-111b3ef84155-f97c6afe-ae0a-48f4-a6cb-868f7ec9020c-5c4b1d30-8e32-4a3d-9142-617df2faa33d-15d6fb8b-f278-4503-98e4-f435ca7bb65e-1cb0ec42-d374-4a1a-b923-59c59dcc4791-c04f60e7-15a7-4cfc-a977-30d02f1c83fe-9e2a0269-9b69-4caa-95c7-327b47eef86a-ffac1d68-518e-4dc2-9bf7-90a8acd0b85d-bb726c61-15c6-4b11-b190-55d7c217c1a3";

const TEXTS = {
  es: {
    call: "Llamar",
    apply: "Aplicar",
    tour: "Agendar",
  },
  en: {
    call: "Call Now",
    apply: "Apply",
    tour: "Schedule",
  }
};

export default function MapFloatingButtons({ lang }: { lang: 'es' | 'en' }) {
  const t = TEXTS[lang];

  
  const btnClass = "flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 border-2 border-[#1a1a1a]";

  return (
    
    <div className="fixed bottom-28 right-4 z-[1000] flex flex-col gap-3">
      
      {/* 1. AGENDAR RECORRIDO */}
      <a
        href={CALENDAR_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnClass} bg-[#529e14] text-white hover:bg-green-700`}
        title={t.tour}
      >
        <span className="text-xl">📅</span>
        <span className="text-[8px] font-bold uppercase mt-[-2px]">{t.tour}</span>
      </a>

      {/* 2. APLICAR */}
      <Link
        href={`/apply?lang=${lang}`}
        className={`${btnClass} bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-300`}
        title={t.apply}
      >
        <span className="text-xl">📝</span>
        <span className="text-[8px] font-bold uppercase mt-[-2px]">{t.apply}</span>
      </Link>

      {/* 3. LLAMAR */}
      <a
        href="tel:9016604100"
        className={`${btnClass} bg-white text-[#1a1a1a] hover:bg-gray-100`}
        title={t.call}
      >
        <span className="text-xl">📞</span>
        <span className="text-[8px] font-bold uppercase mt-[-2px]">{t.call}</span>
      </a>

    </div>
  );
}