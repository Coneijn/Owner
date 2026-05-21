import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; 
import "./globals.css";
import ChatWidget from "./components/ChatWidget";

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
  metadataBase: new URL(baseUrl), 
  title: 'Discover Your 🏡CashFlow',
  description: 'Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.',
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
  openGraph: {
    title: 'Discover Your 🏡CashFlow',
    description: 'Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.',
    images: [
      {
        url: '/share_map.png',
        width: 1200,
        height: 630,
        alt: 'CashFlow Share Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Your 🏡CashFlow',
    description: 'Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.',
    images: ['/share_map.png'],
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
        {/* --- GOOGLE TAG MANAGER (NOSCRIPT) --- */}
        {/* Esto va lo más arriba posible en el body */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MG3ZL6X8"
            height="0" 
            width="0" 
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* --- GOOGLE TAG MANAGER (SCRIPT) --- */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MG3ZL6X8');
          `}
        </Script>

        {/* --- TIKTOK PIXEL SCRIPT --- */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

              ttq.load('D70NPBJC77UCUUDFDN60');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>

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

        {/* --- 4. LEADCONNECTOR CHAT WIDGET (GLOBAL) --- */}
        <ChatWidget />

      </body>
    </html>
  );
}