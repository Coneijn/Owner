'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SellerLightEstimation from '@/app/components/sellers/SellerLightEstimation';
import { registerSellerAction } from './actions';

export default function SellersPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSellerSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await registerSellerAction(formData);

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error inesperado al generar el borrador.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl mb-8 text-center">
        <span className="px-3 py-1 bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/40 rounded-full text-xs font-bold uppercase tracking-widest">
          Autoservicio para Vendedores
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
          Vende Dueño a Dueño en 3 Pasos
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Genera tu borrador oficial, fija tus términos y recibe pagos mensuales sin pagar comisiones de intermediarios.
        </p>
      </div>

      {errorMessage && (
        <div className="w-full max-w-2xl mb-6 p-4 bg-red-900/40 border border-red-500 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      <SellerLightEstimation onSubmit={handleSellerSubmit} isSubmitting={isSubmitting} lang="es" />
    </div>
  );
}