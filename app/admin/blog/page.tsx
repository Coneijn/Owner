import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b border-gray-800 pb-8">
          <div>
             {/* Breadcrumb estilo marca */}
             <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
                <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
                <span>/</span>
                <span className="text-[#f8ed1a]">Blog</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                Blog Posts
             </h1>
          </div>

          {/* Botón de Acción (Verde Corporativo) */}
          <Link 
            href="/admin/blog/new" 
            className="bg-[#529e14] hover:bg-[#458510] text-white px-6 py-3 rounded-lg font-black uppercase tracking-wide shadow-lg hover:shadow-[#529e14]/40 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>+</span> New Post
          </Link>
        </div>

        {/* --- LISTA DE POSTS --- */}
        <div className="space-y-4">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="bg-[#1a1a1a] p-4 border border-gray-800 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-6 hover:border-gray-700 transition-colors shadow-md group"
            >
              <div className="flex items-center gap-5 w-full sm:w-auto">
                
                {/* Thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-800 bg-gray-900 group-hover:border-[#f8ed1a]/30 transition-colors">
                   {post.mainImage ? (
                     <Image src={post.mainImage} alt="" fill className="object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-2xl grayscale opacity-50">📰</div>
                   )}
                </div>
                
                {/* Info Text */}
                <div>
                  <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-[#f8ed1a] transition-colors">
                    {post.titleEn || "Untitled Post"}
                  </h3>
                  
                  <div className="flex items-center gap-3 mt-2">
                      {/* Badge de Estado */}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        post.isPublished 
                          ? 'bg-[#529e14]/10 text-[#529e14] border-[#529e14]/20' 
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                      
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                  </div>
                </div>
              </div>

              {/* Botón Editar */}
              <Link 
                href={`/admin/blog/${post.id}/edit`} 
                className="w-full sm:w-auto text-center text-[#f8ed1a] hover:text-[#1a1a1a] hover:bg-[#f8ed1a] font-black uppercase text-xs tracking-widest border border-[#f8ed1a]/30 hover:border-[#f8ed1a] px-6 py-3 rounded-lg transition-all"
              >
                Edit Post
              </Link>
            </div>
          ))}

          {/* Estado Vacío */}
          {posts.length === 0 && (
             <div className="text-center py-24 border-2 border-dashed border-gray-800 rounded-xl bg-white/5">
                <div className="text-4xl mb-4 opacity-30">📭</div>
                <p className="text-gray-500 font-bold uppercase tracking-widest">No posts found</p>
                <p className="text-gray-600 text-sm mt-2">Create your first blog post to see it here.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}