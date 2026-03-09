import Header from '@/app/components/Header';
import GHLFormEmbed from '@/app/components/GHLFormEmbed'; // Asumiendo que se exporta así
import { Metadata } from 'next';
import Script from 'next/script'; // Importación recomendada en Next.js para scripts externos

export const metadata: Metadata = {
  title: 'Programa de Agentes | Dueño a Dueño',
  description: 'Conviértete en un agente asociado de Dueño a Dueño y recibe comisiones por traer compradores o propiedades al sistema.',
};

export default async function AgentsPage(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  const isEs = lang === 'es';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1a1a1a]">
      <Header lang={lang} activePage="agents" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] mb-6 uppercase tracking-tighter">
            {isEs ? "Acelera tus Ingresos" : "Accelerate Your Income"}
            <span className="block text-[#529e14]">
              {isEs ? "con Dueño a Dueño" : "with Dueño a Dueño"}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            {isEs 
              ? "Únete a nuestra red de agentes asociados. Refiere compradores o dueños de propiedades (Sellers) y recibe atractivas compensaciones económicas por cada transacción exitosa."
              : "Join our network of partner agents. Refer buyers or property owners (Sellers) and receive attractive financial compensation for every successful transaction."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* INFORMACIÓN DEL MODELO */}
          <div className="space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-black uppercase tracking-tight border-l-8 border-[#f8ed1a] pl-4">
              {isEs ? "¿Cómo funciona?" : "How does it work?"}
            </h2>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-3xl">🤝</span>
                <div>
                  <h3 className="font-bold text-lg">{isEs ? "1. Regístrate" : "1. Register"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {isEs 
                      ? "Completa el formulario de afiliación para darte de alta en nuestro sistema CRM."
                      : "Fill out the affiliation form to register in our CRM system."}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-3xl">🏠</span>
                <div>
                  <h3 className="font-bold text-lg">{isEs ? "2. Conecta Oportunidades" : "2. Connect Opportunities"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {isEs 
                      ? "Comparte nuestro inventario de 'Owner Financing' con tus clientes que no califican para hipotecas, o recomiéndanos dueños que quieran vender."
                      : "Share our 'Owner Financing' inventory with clients who don't qualify for mortgages, or refer owners looking to sell."}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-3xl">💰</span>
                <div>
                  <h3 className="font-bold text-lg">{isEs ? "3. Recibe tus Pagos" : "3. Get Paid"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {isEs 
                      ? "Una vez que se cierre el contrato gracias a tu referencia, procesamos tu pago de manera rápida."
                      : "Once the contract is closed thanks to your referral, we process your payment quickly."}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* FORMULARIO DE GHL */}
          <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#529e14] rounded-bl-full opacity-20"></div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 text-center">
              {isEs ? "Aplica Ahora" : "Apply Now"}
            </h2>
            <p className="text-gray-400 text-sm text-center mb-8">
              {isEs ? "Completa tus datos para agendar una llamada inicial." : "Fill in your details to schedule an initial call."}
            </p>
            
            <div className="bg-white rounded-lg p-2 min-h-[500px]">
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
              {/* Usamos next/script para evitar problemas de hidratación con scripts externos en Next.js */}
              <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
            </div>
            
          </div>
        </div>
      </main>

    </div>
  );
}