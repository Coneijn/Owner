"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SignupPopupProps {
  lang: 'en' | 'es';
}

export default function SignupPopup({ lang }: SignupPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Leemos el rol guardado en WelcomeModal
    setUserRole(localStorage.getItem("userRole"));

    const timer = setTimeout(() => setIsVisible(true), 2000);
    const autoClose = setTimeout(() => setIsVisible(false), 32000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
  }, []);

  if (isDismissed) return null;

  const content = {
    es: {
      title: {
        default: "¡HAZTE USUARIO WEB! 🏡",
        buyers: "Compra la casa de tus suenos. ",
        renters: "Renta la casa de tus suenos. ",
        sellers: "Vende tu propiedad.",
        agents: "Conviértete en un agente."
      } ,
      text:"Crea tu cuenta gratis.",
      button: "REGISTRARSE"
    },
    en: {
      title: {
        default: "Become a web user! 🏡",
        buyers: "Buy your dream home.",
        renters: "Rent your dream home.",
        sellers: "Sell your property.",
        agents: "Become an agent."
      },
      text:"Create a free account.",
      button: "SIGN UP"
    }
  };

  const t = content[lang] || content.es;

  // Elegimos el titulo segun el rol, si no hay rol usamos el default
  const title = (userRole && t.title[userRole as keyof typeof t.title]) 
    ? t.title[userRole as keyof typeof t.title] 
    : t.title.default;

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 w-[calc(100%-32px)] max-w-sm sm:bottom-8 sm:left-8 sm:w-full bg-brand-dark border-2 border-brand-accent rounded-lg p-6 shadow-2xl transition-all duration-700 ease-in-out transform animate-bounce-subtle ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      }`}
    >
      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Boton de cerrar con color de marca */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute -top-3 -right-3 bg-brand-accent text-brand-dark rounded-full p-1 hover:brightness-110 transition-colors"
        aria-label="Cerrar"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
        </svg>
      </button>
      
      <h4 className="font-black text-brand-accent text-lg mb-2 uppercase tracking-wide">
        {title}
      </h4>
      <p className="text-sm text-white mb-4 font-medium">
        {t.text}
      </p>
      
      <Link
        href="/signup"
        className="block w-full text-center bg-brand-accent hover:brightness-110 text-brand-dark text-sm font-black py-3 px-4 rounded transition-colors uppercase tracking-widest"
      >
        {t.button}
      </Link>
    </div>
  );
}