'use client';

import { useState, useEffect } from 'react';

type Props = {
  title: string;
  slug: string;
  lang: 'es' | 'en';
};

export default function PropertyShare({ title, slug, lang }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Textos
  const t = {
    triggerBtn: lang === 'en' ? 'Share Property' : 'Compartir Propiedad',
    modalTitle: lang === 'en' ? 'Share this property' : 'Compartir esta propiedad',
    copyLabel: lang === 'en' ? 'Copy Link' : 'Copiar Enlace',
    copiedLabel: lang === 'en' ? 'Copied!' : '¡Copiado!',
    instaHelper: lang === 'en' ? 'Link copied. Paste it on Instagram!' : 'Enlace copiado. ¡Pégalo en Instagram!',
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(`${window.location.origin}/properties/${slug}`);
    }
    // Bloquear scroll cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [slug, isOpen]);

  const handleCopy = (isInsta = false) => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    if (isInsta) {
        alert(t.instaHelper);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + currentUrl)}`,
  };

  // Estilos comunes para los botones circulares
  const circleBtnClasses = "w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md relative group";
  const labelClasses = "absolute -bottom-8 text-xs font-bold text-gray-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap";

  return (
    <>
      {/* --- BOTÓN ACTIVADOR --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] border-2 border-[#f8ed1a] text-[#f8ed1a] hover:bg-[#f8ed1a] hover:text-[#1a1a1a] font-black uppercase tracking-wide py-3 px-4 rounded-xl transition-all duration-300 group"
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        {t.triggerBtn}
      </button>

      {/* --- MODAL --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Overlay con desenfoque */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Contenedor del Modal */}
          <div className="relative bg-[#1a1a1a] border border-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {t.modalTitle}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:rotate-90 transition-all p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Grid de Iconos Circulares */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              
              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={`${circleBtnClasses} bg-[#1877F2] hover:shadow-blue-500/50`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.747-2.971 2.28v1.69h4.766l-.666 3.667h-4.1v7.98h-4.944Z"/></svg>
                <span className={labelClasses}>Facebook</span>
              </a>

              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={`${circleBtnClasses} bg-[#25D366] hover:shadow-green-500/50`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                <span className={labelClasses}>WhatsApp</span>
              </a>

              {/* Instagram (Copia enlace) */}
              <button
                onClick={() => handleCopy(true)}
                className={`${circleBtnClasses} bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:shadow-pink-500/50`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span className={labelClasses}>Instagram</span>
              </button>

              {/* Copy Link Genérico */}
              <button
                onClick={() => handleCopy(false)}
                className={`${circleBtnClasses} ${copied ? 'bg-[#529e14] hover:shadow-green-500/50' : 'bg-gray-700 hover:bg-gray-600 hover:shadow-gray-500/50'}`}
              >
                {copied ? (
                    <svg className="w-8 h-8 animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                )}
                <span className={labelClasses}>{copied ? t.copiedLabel : t.copyLabel}</span>
              </button>
            </div>

            {/* URL Display (Opcional, para que vean qué copian) */}
            <div className="mt-8 p-3 bg-black/30 rounded-lg border border-gray-800 text-gray-500 text-xs truncate font-mono text-center select-all">
                {currentUrl}
            </div>

          </div>
        </div>
      )}
    </>
  );
}