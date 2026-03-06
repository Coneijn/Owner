import prisma from "@/lib/prisma";
import AgentDashboardClient from "./agent-dashboard-client";

export const metadata = {
  title: "Rep Portal — Owner To Dueño",
  description: "Panel de control para representantes locales",
};

export default async function AgentDashboardPage() {
  const propertiesData = await prisma.property.findMany({
    where: {
      isOffMarket: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      marketingMaterials: true,
    },
  });

  const serializedProps = propertiesData.map((p) => {
    const numericPrice = p.price ? Number(p.price) : 0;
    
    return {
      id: p.id,
      address: p.address,
      city: `${p.city}, ${p.state}`,
      mainImage: p.mainImage ,
      emoji: p.emoji || "🏡",
      beds: p.bedrooms,
      baths: Number(p.bathrooms),
      sqft: p.sqft ? p.sqft.toLocaleString() : "0",
      price: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(numericPrice),
      year: p.yearBuilt?.toString() || "N/A",
      type: p.isForSale ? "Single Family" : "Rental",
      condition: p.condition || "Standard",
      commAmt: p.commissionAmt ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Number(p.commissionAmt)) : "N/A",
      commPct: p.commissionPct ? `${p.commissionPct}%` : "N/A",
      status: p.status === "AVAILABLE" ? "Available" : p.status === "UNDER_CONTRACT" ? "Pending" : "Hot",
      highlights: p.features || [],
      commNote: p.commissionNote || "",
      showingSteps: p.showingSteps || [],
      showingNotes: p.showingNotes || "",
      buyerTags: p.buyerTags || [],
      buyerIncome: p.buyerIncome || "",          
      buyerCredit: p.buyerCredit || "",
      buyerFinancing: p.buyerFinancing || "Cash, Owner Finance",
      marketing: p.marketingMaterials || [],
    };
  });

  return <AgentDashboardClient initialProps={serializedProps} />;
}