// scripts/export-blog.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('📰 Iniciando extracción de datos del Blog para la Fase 3...');

  // Extraemos todos los posts incluyendo las imágenes relacionadas para no perder nada en la migración
  const posts = await prisma.post.findMany({
    include: {
      postImages: true,
    },
  });

  const outputPath = path.join(__dirname, '../prisma/blog-export.json');
  
  // Guardamos los datos en un archivo JSON estructurado
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`✅ Exportación del blog exitosa.`);
  console.log(`   - Archivo guardado en: ${outputPath}`);
  console.log(`   - Total de artículos exportados: ${posts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error al exportar el blog:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });