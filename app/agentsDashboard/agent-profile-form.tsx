"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/app/components/ui/image-upload';
// Ajusta la ruta de tus Server Actions donde haces las actualizaciones (o crea una action específica)
import { updateAgentProfile } from '@/lib/user-actions'; 

interface AgentProfileFormProps {
  initialData: {
    id: string;
    agentName: string;
    agentImage: string;
  };
}

export default function AgentProfileForm({ initialData }: AgentProfileFormProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initialData.agentImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!imageUrl) {
      setError("Please upload a profile photo to continue.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Llamada a tu Server Action (Deberás crearla si no existe)
      await updateAgentProfile(initialData.id, { agentImage: imageUrl });
      
      // Refrescamos la ruta para que la página del servidor vuelva a evaluar "isFirstLogin"
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Upload Profile Photo
        </label>
        
        <ImageUpload
  label="Profile Photo"
  value={imageUrl ? [{ url: imageUrl }] : []} // Envolvemos el string en el formato que espera
  onChange={(images) => {
    // Extraemos el string de la URL del arreglo que devuelve el componente
    setImageUrl(images.length > 0 ? images[0].url : ''); 
  }}
  multiple={false} // Evitamos que pueda subir varias fotos
  disableMetadata={true} // Ocultamos los botones de SEO/Alt Text para fotos de perfil
/>
        
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !imageUrl}
        className="w-full bg-[#f8ed1a] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[#d6cc15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Complete Profile & Enter Dashboard'}
      </button>
    </div>
  );
}