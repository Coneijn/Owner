import SellerForm from '../../ui/seller-form'; // Ajusta la ruta a donde guardes el componente

export default function NewSellerPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] p-8 font-sans text-gray-200">
      <div className="max-w-2xl mx-auto">
         {/* No le pasamos "initialData", así que el form sabe que es nuevo */}
        <SellerForm /> 
      </div>
    </div>
  );
}