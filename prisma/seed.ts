// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'seed-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ No se encontró el archivo seed-data.json. Ejecuta primero el backup.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('🌱 Iniciando inyección de datos (Seeding)...');

  for (const user of data.users) {
    await prisma.user.upsert({
      where: { email: user.email }, 
      update: {},
      create: {
        ...user,
        createdAt: new Date(user.createdAt), 
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  for (const prop of data.properties) {
    const { images, ...propData } = prop;

    await prisma.property.upsert({
      where: { id: prop.id }, 
      update: {},
      create: {
        ...propData,
        createdAt: new Date(prop.createdAt),
        updatedAt: new Date(prop.updatedAt),
        price: prop.price,
        downPayment: prop.downPayment,
        interestRate: prop.interestRate,
        taxes: prop.taxes,
        insurance: prop.insurance,
        
        images: images && images.length > 0 ? {
            create: images.map((img: any) => ({
                url: img.url,
                altText: img.altText,
                title: img.title,
                caption: img.caption,
                description: img.description,
                isMain: img.isMain,
                order: img.order
            }))
        } : undefined
      },
    });
  }

  console.log('✅ Datos inyectados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });