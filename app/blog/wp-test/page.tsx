// app/blog/wp-test/page.tsx
import { getAllPostsForBlog } from '../../../lib/wordpress';
import Link from 'next/link';

export default async function WpTestBlogPage() {
  // Obtenemos los posts desde nuestra nueva función conectada a WordPress
  let posts = [];
  let error = null;

  try {
    posts = await getAllPostsForBlog();
  } catch (err) {
    error = 'No se pudo conectar con la API de WordPress. Verifica que el servidor esté encendido.';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Banner de advertencia para saber que estamos en pruebas */}
      <div className="mb-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-sm">
        <strong className="block text-lg">🚧 Entorno de Prueba Headless 🚧</strong>
        <p>Esta página está intentando consumir la API de WordPress. El blog original de Owner sigue intacto.</p>
      </div>

      <h1 className="text-4xl font-bold text-yellow-500 mb-8">Últimos Artículos (WordPress)</h1>

      {/* Manejo de errores de conexión */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-8">
          {error}
        </div>
      )}

      {/* Renderizado de las tarjetas del blog */}
      {!error && posts.length === 0 ? (
        <p className="text-gray-500 text-lg">No hay posts disponibles en la API de WordPress en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(({ node }: any) => (
            <article key={node.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              {/* Imagen de portada */}
              {node.featuredImage?.node?.sourceUrl && (
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={node.featuredImage.node.sourceUrl} 
                    alt={node.featuredImage.node.altText || 'Portada del artículo'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow">
                {/* Fecha */}
                <p className="text-sm text-gray-500 mb-3 font-medium">
                  {new Date(node.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                
                {/* Título: Usamos dangerouslySetInnerHTML porque WP a veces manda caracteres HTML (como tildes o comillas) escapados */}
                <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                  <span dangerouslySetInnerHTML={{ __html: node.title }} />
                </h2>
                
                {/* Extracto / Resumen */}
                <div 
                  className="text-gray-600 mb-4 line-clamp-3 flex-grow prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: node.excerpt }} 
                />
                
                {/* Pie de la tarjeta: Autor y Botón */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    {node.author?.node?.avatar?.url ? (
                      <img 
                        src={node.author.node.avatar.url} 
                        alt={node.author.node.name} 
                        className="w-8 h-8 rounded-full mr-2 border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full mr-2 bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                        {node.author?.node?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-500">
                      {node.author?.node?.name || 'Admin'}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/blog/wp-test/${node.slug}`} 
                    className="text-green-600 hover:text-green-700 text-sm font-bold transition-colors"
                  >
                    Leer más &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}