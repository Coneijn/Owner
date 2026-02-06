'use client';

import Link from 'next/link';
import { updatePost } from '@/lib/blog-actions';
import { useState } from 'react';
import ImageUpload, { ImageFile } from '@/app/admin/ui/image-upload';
import DeletePostButton from './delete-post-button';

interface PostData {
  id: string;
  slug: string;
  isPublished: boolean;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  mainImage: string | null;
}

export default function EditPostForm({ post }: { post: PostData }) {
  // Estado para la imagen (adaptamos el string simple a un array para tu componente ImageUpload)
  const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>(
    post.mainImage ? [{ url: post.mainImage }] : []
  );

  return (
    <form action={updatePost} className="space-y-8 bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-2xl relative">
      
      {/* ID Oculto */}
      <input type="hidden" name="id" value={post.id} />

      {/* --- HEADER DEL FORMULARIO --- */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-6">
        <div>
            <h2 className="text-xl font-black text-white uppercase">Post Configuration</h2>
            <p className="text-gray-400 text-sm mt-1">Manage URL and visibility.</p>
        </div>
        {/* Botón de Borrar situado aquí */}
        <DeletePostButton id={post.id} />
      </div>

      {/* 1. CONFIGURACIÓN GENERAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Slug (URL)</label>
            <input 
                type="text" 
                name="slug" 
                defaultValue={post.slug} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] focus:ring-[#f8ed1a]" 
            />
        </div>
        <div className="flex items-center h-full pt-6">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-900 rounded border border-gray-700 w-full hover:border-[#529e14] transition-colors">
                <input 
                    type="checkbox" 
                    name="isPublished" 
                    defaultChecked={post.isPublished} 
                    className="w-5 h-5 accent-[#529e14]" 
                />
                <span className="font-bold text-white uppercase text-sm">Publish on Site</span>
            </label>
        </div>
      </div>

      {/* 2. IMAGEN PRINCIPAL */}
      <div className="border-t border-gray-700 pt-6">
         <input type="hidden" name="mainImage" value={mainImageFiles[0]?.url || ''} />
         <ImageUpload 
            label="Cover Image" 
            value={mainImageFiles} 
            onChange={setMainImageFiles} 
            multiple={false} 
            disableMetadata={true} // El blog simple no necesita alt text complejo por ahora
         />
      </div>

      {/* 3. CONTENIDO EN INGLÉS */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-sm font-black text-[#f8ed1a] uppercase mb-4">🇺🇸 English Content</h3>
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title (EN)</label>
                <input 
                    type="text" 
                    name="titleEn" 
                    defaultValue={post.titleEn} 
                    required 
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content (Markdown/HTML)</label>
                <textarea 
                    name="contentEn" 
                    rows={12} 
                    defaultValue={post.contentEn} 
                    required 
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white font-mono text-sm" 
                />
            </div>
        </div>
      </div>

      {/* 4. CONTENIDO EN ESPAÑOL */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-sm font-black text-[#f8ed1a] uppercase mb-4">🇲🇽 Spanish Content</h3>
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título (ES)</label>
                <input 
                    type="text" 
                    name="titleEs" 
                    defaultValue={post.titleEs} 
                    required 
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contenido (Markdown/HTML)</label>
                <textarea 
                    name="contentEs" 
                    rows={12} 
                    defaultValue={post.contentEs} 
                    required 
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white font-mono text-sm" 
                />
            </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="sticky bottom-0 z-40 bg-[#1a1a1a]/95 backdrop-blur py-4 border-t border-gray-800 flex items-center justify-end gap-4 -mx-8 px-8 -mb-8 rounded-b-2xl">
        <Link href="/admin/blog" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Cancel
        </Link>
        <button 
            type="submit" 
            className="bg-[#529e14] hover:bg-[#458510] text-white px-8 py-3 rounded-lg font-black uppercase tracking-wide shadow-lg hover:scale-105 transition-all"
        >
            Update Post
        </button>
      </div>

    </form>
  );
}