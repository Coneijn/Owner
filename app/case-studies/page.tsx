import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/Header'; 

export default async function CaseStudiesIndexPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const currentLang = lang === 'en' ? 'en' : 'es';
  
  // Obtener SOLO casos de estudio
  const posts = await prisma.post.findMany({
    where: { 
      isPublished: true, 
      isCaseStudy: true // <-- FILTRAR PARA QUE SEAN SOLO CASOS DE ESTUDIO
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans">
      <Header lang={currentLang} activePage="case-studies" />
      
      <main className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-black text-[#f8ed1a] uppercase mb-10 text-center">
          {currentLang === 'en' ? 'Case Studies' : 'Casos de Estudio'}
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.id} href={`/case-studies/${post.slug}?lang=${currentLang}`} className="group">
              <article className="bg-[#242424] rounded-xl overflow-hidden border border-gray-800 hover:border-[#f8ed1a] transition-all h-full flex flex-col">
                  <div className="relative h-48 w-full">
                     {post.mainImage ? (
                       <Image src={post.mainImage} alt="Cover" fill className="object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">📰</div>
                     )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold mb-2 uppercase text-white group-hover:text-[#f8ed1a]">
                      {currentLang === 'en' ? post.titleEn : post.titleEs}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {/* SOLUCIÓN: Limpiamos las etiquetas HTML antes de cortar el texto */}
                      {currentLang === 'en' 
                        ? post.contentEn.replace(/<[^>]+>/g, '').substring(0, 100) 
                        : post.contentEs.replace(/<[^>]+>/g, '').substring(0, 100)}...
                    </p>
                    <span className="mt-auto pt-4 text-[#529e14] font-bold text-sm uppercase flex items-center gap-2">
                      {currentLang === 'en' ? 'Read More' : 'Leer Más'} <span>→</span>
                    </span>
                  </div>
                </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}