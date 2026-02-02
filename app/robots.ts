import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Protege rutas internas
    },
    sitemap: 'https://ownertodueno.com/sitemap.xml',
  };
}