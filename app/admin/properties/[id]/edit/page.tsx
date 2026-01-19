import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import EditForm from '@/app/admin/ui/edit-form';

export default async function EditPropertyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params; 

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    notFound();
  }

  const plainProperty = {
    ...property,
    price: property.price.toNumber(),
    downPayment: property.downPayment.toNumber(),
    interestRate: property.interestRate.toNumber(),
    taxes: property.taxes.toNumber(),
    insurance: property.insurance.toNumber(),
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-black leading-7 text-white uppercase tracking-tight sm:truncate">
              Edit Property
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Modifying details for: <span className="text-[#f8ed1a] font-bold">{property.titleEn || property.titleEs}</span>
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-8 shadow-2xl rounded-2xl border border-gray-800 relative">
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8ed1a] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            
            <EditForm property={plainProperty} />
        </div>

      </div>
    </div>
  );
}