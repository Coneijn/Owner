import HiringForm from "../components/HiringForm";

export default function HiringPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
            Join the OTD Team
          </h1>
          <p className="text-foreground/80 dark:text-gray-300 text-sm">
            We are looking for top talent! Déjanos tus datos y sube tu resume para formar parte de nuestro crew.
          </p>
        </div>

        {/* Company Overview / Filtro Bilingüe Natural */}
        <div className="mb-8 rounded-xl border border-border bg-card/50 p-5 shadow-xs text-sm text-foreground/85 dark:text-gray-300 space-y-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-brand-dark dark:text-white">
            About OwnerToDueño
          </h2>
          <p className="leading-relaxed">
            En <strong>OwnerToDueño (OTD)</strong> facilitamos el camino hacia el <em>homeownership</em> conectando inversionistas con compradores mediante <strong>owner-financing</strong> estructurado. Eliminamos las barreras bancarias tradicionales ayudando a familias trabajadoras a adquirir su hogar directamente con el dueño, protegiendo cada deal con procesos legales claros y un cierre formal.
          </p>
          <p className="leading-relaxed">
            Because our daily operations bridge English-speaking investors and Spanish-speaking buyers, we require team members who can naturally switch gears between both languages—managing pipelines, handling direct communication, and closing deals seamlessly.
          </p>
        </div>

        {/* Componente del formulario */}
        <HiringForm />
        
      </div>
    </div>
  );
}