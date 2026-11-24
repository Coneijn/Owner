'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SellerLightEstimation from '@/app/components/sellers/SellerLightEstimation';
import CheckEmailModal from '@/app/components/sellers/CheckEmailModal';
import LanguageSwitch from '@/app/components/LanguageSwitch';
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

export default function SellersClient() {
  const searchParams = useSearchParams();
  const lang: 'es' | 'en' = searchParams.get('lang') === 'en' ? 'en' : 'es';
  const t = translations[lang];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleSellerSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await registerSellerAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSellerEmail(formData.email || '');
      return true;
    } else {
      setErrorMessage(res.error || t.defaultError);
      return false;
    }
  };

  // Se ejecuta al hacer clic en el botón dentro de CashOfferWidget
  const handleSelectOfferOption = (_option: string, data: any) => {
    if (data?.sellerContact?.email) {
      setSellerEmail(data.sellerContact.email);
    }
    setShowEmailModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Barra superior con el toggle de idioma */}
      <div className="w-full max-w-2xl flex justify-end mb-6">
        <LanguageSwitch />
      </div>

      <div className="w-full max-w-2xl mb-8 text-center">
        <span className="px-3 py-1 bg-[#f8ed1a]/20 text-[#f8ed1a] border border-[#f8ed1a]/40 rounded-full text-xs font-bold uppercase tracking-widest">
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
        onSelectOfferOption={handleSelectOfferOption}
        isSubmitting={isSubmitting}
        lang={lang}
      />

      {/* Modal informativo de correo enviado */}
      <CheckEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        email={sellerEmail}
        lang={lang}
      />
    </div>
  );
}