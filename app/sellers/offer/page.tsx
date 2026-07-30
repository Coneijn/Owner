'use client';

import { useState, use, useEffect } from 'react';
import Header from '@/app/components/Header';
import Link from 'next/link';
import CashOfferWidget from '@/app/components/CashOfferWidget';
import SellerFunnelModal from '@/app/components/SellerFunnelModal';

type Props = {
  searchParams: Promise<{ address?: string; lang?: string }>;
};

export default function OfferPage({ searchParams }: Props) {
  const params = use(searchParams);
  const address = params.address || '';
  const lang = (params.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState('');

  // Genera la URL amigable (ej. /sellers/2175-burlingate) para el buscador fuzzy
  useEffect(() => {
    if (address) {
      const formattedAddress = address.trim().replace(/\s+/g, '-').toLowerCase();
      setShareUrl(`${window.location.origin}/sellers/${formattedAddress}`);
    }
  }, [address]);

  const handleSelectOption = (strategyName: string, widgetData: any) => {
    setPrefillData({
      strategySelected: strategyName,
      ...widgetData
    });
    setIsModalOpen(true);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: lang === 'en' ? 'Property Cash Flow Offer' : 'Oferta de Flujo de Efectivo',
      text: lang === 'en' ? `Check out the data and offer for ${address}` : `Mira el análisis y la oferta para ${address}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(lang === 'en' ? 'Link copied to clipboard!' : '¡Enlace copiado al portapapeles!');
      } catch (error) {
        console.error('Error copying:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      <Header lang={lang} activePage="sellers" />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Link
            href={`/sellers?lang=${lang}`}
            className="inline-flex items-center gap-2 text-[#529e14] hover:text-white font-bold uppercase tracking-wide transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-[#529e14]"
          >
            {lang === 'en' ? 'Enter a different address' : 'Ingresar otra dirección'}
          </Link>
        </div>

        {/* Contenedor Flex para el Título y los Botones de Compartir */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-800 pb-4 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {lang === 'en' ? 'Property Analysis For:' : 'Análisis de Propiedad Para:'} <br/>
              <span className="text-[#f8ed1a] drop-shadow-md">{address}</span>
            </h1>
          </div>

          {/* Botones de Compartir Sociales */}
          {address && shareUrl && (
            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:block">
                {lang === 'en' ? 'Share:' : 'Compartir:'}
              </span>
              
              {/* Compartir Nativo / Copiar Enlace */}
              <button 
                onClick={handleNativeShare}
                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-700 hover:border-gray-500 shadow-sm"
                title={lang === 'en' ? 'Share / Copy Link' : 'Compartir / Copiar Enlace'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              </button>

              {/* WhatsApp */}
              <a 
                href={`https://wa.me/?text=${encodeURIComponent((lang === 'en' ? `Check out this cash flow offer for ${address}: ` : `Mira los números de esta oferta para ${address}: `) + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/30 text-[#25D366] rounded-full transition-colors border border-[#25D366]/20"
                title="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.459-1.653-1.756-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>

              {/* Facebook */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/30 text-[#1877F2] rounded-full transition-colors border border-[#1877F2]/20"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>

              {/* Email */}
              <a 
                href={`mailto:?subject=${encodeURIComponent(lang === 'en' ? 'Property Cash Flow Offer' : 'Oferta de Propiedad Dueño a Dueño')}&body=${encodeURIComponent((lang === 'en' ? `Check out this cash flow offer for ${address}:\n\n` : `Mira esta oferta para ${address}:\n\n`) + shareUrl)}`}
                className="p-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-full transition-colors border border-gray-600"
                title="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </a>
            </div>
          )}
        </div>

        {address ? (
          <CashOfferWidget
            lang={lang}
            onSelectOption={handleSelectOption}
            initialAddress={address}
            autoAnalyze={true}
          />
        ) : (
          <div className="p-8 bg-red-500/20 text-red-200 rounded-xl border border-red-500/50">
            {lang === 'en' ? 'No address provided in the URL.' : 'No se proporcionó ninguna dirección en la URL.'}
          </div>
        )}
      </main>

      <SellerFunnelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lang={lang}
        prefillData={prefillData}
      />
    </div>
  );
}