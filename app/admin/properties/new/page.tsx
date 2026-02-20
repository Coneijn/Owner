import { prisma } from '@/lib/prisma';
import NewPropertyForm from '@/app/admin/properties/new/new-form'; // Importa el archivo que renombramos

export default async function NewPropertyServerPage() {
  // 1. Obtenemos los vendedores de la BD
  const sellers = await prisma.sellerProfile.findMany({
    select: {
      id: true,
      sellerName: true,
      sellerType: true,
    },
    orderBy: { sellerName: 'asc' },
  });

  // 2. Le pasamos la lista al Client Component
  return <NewPropertyForm sellers={sellers} />;
}