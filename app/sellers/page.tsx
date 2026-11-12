'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SellerLightEstimation from '@/app/components/sellers/SellerLightEstimation';
import LanguageSwitch from '@/app/components/LanguageSwitch'; // Ajusta esta ruta si está en otra carpeta
import { registerSellerAction } from './actions';

const translations = {
  es: {
    badge: 'Autoservicio para Vendedores',
    title: 'Vende Dueño a Dueño en 3 Pasos',
    subtitle:
      'Genera tu borrador oficial, fija tus términos y recibe pagos mensuales sin pagar comisiones de intermediarios.',
    defaultError: 'Ocurrió un error inesperado al generar el borrador.',
  },
  en: {
    badge: 'Seller Self-Service',
    title: 'Sell Owner-to-Owner in 3 Steps',
    subtitle:
      'Generate your official draft, set your terms, and receive monthly payments with zero middleman commissions.',
    defaultError: 'An unexpected error occurred while generating the draft.',
  },
};

function SellersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang: 'es' | 'en' = searchParams.get('lang') === 'en' ? 'en' : 'es';
  const t = translations[lang];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSellerSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await registerSellerAction(formData);

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      setErrorMessage(res.error || t.defaultError);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Barra superior con el toggle de idioma */}
      <div className="w-full max-w-2xl flex justify-end mb-6">
        <LanguageSwitch />
      </div>

      <div className="w-full max-w-2xl mb-8 text-center">
        <span className="px-3 py-1 bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/40 rounded-full text-xs font-bold uppercase tracking-widest">
          {t.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
          {t.title}
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          {t.subtitle}
        </p>
      </div>

      {errorMessage && (
        <div className="w-full max-w-2xl mb-6 p-4 bg-red-900/40 border border-red-500 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      <SellerLightEstimation
        onSubmit={handleSellerSubmit}
        isSubmitting={isSubmitting}
        lang={lang}
      />
    </div>
  );
}

export default function SellersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <SellersContent />
    </Suspense>
  );
}