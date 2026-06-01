import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/app/components/Header';
import sanitizeHtml from 'sanitize-html';

export default async function BlogPostPage(props: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const slug = resolvedParams?.slug;
  const lang = resolvedSearchParams?.lang;

  // Validación previa para asegurar que el slug no tumbe el servidor con Prisma
  if (!slug) {
    notFound();
  }

  const currentLang = lang === 'en' ? 'en' : 'es';

  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post || !post.isPublished) notFound();

  const title = currentLang === 'en' ? post.titleEn : post.titleEs;
  const rawContent = currentLang === 'en' ? post.contentEn : post.contentEs;
  const authorBio = currentLang === 'en' ? post.authorBioEn : post.authorBioEs;

  // Configuración de Sanitización de HTML
  const sanitizedContent = sanitizeHtml(rawContent, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 
      'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 'br', 'img', 'blockquote', 'code', 'pre', 'hr'
    ],
    allowedAttributes: {
      '*': ['className', 'class'], 
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height']
    },
    transformTags: {
      'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
    }
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      <Header lang={currentLang} activePage="blog" />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase mb-8 leading-tight tracking-tight">
          {title}
        </h1>

        {post.mainImage && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 shadow-2xl border border-gray-800">
            <Image src={post.mainImage} alt={title} fill className="object-cover" />
          </div>
        )}

        {/* Contenido del Post */}
        <div className="prose prose-invert prose-lg max-w-none 
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-headings:font-bold prose-headings:uppercase
          prose-h2:text-[#f8ed1a] prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-white prose-h3:mt-8
          prose-a:text-[#529e14] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-blockquote:border-l-[#529e14] prose-blockquote:bg-gray-800/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
          
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>

        {/* --- SECCIÓN DEL AUTOR AL FINAL DEL POST --- */}
        {(post.authorName || post.authorImage || authorBio) && (
          <div className="flex items-center gap-5 mt-14 p-6 bg-gray-800/30 rounded-xl border border-gray-800/80 shadow-xl">
            {/* Renderizado de la foto del autor */}
            {post.authorImage ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-gray-700">
                {/* Regresamos al componente Image optimizado de Next.js */}
                <Image 
                  src={post.authorImage} 
                  alt={post.authorName || 'Autor'} 
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center shrink-0 border border-gray-600">
                <span className="text-2xl font-bold text-gray-300">
                  {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
            )}
            
            <div className="flex flex-col">
               <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                 {currentLang === 'en' ? 'Written by' : 'Escrito por'}
               </span>
               <span className="text-white font-bold text-lg">{post.authorName || 'Autor Anónimo'}</span>
               
               {/* Mostrar la biografía renderizando HTML de forma segura */}
               {authorBio && (
                 <div 
                   className="text-gray-400 text-sm mt-1 leading-relaxed prose prose-invert prose-p:my-1"
                   dangerouslySetInnerHTML={{ 
                     __html: sanitizeHtml(authorBio, {
                       allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
                       allowedAttributes: { 'a': ['href', 'target', 'rel'] }
                     })
                   }} 
                 />
               )}
            </div>
          </div>
        )}
        {/* --- FIN SECCIÓN DEL AUTOR --- */}

      </main>
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center mt-12">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}