'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignPropertyClient } from '@/lib/actions';

export default function AssignClientForm({
  propertyId,
  clientType,
  successRedirect,
  initialData // <--- Recibimos los datos de la propiedad
}: {
  propertyId: string;
  clientType: 'BUYER' | 'RENTER';
  successRedirect: string;
  initialData?: { // <--- Definimos qué datos financieros esperamos
    monthlyRent?: number;
    securityDeposit?: number;
    price?: number;
    downPayment?: number;
    interestRate?: number;
  }
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCoOwner, setHasCoOwner] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await assignPropertyClient(propertyId, clientType, formData);

    if (result.success) {
      router.push(successRedirect);
      router.refresh();
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-[#1a1a1a] p-8 rounded-lg shadow-xl border border-gray-800">
      {error && (
        <div className="p-3 bg-red-900/50 text-red-200 text-sm rounded border border-red-800">
          {error}
        </div>
      )}

      {/* SECCIÓN 1: DATOS PERSONALES */}
      <div>
        <h3 className="text-[#f8ed1a] font-bold uppercase text-xs tracking-widest mb-4 border-b border-gray-800 pb-2">
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none"
              placeholder="client@email.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">First Name</label>
              <input type="text" name="firstName" required className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Name</label>
              <input type="text" name="lastName" required className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
            <input type="tel" name="phone" className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
          </div>
        </div>
      </div>

      {/* SECCIÓN CO-PROPIETARIO */}
      <div className="pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <input
            type="checkbox"
            name="hasCoOwner"
            id="hasCoOwner"
            checked={hasCoOwner}
            onChange={(e) => setHasCoOwner(e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-[#0a0f1c] text-[#f8ed1a] focus:ring-[#f8ed1a]"
          />
          <label htmlFor="hasCoOwner" className="text-white font-bold uppercase text-xs tracking-widest">
            Add Co-{clientType === 'BUYER' ? 'Buyer' : 'Tenant'}?
          </label>
        </div>

        {hasCoOwner && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-[#f8ed1a] font-bold uppercase text-xs tracking-widest mb-4 border-b border-gray-800 pb-2">
              Co-{clientType === 'BUYER' ? 'Buyer' : 'Tenant'} Information
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
              <input
                type="email"
                name="coEmail"
                required={hasCoOwner}
                className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none"
                placeholder="co-client@email.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">First Name</label>
                <input type="text" name="coFirstName" required={hasCoOwner} className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Name</label>
                <input type="text" name="coLastName" required={hasCoOwner} className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
              <input type="tel" name="coPhone" className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: TÉRMINOS DEL CONTRATO */}
      <div className="pt-4">
        <h3 className="text-[#f8ed1a] font-bold uppercase text-xs tracking-widest mb-4 border-b border-gray-800 pb-2">
          {clientType === 'BUYER' ? 'Sale & Loan Terms' : 'Lease Agreement Terms'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Date</label>
            <input type="date" name="startDate" required className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
          </div>

          {clientType === 'RENTER' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Monthly Rent ($)</label>
                <input 
                  type="number" 
                  name="monthlyRent" 
                  step="0.01" 
                  required 
                  defaultValue={initialData?.monthlyRent || ''} 
                  className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Security Deposit ($)</label>
                <input 
                  type="number" 
                  name="securityDeposit" 
                  step="0.01" 
                  defaultValue={initialData?.securityDeposit || ''} 
                  className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Lease Term (Months)</label>
                <select 
                  name="leaseTerm" 
                  required 
                  defaultValue="12"
                  className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none"
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Total Price ($)</label>
                <input 
                  type="number" 
                  name="totalAmount" 
                  step="0.01" 
                  required 
                  defaultValue={initialData?.price || ''} 
                  className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Down Payment ($)</label>
                <input 
                  type="number" 
                  name="downPayment" 
                  step="0.01" 
                  required 
                  defaultValue={initialData?.downPayment || ''} 
                  className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Interest Rate (%)</label>
                <input 
                  type="number" 
                  name="interestRate" 
                  step="0.01" 
                  defaultValue={initialData?.interestRate || ''} 
                  className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Term (Years)</label>
                <input type="number" name="termInYears" placeholder="e.g. 30" defaultValue={30} className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] outline-none" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#f8ed1a] text-[#1a1a1a] py-3 rounded-md hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(248,237,26,0.3)] disabled:opacity-50 transition-all font-black uppercase tracking-widest text-sm"
        >
          {isLoading ? 'Creating Contract...' : `Confirm & Assign ${clientType === 'BUYER' ? 'Buyer' : 'Tenant'}`}
        </button>
      </div>
    </form>
  );
}