'use client';

import { useState, useEffect } from 'react';

type Props = {
  title: string;
  slug: string;
  lang: 'es' | 'en';
};

export default function PropertyShare({ title, slug, lang }: Props) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Textos
  const t = {
    shareBtn: lang === 'en' ? 'Share' : 'Compartir',
    copiedLabel: lang === 'en' ? 'Copied!' : '¡Copiado!',
    instaHelper: lang === 'en' ? 'Link copied. Paste it on Instagram!' : 'Enlace copiado. ¡Pégalo en Instagram!',
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(`${window.location.origin}/propiedades/${slug}`);
    }
  }, [slug]);

  const handleCopy = (isInsta = false) => {
    if (!currentUrl) return;
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

  // Estilos de los botones pequeños (Iconos)
  const btnClass = "w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm transition-transform hover:scale-110 hover:shadow-md";

  if (!currentUrl) return null;

  // --- ESTADO 1: BOTÓN "COMPARTIR" (ESTILO NEGRO -> AMARILLO) ---
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="
            flex items-center gap-2 
            px-6 py-2 
            rounded-full 
            font-black uppercase tracking-wide text-sm
            transition-all shadow-sm
            border-2 border-[#529e14]
            
            /* ESTADO INICIAL: Negro con letras blancas */
            bg-[#1a1a1a] 
            text-white
            
            /* HOVER: Amarillo con letras negras */
            hover:bg-[#f8ed1a] 
            hover:text-[#1a1a1a]
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {t.shareBtn}
      </button>
    );
  }

  // --- ESTADO 2: BARRA DE ICONOS (REVELADO) ---
  return (
    <div className="flex items-center gap-3 bg-white/5 p-1 pr-3 rounded-full border border-gray-200/20 backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-300">
      
      {/* Botón X para cerrar */}
      <button 
        onClick={() => setIsExpanded(false)}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
      >
        ✕
      </button>

      {/* 1. Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnClass} bg-[#1877F2] hover:bg-[#166fe5]`}
        title="Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.747-2.971 2.28v1.69h4.766l-.666 3.667h-4.1v7.98h-4.944Z"/></svg>
      </a>

      {/* 2. WhatsApp */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnClass} bg-[#25D366] hover:bg-[#20bd5a]`}
        title="WhatsApp"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>

      {/* 3. Instagram (Copiar) */}
      <button
        onClick={() => handleCopy(true)}
        className={`${btnClass} bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:shadow-pink-500/50`}
        title="Instagram"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </button>

      {/* 4. Copiar Enlace */}
      <button
        onClick={() => handleCopy(false)}
        className={`${btnClass} ${copied ? 'bg-[#529e14]' : 'bg-gray-700 hover:bg-gray-600'}`}
        title="Copy Link"
      >
        {copied ? (
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        )}
      </button>

      {/* Feedback visual si se copió */}
      {copied && <span className="text-[#529e14] text-xs font-bold animate-pulse hidden sm:block">{t.copiedLabel}</span>}
    </div>
  );
}