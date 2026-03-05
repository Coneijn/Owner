'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function ChatWidget() {
  const pathname = usePathname();

  // Ocultar en las rutas que empiecen por /admin o /sellerDashboard
  const isHiddenRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/sellerDashboard');

  if (isHiddenRoute) return null;

  return (
    <Script
      src="https://widgets.leadconnectorhq.com/loader.js"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id="6982bc477cd1e65428cc69fe"
      strategy="afterInteractive"
    />
  );
}