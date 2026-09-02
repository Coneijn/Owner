import Header from '@/app/components/Header';
import { Metadata } from 'next';
import Script from 'next/script';
import AgentsCalendar from '@/app/components/AgentsCalendar';

export const metadata: Metadata = {
  title: 'Programa de Agentes | Dueño a Dueño',
  description: 'Conviértete en un agente asociado de Dueño a Dueño y recibe comisiones por traer compradores o propiedades al sistema.',
};

export default async function AgentsPage(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  const isEs = lang === 'es';

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 font-sans flex flex-col justify-between">
      <div>
        <Header lang={lang} activePage="agents" />

        {/* HERO / ENCABEZADO */}
        <section className="bg-gradient-to-b from-brand-header to-brand-dark py-14 px-4 text-center border-b border-gray-800">
          <span className="inline-block text-[#529e14] font-black tracking-widest text-xs uppercase mb-3">
            {isEs ? "🏡 RED DE ASOCIADOS • DUEÑO A DUEÑO" : "🏡 PARTNER NETWORK • OWNER TO OWNER"}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-brand-accent uppercase mb-4 tracking-tight">
            {isEs ? "Acelera tus Ingresos" : "Accelerate Your Income"}
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
            {isEs 
              ? "Únete a nuestra red de agentes asociados. Refiere compradores o dueños de propiedades (Sellers) y recibe atractivas compensaciones económicas por cada transacción exitosa."
              : "Join our network of partner agents. Refer buyers or property owners (Sellers) and receive attractive financial compensation for every successful transaction."
            }
          </p>
        </section>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA: HOW DOES IT WORK + AGENTS CALENDAR */}
            <div className="space-y-8">
              
              {/* TARJETA: CÓMO FUNCIONA */}
              <div className="bg-[#121212] p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
                <h2 className="text-xl font-black text-brand-accent uppercase tracking-wider flex items-center gap-2 border-l-4 border-brand-accent pl-3">
                  {isEs ? "¿Cómo funciona?" : "How does it work?"}
                </h2>
                
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="text-2xl p-2 bg-[#1a1a1a] rounded-lg border border-gray-800">🤝</span>
                    <div>
                      <h3 className="font-bold text-white text-base">{isEs ? "1. Regístrate" : "1. Register"}</h3>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        {isEs 
                          ? "Completa el formulario de afiliación para darte de alta en nuestro sistema CRM."
                          : "Fill out the affiliation form to register in our CRM system."}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-2xl p-2 bg-[#1a1a1a] rounded-lg border border-gray-800">🏠</span>
                    <div>
                      <h3 className="font-bold text-white text-base">{isEs ? "2. Conecta Oportunidades" : "2. Connect Opportunities"}</h3>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        {isEs 
                          ? "Comparte nuestro inventario de 'Owner Financing' con tus clientes que no califican para hipotecas, o recomiéndanos dueños que quieran vender."
                          : "Share our 'Owner Financing' inventory with clients who don't qualify for mortgages, or refer owners looking to sell."}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-2xl p-2 bg-[#1a1a1a] rounded-lg border border-gray-800">💰</span>
                    <div>
                      <h3 className="font-bold text-white text-base">{isEs ? "3. Recibe tus Pagos" : "3. Get Paid"}</h3>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        {isEs 
                          ? "Una vez que se cierre el contrato gracias a tu referencia, procesamos tu pago de manera rápida."
                          : "Once the contract is closed thanks to your referral, we process your payment quickly."}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* CALENDARIO DE AGENTES: JUSTO DEBAJO */}
              <div className="bg-[#121212] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-2xl">
                <h3 className="text-sm font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="text-[#529e14]">📅</span> {isEs ? "Agenda una llamada informativa" : "Schedule an intro call"}
                </h3>
                <AgentsCalendar className="rounded-xl overflow-hidden bg-white" />
              </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO DE GHL */}
            <div className="bg-[#121212] rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#529e14]/10 rounded-bl-full pointer-events-none"></div>
              
              <h2 className="text-xl font-black text-white uppercase tracking-tight text-center">
                {isEs ? "Aplica Ahora" : "Apply Now"}
              </h2>
              <p className="text-gray-400 text-xs text-center mt-1 mb-6">
                {isEs ? "Completa tus datos para enviarte los detalles del programa." : "Fill in your details to receive the program information."}
              </p>
              
              <div className="bg-white rounded-xl p-2 min-h-[500px]">
                {isEs ? (
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/QHmfWgnEgjKBaKotwy3I"
                    style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }}
                    id="inline-QHmfWgnEgjKBaKotwy3I" 
                    title="Formulario de Agentes ES"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Agent Registration ES"
                    data-height="500"
                    data-layout-iframe-id="inline-QHmfWgnEgjKBaKotwy3I"
                    data-form-styles=""
                    data-use-new-styles="true"
                    data-percentage="100"
                  />
                ) : (
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/Ivwlj3I6ZgkLdr6kwPRT"
                    style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }}
                    id="inline-Ivwlj3I6ZgkLdr6kwPRT" 
                    title="Agent Registration Form EN"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Agent Registration EN"
                    data-height="500"
                    data-layout-iframe-id="inline-Ivwlj3I6ZgkLdr6kwPRT"
                    data-form-styles=""
                    data-use-new-styles="true"
                    data-percentage="100"
                  />
                )}
                <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
              </div>
            </div>

          </div>
        </main>
      </div>

      <footer className="bg-brand-header text-white py-8 border-t border-gray-800 text-center mt-12">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}