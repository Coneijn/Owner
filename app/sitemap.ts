import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://ownertodueno.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Obtener todas las propiedades disponibles de la base de datos
  const properties = await prisma.property.findMany({
    where: {
      status: 'AVAILABLE', // Solo indexar propiedades disponibles
      isOffMarket: false,  // Opcional: Si no quieres que Google indexe las "Off Market"
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // 2. Crear las rutas dinámicas de las propiedades
  const propertyRoutes = properties.map((property) => ({
    url: `${BASE_URL}/propiedades/${property.slug}`,
    lastModified: property.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. Definir las rutas estáticas principales
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/properties`, // Catálogo
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/why-choose-owner-to-dueno`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // 4. Combinar y retornar todo
  return [...staticRoutes, ...propertyRoutes];
}