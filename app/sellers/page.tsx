import type { Metadata } from 'next';
import { Suspense } from 'react';
import SellersClient from './SellersClient';

export const metadata: Metadata = {
  title: 'List Your Home Rent to Own',
  openGraph: {
    title: 'List Your Home Rent to Own',
    description:
      'Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.',
    images: [
      {
        url: '/share_map.png',
        width: 1200,
        height: 630,
        alt: 'List Your Home Rent to Own',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Home Rent to Own',
    description:
      'Marketplace inmobiliario en Memphis para comprar y vender casas directamente, sin bancos ni intermediarios. Owner financing available.',
    images: ['/share_map.png'],
  },
};

export default function SellersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <SellersClient />
    </Suspense>
  );
}