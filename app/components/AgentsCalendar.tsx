'use client';

import Script from 'next/script';

interface AgentsCalendarProps {
  className?: string;
}

export default function AgentsCalendar({ className = '' }: AgentsCalendarProps) {
  const iframeId = 'krp8ck9oiW0Z7oZZYlnL_1788365897509';
  const iframeSrc = 'https://api.leadconnectorhq.com/widget/booking/krp8ck9oiW0Z7oZZYlnL';

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
          minHeight: '650px',
        }}
      />
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="lazyOnload"
      />
    </div>
  );
}