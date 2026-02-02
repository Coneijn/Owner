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
  metadataBase: new URL(baseUrl), 
  
  title: {
    default: "Dueño a Dueño | Compra y Venta Directa en Memphis", // Mejoré un poco el título por defecto
    template: "%s | Dueño a Dueño", 
  },
  description: "Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.",
  
  // --- CAMBIO IMPORTANTE AQUÍ: index: true ---
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
        {/* Google Ads Tag */}
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

        {children}
      </body>
    </html>
  );
}