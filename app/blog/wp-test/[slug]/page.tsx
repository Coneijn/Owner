// app/blog/wp-test/[slug]/page.tsx
import { Metadata } from 'next';
import { getPostBySlug } from '../../../../lib/wordpress';
import Link from 'next/link';

// Esta función mágica de Next.js se encarga del SEO dinámico
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Artículo no encontrado | Owner',
      description: 'El artículo que buscas no está disponible en nuestro blog.',
    };
  }

  // Limpiamos las etiquetas HTML del resumen para que Google lo lea como texto plano
  const plainDescription = post.excerpt 
    ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) 
    : 'Lee este artículo en el blog de Owner.';

  return {
    title: `${post.title} | Owner`,
    description: plainDescription,
    openGraph: {
      title: post.title,
      description: plainDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author?.node?.name || 'Equipo Owner'],
      images: post.featuredImage?.node?.sourceUrl ? [
        {
          url: post.featuredImage.node.sourceUrl,
          alt: post.featuredImage.node.altText || post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: plainDescription,
      images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : [],
    }
  };
}

export default async function WpTestSinglePost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let post = null;
  let error = null;

  try {
    post = await getPostBySlug(resolvedParams.slug);
  } catch (err) {
    error = 'No se pudo conectar con la API de WordPress.';
  }

  // Vista de Error
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center mt-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">🚧 Error de Conexión 🚧</h1>
        <p className="text-gray-700">{error}</p>
        <Link href="/blog/wp-test" className="text-green-600 hover:underline mt-6 inline-block font-medium">
          &larr; Volver a la lista de pruebas
        </Link>
      </div>
    );
  }

  // Vista de "No encontrado" (404)
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center mt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
        <p className="text-gray-600 mb-6">El artículo que buscas no existe en la base de datos de WordPress.</p>
        <Link href="/blog/wp-test" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Vista exitosa del Artículo
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <Link href="/blog/wp-test" className="text-green-600 hover:text-green-800 font-medium mb-8 inline-block transition-colors">
        &larr; Volver a todos los artículos
      </Link>

      {/* Indicador Bilingüe */}
      <div className="mb-6">
        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-300">
          🌐 Arquitectura Bilingüe Lista
        </span>
      </div>

      {/* Título Principal */}
      <h1 
        className="text-4xl md:text-5xl font-extrabold text-yellow-500 mb-8 leading-tight"
        dangerouslySetInnerHTML={{ __html: post.title }}
      />

      {/* Perfil del Autor y Fecha */}
      <div className="flex items-center mb-10 pb-6 border-b border-white-200">
        {post.author?.node?.avatar?.url ? (
          <img 
            src={post.author.node.avatar.url} 
            alt={post.author.node.name} 
            className="w-14 h-14 rounded-full mr-4 border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-14 h-14 rounded-full mr-4 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-xl shadow-sm">
            {post.author?.node?.name?.charAt(0) || 'A'}
          </div>
        )}
        <div>
          <p className="font-bold text-gray-400 text-lg">{post.author?.node?.name || 'Equipo Owner'}</p>
          <p className="text-sm text-white">
            {new Date(post.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Imagen Destacada (Portada) */}
      {post.featuredImage?.node?.sourceUrl && (
        <div className="w-full h-[300px] md:h-[500px] mb-12 overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={post.featuredImage.node.sourceUrl} 
            alt={post.featuredImage.node.altText || 'Portada del artículo'} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido Completo del Artículo */}
      <div 
        className="prose prose-lg md:prose-xl max-w-none text-gray-500 prose-a:text-green-600 hover:prose-a:text-green-800 prose-img:rounded-xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
    </article>
  );
}