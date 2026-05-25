import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import PaymentHistoryClient from './payment-history-client';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatDate = (date: any) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return '-';
  }
};

const SERVICE_FEE = 39;

export default async function SellerAgreementDetailsPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ type?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // 1. Obtener el perfil del seller autenticado
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { sellerProfile: true }
  });
  
  const sellerProfile = user?.sellerProfile;
  if (!sellerProfile) redirect('/sellerDashboard');

  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;
  const { type } = searchParams;

  if (!type || (type !== 'LOAN' && type !== 'LEASE' && type !== 'RENTAL')) {
    notFound();
  }

  let agreement: any = null;
  let client: any = null;
  let payments: any[] = [];
  const isLease = type === 'LEASE' || type === 'RENTAL';

  // Buscar en la base de datos según el tipo
  if (isLease) {
    agreement = await prisma.leaseAgreement.findUnique({
      where: { id },
      include: {
        property: { include: { sellerProfile: true } },
        renters: true,
        payments: { orderBy: { paymentDate: 'desc' } } 
      }
    });
    if (agreement) {
      client = agreement.renters?.[0];
      payments = agreement.payments;
    }
  } else {
    agreement = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: { include: { sellerProfile: true } },
        buyers: true,
        payments: { orderBy: { paymentDate: 'desc' } }
      }
    });
    if (agreement) {
      client = agreement.buyers?.[0];
      payments = agreement.payments;
    }
  }

  if (!agreement || !agreement.property) notFound();

  // CAPA DE SEGURIDAD: Verificar que la propiedad le pertenece a este seller
  if (agreement.property.sellerProfileId !== sellerProfile.id) {
    redirect('/sellerDashboard'); 
  }

  const property = agreement.property;
  const seller = property.sellerProfile;

  let progressPct = 0;
  let paidPrincipal = 0;

  if (!isLease && agreement.principalAmount) {
    const paidPayments = payments.filter(p => p.status === 'PAID');
    paidPrincipal = paidPayments.reduce((acc, p) => acc + Number(p.principal), 0);
    progressPct = (paidPrincipal / Number(agreement.principalAmount)) * 100;
  }
const serializedPayments = payments.map((payment) => ({
    ...payment,
    totalDue: payment.totalDue ? Number(payment.totalDue) : 0,
    principal: payment.principal ? Number(payment.principal) : 0,
    interest: payment.interest ? Number(payment.interest) : 0,
    taxes: payment.taxes ? Number(payment.taxes) : 0,
    insurance: payment.insurance ? Number(payment.insurance) : 0,
    serviceFee: payment.serviceFee ? Number(payment.serviceFee) : 0,
    lateFee: payment.lateFee ? Number(payment.lateFee) : 0,
    remainingBalance: payment.remainingBalance ? Number(payment.remainingBalance) : 0,
  }));
  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-sans pb-20">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 pt-10 pb-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/sellerDashboard" className="text-[#f8ed1a] text-sm font-bold hover:underline mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              {isLease ? 'Lease Agreement Details' : 'Contract Details'}
            </h1>
          </div>
          <div>
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${agreement.isActive ? 'bg-[#529e14]/20 text-[#529e14] border border-[#529e14]' : 'bg-red-900/20 text-red-500 border border-red-800'}`}>
              {agreement.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Top 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Property */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Property Info</h2>
            {property.mainImage && (
              <img src={property.mainImage} alt={property.titleEn} className="w-full h-32 object-cover rounded-lg mb-4 border border-gray-700" />
            )}
            <h3 className="text-lg font-bold text-white leading-tight">{property.titleEn || property.titleEs}</h3>
            <p className="text-sm text-gray-400 mt-1">{property.address}, {property.city}, {property.state} {property.zipCode}</p>
            <div className="mt-4 flex gap-3 text-xs text-gray-500 font-bold bg-gray-900 p-2 rounded">
              <span>🛏️ {property.bedrooms} Beds</span>
              <span>🛁 {property.bathrooms} Baths</span>
              <span>📐 {property.sqft} SqFt</span>
            </div>
          </div>

          {/* Card 2: People */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Parties Involved</h2>
            <div className="mb-6">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">{isLease ? 'Tenant' : 'Buyer'}</span>
              <p className="text-lg font-bold text-white">
                {isLease 
                  ? (client?.RenterName || 'Unknown Tenant') 
                  : (`${client?.firstName || 'Unknown'} ${client?.lastName || ''}`)}
              </p>
              {client?.phone && <p className="text-sm text-gray-400 mt-1">📞 {client.phone}</p>}
            </div>
            <div>
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Seller / Owner</span>
              <div className="flex items-center gap-3 mt-1">
                {seller?.sellerImage ? (
                  <img src={seller.sellerImage} className="w-8 h-8 rounded-full border border-gray-600 object-cover" alt="Seller" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs">👔</div>
                )}
                <div>
                  <p className="text-base font-bold text-white">{seller?.sellerName || 'Dueño a Dueño Team'}</p>
                  {seller?.phone && <p className="text-sm text-gray-400">📞 {seller.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Financials */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Financial Terms</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">{isLease ? 'Monthly Rent' : 'Total Amount'}</span>
                  <span className="text-sm font-bold text-[#f8ed1a]">
                    {formatMoney(isLease ? agreement.monthlyRent : Number(agreement.totalAmount || 0) + SERVICE_FEE)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">{isLease ? 'Security Deposit' : 'Down Payment'}</span>
                  <span className="text-sm font-bold text-white">
                    {formatMoney(isLease ? agreement.securityDeposit : agreement.downPayment)}
                  </span>
                </div>
                {!isLease && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Principal Amount</span>
                      <span className="text-sm font-bold text-white">{formatMoney(agreement.principalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Interest Rate</span>
                      <span className="text-sm font-bold text-white">{Number(agreement.interestRate)}%</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Start Date</span>
                  <span className="text-sm font-bold text-white">{formatDate(agreement.startDate)}</span>
                </div>
              </div>
            </div>

            {!isLease && (
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400 uppercase font-bold">Principal Paid</span>
                  <span className="text-[#529e14] font-bold">{progressPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2.5 border border-gray-700 overflow-hidden">
                  <div className="bg-[#529e14] h-2.5 rounded-full" style={{ width: `${Math.min(progressPct, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-500 text-right mt-1">{formatMoney(paidPrincipal)} of {formatMoney(agreement.principalAmount)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments Table (Client Component for Pagination) */}
        <PaymentHistoryClient payments={serializedPayments} isLease={isLease} />
      </main>
    </div>
  );
}