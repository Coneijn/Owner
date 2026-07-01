// scripts/import-to-wp.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configuramos las rutas usando tus variables
const WP_GRAPHQL_URL = process.env.WORDPRESS_API_URL || 'http://localhost:10000/graphql';
const WP_REST_URL = WP_GRAPHQL_URL.replace('/graphql', '/wp-json/wp/v2'); 

const WP_USER = process.env.WORDPRESS_USER;
const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;

console.log("=== DEBUG DE VARIABLES ===");
console.log("URL cruda del .env:", process.env.WORDPRESS_API_URL);
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
 * Función auxiliar para enviar el POST a WordPress
 */
async function sendPostToWP(wpPost: any, lang: string) {
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
    console.error(`   ❌ Error al crear el artículo en ${lang} "${wpPost.title}":`, errorData);
    return null;
  }

  const newPost = await response.json();
  console.log(`   📝 Artículo en ${lang} creado con éxito: ${newPost.title.rendered}`);
  return newPost;
}

/**
 * Función principal para procesar los datos de cada artículo
 */
async function createPostInWP(postData: any) {
  console.log(`\nProcesando artículo base: ${postData.titleEs || postData.titleEn || 'Sin Título'}`);

  // 1. Manejo de la imagen (se sube solo una vez)
  const imageUrlToUpload = postData.mainImage || null;
  let featuredMediaId = null;
  
  if (imageUrlToUpload) {
    featuredMediaId = await uploadImageToWP(imageUrlToUpload);
    if (featuredMediaId) {
      console.log(`   🖼️ Imagen destacada lista para asignarse (ID: ${featuredMediaId})`);
    }
  }

  // 2. Mapeo de Autores
  const authorMap: Record<string, number> = {
    'default': 1,
    'Spencer': 2,       
  };
  const incomingAuthor = postData.author?.toLowerCase() || postData.authorId || 'default';
  const assignedWpAuthorId = authorMap[incomingAuthor] || authorMap['default'];

  // 3. Crear versión en ESPAÑOL si existe el título
  if (postData.titleEs) {
    const wpPostEs = {
      title: postData.titleEs,
      content: postData.contentEs || '',
      excerpt: postData.seoDescEs || '', 
      status: 'publish', 
      slug: `${postData.slug}-es`, // Se añade -es al slug para evitar colisiones
      date: postData.createdAt,
      featured_media: featuredMediaId,
      author: assignedWpAuthorId 
    };
    await sendPostToWP(wpPostEs, 'ESPAÑOL');
  }

  // 4. Crear versión en INGLÉS si existe el título
  if (postData.titleEn) {
    const wpPostEn = {
      title: postData.titleEn,
      content: postData.contentEn || '',
      excerpt: postData.seoDescEn || '', 
      status: 'publish', 
      slug: `${postData.slug}-en`, // Se añade -en al slug
      date: postData.createdAt,
      featured_media: featuredMediaId,
      author: assignedWpAuthorId 
    };
    await sendPostToWP(wpPostEn, 'INGLÉS');
  }
}

async function main() {
  console.log('🚀 Iniciando migración automatizada a WordPress (Versión Bilingüe)...');
  
  const inputPath = path.join(__dirname, '../prisma/blog-export.json');
  if (!fs.existsSync(inputPath)) {
    throw new Error(`No se encontró el archivo de exportación en ${inputPath}`);
  }

  const posts = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`Se procesarán ${posts.length} artículos base.`);

  for (const post of posts) {
    await createPostInWP(post);
    // Pausa para evitar bloquear el servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 Migración 100% finalizada.');
}

main().catch(console.error);