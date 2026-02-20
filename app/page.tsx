import { prisma } from '@/lib/prisma';
import Header from '@/app/components/Header'; 
import MapSplitView from './map/MapSplitView';

export const dynamic = 'force-dynamic';

export default async function MapPage(props: { 
  searchParams: Promise<{ 
    lang?: string; 
    query?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    sqft?: string;
    type?: string; 
  }> 
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const searchType = searchParams?.type === 'rent' ? 'rent' : 'buy';

  const DICTIONARY = {
    es: {
      sidebar: {
        results: "Resultados",
        inventory: "Inventario • Memphis, TN",
        viewList: "Ver Lista"
      },
      status: {
        available: "DISPONIBLE",
        comingSoon: "PRÓXIMAMENTE",
        sold: "VENDIDO"
      },
      search: {
        placeholder: "Buscar dirección, ciudad o CP..."
      },
      card: {
        monthly: "Mensualidad Est.",
        zip: "CP"
      },
      tabs: {
        buy: "COMPRAR",
        rent: "RENTAR"
      },
      specs: {
        beds: "Hab",
        baths: "Baños",
        sqft: "Sqft"
      }
    },
    en: {
      sidebar: {
        results: "Results",
        inventory: "Memphis, TN • Inventory",
        viewList: "View List"
      },
      status: {
        available: "AVAILABLE",
        comingSoon: "COMING SOON",
        sold: "SOLD"
      },
      search: {
        placeholder: "Search address, city or zip..."
      },
      card: {
        monthly: "Est. Monthly",
        zip: "Zip"
      },
      tabs: {
        buy: "BUY",
        rent: "RENT"
      },
      specs: {
        beds: "Beds",
        baths: "Baths",
        sqft: "Sqft"
      }
    }
  };

  const t = DICTIONARY[lang];

  // --- LÓGICA DE FILTROS ---
  const queryText = searchParams?.query || '';
  const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const minBeds = searchParams?.beds ? Number(searchParams.beds) : undefined;
  const minBaths = searchParams?.baths ? Number(searchParams.baths) : undefined;
  const minSqft = searchParams?.sqft ? Number(searchParams.sqft) : undefined;

  const whereClause: any = {
    OR: [
        { status: 'AVAILABLE' },
        { status: 'COMING_SOON' }
    ],
    ...(searchType === 'rent' ? { isForRent: true } : { isForSale: true }),
    
    ...(queryText && {
        AND: [{
            OR: [
                { address: { contains: queryText, mode: 'insensitive' } },
                { city: { contains: queryText, mode: 'insensitive' } },
                { zipCode: { contains: queryText } }
            ]
        }]
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
        ...(searchType === 'rent' 
            ? { monthlyRent: {
                  ...(minPrice !== undefined && { gte: minPrice }), 
                  ...(maxPrice !== undefined && { lte: maxPrice }),
              }}
            : { price: {
                  ...(minPrice !== undefined && { gte: minPrice }), 
                  ...(maxPrice !== undefined && { lte: maxPrice }),
              }}
        )
    }),
    ...(minBeds !== undefined && { bedrooms: { gte: minBeds } }),
    ...(minBaths !== undefined && { bathrooms: { gte: minBaths } }),
    ...(minSqft !== undefined && { sqft: { gte: minSqft } }),
  };

  
  // --- CONSULTA A BASE DE DATOS ---
  const rawProperties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
        id: true,
        titleEn: true,
        titleEs: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        createdAt: true,
        price: true,
        previousPrice: true,
        lastPriceChangeAt : true,
        downPayment: true,
        interestRate: true,
        taxes: true,
        insurance: true,
        latitude: true,
        longitude: true,
        slug: true,
        mainImage: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        status: true,
        
        // Campos de Renta
        isForRent: true,
        monthlyRent: true,
        securityDeposit: true, 

        features: true,    
        showSeller: true,
        
        // --- CAMBIO APLICADO: Hacemos select de la relación sellerProfile ---
        sellerProfile: {
          select: {
            sellerName: true,
            sellerImage: true,
            sellerType: true,
          }
        }
    }
  });


  
  // --- MAPEO DE DATOS ---
  const properties = rawProperties.map(p => ({
    id: p.id,
    title: lang === 'en' ? p.titleEn : p.titleEs,
    address: p.address,
    city: p.city,
    state: p.state,
    zipCode: p.zipCode,
    price: Number(p.price),
    downPayment: Number(p.downPayment || 0),
    interestRate: Number(p.interestRate || 0),
    taxes: Number(p.taxes || 0),
    insurance: Number(p.insurance || 0),
    monthlyRent: Number(p.monthlyRent || 0),
    securityDeposit: Number(p.securityDeposit || 0),
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    slug: p.slug,
    image: p.mainImage,
    beds: p.bedrooms,
    baths: p.bathrooms,
    sqft: p.sqft,
    status: p.status,
    isForRent: p.isForRent, 
    features: p.features,
    showSeller: p.showSeller,

    // --- CAMBIO APLICADO: Extraemos la info desde p.sellerProfile ---
    sellerName: p.sellerProfile?.sellerName || null,
    sellerImage: p.sellerProfile?.sellerImage || null,
    sellerType: p.sellerProfile?.sellerType || null,

    createdAt: p.createdAt.toISOString(),
    previousprice: p.previousPrice ? Number(p.previousPrice) : null,
    lastPriceChangeAt: p.lastPriceChangeAt ? p.lastPriceChangeAt.toISOString() : null,

  }));

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1c] overflow-hidden">
        <Header lang={lang} activePage="home" />
        <div className="flex-1 relative min-h-0">
            <MapSplitView 
                properties={properties} 
                lang={lang} 
                t={t} 
                searchType={searchType}
            />
        </div>
    </div>
  );
}