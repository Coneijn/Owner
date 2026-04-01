'use client';

import Script from 'next/script';

interface GHLCalendarEmbedProps {
  lang: 'es' | 'en';
}

export default function GHLCalendarEmbed({ lang }: GHLCalendarEmbedProps) {
  const calendarIdES = "tN62aj4gxMewhc2OFfD8"; 
  const calendarIdEN = "tN62aj4gxMewhc2OFfD8"; 

  const currentCalendarId = lang === 'en' ? calendarIdEN : calendarIdES;
  const iframeSrc = `https://api.leadconnectorhq.com/widget/booking/${currentCalendarId}`;

  return (
    // CAMBIO AQUÍ: Quitamos bg-white y pusimos bg-transparent. 
    // Mantenemos la sombra oscura y el borde para que se vea como un widget premium.
    <div className="w-full max-w-4xl mx-auto bg-transparent rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-[#1a1a1a] p-2 md:p-6 overflow-hidden">
      <iframe 
        key={currentCalendarId} 
        src={iframeSrc} 
        style={{ width: '100%', border: 'none', minHeight: '700px', overflow: 'hidden' }} 
        scrolling="no" 
        id={`${currentCalendarId}_1775056101479`}
      />
      
      <Script 
        src="https://api.leadconnectorhq.com/js/form_embed.js" 
        strategy="lazyOnload" 
      />
    </div>
  );
}