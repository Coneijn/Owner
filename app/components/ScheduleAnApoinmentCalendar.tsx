'use client';

import Script from 'next/script';

interface BookingCalendarProps {
  className?: string;
}

export default function BookingCalendar({ className = '' }: BookingCalendarProps) {
  const iframeId = 'xE7JQKuT8CBF4tlGvUDD_1788361738110';
  const iframeSrc = 'https://api.leadconnectorhq.com/widget/booking/xE7JQKuT8CBF4tlGvUDD';

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <iframe
        id={iframeId}
        src={iframeSrc}
        allow="payment"
        scrolling="no"
        style={{
          width: '100%',
          border: 'none',
          overflow: 'hidden',
          minHeight: '650px', // Altura inicial recomendada para evitar parpadeos visuales (CLS)
        }}
      />
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="lazyOnload"
      />
    </div>
  );
}