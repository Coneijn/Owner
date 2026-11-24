'use client';

import Link from 'next/link';

interface CheckEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  lang?: 'es' | 'en';
}

const translations = {
  es: {
    badge: '¡Borrador Creado!',
    title: 'Revisa tu correo electrónico',
    descriptionPrefix: 'Hemos enviado un enlace de acceso a ',
    descriptionSuffix:
      ' para que puedas iniciar sesión, configurar tu contraseña y completar los detalles de tu propiedad.',
    spamNote:
      'Si no ves el correo en unos minutos, revisa tu carpeta de Spam o Promociones.',
    loginBtn: 'Ir a Iniciar Sesión',
    closeBtn: 'Entendido',
  },
  en: {
    badge: 'Draft Created!',
    title: 'Check your email',
    descriptionPrefix: 'We have sent an access link to ',
    descriptionSuffix:
      ' so you can log in, set up your password, and complete your property listing details.',
    spamNote:
      "If you don't see the email within a few minutes, please check your Spam or Promotions folder.",
    loginBtn: 'Go to Log In',
    closeBtn: 'Got it',
  },
};

export default function CheckEmailModal({
  isOpen,
  onClose,
  email,
  lang = 'es',
}: CheckEmailModalProps) {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-white relative text-center">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl font-bold transition-colors"
        >
          ✕
        </button>

        {/* Ícono de correo */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f8ed1a]/20 border border-[#f8ed1a]/40 flex items-center justify-center text-3xl">
          ✉️
        </div>

        <span className="px-3 py-1 bg-[#f8ed1a]/20 text-[#f8ed1a] border border-[#f8ed1a]/40 rounded-full text-xs font-bold uppercase tracking-widest">
          {t.badge}
        </span>

        <h3 className="text-2xl font-black text-white mt-4 mb-3">
          {t.title}
        </h3>

        <p className="text-sm text-gray-300 leading-relaxed mb-4">
          {t.descriptionPrefix}
          {email ? (
            <strong className="text-[#f8ed1a] font-bold break-all">{email}</strong>
          ) : (
            <strong className="text-[#f8ed1a] font-bold">tu correo</strong>
          )}
          {t.descriptionSuffix}
        </p>

        <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-gray-400 mb-6">
          ℹ️ {t.spamNote}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex-1 py-3 px-4 bg-[#f8ed1a] hover:bg-[#459e10] text-[#0a0f1c] font-black uppercase tracking-wide text-xs rounded-lg transition-all text-center"
          >
            {t.loginBtn}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold uppercase tracking-wide text-xs rounded-lg transition-all"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}