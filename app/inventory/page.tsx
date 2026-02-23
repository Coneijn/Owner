import { prisma } from '@/lib/prisma';
import Header from '@/app/components/Header';
import InventoryClient from './inventory-client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// --- DICCIONARIO DE TRADUCCIONES ---
const DICTIONARY = {
  en: {
    title: " Inventory",
    //subtitle: "Live view of all properties. Select items to perform batch actions.",
    tabs: { all: "All Properties", new: "Newly Listed", available: "Available", sold: "Sold History" },
    empty: "No properties found in this category.",
    selected: "Selected",
    clear: "Clear",
    actions: "Actions →",
    badges: { available: "Available", sold: "Sold", new: "Newly Listed" }
  },
  es: {
    title: "Inventario",
    //subtitle: "Vista en vivo de todas las propiedades. Selecciona elementos para acciones en lote.",
    tabs: { all: "Todas", new: "Recientes", available: "Disponibles", sold: "Vendidas" },
    empty: "No se encontraron propiedades en esta categoría.",
    selected: "Seleccionadas",
    clear: "Limpiar",
    actions: "Acciones →",
    badges: { available: "Disponible", sold: "Vendido", new: "Reciente" }
  }
};

export default async function InventoryPage(props: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'es' ? 'es' : 'en') as 'es' | 'en';
  const t = DICTIONARY[lang];

  // Fetch de datos incluyendo titleEs
  const properties = await prisma.property.findMany({
    where: {isForSale: true},
    orderBy: { createdAt: 'desc' },
    select: {
        id: true,
        titleEn: true,
        titleEs: true, // <-- Importante para el bilingüe
        address: true,
        price: true,
        status: true,
        mainImage: true,
        createdAt: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        phoneNumber: true,
        sellerProfile: {
            select: {
                sellerName: true,
                sellerType: true
            }
        }

    }
  });

  const sanitizedProperties = properties.map(p => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString()
  }));

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-sans text-gray-200">
      <Header lang={lang} activePage="inventory" />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                    {t.title}
                </h1>
                {/*  <p className="text-gray-400 text-sm mt-1">
                    {t.subtitle}
                </p>*/}
            </div>
        </div>

        {/* Pasamos el idioma y el diccionario al cliente */}
        <InventoryClient properties={sanitizedProperties} lang={lang} t={t} />

      </main>
    </div>
  );
}