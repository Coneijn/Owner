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