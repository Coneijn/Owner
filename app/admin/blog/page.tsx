import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">Blog Posts</h1>
        <Link href="/admin/blog/new" className="bg-[#529e14] px-6 py-2 rounded-lg font-bold text-white">
          + New Post
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-[#1a1a1a] p-4 border border-gray-800 rounded flex justify-between items-center">
            <div className="flex items-center gap-4">
              {post.mainImage && (
                <div className="relative w-16 h-16 rounded overflow-hidden">
                   <Image src={post.mainImage} alt="" fill className="object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-white">{post.titleEn}</h3>
                <span className={`text-xs px-2 py-1 rounded ${post.isPublished ? 'bg-green-900 text-green-300' : 'bg-gray-700'}`}>
                  {post.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            <Link href={`/admin/blog/${post.id}/edit`} className="text-[#f8ed1a] font-bold hover:underline">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}