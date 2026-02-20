'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload, { ImageFile } from '@/app/admin/ui/image-upload'; 
import { createSellerProfile, updateSellerProfile } from '@/lib/actions'; 

// Definimos la forma de los datos iniciales
type SellerData = {
  id: string;
  sellerName: string | null;
  sellerType: string;
  sellerImage: string | null;
};

export default function SellerForm({ initialData }: { initialData?: SellerData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Verificamos si estamos en modo edición
  const isEditing = !!initialData;

  // Si hay datos iniciales y tiene imagen, pre-cargamos el estado del ImageUpload
  const [sellerImage, setSellerImage] = useState<ImageFile[]>(
    initialData?.sellerImage ? [{ url: initialData.sellerImage }] : []
  );

  const formAction = (formData: FormData) => {
    setError(null);

    // Inyectamos la URL de la imagen
    if (sellerImage.length > 0 && sellerImage[0].url) {
      formData.append('sellerImage', sellerImage[0].url);
    } else {
       formData.append('sellerImage', ''); // Enviamos vacío si borraron la foto
    }

    startTransition(async () => {
      try {
        let result;
        if (isEditing) {
          // Si editamos, llamamos a la acción de update pasándole el ID
          result = await updateSellerProfile(initialData.id, null, formData);
        } else {
          // Si creamos, llamamos a la acción de create
          result = await createSellerProfile(null, formData);
        }
        
        if (result?.message) {
          setError(result.message);
        }
      } catch (err) {
        setError('Ocurrió un error inesperado al guardar el perfil.');
      }
    });
  };

  return (
    <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl border border-gray-800">
      
      <div className="mb-8 border-b-2 border-gray-800 pb-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
          {isEditing ? 'Edit' : 'Create'} <span className="text-[#f8ed1a]">Seller Profile</span>
        </h2>
        <p className="text-gray-400 mt-2 font-medium text-sm">
          {isEditing 
            ? 'Update the public details for this profile.' 
            : 'Create a public profile for a property owner or sales agent.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border-l-4 border-red-500 text-red-200 rounded-md font-bold text-sm">
          ⚠ {error}
        </div>
      )}

      <form action={formAction} className="space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#f8ed1a] uppercase tracking-wide mb-2">
              Public Display Name *
            </label>
            <input
              type="text"
              name="sellerName"
              required
              defaultValue={initialData?.sellerName || ''}
              placeholder="e.g. John Doe"
              className="w-full p-4 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#f8ed1a] outline-none transition-all placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#f8ed1a] uppercase tracking-wide mb-2">
              Role / Type *
            </label>
            <select
              name="sellerType"
              defaultValue={initialData?.sellerType || 'OWNER'}
              className="w-full p-4 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#f8ed1a] outline-none transition-all font-medium appearance-none"
            >
              <option value="OWNER">Property Owner (OWNER)</option>
              <option value="AGENT">Sales Agent (AGENT)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
           <ImageUpload 
              label="Profile Avatar (Optional)" 
              value={sellerImage} 
              onChange={setSellerImage} 
              multiple={false} 
              disableMetadata={true} 
           />
        </div>

        <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-800 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-400 font-bold uppercase tracking-wide hover:text-white transition-colors"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-[#f8ed1a] hover:bg-[#e6db15] text-[#1a1a1a] font-black uppercase tracking-wide rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? 'Saving...' : (isEditing ? 'Update Profile' : 'Save Profile')}
          </button>
        </div>
      </form>
    </div>
  );
}