export function normalizeProperty(property: any) {
    return {
      ...property,
      // Safely convert Decimals to numbers, handling nulls
      price: property.price?.toNumber() ?? 0,
      downPayment: property.downPayment?.toNumber() ?? 0,
      interestRate: property.interestRate?.toNumber() ?? 0,
      taxes: property.taxes?.toNumber() ?? 0,
      insurance: property.insurance?.toNumber() ?? 0,
      
      // Safely convert Dates to strings (avoids serialization warnings)
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString(),
    };
  }