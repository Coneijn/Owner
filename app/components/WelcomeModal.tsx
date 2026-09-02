"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<"en" | "es">("en"); // Por defecto inglés para evitar nulos
  const router = useRouter();

  // Paso 3 del plan: Verificar si el usuario ya completó el onboarding
  useEffect(() => {
    const hasSeenModal = localStorage.getItem("onboardingComplete");
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleLanguageSelect = (selectedLang: "en" | "es") => {
    setLang(selectedLang);
    setStep(2);
  };

  const handleRoleSelect = (rolePath: string) => {
    //guarda el tipo de usuario seleccionado en el localStorage para futuras referencias
    localStorage.setItem("userRole", rolePath);
    // Guardar preferencia para no volver a mostrar el modal
    localStorage.setItem("onboardingComplete", "true");
    setIsOpen(false);
    
    // Paso 2 del plan: Enrutamiento con el parámetro lang
    router.push(`/${rolePath}?lang=${lang}`);
  };

  // Textos dinámicos según el idioma seleccionado
  const content = {
    en: {
      question: "What kind of user fits you better? Looking for a house, selling a property, or would you like to be an agent? ",      
      buyer: "Buyer",
      renter: "Renter",
      seller: "Seller",
      agent: "Agent",
    },
    es: {
      question: "¿Qué tipo de usuario se adapta mejor a ti? ¿Buscas una casa, vender una propiedad o te gustaría ser un agente? ",
      buyer: "Comprador",
      renter: "Inquilino",
      seller: "Vendedor",
      agent: "Agente",
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Welcome! / ¡Bienvenido!
            </h2>
            <p className="text-gray-600 mb-8">
              Please select your language.<br />
              Por favor, selecciona tu idioma.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleLanguageSelect("en")}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                English
              </button>
              <button
                onClick={() => handleLanguageSelect("es")}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Español
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {content[lang].question}
            </h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleRoleSelect("buyers")}
                className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
              >
                {content[lang].buyer}
              </button>
              <button
                onClick={() => handleRoleSelect("renters")}
                className="w-full py-3 px-4 border-2 border-blue-400 text-blue-400 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
              >
                {content[lang].renter}
              </button>
              <button
                onClick={() => handleRoleSelect("sellers")}
                className="w-full py-3 px-4 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-lg transition-colors"
              >
                {content[lang].seller}
              </button>
              <button
                onClick={() => handleRoleSelect("agents")}
                className="w-full py-3 px-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-colors"
              >
                {content[lang].agent}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}