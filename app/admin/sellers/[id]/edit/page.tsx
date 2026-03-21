import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SellerForm from '../../../../components/ui/seller-form'; // Ajusta la ruta

export default async function EditSellerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // Buscamos los datos actuales del vendedor en la base de datos
  const seller = await prisma.sellerProfile.findUnique({
    where: { id },
    select: {
      id: true,
      sellerName: true,
      sellerType: true,
      sellerImage: true,
    }
  });

  // Si alguien pone una URL de un ID que no existe, mostramos error 404
  if (!seller) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-8 font-sans text-gray-200">
      <div className="max-w-2xl mx-auto">
        {/* Le pasamos la data, el form sabe automáticamente que está en modo edición */}
        <SellerForm initialData={seller} redirectTo="/admin/sellers" />
      </div>
    </div>
  );
}