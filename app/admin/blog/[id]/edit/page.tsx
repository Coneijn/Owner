import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import EditPostForm from '../../ui/edit-post-form';

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-800 pb-6">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Edit Blog Post
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Modifying: <span className="text-[#f8ed1a] font-bold">{post.titleEn}</span>
            </p>
          </div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
          >
            ← Back to List
          </Link>
        </div>

        {/* --- FORM CLIENT COMPONENT --- */}
        <div className="relative">
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8ed1a] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            
            <EditPostForm post={post} />
        </div>

      </div>
    </div>
  );
}