'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react'; 
import { updateProperty } from '@/lib/actions';
import ImageUpload from '@/app/admin/ui/image-upload'; 

export default function EditForm({ property }: { property: any }) {
  const [state, formAction, isPending] = useActionState(updateProperty, null);
  const [mainImage, setMainImage] = useState<string>(property.mainImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(property.galleryImages || []);
  const [sellerImage, setSellerImage] = useState<string>(property.sellerImage || '');
  const [showSeller, setShowSeller] = useState<boolean>(property.showSeller || false);

  return (
    <form action={formAction} className="space-y-10">
      
      {/* HIDDEN ID FIELD */}
      <input type="hidden" name="id" value={property.id} />

      {/* SECTION 1: GENERAL CONFIGURATION */}
      <div className="border-b border-gray-800 pb-10">
        <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">General Configuration</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Status</label>
            <select 
              name="status" 
              defaultValue={property.status} 
              className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#f8ed1a] sm:text-sm sm:leading-6"
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_CONTRACT">Under Contract</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Slug (URL)</label>
            <div className="mt-2">
              <input
                type="text"
                name="slug"
                defaultValue={property.slug}
                required
                className="block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* NUEVO CAMPO: CALENDARIO */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Calendar Link (Booking)</label>
            <div className="mt-2">
              <input
                type="url"
                name="calendarLink"
                defaultValue={property.calendarLink || ''}
                placeholder="https://calendly.com/..."
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
                    defaultChecked={property.isFeatured}
                    className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-[#529e14] focus:ring-[#529e14]"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="isFeatured" className="font-bold text-white">Featured</label>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="isOffMarket"
                    name="isOffMarket"
                    type="checkbox"
                    defaultChecked={property.isOffMarket}
                    className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="isOffMarket" className="font-bold text-white">Off Market</label>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LOCATION */}
      <div className="border-b border-gray-800 pb-10">
        <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Location & Contact</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Address</label>
            <input type="text" name="address" defaultValue={property.address} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Contact Phone</label>
            <input 
                type="tel" 
                name="phoneNumber" 
                defaultValue={property.phoneNumber}
                className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" 
            />
          </div>

          <div className="sm:col-span-2 sm:col-start-1">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">City</label>
            <input type="text" name="city" defaultValue={property.city} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">State</label>
            <input type="text" name="state" defaultValue={property.state} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Zip Code</label>
            <input type="text" name="zipCode" defaultValue={property.zipCode} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>
        </div>
      </div>

      {/* SECTION 3: SPECS */}
      <div className="border-b border-gray-800 pb-10">
        <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Property Specs</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Bedrooms</label>
            <input type="number" name="bedrooms" defaultValue={property.bedrooms} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Bathrooms</label>
            <input type="number" step="0.5" name="bathrooms" defaultValue={property.bathrooms} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Sqft</label>
            <input type="number" name="sqft" defaultValue={property.sqft} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Year Built</label>
            <input type="number" name="yearBuilt" defaultValue={property.yearBuilt || ''} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>
        </div>
      </div>

      {/* SECTION 4: FINANCIALS */}
      <div className="border-b border-gray-800 pb-10 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg font-black leading-7 text-[#529e14] uppercase tracking-wide mb-6">Financial Data</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-white uppercase">Total Price ($)</label>
            <input type="number" step="0.01" name="price" defaultValue={String(property.price)} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-white uppercase">Down Payment ($)</label>
            <input type="number" step="0.01" name="downPayment" defaultValue={String(property.downPayment)} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold leading-6 text-white uppercase">Interest Rate (%)</label>
            <input type="number" step="0.01" name="interestRate" defaultValue={String(property.interestRate)} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Annual Taxes ($)</label>
            <input type="number" step="0.01" name="taxes" defaultValue={String(property.taxes)} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-bold leading-6 text-gray-400 uppercase">Annual Insurance ($)</label>
            <input type="number" step="0.01" name="insurance" defaultValue={String(property.insurance)} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
          </div>
        </div>
      </div>

      {/* SECTION 5: BILINGUAL */}
      <div className="border-b border-gray-800 pb-10">
        <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Bilingual Content</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          {/* English */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇺🇸</span>
                <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">English</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Title (EN)</label>
              <input type="text" name="titleEn" defaultValue={property.titleEn} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Description (EN)</label>
              <textarea name="descriptionEn" rows={4} defaultValue={property.descriptionEn} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
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
              <input type="text" name="titleEs" defaultValue={property.titleEs} required className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Description (ES)</label>
              <textarea name="descriptionEs" rows={4} defaultValue={property.descriptionEs} className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: MEDIA (DRAG & DROP S3) */}
      <div className="pb-8 border-b border-gray-800">
        <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Images & Features</h2>
        
        <input type="hidden" name="mainImage" value={mainImage} />
        <input type="hidden" name="galleryImages" value={galleryImages.join(',')} />

        <div className="grid grid-cols-1 gap-10">
          
          {/* Main Image Upload Component */}
          <ImageUpload 
            label="Main Image" 
            value={mainImage} 
            onChange={(url) => setMainImage(url as string)} 
          />

          {/* Gallery Upload Component */}
          <ImageUpload 
            label="Gallery Images" 
            value={galleryImages} 
            onChange={(urls) => setGalleryImages(urls as string[])} 
            multiple={true}
          />
          {/* VIDEO URL */}
        <div className="mt-8">
            <label className="block text-sm font-bold text-[#f8ed1a] uppercase">Video Tour URL (YouTube/Vimeo)</label>
            <div className="mt-2">
              <input
                type="url"
                name="videoUrl"
                defaultValue={property.videoUrl || ''}
                placeholder="https://www.youtube.com/watch?v=..."
                className="block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Paste the full link. It will be shown as a button in the gallery.</p>
            </div>
        </div>
          {/* Features */}
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase">Features (Comma separated)</label>
            <textarea 
                name="features" 
                rows={3} 
                defaultValue={property.features.join(', ')} 
                className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm"
            ></textarea>
          </div>
        </div>
      </div>

      {/* SECTION 7: SELLER INFORMATION (NUEVA SECCIÓN) */}
      <div className="border-b border-gray-800 pb-10 pt-10">
        <h2 className="text-lg font-black leading-7 text-white uppercase tracking-wide mb-6">Seller Information</h2>
        
        {/* Checkbox para habilitar la sección */}
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

        {/* Campos Condicionales */}
        {showSeller && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="sm:col-span-2">
                    <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Role Title</label>
                    <select 
                      name="sellerType" 
                      defaultValue={property.sellerType || 'OWNER'} 
                      className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#f8ed1a] sm:text-sm"
                    >
                      <option value="OWNER">Owner (Dueño)</option>
                      <option value="AGENT">Sales Agent (Vendedor)</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">Seller Name</label>
                    <input 
                        type="text" 
                        name="sellerName" 
                        defaultValue={property.sellerName || ''}
                        className="mt-2 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" 
                    />
                </div>

                <div className="sm:col-span-6">
                    <input type="hidden" name="sellerImage" value={sellerImage} />
                    
                    <ImageUpload 
                        label="Seller Photo" 
                        value={sellerImage} 
                        onChange={(url) => setSellerImage(url as string)} 
                    />
                </div>
            </div>
        )}
      </div>

      {state?.message && (
        <div className="rounded-md bg-red-900/30 p-4 border border-red-800">
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-x-6 pt-6">
        <Link href="/admin" className="text-sm font-bold leading-6 text-gray-400 hover:text-white">Cancel</Link>
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-lg px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all ${
            isPending ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#529e14] hover:bg-[#458510] hover:scale-105'
          }`}
        >
          {isPending ? 'Saving...' : 'Update Property'}
        </button>
      </div>
    </form>
  );
}