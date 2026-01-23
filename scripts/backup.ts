// scripts/backup.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando respaldo de datos...');

  const users = await prisma.user.findMany();
  
  const properties = await prisma.property.findMany(); 

  const data = {
    users,
    properties,
  };

  const outputPath = path.join(__dirname, '../prisma/seed-data.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✅ Respaldo guardado en: ${outputPath}`);
  console.log(`   - Usuarios: ${users.length}`);
  console.log(`   - Propiedades: ${properties.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });