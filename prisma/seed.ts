import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear Usuario Admin
  const hashedPassword = await bcrypt.hash('admin123', 10); // ¡Cambia esto en producción!
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spencersbuyershouse.com' },
    update: {},
    create: {
      email: 'admin@spencersbuyershouse.com',
      name: 'Spencer Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`👤 Admin creado: ${admin.email}`);

  // 2. Crear Propiedad de Prueba (Bilingüe)
  const property = await prisma.property.upsert({
    where: { slug: 'casa-familiar-charlotte-nc' },
    update: {},
    create: {
      slug: 'casa-familiar-charlotte-nc',
      status: 'AVAILABLE',
      isFeatured: true,
      
      // Contenido EN
      titleEn: 'Charming Family Home in Charlotte',
      descriptionEn: 'Beautiful renovated home perfect for a growing family. Features a spacious backyard and modern kitchen.',
      
      // Contenido ES
      titleEs: 'Encantadora Casa Familiar en Charlotte',
      descriptionEs: 'Hermosa casa renovada perfecta para una familia en crecimiento. Cuenta con un patio amplio y cocina moderna.',
      
      // Financiero (Strings para asegurar precisión Decimal)
      price: '250000.00',
      downPayment: '15000.00',
      interestRate: '9.5',
      taxes: '2500.00',
      insurance: '1200.00',
      
      // Ubicación
      address: '123 Maple Street',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28205',
      
      // Specs
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1800,
      lotSize: 5000,
      yearBuilt: 2015,
      
      // Imágenes (Placeholders)
      mainImage: '/images/house-placeholder-1.jpg',
      galleryImages: ['/images/house-placeholder-2.jpg', '/images/house-placeholder-3.jpg'],
      
      // Features
      features: ['Garage', 'Fireplace', 'Hardwood Floors', 'Garden'],
    },
  });
  console.log(`🏠 Propiedad creada: ${property.titleEn}`);

  console.log('✅ Seed completado.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });