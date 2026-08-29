'use client';

import { useState } from 'react';
import Link from 'next/link';

// Componente colapsable reutilizado
const AccordionSection = ({ title, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900/30 overflow-hidden mb-4 transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wide">{title}</h2>
        </div>
        <span className={`transform transition-transform duration-200 text-[#f8ed1a] ${isOpen ? 'rotate-180' : ''}`}>
           V
        </span>
      </button>
      <div className={isOpen ? 'block p-6 border-t border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200' : 'hidden'}>
        {children}
      </div>
    </div>
  );
};

export default function SeoEditClient({ property, saveAction }: { property: any, saveAction: (formData: FormData) => void }) {
  const [isPending, setIsPending] = useState(false);
  
  // Estado para la lista completa de imagenes
  const [imagesData, setImagesData] = useState(property.allImages.map((img: any) => ({
     id: img.id,
     url: img.url,
     altText: img.altText || '',
     title: img.title || '',
     caption: img.caption || '',
     description: img.description || '',
     isMain: img.isMain
  })));

  // Estado para controlar el modal
  const [editingImage, setEditingImage] = useState<any>(null);

  const handleOpenModal = (img: any) => {
      setEditingImage({ ...img }); // Clonamos para no afectar el original hasta guardar
  };

  const handleCloseModal = () => {
      setEditingImage(null);
  };

  const handleSaveModal = () => {
      setImagesData((prev: any) => prev.map((img: any) => img.id === editingImage.id ? editingImage : img));
      setEditingImage(null);
  };

  const handleDeleteImage = (id: string) => {
      // Si quisieras que el boton de borrar quite la imagen de la lista de metadatos (opcional)
      // setImagesData((prev: any) => prev.filter((img: any) => img.id !== id));
      alert("Para borrar la imagen por completo, utiliza el editor general de la propiedad.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsPending(true);
     const formData = new FormData(e.currentTarget);
     formData.append('imagesData', JSON.stringify(imagesData));
     await saveAction(formData);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-black leading-7 text-white uppercase tracking-tight sm:truncate">
              Edit SEO & Content
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Modifying content for: <span className="text-[#f8ed1a] font-bold">{property.titleEn || 'Property'}</span>
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
            <Link
              href="/admin/image-seo"
              className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              Back
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <input type="hidden" name="id" value={property.id} />

          <AccordionSection title="Content & Descriptions" defaultOpen={true}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">EN - English Content</h3>
                    <input type="text" name="titleEn" defaultValue={property.titleEn} placeholder="Title EN" required className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                    <textarea name="descriptionEn" defaultValue={property.descriptionEn} rows={6} placeholder="Description EN" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">ES - Spanish Content</h3>
                    <input type="text" name="titleEs" defaultValue={property.titleEs} placeholder="Title ES" required className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                    <textarea name="descriptionEs" defaultValue={property.descriptionEs} rows={6} placeholder="Description ES" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                </div>
            </div>
          </AccordionSection>

          <AccordionSection title="SEO Metadata" defaultOpen={true}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO English</h4>
                    <input type="text" name="seoTitleEn" defaultValue={property.seoTitleEn} placeholder="Meta Title" className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                    <textarea name="seoDescriptionEn" defaultValue={property.seoDescriptionEn} rows={2} placeholder="Meta Desc" className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                    <input type="text" name="focusKeywordEn" defaultValue={property.focusKeywordEn} placeholder="Focus Keyword" className="mt-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO Spanish</h4>
                    <input type="text" name="seoTitleEs" defaultValue={property.seoTitleEs} placeholder="Meta Title" className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                    <textarea name="seoDescriptionEs" defaultValue={property.seoDescriptionEs} rows={2} placeholder="Meta Desc" className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                    <input type="text" name="focusKeywordEs" defaultValue={property.focusKeywordEs} placeholder="Focus Keyword" className="mt-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Photos, Video & Descriptions" defaultOpen={true}>
             {/* SECCION MAIN IMAGE */}
             <div className="mb-8">
                 <h4 className="text-sm font-black text-[#f8ed1a] uppercase mb-4">Main Image</h4>
                 <div className="flex flex-wrap gap-4">
                     {imagesData.filter((img: any) => img.isMain).map((img: any) => (
                         <div key={img.id} className="relative w-36 h-36 rounded-lg overflow-hidden border border-gray-700 group bg-black shadow-lg">
                             <img src={img.url} alt="thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                             
                             {/* Boton Editar (Azul) */}
                             <button type="button" onClick={() => handleOpenModal(img)} className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded transition-colors shadow-md">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.12l-2.827.9.9-2.827a4.5 4.5 0 0 1 1.12-1.89l10.828-10.828Zm0 0L19.5 7.125" />
                                 </svg>
                             </button>

                             {/* Boton Borrar (Rojo) */}
                             <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded transition-colors shadow-md">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                 </svg>
                             </button>

                             {/* Banner Missing Alt */}
                             {!img.altText && (
                                 <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] font-black text-center py-1.5 uppercase tracking-wider">
                                     Missing Alt
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>

             {/* SECCION GALLERY IMAGES */}
             <div className="mb-8 border-t border-gray-800 pt-8">
                 <h4 className="text-sm font-black text-[#f8ed1a] uppercase mb-4">Gallery Images</h4>
                 <div className="flex flex-wrap gap-4">
                     {imagesData.filter((img: any) => !img.isMain).length === 0 && (
                         <p className="text-sm text-gray-500">No gallery images found.</p>
                     )}
                     {imagesData.filter((img: any) => !img.isMain).map((img: any) => (
                         <div key={img.id} className="relative w-36 h-36 rounded-lg overflow-hidden border border-gray-700 group bg-black shadow-lg">
                             <img src={img.url} alt="thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                             
                             <button type="button" onClick={() => handleOpenModal(img)} className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded transition-colors shadow-md">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.12l-2.827.9.9-2.827a4.5 4.5 0 0 1 1.12-1.89l10.828-10.828Zm0 0L19.5 7.125" />
                                 </svg>
                             </button>

                             <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded transition-colors shadow-md">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                 </svg>
                             </button>

                             {!img.altText && (
                                 <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] font-black text-center py-1.5 uppercase tracking-wider">
                                     Missing Alt
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>

             <div className="border-t border-gray-800 pt-8">
                 <h4 className="text-sm font-black text-[#f8ed1a] uppercase mb-2">Video Tour URL</h4>
                 <input type="url" name="videoUrl" defaultValue={property.videoUrl} placeholder="https://youtube.com..." className="block w-full rounded bg-gray-900 border border-gray-700 text-white focus:ring-[#f8ed1a] sm:text-sm p-3 shadow-inner" />
             </div>
          </AccordionSection>

          <div className="flex items-center justify-end gap-x-6 pt-6 border-t border-gray-800 pb-16">
            <Link href="/admin/image-seo" className="text-sm font-bold leading-6 text-gray-400 hover:text-white transition-colors">
               Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#529e14] px-8 py-3 text-sm font-black text-white shadow-lg hover:bg-[#458510] hover:scale-105 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save SEO & Content'}
            </button>
          </div>
        </form>

        {/* MODAL DE EDICION DE IMAGEN */}
        {editingImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#1e2333] border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
                    
                    {/* Header del Modal */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50">
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Image Details</h3>
                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cuerpo del Modal */}
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-32 bg-black rounded-lg overflow-hidden border border-gray-600 shadow-md">
                                <img src={editingImage.url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#f8ed1a] uppercase mb-1">Alt Text (Accessibility)</label>
                            <input 
                                type="text" 
                                value={editingImage.altText} 
                                onChange={(e) => setEditingImage({...editingImage, altText: e.target.value})}
                                placeholder="Describe the image..."
                                className="block w-full rounded bg-[#131722] border border-gray-700 text-white focus:ring-[#f8ed1a] sm:text-sm p-3" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Title</label>
                            <input 
                                type="text" 
                                value={editingImage.title} 
                                onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                                className="block w-full rounded bg-[#131722] border border-gray-700 text-white focus:ring-[#f8ed1a] sm:text-sm p-3" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Caption</label>
                            <textarea 
                                rows={2}
                                value={editingImage.caption} 
                                onChange={(e) => setEditingImage({...editingImage, caption: e.target.value})}
                                className="block w-full rounded bg-[#131722] border border-gray-700 text-white focus:ring-[#f8ed1a] sm:text-sm p-3" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Long Description</label>
                            <textarea 
                                rows={3}
                                value={editingImage.description} 
                                onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                                className="block w-full rounded bg-[#131722] border border-gray-700 text-white focus:ring-[#f8ed1a] sm:text-sm p-3" 
                            />
                        </div>
                    </div>

                    {/* Footer del Modal */}
                    <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-700 bg-gray-900/50">
                        <button type="button" onClick={handleCloseModal} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSaveModal}
                            className="rounded bg-[#529e14] px-6 py-2.5 text-sm font-black text-white hover:bg-[#458510] transition-colors"
                        >
                            Save Metadata
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
     