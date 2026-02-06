import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header'; // <--- 1. Importamos el Header

export default async function BlogPostPage(props: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await props.params;
  const { lang } = await props.searchParams;
  const currentLang = lang === 'en' ? 'en' : 'es';

  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post || !post.isPublished) notFound();

  const title = currentLang === 'en' ? post.titleEn : post.titleEs;
  const content = currentLang === 'en' ? post.contentEn : post.contentEs;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      
      {/* 2. Insertamos el Header */}
      <Header lang={currentLang} activePage="blog" />

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Breadcrumb local "Volver al Blog" */}
        <Link href={`/blog?lang=${currentLang}`} className="text-[#529e14] font-bold uppercase text-sm mb-6 inline-block hover:underline">
          ← {currentLang === 'en' ? 'Back to Blog' : 'Volver al Blog'}
        </Link>

        <h1 className="text-3xl md:text-5xl font-black text-white uppercase mb-8 leading-tight tracking-tight">
          {title}
        </h1>

        {post.mainImage && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 shadow-2xl border border-gray-800">
            <Image src={post.mainImage} alt={title} fill className="object-cover" />
          </div>
        )}

        {/* Contenido del Artículo */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#f8ed1a] prose-a:text-[#529e14] prose-strong:text-white">
          {/* Si usas texto plano con saltos de línea: */}
          <div className="whitespace-pre-wrap font-medium text-gray-300 leading-relaxed">
            {content}
          </div>
        </div>
      </main>

      {/* Footer simple para consistencia */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800 text-center mt-12">
        <p className="text-gray-500 text-sm">© 2026 Dueño a Dueño.</p>
      </footer>
    </div>
  );
}