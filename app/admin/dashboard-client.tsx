'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeletePropertyButton from '@/app/components/ui/delete-button';
import { deleteAgreement } from '@/lib/actions';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatDate = (date: any) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '-';
  }
};

/* =========================================================
   PROPERTY SECTION
   ========================================================= */
const PropertySection = ({ title, items, icon, colorClass }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-4 bg-[#1c2030] border border-[#2e3340] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#1c2030] hover:bg-[#222838] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h2 className={`text-[12px] font-bold uppercase tracking-[1px] ${colorClass}`}>
            {title}
            <span className="text-[#8892a4] ml-2 normal-case">({items.length})</span>
          </h2>
        </div>
        <span
          className={`text-[#8892a4] text-xs transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-[#2e3340]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                    Property
                  </th>
                  <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                    Type & Price
                  </th>
                  <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                    Seller
                  </th>
                  <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#F8ED1A] py-2.5 px-4 border-b border-[#2e3340]">
                    Lockbox
                  </th>
                  <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                    Specs
                  </th>
                  <th className="text-right text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((property: any) => {
                  const isRent = property.isForRent;
                  const isSale = property.isForSale;

                  return (
                    <tr
                      key={property.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Property */}
                      <td className="px-4 py-3 border-b border-white/[0.04] align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 bg-[#111318] rounded-lg overflow-hidden border border-[#2e3340] relative">
                            {property.mainImage ? (
                              <img
                                src={property.mainImage}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[#4b5563] text-[10px]">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-white truncate max-w-[220px]">
                              {property.titleEn || property.titleEs}
                            </div>
                            <div className="text-[11px] text-[#8892a4]">
                              {property.address}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Price */}
                      <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {isSale && (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-[#F8ED1A] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  SALE
                                </span>
                                <span className="text-[13px] text-[#F8ED1A] font-bold">
                                  {formatMoney(property.price)}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8892a4] ml-1">
                                Down: {formatMoney(property.downPayment)}
                              </div>
                            </div>
                          )}
                          {isRent && (
                            <div
                              className={
                                isSale ? 'mt-1 pt-1 border-t border-[#2e3340]' : ''
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span className="bg-[#60a5fa] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  RENT
                                </span>
                                <span className="text-[13px] text-[#60a5fa] font-bold">
                                  {formatMoney(property.monthlyRent)}/mo
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8892a4] ml-1">
                                Dep: {formatMoney(property.securityDeposit)}
                              </div>
                            </div>
                          )}
                          {!isSale && !isRent && (
                            <span className="text-[#4b5563] text-xs italic">
                              Not configured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {property.sellerImage && (
                            <img
                              src={property.sellerImage}
                              className="w-6 h-6 rounded-full object-cover border border-[#2e3340]"
                              alt="Seller"
                            />
                          )}
                          <div>
                            <div className="text-[12px] text-white font-bold">
                              {property.sellerName || (
                                <span className="text-[#4b5563] italic text-[11px]">
                                  Dueño a Dueño Team
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-[#8892a4] uppercase tracking-wider">
                              {property.sellerType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lockbox */}
                      <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                        {property.lockboxCode ? (
                          <span className="px-2 py-1 rounded bg-[#111318] border border-[#2e3340] text-[#F8ED1A] font-mono font-bold text-[11px] tracking-wider">
                            {property.lockboxCode}
                          </span>
                        ) : (
                          <span className="text-[#4b5563] text-xs">-</span>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap text-[11px] text-[#8892a4] font-semibold">
                        {property.bedrooms} bd • {property.bathrooms} ba •{' '}
                        {property.sqft} sqft
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 border-b border-white/[0.04] align-middle text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-3">
                          <Link
                            href={`/propiedades/${property.slug}`}
                            target="_blank"
                            className="text-[#8892a4] hover:text-white transition-colors text-sm"
                            title="View"
                          >
                            👁️
                          </Link>
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="text-[#60a5fa] hover:text-[#93c5fd] font-bold uppercase text-[10px] tracking-wider"
                          >
                            Edit
                          </Link>
                          <DeletePropertyButton id={property.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#2e3340] bg-[#111318]/40">
              <span className="text-[11px] text-[#8892a4]">
                Showing{' '}
                <span className="font-bold text-white">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-white">
                  {Math.min(startIndex + itemsPerPage, items.length)}
                </span>{' '}
                of {items.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-[#111318] border border-[#2e3340] text-[#8892a4] hover:border-[#F8ED1A] hover:text-[#F8ED1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-[#111318] border border-[#2e3340] text-[#8892a4] hover:border-[#F8ED1A] hover:text-[#F8ED1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   CONTRACT / LEASE SECTION
   ========================================================= */
const ContractSection = ({
  contracts,
  isLease = false,
}: {
  contracts: any[];
  isLease?: boolean;
}) => {
  const router = useRouter();

  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1c2030] border border-dashed border-[#2e3340] rounded-xl">
        <p className="text-[#8892a4] text-sm">
          No {isLease ? 'lease agreements' : 'contracts or active loans'} found.
        </p>
      </div>
    );
  }

  const handleDelete = async (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        'Are you sure you want to delete this agreement? This action cannot be undone.'
      )
    ) {
      const response = await deleteAgreement(contractId, isLease);
      if (!response.success) {
        alert(response.message);
      }
    }
  };

  return (
    <div className="bg-[#1c2030] border border-[#2e3340] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                Property & Type
              </th>
              <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                Seller Details
              </th>
              <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                {isLease ? 'Tenant Details' : 'Buyer Details'}
              </th>
              <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#F8ED1A] py-2.5 px-4 border-b border-[#2e3340]">
                Financial Terms
              </th>
              <th className="text-left text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]">
                Status
              </th>
              <th className="text-right text-[9px] font-bold uppercase tracking-[0.6px] text-[#f87171] py-2.5 px-4 border-b border-[#2e3340]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract: any) => {
              const client = isLease
                ? contract?.renters?.[0] ||
                  contract?.renter ||
                  contract?.buyers?.[0] ||
                  contract?.buyer
                : contract?.buyers?.[0] || contract?.buyer;

              const seller = contract?.property?.sellerProfile;

              const isUnknown = isLease
                ? !client?.RenterName
                : !client?.firstName && !client?.lastName;

              return (
                <tr
                  key={contract.id}
                  onClick={() =>
                    router.push(
                      `/admin/agreements/${contract.id}?type=${
                        isLease ? 'LEASE' : 'LOAN'
                      }`
                    )
                  }
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {/* Property + Type */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white max-w-[200px] truncate">
                        {contract?.property?.titleEn ||
                          contract?.property?.titleEs ||
                          'Property Name N/A'}
                      </span>
                      <span className="text-[11px] text-[#8892a4] mb-1">
                        {contract?.property?.address || 'Address N/A'}
                      </span>
                      <span
                        className={`w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          contract?.type === 'LOAN'
                            ? 'bg-[#F8ED1A] text-black'
                            : 'bg-[#60a5fa] text-white'
                        }`}
                      >
                        {contract?.type || 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Seller */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {seller?.sellerImage && (
                        <img
                          src={seller.sellerImage}
                          className="w-7 h-7 rounded-full object-cover border border-[#2e3340]"
                          alt="Seller"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-white">
                          {seller?.sellerName || (
                            <span className="text-[#4b5563] italic">
                              Dueño a Dueño Team
                            </span>
                          )}
                        </span>
                        {seller?.phone && (
                          <span className="text-[11px] text-[#8892a4]">
                            {seller.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-white">
                        {isLease
                          ? client?.RenterName || 'Unknown Tenant'
                          : client
                          ? `${client.firstName || 'Unknown'} ${
                              client.lastName || 'Buyer'
                            }`
                          : 'Unknown Buyer'}
                      </span>

                      {isUnknown ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/admin/properties/${
                                contract?.propertyId || contract?.property?.id
                              }/assign?type=${isLease ? 'RENTED' : 'SOLD'}`
                            );
                          }}
                          className="mt-1 w-fit bg-[#F8ED1A] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase hover:bg-[#e6dc10] transition-colors tracking-wide"
                        >
                          Assign {isLease ? 'Tenant' : 'Buyer'}
                        </button>
                      ) : (
                        <>
                          {client?.user?.email && (
                            <span className="text-[11px] text-[#8892a4]">
                              {client.user.email}
                            </span>
                          )}
                          {client?.phone && (
                            <span className="text-[11px] text-[#8892a4]">
                              {client.phone}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>

                  {/* Financial */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] text-white font-bold">
                        {isLease ? 'Rent: ' : 'Amt: '}
                        {formatMoney(
                          contract?.totalAmount || contract?.monthlyRent || 0
                        )}
                      </span>
                      <div className="text-[11px] text-[#8892a4] flex gap-2">
                        {isLease ? (
                          <>
                            {contract?.securityDeposit ? (
                              <span>
                                Dep: {formatMoney(contract.securityDeposit)}
                              </span>
                            ) : null}
                            {contract?.termInYears ? (
                              <span>Term: {contract.termInYears} mos</span>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {contract?.interestRate ? (
                              <span>Rate: {contract.interestRate}%</span>
                            ) : null}
                            {contract?.termInYears ? (
                              <span>Term: {contract.termInYears} yrs</span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {contract?.isActive ? (
                        <span className="inline-flex items-center gap-1.5 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(52,211,153,.1)] text-[#34d399] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(248,113,113,.1)] text-[#f87171] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                          Inactive
                        </span>
                      )}
                      <span className="text-[10px] text-[#8892a4]">
                        Started: {formatDate(contract?.startDate)}
                      </span>
                      {contract?.payments && (
                        <div className="mt-1 pt-1 border-t border-[#2e3340] flex flex-col">
                          <span className="text-[10px] text-[#F8ED1A] font-bold">
                            {contract.payments.length} Generated Payments
                          </span>
                          <span className="text-[10px] text-[#8892a4]">
                            {
                              contract.payments.filter(
                                (p: any) => p.status === 'PAID'
                              ).length
                            }{' '}
                            Paid
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle text-right whitespace-nowrap">
                    <button
                      onClick={(e) => handleDelete(e, contract.id)}
                      className="text-[#f87171] hover:text-[#fca5a5] font-bold uppercase text-[10px] tracking-wider transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN CLIENT
   ========================================================= */
export default function DashboardClient({
  properties = [],
  contracts = [],
}: {
  properties: any[];
  contracts?: any[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'properties' | 'contracts' | 'leases'>(
    'properties'
  );

  const salesContracts = contracts.filter((c) => c.type === 'LOAN');
  const leaseAgreements = contracts.filter(
    (c) => c.type === 'RENTAL' || c.type === 'LEASE' || c.type !== 'LOAN'
  );

  const filteredProperties = properties.filter((p) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      p.titleEn?.toLowerCase().includes(query) ||
      p.titleEs?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.zipCode?.toLowerCase().includes(query)
    );
  });

  const availableProps = filteredProperties.filter((p) => p.status === 'AVAILABLE');
  const underContractProps = filteredProperties.filter(
    (p) => p.status === 'UNDER_CONTRACT'
  );
  const soldProps = filteredProperties.filter((p) => p.status === 'SOLD');
  const rentedProps = filteredProperties.filter((p) => p.status === 'RENTED');
  const draftProps = filteredProperties.filter((p) => p.status === 'DRAFT');
  const comingSoonProps = filteredProperties.filter(
    (p) => p.status === 'COMING_SOON'
  );

  return (
    <div className="space-y-6">
      {/* ===== TABS ===== */}
      <div className="flex border-b border-[#2a2d38] gap-1 overflow-x-auto whitespace-nowrap">
        <TabButton
          active={activeTab === 'properties'}
          onClick={() => setActiveTab('properties')}
        >
          All Properties
        </TabButton>
        <TabButton
          active={activeTab === 'contracts'}
          onClick={() => setActiveTab('contracts')}
          badge={salesContracts.length}
        >
          All Contracts
        </TabButton>
        <TabButton
          active={activeTab === 'leases'}
          onClick={() => setActiveTab('leases')}
          badge={leaseAgreements.length}
        >
          All Lease Agreements
        </TabButton>
      </div>

      {/* ===== PROPERTIES TAB ===== */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563] text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search properties by title, address, or zip code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111318] border border-[#2e3340] text-white rounded-lg py-3 pl-11 pr-4 text-[13px] focus:outline-none focus:border-[#F8ED1A] transition-colors placeholder:text-[#4b5563]"
            />
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-20 bg-[#1c2030] border border-dashed border-[#2e3340] rounded-xl">
              <p className="text-[#8892a4] text-sm">
                No properties found matching &ldquo;{searchTerm}&rdquo;.
              </p>
            </div>
          )}

          <PropertySection
            title="Available Properties"
            items={availableProps}
            icon="✅"
            colorClass="text-[#34d399]"
          />
          <PropertySection
            title="Coming Soon"
            items={comingSoonProps}
            icon="⏳"
            colorClass="text-[#60a5fa]"
          />
          <PropertySection
            title="Under Contract"
            items={underContractProps}
            icon="📝"
            colorClass="text-[#F8ED1A]"
          />
          <PropertySection
            title="Sold History"
            items={soldProps}
            icon="💰"
            colorClass="text-[#f87171]"
          />
          <PropertySection
            title="Rented History"
            items={rentedProps}
            icon="🏠"
            colorClass="text-[#a78bfa]"
          />
          <PropertySection
            title="Drafts"
            items={draftProps}
            icon="✏️"
            colorClass="text-[#fb923c]"
          />
        </div>
      )}

      {/* ===== CONTRACTS TAB ===== */}
      {activeTab === 'contracts' && (
        <ContractSection contracts={salesContracts} isLease={false} />
      )}

      {/* ===== LEASES TAB ===== */}
      {activeTab === 'leases' && (
        <ContractSection contracts={leaseAgreements} isLease={true} />
      )}
    </div>
  );
}

/* ---------- Tabs helper ---------- */
function TabButton({
  active,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-2 text-[12px] font-black uppercase tracking-wider transition-colors border-b-[3px] -mb-px flex items-center gap-2 ${
        active
          ? 'text-[#F8ED1A] border-[#F8ED1A]'
          : 'text-[#8892a4] border-transparent hover:text-white'
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="bg-[rgba(248,237,26,.15)] text-[#F8ED1A] px-2 py-0.5 rounded-full text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}