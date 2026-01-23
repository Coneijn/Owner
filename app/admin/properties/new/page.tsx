'use client'; 

import Link from 'next/link';
import { createProperty } from '@/lib/actions';
import { useActionState, useState } from 'react'; 
import ImageUpload, { ImageFile } from '@/app/admin/ui/image-upload'; 

export default function NewPropertyPage() {
    const [state, formAction, isPending] = useActionState(createProperty, null);
    
    const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>([]);
    const [galleryImageFiles, setGalleryImageFiles] = useState<ImageFile[]>([]);

    const [sellerImage, setSellerImage] = useState<ImageFile[]>([]);
    const [showSeller, setShowSeller] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-black leading-7 text-white uppercase tracking-tight sm:truncate">
              New Property
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Add a new home to the public catalog.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-10 bg-[#1a1a1a] p-8 shadow-2xl rounded-2xl border border-gray-800 relative">
          
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8ed1a] opacity-5 rounded-full blur-3xl pointer-events-none"></div>

          {/* SECTION 1: GENERAL CONFIGURATION */}
          <div className="border-b border-gray-800 pb-10">
            <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">General Configuration</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Status</label>
                <select name="status" className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#f8ed1a] sm:text-sm sm:leading-6">
                  <option value="AVAILABLE">Available</option>
                  <option value="UNDER_CONTRACT">Under Contract</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Slug (URL Identifier)</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="slug"
                    placeholder="ex: family-home-charlotte-nc"
                    required
                    className="block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#f8ed1a] sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* CALENDARIO */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Calendar Link (Booking)</label>
                <div className="mt-2">
                  <input
                    type="url"
                    name="calendarLink"
                    placeholder="https://cal.com/duenodueno..."
                    className="block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* FLAGS: Featured & Off Market */}
              <div className="sm:col-span-6 flex gap-8 pt-4">
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        id="isFeatured"
                        name="isFeatured"
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-[#529e14] focus:ring-[#529e14]"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="isFeatured" className="font-bold text-white">Featured Property</label>
                      <p className="text-gray-500 text-xs">Show on home page slider.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        id="isOffMarket"
                        name="isOffMarket"
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="isOffMarket" className="font-bold text-white">Off Market</label>
                      <p className="text-gray-500 text-xs">Hidden from public catalog.</p>
                    </div>
                  </div>
              </div>

            </div>
          </div>

          {/* SECTION: PAGE SEO & METADATA (NUEVO) */}
          <div className="border-b border-gray-800 pb-10">
            <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Page SEO & Meta Tags</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                
                {/* SEO English */}
                <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🇺🇸</span>
                        <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">SEO English</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Meta Title (Browser Tab)</label>
                        <input type="text" name="seoTitleEn" className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        <p className="text-[10px] text-gray-500 mt-1">Recommended: 50-60 characters</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Meta Description (Google Snippet)</label>
                        <textarea name="seoDescriptionEn" rows={3} className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                        <p className="text-[10px] text-gray-500 mt-1">Recommended: 150-160 characters</p>
                    </div>
                </div>

                {/* SEO Spanish */}
                <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🇲🇽</span>
                        <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">SEO Español</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Meta Título</label>
                        <input type="text" name="seoTitleEs" className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Meta Descripción</label>
                        <textarea name="seoDescriptionEs" rows={3} className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                    </div>
                </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION & CONTACT */}
          <div className="border-b border-gray-800 pb-10">
            <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Location & Contact</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              <div className="sm:col-span-4">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Address</label>
                <input type="text" name="address" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Contact Phone</label>
                <input 
                    type="tel" 
                    name="phoneNumber" 
                    placeholder="901-555-0123" 
                    className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" 
                />
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">City</label>
                <input type="text" name="city" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">State</label>
                <input type="text" name="state" defaultValue="TN" className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Zip Code</label>
                <input type="text" name="zipCode" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>
            </div>
          </div>

          {/* SECTION 3: SPECS */}
          <div className="border-b border-gray-800 pb-10">
            <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Property Specs</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              
              <div className="sm:col-span-1">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Bedrooms</label>
                <input type="number" name="bedrooms" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Bathrooms</label>
                <input type="number" step="0.5" name="bathrooms" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Sqft</label>
                <input type="number" name="sqft" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Year Built</label>
                <input type="number" name="yearBuilt" className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>
            </div>
          </div>

          {/* SECTION 4: FINANCIALS */}
          <div className="border-b border-gray-800 pb-10 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <h2 className="text-lg font-black leading-7 text-[#529e14] uppercase tracking-wide mb-6">Financial Data (Owner Finance)</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-white uppercase">Total Price ($)</label>
                <input type="number" step="0.01" name="price" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-white uppercase">Down Payment ($)</label>
                <input type="number" step="0.01" name="downPayment" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold leading-6 text-white uppercase">Interest Rate (%)</label>
                <input type="number" step="0.01" name="interestRate" defaultValue="10.0" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Annual Taxes ($)</label>
                <input type="number" step="0.01" name="taxes" className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Annual Insurance ($)</label>
                <input type="number" step="0.01" name="insurance" className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
              </div>
            </div>
          </div>

          {/* SECTION 5: BILINGUAL CONTENT */}
          <div className="border-b border-gray-800 pb-10">
            <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Content (Bilingual)</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
              
              {/* English */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                     <span className="text-xl">🇺🇸</span>
                     <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">English</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Title (EN)</label>
                  <input type="text" name="titleEn" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Description (EN)</label>
                  <textarea name="descriptionEn" rows={4} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                </div>
              </div>

              {/* Spanish */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                     <span className="text-xl">🇲🇽</span>
                     <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">Spanish</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Title (ES)</label>
                  <input type="text" name="titleEs" required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Description (ES)</label>
                  <textarea name="descriptionEs" rows={4} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 6: MEDIA (UPDATED WITH METADATA) */}
          <div className="pb-8 border-b border-gray-800 pt-10">
             <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Images & Features</h2>
             
             {/* INPUTS OCULTOS JSON PARA SERVER ACTIONS */}
             {/* Importante: Parsear estos strings en el backend */}
             <input type="hidden" name="mainImageData" value={JSON.stringify(mainImageFiles[0] || null)} />
             <input type="hidden" name="galleryImagesData" value={JSON.stringify(galleryImageFiles)} />
             
             <div className="grid grid-cols-1 gap-10">
                {/* Componente Drag & Drop Actualizado: Main Image */}
                <ImageUpload 
                  label="Main Image" 
                  value={mainImageFiles} 
                  onChange={(files) => setMainImageFiles(files)}
                  multiple={false} 
                />

                {/* Componente Drag & Drop Actualizado: Gallery */}
                <ImageUpload 
                  label="Gallery Images" 
                  value={galleryImageFiles} 
                  onChange={(files) => setGalleryImageFiles(files)} 
                  multiple={true}
                />

                {/* NUEVO INPUT: VIDEO URL */}
                <div className="mt-2">
                    <label className="block text-sm font-bold text-[#f8ed1a] uppercase">Video Tour URL (YouTube/Vimeo)</label>
                    <div className="mt-2">
                      <input
                        type="url"
                        name="videoUrl"
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Paste the full link. It will be shown as a button in the gallery.</p>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase">Features (Comma separated)</label>
                  <textarea name="features" rows={3} placeholder="Garage, Fireplace, Pool, Hardwood Floors..." className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                </div>
             </div>
          </div>

          {/* SECTION 7: SELLER INFORMATION */}
          <div className="border-b border-gray-800 pb-10 pt-10">
            <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Seller Information</h2>
            
            <div className="relative flex items-start mb-8">
                <div className="flex h-6 items-center">
                  <input
                    id="showSeller"
                    name="showSeller"
                    type="checkbox"
                    checked={showSeller}
                    onChange={(e) => setShowSeller(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-[#529e14] focus:ring-[#529e14]"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="showSeller" className="font-bold text-white">Enable "Meet Your Seller" Section</label>
                  <p className="text-gray-500 text-xs">If checked, the seller profile will be displayed on the property page.</p>
                </div>
            </div>

            {showSeller && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Role Title</label>
                        <select 
                          name="sellerType" 
                          defaultValue="OWNER"
                          className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#f8ed1a] sm:text-sm"
                        >
                          <option value="OWNER">Owner (Dueño)</option>
                          <option value="AGENT">Sales Agent (Vendedor)</option>
                        </select>
                    </div>

                    <div className="sm:col-span-4">
                        <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Seller Name</label>
                        <input 
                            type="text" 
                            name="sellerName" 
                            placeholder="e.g. Maria Gonzalez"
                            className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" 
                        />
                    </div>

                    <div className="sm:col-span-6">
                        <input type="hidden" name="sellerImage" value={sellerImage[0]?.url || ''} />
                        
                        <ImageUpload 
                            label="Seller Photo" 
                            value={sellerImage} 
                            onChange={(files) => setSellerImage(files)} 
                            multiple={false}
                        />
                    </div>
                </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-x-6 pt-6">
            <Link href="/admin" className="text-sm font-bold leading-6 text-gray-400 hover:text-white transition-colors">Cancel</Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#529e14] px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-[#458510] hover:scale-105 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save Property'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}