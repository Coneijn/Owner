import { prisma } from '@/lib/prisma';
import HomeHeader from '@/app/components/HomeHeader'; 
import MapSplitView from './map/MapSplitView';
import WhatsAppButton from './components/WhatsAppButton';
import SignupPopup from './components/SignupPopup';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dueño a Dueño 🏡 Houses 4 Sale',
  openGraph: {
    title: 'Dueño a Dueño 🏡 Houses 4 Sale'},
  twitter: {
    title: 'Dueño a Dueño 🏡 Houses 4 Sale'
  }
  
};

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
  const contactName = lang === 'es' ? '' : '';
  
  const typeParam = searchParams?.type;
  const searchType = typeParam === 'rent' ? 'rent' : typeParam === 'sold' ? 'sold' : 'buy';

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
        rent: "RENTAR",
        sold: "VENDER"
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
        rent: "RENT",
        sold: "SOLD"
      },
      specs: {
        beds: "Beds",
        baths: "Baths",
        sqft: "Sqft"
      }
    }
  };

  const t = DICTIONARY[lang];

  const queryText = searchParams?.query || '';
  const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const minBeds = searchParams?.beds ? Number(searchParams.beds) : undefined;
  const minBaths = searchParams?.baths ? Number(searchParams.baths) : undefined;
  const minSqft = searchParams?.sqft ? Number(searchParams.sqft) : undefined;

  const whereClause: any = {
    ...(searchType === 'sold'
        ? { status: 'SOLD' } 
        : {
            OR: [
                { status: 'AVAILABLE' },
                { status: 'COMING_SOON' }
            ],
            ...(searchType === 'rent' ? { isForRent: true } : { isForSale: true }),
          }
    ),
    
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

  // Obtener los precios globales mínimos y máximos para el Slider
  const priceStats = await prisma.property.aggregate({
    where: { 
      status: { in: ['AVAILABLE', 'COMING_SOON'] },
      isForSale: true
    },
    _min: { price: true },
    _max: { price: true }
  });
  const globalMinPrice = Number(priceStats._min.price || 0);
  const globalMaxPrice = Number(priceStats._max.price || 1000000);

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
        
        // --- CAMBIO: Seleccionamos explícitamente ambos tipos ---
        isForSale: true,
        isForRent: true,
        monthlyRent: true,
        securityDeposit: true, 

        features: true,    
        showSeller: true,
        
        sellerProfile: {
          select: {
            sellerName: true,
            sellerImage: true,
            sellerType: true,
          }
        }
    }
  });

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
    
    // --- CAMBIO: Pasamos los valores al front ---
    isForRent: p.isForRent, 
    isForSale: p.isForSale,
    // Definimos el tipo para el bot (Frank)
    listingType: p.isForRent && !p.isForSale ? 'rent' : 'owner-finance',

    features: p.features,
    showSeller: p.showSeller,
    sellerName: p.sellerProfile?.sellerName || null,
    sellerImage: p.sellerProfile?.sellerImage || null,
    sellerType: p.sellerProfile?.sellerType || null,
    createdAt: p.createdAt.toISOString(),
    previousprice: p.previousPrice ? Number(p.previousPrice) : null,
    lastPriceChangeAt: p.lastPriceChangeAt ? p.lastPriceChangeAt.toISOString() : null,
  }));

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1c] overflow-hidden">
        <HomeHeader lang={lang} activePage="home" />
        <div className="flex-1 relative min-h-0">
            <MapSplitView 
                properties={properties} 
                lang={lang} 
                t={t} 
                searchType={searchType}
                globalMinPrice={globalMinPrice}
                globalMaxPrice={globalMaxPrice}
            />
        </div>
        
        <div className="hidden lg:block">
            <WhatsAppButton lang={lang} propertyName={contactName} position="left"/>
        </div>
        
        <SignupPopup lang={lang} />
    </div>
  );
}