import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://ownertodueno.com";

export const metadata: Metadata = {
  // ... (tu metadata existente se mantiene igual)
  metadataBase: new URL(baseUrl), 
  title: {
    default: "Dueño a Dueño | Compra y Venta Directa en Memphis",
    template: "%s | Dueño a Dueño", 
  },
  description: "Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.",
  robots: {
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/', 
    languages: {
      'es': '/',           
      'en': '/?lang=en',   
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* --- 1. META PIXEL SCRIPT --- */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1252009270175766');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* --- 2. GOOGLE ADS TAG --- */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=AW-17843139208"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-17843139208');
          `}
        </Script>

        {/* --- 3. META PIXEL NOSCRIPT --- */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }} 
            src="https://www.facebook.com/tr?id=1252009270175766&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}

        {/* --- 4. NUEVO: LEADCONNECTOR CHAT WIDGET (GLOBAL) --- */}
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="6982bc477cd1e65428cc69fe"
          strategy="afterInteractive"
        />

      </body>
    </html>
  );
}