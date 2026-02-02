'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getPresignedUrl } from '@/lib/s3-actions'; 
import Image from 'next/image';

export interface ImageFile {
  id?: string;
  url: string;
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  file?: File;
}

interface ImageUploadProps {
  label: string;
  value: ImageFile[]; 
  onChange: (images: ImageFile[]) => void;
  multiple?: boolean;
  disableMetadata?: boolean; // <--- NUEVA PROP
}

export default function ImageUpload({ 
  label, 
  value = [], 
  onChange, 
  multiple = false,
  disableMetadata = false // Por defecto es falso (las casas sí llevan metadata)
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageFile | null>(null); 
  const [editIndex, setEditIndex] = useState<number>(-1);

  // --- DROPZONE LOGIC ---
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const newImages: ImageFile[] = [];

      for (const file of acceptedFiles) {
        const { signedUrl, publicUrl } = await getPresignedUrl(file.type);
        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        newImages.push({
            url: publicUrl,
            altText: '',
            title: '',
            caption: '',
            description: ''
        });
      }

      if (multiple) {
        onChange([...value, ...newImages]);
      } else {
        onChange([newImages[0]]);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  }, [multiple, value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple 
  });

  // --- HANDLERS ---
  const removeImage = (indexToRemove: number) => {
    const updated = value.filter((_, i) => i !== indexToRemove);
    onChange(updated);
  };

  const openEditModal = (img: ImageFile, index: number) => {
    setEditingImage({ ...img });
    setEditIndex(index);
  };

  const saveMetadata = () => {
    if (editingImage && editIndex > -1) {
        const updatedList = [...value];
        updatedList[editIndex] = editingImage;
        onChange(updatedList);
        setEditingImage(null);
        setEditIndex(-1);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">{label}</label>
      
      {/* GRID DE IMÁGENES */}
      <div className="flex flex-wrap gap-6">
        {value.map((img, i) => (
             <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-600 group bg-gray-900">
                <Image src={img.url} alt={img.altText || "Image"} fill className="object-cover" />
                
                {/* BOTÓN ELIMINAR (Siempre visible) */}
                <button 
                    type="button" 
                    onClick={() => removeImage(i)} 
                    className="absolute top-0 right-0 bg-red-600/90 hover:bg-red-600 text-white p-1.5 z-10"
                    title="Remove"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>

                {/* BOTÓN EDITAR (Oculto si disableMetadata es true) */}
                {!disableMetadata && (
                    <button 
                        type="button" 
                        onClick={() => openEditModal(img, i)} 
                        className="absolute top-0 left-0 bg-blue-600/90 hover:bg-blue-600 text-white p-1.5 z-10"
                        title="Edit Alt Text & Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                    </button>
                )}

                {/* ALERTA MISSING ALT (Oculta si disableMetadata es true) */}
                {!disableMetadata && !img.altText && (
                    <div className="absolute bottom-0 w-full bg-red-500/50 text-[10px] text-center text-white font-bold py-1">
                        MISSING ALT
                    </div>
                )}
             </div>
        ))}
      </div>

      {/* DROPZONE */}
      <div 
        {...getRootProps()} 
        className={`
          mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
          ${isDragActive ? 'border-[#529e14] bg-[#529e14]/10' : 'border-gray-600 hover:border-[#f8ed1a] bg-gray-800'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {uploading ? (
             <div className="text-[#f8ed1a] font-bold animate-pulse">Uploading...</div>
          ) : (
             <p className="text-sm text-gray-400">Drag & drop or click to upload</p>
          )}
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                    <h3 className="text-white font-bold uppercase text-sm">Image Details</h3>
                    <button onClick={() => setEditingImage(null)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Preview */}
                    <div className="flex justify-center mb-4">
                        <div className="relative w-32 h-32 rounded bg-gray-900 border border-gray-700">
                            <Image src={editingImage.url} alt="Preview" fill className="object-contain" />
                        </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div>
                        <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-1">Alt Text (Accessibility)</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a]"
                            value={editingImage.altText || ''}
                            onChange={(e) => setEditingImage({...editingImage, altText: e.target.value})}
                            placeholder="Describe the image..."
                        />
                    </div>
                    {/* ... Resto de inputs (Title, Caption, Desc) ... */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-[#f8ed1a]"
                            value={editingImage.title || ''}
                            onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Caption</label>
                        <textarea 
                            rows={2}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-[#f8ed1a]"
                            value={editingImage.caption || ''}
                            onChange={(e) => setEditingImage({...editingImage, caption: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Long Description</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-[#f8ed1a]"
                            value={editingImage.description || ''}
                            onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
                    <button 
                        type="button"
                        onClick={() => setEditingImage(null)}
                        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={saveMetadata}
                        className="px-4 py-2 text-sm font-bold bg-[#529e14] text-white rounded hover:bg-[#458510]"
                    >
                        Save Metadata
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}