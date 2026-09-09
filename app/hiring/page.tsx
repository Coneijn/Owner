import HiringForm from "../components/HiringForm";

export default function HiringPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        
        {/* Encabezado Spanglish */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
            Join the OTD Team
          </h1>
          <p className="text-foreground/80 dark:text-gray-300">
            We are looking for top talent! Dejanos tus datos y sube tu resume para formar parte de nuestro crew. Must be fully bilingual.
          </p>
        </div>

        {/* Componente del formulario */}
        <HiringForm />
        
      </div>
    </div>
  );
}