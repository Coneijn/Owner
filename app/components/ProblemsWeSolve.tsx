'use client';

const DICTIONARY = {
  en: {
    chip: "Real Research · Real Problems",
    title: "We talked to dozens of sellers. The same 3 problems came up every time.",
    subtitle: "Landlords, investors, wholesalers, and owner-financiers across Memphis and beyond told us the same story. Here's what we heard — and what we built.",
    problemBadge: "The Problem",
    solutionBadge: "Our Solution",
    problems: [
      {
        title: "\"There's no good place to list and market these deals.\"",
        quote: "\"I've been selling homes this way for years but I'm posting on Facebook, calling contacts, and praying. There's no real marketplace for this kind of deal.\"",
        author: "— Memphis landlord, 9 properties",
        solutionTitle: "A Unified Off-Market Marketplace",
        solutionDesc: "OwnerToDueno is the first dedicated platform for listing, marketing, and closing seller-financed deals. Your property gets in front of pre-qualified, motivated buyers — not random social media scrollers.",
        features: ["AI-powered listing", "Targeted buyer matching", "Off-market reach"]
      },
      {
        title: "\"Showings, follow-up, and closing coordination are a full-time job.\"",
        quote: "\"I'm losing buyers because I can't follow up fast enough. And half my buyers only speak Spanish — I can't close deals I can't communicate through.\"",
        author: "— Investor-seller, 14 units",
        solutionTitle: "Bilingual AI Showings + Automated Follow-Up",
        solutionDesc: "Our AI conducts full property showings in English and Spanish — 24/7. It books buyers directly on your calendar, sends automated follow-ups at the point of sale, and keeps every lead warm until they're ready to close.",
        features: ["English & Spanish", "Auto calendar booking", "AI follow-up sequences", "24/7 availability"]
      },
      {
        title: "\"Tracking payments and amortization after closing is a nightmare.\"",
        quote: "\"I've got buyers paying me in cash, Zelle, checks — all different amounts, all different days. My spreadsheet is a disaster and I've lost track of what they actually owe.\"",
        author: "— Wholesaler, 6 active deals",
        solutionTitle: "Built-In Payment Tracking",
        solutionDesc: "After closing, every deal lives in your dashboard. See the full amortization schedule, track every payment received, flag missed payments, and export statements — all in one place. No more spreadsheet chaos.",
        features: ["Amortization schedules", "Payment history", "Late payment alerts", "Exportable statements"]
      }
    ]
  },
  es: {
    chip: "Investigación Real · Problemas Reales",
    title: "Hablamos con docenas de vendedores. Los mismos 3 problemas surgieron siempre.",
    subtitle: "Arrendadores, inversionistas y mayoristas en Memphis y otras áreas nos contaron la misma historia. Esto fue lo que escuchamos — y lo que construimos.",
    problemBadge: "El Problema",
    solutionBadge: "Nuestra Solución",
    problems: [
      {
        title: "\"No hay un buen lugar para publicar y comercializar estos tratos.\"",
        quote: "\"Llevo años vendiendo casas así, pero publico en Facebook, llamo a contactos y rezo. No hay un mercado real para este tipo de tratos.\"",
        author: "— Propietario en Memphis, 9 propiedades",
        solutionTitle: "Un Mercado Unificado Exclusivo",
        solutionDesc: "OwnerToDueno es la primera plataforma dedicada a publicar, comercializar y cerrar tratos financiados por el dueño. Tu propiedad llega a compradores precalificados y motivados, no a curiosos en redes sociales.",
        features: ["Publicaciones impulsadas por IA", "Emparejamiento de compradores", "Alcance fuera del mercado"]
      },
      {
        title: "\"Las demostraciones y el seguimiento son un trabajo de tiempo completo.\"",
        quote: "\"Pierdo compradores porque no puedo darles seguimiento rápido. Y la mitad de mis prospectos solo hablan español; no puedo cerrar tratos si no me comunico.\"",
        author: "— Inversionista-vendedor, 14 unidades",
        solutionTitle: "Demostraciones Bilingües IA + Seguimiento",
        solutionDesc: "Nuestra IA realiza demostraciones completas en inglés y español, 24/7. Agenda a los compradores en tu calendario, envía seguimientos automáticos y mantiene cada prospecto activo hasta que cierra.",
        features: ["Inglés y Español", "Agenda automática en calendario", "Seguimiento con IA", "Disponibilidad 24/7"]
      },
      {
        title: "\"Rastrear los pagos y la amortización después del cierre es una pesadilla.\"",
        quote: "\"Tengo compradores pagando en efectivo, Zelle, cheques... diferentes montos y días. Mi Excel es un desastre y ya no sé cuánto me deben realmente.\"",
        author: "— Mayorista, 6 tratos activos",
        solutionTitle: "Panel de Pagos y Amortización Integrado",
        solutionDesc: "Después del cierre, cada trato vive en tu panel. Revisa el calendario de amortización, rastrea cada pago, detecta atrasos y exporta estados de cuenta en un solo lugar. Adiós al caos de Excel.",
        features: ["Calendarios de amortización", "Historial de pagos", "Alertas de atraso", "Estados de cuenta exportables"]
      }
    ]
  }
};

export default function ProblemsWeSolve({ lang = 'en' }: { lang: 'en' | 'es' }) {
  const t = DICTIONARY[lang];

  return (
    <section className="py-20 bg-black relative z-10 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">
            {t.chip}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t.title}
          </h2>
          <p className="text-lg text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Grid de 3 tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.problems.map((prob, idx) => (
            <div key={idx} className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 flex flex-col hover:border-gray-600 transition-colors">
              
              {/* Sección del Problema */}
              <div className="mb-8">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 block">
                  {t.problemBadge}
                </span>
                <h3 className="text-xl font-bold text-white mb-4">
                  {prob.title}
                </h3>
                <blockquote className="border-l-2 border-gray-700 pl-4 text-sm text-gray-500 italic mb-3">
                  {prob.quote}
                </blockquote>
                <p className="text-xs text-gray-600 font-semibold">{prob.author}</p>
              </div>

              <hr className="border-gray-800 mb-8" />

              {/* Sección de la Solución */}
              <div className="flex-grow">
                <span className="text-xs font-bold text-[#52b788] uppercase tracking-wider mb-3 block">
                  {t.solutionBadge}
                </span>
                <h4 className="text-lg font-bold text-white mb-3">
                  {prob.solutionTitle}
                </h4>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {prob.solutionDesc}
                </p>
                
                {/* Lista de características (Checklist) */}
                <ul className="space-y-2 mt-auto">
                  {prob.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-[#52b788]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}