'use client';

import Link from 'next/link';
import { updatePost } from '@/lib/blog-actions';
import { useState } from 'react';
import ImageUpload, { ImageFile } from '@/app/components/ui/image-upload';
import DeletePostButton from './delete-post-button';
import HtmlEditor from '@/app/components/ui/html-editor';

// Interface matching the updated Schema
interface PostData {
  id: string;
  slug: string;
  isPublished: boolean;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  mainImage: string | null;
  
  // New Fields
  seoTitleEn?: string | null;
  seoDescEn?: string | null;
  focusKeywordEn?: string | null;
  seoTitleEs?: string | null;
  seoDescEs?: string | null;
  focusKeywordEs?: string | null;
  
  authorName?: string | null;
  authorImage?: string | null;
  authorBioEn?: string | null;
  authorBioEs?: string | null;
}

// Reusable Accordion
const AccordionSection = ({ title, children, defaultOpen = false, icon }: { title: string, children: React.ReactNode, defaultOpen?: boolean, icon?: string }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900/30 overflow-hidden mb-4 transition-all duration-200">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors">
        <div className="flex items-center gap-3">
            {icon && <span className="text-lg">{icon}</span>}
            <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wide">{title}</h2>
        </div>
        <span className={`transform transition-transform duration-200 text-[#f8ed1a] ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="p-6 border-t border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};

export default function EditPostForm({ post }: { post: PostData }) {
  // Initialize state with existing data if available
  const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>(
    post.mainImage ? [{ url: post.mainImage }] : []
  );
  
  const [authorImageFiles, setAuthorImageFiles] = useState<ImageFile[]>(
    post.authorImage ? [{ url: post.authorImage }] : []
  );

  // Auxiliary loader (starts empty on edit)
  const [bodyImages, setBodyImages] = useState<ImageFile[]>([]);

  // LOGIC: Get the URL of the most recently uploaded image in the body loader
  const lastUploadedUrl = bodyImages.length > 0 ? bodyImages[bodyImages.length - 1].url : null;

  return (
    <form action={updatePost} className="space-y-6 relative">
      
      {/* Hidden ID & Image Inputs */}
      <input type="hidden" name="id" value={post.id} />
      <input type="hidden" name="mainImage" value={mainImageFiles[0]?.url || ''} />
      <input type="hidden" name="authorImage" value={authorImageFiles[0]?.url || ''} />

      {/* --- HEADER --- */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6">
        <div>
            <h2 className="text-xl font-black text-white uppercase">Edit Configuration</h2>
            <p className="text-gray-400 text-sm mt-1">Manage URL and metadata.</p>
        </div>
        <DeletePostButton id={post.id} />
      </div>

      {/* 1. MAIN INFO & ASSETS */}
      <AccordionSection title="Main Info & Cover" icon="📰" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-2">Slug (URL)</label>
                <input 
                    type="text" 
                    name="slug" 
                    defaultValue={post.slug} 
                    className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] outline-none" 
                />
                
                <div className="mt-6">
                    <label className="flex items-center cursor-pointer gap-3 p-3 bg-gray-900 rounded border border-gray-700 hover:border-[#529e14]">
                        <input 
                            type="checkbox" 
                            name="isPublished" 
                            defaultChecked={post.isPublished} 
                            className="w-5 h-5 accent-[#529e14]" 
                        />
                        <span className="font-bold uppercase text-sm text-white">Publish on Site</span>
                    </label>
                </div>
            </div>
            <div>
                <ImageUpload label="Cover Image" value={mainImageFiles} onChange={setMainImageFiles} multiple={false} />
            </div>
        </div>
      </AccordionSection>

      {/* 2. SEO & METADATA */}
      <AccordionSection title="SEO & Metadata" icon="🔍">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* English */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase border-b border-gray-700 pb-2">🇺🇸 English SEO</h3>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Meta Title</label>
                    <input type="text" name="seoTitleEn" defaultValue={post.seoTitleEn || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm" placeholder="Max 60 chars" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Meta Description</label>
                    <textarea name="seoDescEn" rows={3} defaultValue={post.seoDescEn || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm" placeholder="Max 160 chars"></textarea>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Focus Keyword</label>
                    <input type="text" name="focusKeywordEn" defaultValue={post.focusKeywordEn || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm" />
                </div>
            </div>
            {/* Spanish */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase border-b border-gray-700 pb-2">🇲🇽 Spanish SEO</h3>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Meta Title</label>
                    <input type="text" name="seoTitleEs" defaultValue={post.seoTitleEs || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm" placeholder="Max 60 chars" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Meta Description</label>
                    <textarea name="seoDescEs" rows={3} defaultValue={post.seoDescEs || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm" placeholder="Max 160 chars"></textarea>
                </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Focus Keyword</label>
                    <input type="text" name="focusKeywordEs" defaultValue={post.focusKeywordEs || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm" />
                </div>
            </div>
        </div>
      </AccordionSection>

      {/* 3. AUTHOR & BIO */}
      <AccordionSection title="Author Profile" icon="✍️">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                    <ImageUpload label="Author Photo" value={authorImageFiles} onChange={setAuthorImageFiles} multiple={false} disableMetadata={true} />
            </div>
            <div className="md:col-span-2 space-y-4">
                    <div>
                    <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-1">Author Name</label>
                    <input type="text" name="authorName" defaultValue={post.authorName || ''} className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bio (English)</label>
                        <textarea name="authorBioEn" rows={3} defaultValue={post.authorBioEn || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm"></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bio (Spanish)</label>
                        <textarea name="authorBioEs" rows={3} defaultValue={post.authorBioEs || ''} className="w-full bg-gray-900 rounded p-2 text-white border border-gray-700 text-sm"></textarea>
                    </div>
                </div>
            </div>
        </div>
      </AccordionSection>

      {/* 4. ASSETS HELPER (UX Improvement) */}
      <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
            <p className="text-xs font-bold text-[#f8ed1a] uppercase flex items-center gap-2">
                📸 Body Image Loader 
            </p>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Use this to add images inside the article</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full">
                <ImageUpload label="" value={bodyImages} onChange={setBodyImages} multiple={true} disableMetadata={true} />
                </div>
                <div className="w-full md:w-1/3 bg-[#1a1a1a] p-4 rounded border border-gray-700 text-xs text-gray-400">
                <p className="font-bold text-white mb-2 uppercase">How to insert:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Upload image here.</li>
                    <li>Wait for the thumbnail to appear.</li>
                    <li>Go to the editor below.</li>
                    <li>Click the <span className="text-green-400 font-bold">"Insert Uploaded Img"</span> button.</li>
                </ol>
                </div>
        </div>
      </div>

      {/* 5. CONTENT EDITOR */}
      <div className="grid grid-cols-1 gap-8 pt-4 pb-20">
        {/* English */}
        <div className="border border-gray-800 p-6 rounded-xl bg-[#1a1a1a] shadow-lg">
            <h3 className="text-sm font-black text-[#f8ed1a] uppercase mb-4 flex items-center gap-2">🇺🇸 English Content</h3>
            <input type="text" name="titleEn" defaultValue={post.titleEn} placeholder="Post Title (EN)" className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 font-bold mb-4 text-lg" required />
            <HtmlEditor 
                label="Body Content (EN)" 
                name="contentEn" 
                defaultValue={post.contentEn} 
                placeholder="Write your article..." 
                required 
                latestUploadedImageUrl={lastUploadedUrl}
            />
        </div>

        {/* Spanish */}
        <div className="border border-gray-800 p-6 rounded-xl bg-[#1a1a1a] shadow-lg">
            <h3 className="text-sm font-black text-[#f8ed1a] uppercase mb-4 flex items-center gap-2">🇲🇽 Spanish Content</h3>
            <input type="text" name="titleEs" defaultValue={post.titleEs} placeholder="Post Title (ES)" className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 font-bold mb-4 text-lg" required />
            <HtmlEditor 
                label="Body Content (ES)" 
                name="contentEs" 
                defaultValue={post.contentEs} 
                placeholder="Write your article..." 
                required 
                latestUploadedImageUrl={lastUploadedUrl}
            />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a]/95 backdrop-blur py-4 border-t border-gray-800 flex items-center justify-end gap-4 px-8 lg:pr-12">
        <Link href="/admin/blog" className="text-sm font-bold text-gray-400 hover:text-white">
            Cancel
        </Link>
        <button 
            type="submit" 
            className="bg-[#529e14] hover:bg-[#458510] text-white px-8 py-3 rounded-lg font-black uppercase tracking-wide shadow-lg hover:scale-105 transition-all"
        >
            Save Changes
        </button>
      </div>

    </form>
  );
}