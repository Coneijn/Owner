// lib/wordpress.ts

// Aquí pondremos la URL que Alexis te pase en el futuro. 
// Por ahora, dejamos un placeholder o una de prueba local.
const WP_GRAPHQL_URL = process.env.WORDPRESS_API_URL || 'http://localhost:10000/graphql';

/**
 * Función base para hacer peticiones a la API de WordPress
 */
export async function fetchAPI(query: string, { variables }: { variables?: any } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const res = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 60 }, 
    });

    const json = await res.json();

    if (json.errors) {
      console.error('❌ Errores en la consulta a WordPress:', json.errors);
      throw new Error('Fallo al obtener datos de la API de WordPress');
    }

    return json.data;
  } catch (error) {
    console.error('❌ Error de red al conectar con WordPress:', error);
    throw new Error('No se pudo conectar con WordPress');
  }
}

/**
 * Obtiene todos los artículos para la página principal del blog
 */
export async function getAllPostsForBlog() {
  const data = await fetchAPI(`
    query AllPosts {
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            author {
              node {
                name
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `);

  return data?.posts?.edges || [];
}

/**
 * Obtiene un artículo individual usando su slug
 */
export async function getPostBySlug(slug: string) {
  const data = await fetchAPI(`
    query PostBySlug($id: ID!) {
      post(id: $id, idType: SLUG) {
        id
        title
        excerpt
        content
        date
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
      }
    }
  `, {
    variables: {
      id: slug
    }
  });

  return data?.post || null;
}