export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
export const DEFAULT_TERM_YEARS = 30;
export const SERVICE_FEE = 39;

export function calculateEstimatedPayment(
  price: number,
  downPayment: number,
  annualTaxes: number,
  annualInsurance: number,
  interestRate: number
) {
  const loanAmount = price - downPayment;
  // Safety check to avoid division by zero if interest is 0 (unlikely but good practice)
  if (loanAmount <= 0) return SERVICE_FEE + (annualTaxes / 12) + (annualInsurance / 12);

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = DEFAULT_TERM_YEARS * 12;

  let principalAndInterest = 0;
  if (monthlyRate > 0) {
    principalAndInterest =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } else {
    principalAndInterest = loanAmount / numberOfPayments;
  }

  const monthlyTaxes = annualTaxes / 12;
  const monthlyInsurance = annualInsurance / 12;

  return principalAndInterest + monthlyTaxes + monthlyInsurance + SERVICE_FEE;
}

export function formatMoney(amount: number | unknown) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function normalizeProperty(property: any) {
    return {
      ...property,
      price: property.price?.toNumber() ?? 0,
      downPayment: property.downPayment?.toNumber() ?? 0,
      interestRate: property.interestRate?.toNumber() ?? 0,
      taxes: property.taxes?.toNumber() ?? 0,
      insurance: property.insurance?.toNumber() ?? 0,
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString(),
    };
}
{/*cosas puestas para seller page*/}
export interface SellerProjection {
  askingPrice: number;
  estimatedDownPayment: number;
  financedAmount: number;
  interestRateMin: number;
  interestRateMax: number;
  termYears: number;
  grossMonthlyPayment: number;
  serviceFee: number;
  netMonthlyIncome: number;
  platformFee: number;
}

export function calculateSellerProjection(askingPrice: number): SellerProjection {
  // Reglas de negocio del Seller Funnel
  const TERM_YEARS = 15;
  const SERVICE_FEE = 129;
  const INTEREST_RATE = 11; // Usaremos 11% como promedio para el cálculo base (entre 10% y 12%)
  
  // 1. Enganche estimado (Asumimos un 10% del valor, con un mínimo de $10,000 y tope de $20,000)
  let estimatedDownPayment = askingPrice * 0.10;
  if (estimatedDownPayment < 10000) estimatedDownPayment = 10000;
  if (estimatedDownPayment > 20000) estimatedDownPayment = 20000; 

  // 2. Monto a financiar
  const financedAmount = askingPrice - estimatedDownPayment;

  // 3. Pago mensual bruto (Fórmula de amortización estándar)
  const monthlyRate = (INTEREST_RATE / 100) / 12;
  const numberOfPayments = TERM_YEARS * 12;
  
  let grossMonthlyPayment = 0;
  if (financedAmount > 0) {
    grossMonthlyPayment = 
      (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // 4. Ingreso neto mensual para el vendedor
  const netMonthlyIncome = grossMonthlyPayment - SERVICE_FEE;

  // 5. Tarifa única de la plataforma (50% del enganche, tope de $10,000)
  let platformFee = estimatedDownPayment * 0.50;
  if (platformFee > 10000) platformFee = 10000;

  return {
    askingPrice,
    estimatedDownPayment,
    financedAmount,
    interestRateMin: 10,
    interestRateMax: 12,
    termYears: TERM_YEARS,
    grossMonthlyPayment,
    serviceFee: SERVICE_FEE,
    netMonthlyIncome,
    platformFee
  };
}