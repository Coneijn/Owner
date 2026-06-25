// scripts/import-to-wp.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configuramos las rutas usando tus variables
const WP_GRAPHQL_URL = process.env.WORDPRESS_API_URL || 'http://localhost:10000/graphql';
// Asumimos que la API REST está en el mismo dominio
const WP_REST_URL = WP_GRAPHQL_URL.replace('/graphql', '/wp-json/wp/v2'); 

const WP_USER = process.env.WORDPRESS_USER;
const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;

console.log("=== DEBUG DE VARIABLES ===");
console.log("URL cruda del .env:", process.env.WORDPRESS_API_URL);
console.log("Usuario crudo del .env:", process.env.WORDPRESS_USER);
console.log("WP_REST_URL final generada:", WP_REST_URL);
console.log("==========================");

// Codificamos las credenciales en Base64 para la autenticación Basic
const authHeader = `Basic ${Buffer.from(`${WP_USER}:${WP_PASSWORD}`).toString('base64')}`;

/**
 * Función para descargar una imagen de una URL y subirla a WordPress
 */
async function uploadImageToWP(imageUrl: string) {
  try {
    console.log(`   ⬇️ Descargando imagen origen: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) throw new Error('No se pudo descargar la imagen origen');
    
    const imageBuffer = await imageResponse.arrayBuffer();
    // Extraemos el nombre del archivo de la URL o asignamos uno por defecto
    const fileName = imageUrl.split('/').pop() || 'imagen-destacada.jpg';

    console.log(`   ☁️ Subiendo a la Biblioteca de Medios de WordPress...`);
    const uploadResponse = await fetch(`${WP_REST_URL}/media`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('   ❌ Error de WordPress al subir imagen:', error);
      return null;
    }

    const mediaData = await uploadResponse.json();
    console.log(`   ✅ Imagen procesada exitosamente. WP Media ID: ${mediaData.id}`);
    return mediaData.id;
  } catch (error) {
    console.error('   ❌ Excepción al procesar la imagen:', error);
    return null;
  }
}

/**
 * Función principal para crear el post
 */
async function createPostInWP(postData: any) {
  console.log(`Procesando artículo: ${postData.titleEs || postData.titleEn}`);

  // Modificación 2: Quitamos el fallback de postImages para evitar fotos erróneas
  const imageUrlToUpload = postData.mainImage || null;
  let featuredMediaId = null;
  
  if (imageUrlToUpload) {
    featuredMediaId = await uploadImageToWP(imageUrlToUpload);
    if (featuredMediaId) {
      console.log(`   🖼️ Imagen destacada asignada con ID: ${featuredMediaId}`);
    }
  }

  // Modificación 1: Mapeo de Autores
  const authorMap: Record<string, number> = {
    'default': 1 ,
    'Spencer': 2,       
  };

  const incomingAuthor = postData.author?.toLowerCase() || postData.authorId || 'default';
  const assignedWpAuthorId = authorMap[incomingAuthor] || authorMap['default'];

  const wpPost = {
    title: postData.titleEs || postData.titleEn || 'Sin Título',
    content: postData.contentEs || postData.contentEn || '',
    excerpt: postData.seoDescEs || postData.seoDescEn || '', 
    status: 'publish', 
    slug: postData.slug,
    date: postData.createdAt,
    featured_media: featuredMediaId,
    author: assignedWpAuthorId 
  };
  const response = await fetch(`${WP_REST_URL}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wpPost),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`❌ Error al crear el artículo "${wpPost.title}":`, errorData);
    return null;
  }

  const newPost = await response.json();
  console.log(`📝 Artículo creado con éxito: ${newPost.title.rendered}`);
  return newPost;
}

async function main() {
  console.log('🚀 Iniciando migración automatizada a WordPress...');
  
  const inputPath = path.join(__dirname, '../prisma/blog-export.json');
  if (!fs.existsSync(inputPath)) {
    throw new Error(`No se encontró el archivo de exportación en ${inputPath}`);
  }

  const posts = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`Se procesarán ${posts.length} artículos.`);

  for (const post of posts) {
    await createPostInWP(post);
    // Agregamos una pequeña pausa de 1 segundo entre cada petición
    // Esto evita que tu servidor de WordPress colapse o te bloquee por exceso de peticiones
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 Migración 100% finalizada.');
}

main().catch(console.error);