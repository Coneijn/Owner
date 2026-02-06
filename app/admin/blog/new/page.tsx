'use client';

import { createPost } from '@/lib/blog-actions';
import { useState } from 'react';
import ImageUpload, { ImageFile } from '@/app/admin/ui/image-upload';
import Link from 'next/link'; // <--- 1. Importamos Link

export default function NewPostPage() {
  const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>([]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER CON BREADCRUMBS Y BOTÓN ATRÁS --- */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="min-w-0 flex-1">
            {/* Breadcrumbs Pequeños */}
            <nav className="flex text-sm text-gray-500 mb-2 font-bold uppercase tracking-wide">
                <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
                <span className="mx-2">/</span>
                <Link href="/admin/blog" className="hover:text-white transition-colors">Blog</Link>
                <span className="mx-2">/</span>
                <span className="text-[#f8ed1a]">New</span>
            </nav>

            <h2 className="text-3xl font-black leading-7 text-white uppercase tracking-tight sm:truncate">
              Create New Post
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Write an article for the news section.
            </p>
          </div>
          
          {/* Botón de Cancelar / Volver */}
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/admin/blog"
              className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors uppercase"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* --- FORMULARIO --- */}
        <form action={createPost} className="space-y-8 bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-2xl relative">
            
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8ed1a] opacity-5 rounded-full blur-3xl pointer-events-none"></div>

            {/* URL Slug & Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
               <div>
                 <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-2">Slug (URL)</label>
                 <input 
                   type="text" 
                   name="slug" 
                   className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] outline-none transition-all" 
                   placeholder="e.g. my-new-post" 
                 />
                 <p className="text-[10px] text-gray-500 mt-1">Leave empty to auto-generate from English title.</p>
               </div>
               <div className="flex items-center pt-6">
                 <label className="flex items-center cursor-pointer gap-3 p-3 bg-gray-900 rounded border border-gray-700 w-full hover:border-[#529e14] transition-colors">
                    <input type="checkbox" name="isPublished" className="w-5 h-5 accent-[#529e14]" />
                    <span className="ml-2 font-bold uppercase text-sm">Publish Immediately</span>
                 </label>
               </div>
            </div>

            {/* Imagen */}
            <div className="relative z-10">
                <input type="hidden" name="mainImage" value={mainImageFiles[0]?.url || ''} />
                <ImageUpload 
                  label="Cover Image" 
                  value={mainImageFiles} 
                  onChange={setMainImageFiles} 
                  multiple={false} 
                  disableMetadata={true} 
                />
            </div>

            {/* Contenido Inglés */}
            <div className="border-t border-gray-700 pt-6 relative z-10">
              <h3 className="text-sm font-black text-[#f8ed1a] uppercase mb-4 flex items-center gap-2">
                 🇺🇸 English Content
              </h3>
              <div className="space-y-4">
                  <input 
                    type="text" 
                    name="titleEn" 
                    placeholder="Post Title (EN)" 
                    className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] outline-none font-bold" 
                    required 
                  />
                  <textarea 
                    name="contentEn" 
                    rows={8} 
                    placeholder="Write content here (Markdown or HTML supported)..." 
                    className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] outline-none font-mono text-sm" 
                    required 
                  />
              </div>
            </div>

            {/* Contenido Español */}
            <div className="border-t border-gray-700 pt-6 relative z-10">
              <h3 className="text-sm font-black text-[#f8ed1a] uppercase mb-4 flex items-center gap-2">
                 🇲🇽 Spanish Content
              </h3>
              <div className="space-y-4">
                  <input 
                    type="text" 
                    name="titleEs" 
                    placeholder="Título del Post (ES)" 
                    className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] outline-none font-bold" 
                    required 
                  />
                  <textarea 
                    name="contentEs" 
                    rows={8} 
                    placeholder="Escribe el contenido aquí..." 
                    className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] outline-none font-mono text-sm" 
                    required 
                  />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-gray-800 flex items-center justify-end gap-4 relative z-10">
                <Link href="/admin/blog" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Cancel
                </Link>
                <button 
                  type="submit" 
                  className="bg-[#529e14] px-8 py-3 rounded-lg font-black text-white hover:bg-green-700 uppercase shadow-lg transition-all hover:scale-105"
                >
                  Save Post
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}