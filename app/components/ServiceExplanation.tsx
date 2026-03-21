'use client';

const DICTIONARY = {
  en: {
    chip: "The Dueño a Dueño Process",
    title: "How It Works & Why It Wins",
    subtitle: "A seamless end-to-end platform powered by AI to make seller-financing effortless.",
    
    // How it works section
    stepsTitle: "The 4-Step Process",
    steps: [
      { num: "01", title: "List Your Property", desc: "Upload your property details. We instantly market it to our pre-qualified off-market buyer pool." },
      { num: "02", title: "AI-Powered Showings", desc: "Our AI handles inquiries, answers questions, and schedules tours in English and Spanish, 24/7." },
      { num: "03", title: "Close the Deal", desc: "Select the best buyer, sign the paperwork, and collect your down payment." },
      { num: "04", title: "Track Everything", desc: "Manage amortization, track monthly payments, and monitor your cash flow in your dashboard." }
    ],

    // Win-Win section
    winWinTitle: "The Win-Win Philosophy",
    winWinSeller: {
      title: "For You (The Seller)",
      benefits: ["Sell at a premium price", "Generate passive monthly income", "Reduce tax burden (installment sale)"]
    },
    winWinBuyer: {
      title: "For The Buyer",
      benefits: ["No traditional banks required", "Accessible path to homeownership", "Clear and fair terms"]
    },

    // AI Features section
    aiTitle: "Built on Advanced AI",
    aiFeatures: [
      { title: "Bilingual Communication", desc: "Never lose a deal to a language barrier. Our AI speaks native English and Spanish." },
      { title: "Automated Follow-ups", desc: "Every lead is nurtured automatically until they are ready to buy." },
      { title: "Smart Scheduling", desc: "Direct integration with your calendar to book property tours without the back-and-forth." }
    ]
  },
  es: {
    chip: "El Proceso Dueño a Dueño",
    title: "Cómo Funciona y Por Qué Conviene",
    subtitle: "Una plataforma integral impulsada por IA para que el financiamiento de dueños sea fácil.",
    
    // How it works section
    stepsTitle: "El Proceso de 4 Pasos",
    steps: [
      { num: "01", title: "Publica tu Propiedad", desc: "Sube los detalles de tu casa. La comercializamos al instante con nuestra red de compradores precalificados." },
      { num: "02", title: "Demostraciones con IA", desc: "Nuestra IA maneja consultas, responde preguntas y agenda visitas en inglés y español, 24/7." },
      { num: "03", title: "Cierra el Trato", desc: "Elige al mejor comprador, firma el papeleo y cobra tu pago inicial (enganche)." },
      { num: "04", title: "Rastrea Todo", desc: "Administra la amortización, rastrea los pagos mensuales y monitorea tu flujo de caja en tu panel." }
    ],

    // Win-Win section
    winWinTitle: "Filosofía de Beneficio Mutuo",
    winWinSeller: {
      title: "Para Ti (El Vendedor)",
      benefits: ["Vende a un precio más alto", "Genera ingresos pasivos mensuales", "Reduce la carga fiscal"]
    },
    winWinBuyer: {
      title: "Para El Comprador",
      benefits: ["Sin necesidad de bancos tradicionales", "Un camino accesible para ser propietario", "Términos claros y justos"]
    },

    // AI Features section
    aiTitle: "Construido con IA Avanzada",
    aiFeatures: [
      { title: "Comunicación Bilingüe", desc: "Nunca pierdas un trato por la barrera del idioma. Nuestra IA habla inglés y español nativo." },
      { title: "Seguimiento Automático", desc: "Cada prospecto recibe atención continua automáticamente hasta que esté listo para comprar." },
      { title: "Agenda Inteligente", desc: "Integración directa con tu calendario para agendar visitas sin tener que enviar mensajes de ida y vuelta." }
    ]
  }
};

export default function ServiceExplanation({ lang = 'en' }: { lang: 'en' | 'es' }) {
  const t = DICTIONARY[lang];

  return (
    <section className="py-20 bg-[#0a0a0a] relative z-10 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-green-900/30 border border-green-800 text-xs font-bold text-green-400 uppercase tracking-widest mb-4">
            {t.chip}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          <p className="text-lg text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* 1. HOW IT WORKS (Pasos) */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">{t.stepsTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {t.steps.map((step, idx) => (
              <div key={idx} className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 relative">
                <span className="text-5xl font-black text-gray-800 absolute top-4 right-4 opacity-50">{step.num}</span>
                <h4 className="text-lg font-bold text-white mt-8 mb-3 relative z-10">{step.title}</h4>
                <p className="text-sm text-gray-400 relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. WIN-WIN & AI FEATURES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Win-Win */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-8 rounded-3xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-8">{t.winWinTitle}</h3>
            
            <div className="mb-8">
              <h4 className="text-green-400 font-bold mb-4 uppercase text-sm tracking-wider">{t.winWinSeller.title}</h4>
              <ul className="space-y-3">
                {t.winWinSeller.benefits.map((ben, idx) => (
                  <li key={idx} className="flex items-center text-gray-300 text-sm">
                    <span className="text-green-500 mr-3">✔</span> {ben}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-blue-400 font-bold mb-4 uppercase text-sm tracking-wider">{t.winWinBuyer.title}</h4>
              <ul className="space-y-3">
                {t.winWinBuyer.benefits.map((ben, idx) => (
                  <li key={idx} className="flex items-center text-gray-300 text-sm">
                    <span className="text-blue-500 mr-3">✔</span> {ben}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Features */}
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-8">{t.aiTitle}</h3>
            <div className="space-y-6">
              {t.aiFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                      <span className="text-green-400 text-xs font-bold">AI</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-bold mb-1">{feat.title}</h4>
                    <p className="text-gray-400 text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}