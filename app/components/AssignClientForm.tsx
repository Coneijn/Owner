'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignPropertyClient } from '@/lib/actions';

export default function AssignClientForm({
  propertyId,
  clientType,
  successRedirect
}: {
  propertyId: string;
  clientType: 'BUYER' | 'RENTER';
  successRedirect: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <form action={handleSubmit} className="space-y-4 bg-[#1a1a1a] p-6 rounded-lg shadow-xl border border-gray-800">
      {error && (
        <div className="p-3 bg-red-900/50 text-red-200 text-sm rounded border border-red-800">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Email Address </label>
        <input
          type="email"
          name="email"
          //required
          className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] focus:border-[#f8ed1a] outline-none transition-colors"
          placeholder="client@email.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">First Name </label>
          <input 
            type="text" 
            name="firstName" 
            //required
            className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] focus:border-[#f8ed1a] outline-none transition-colors" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Last Name </label>
          <input 
            type="text" 
            name="lastName" 
            //required 
            className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] focus:border-[#f8ed1a] outline-none transition-colors" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Phone Number</label>
        <input 
          type="tel" 
          name="phone" 
          className="w-full bg-[#0a0f1c] text-white border border-gray-700 p-2 rounded focus:ring-2 focus:ring-[#f8ed1a] focus:border-[#f8ed1a] outline-none transition-colors" 
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#f8ed1a] text-[#1a1a1a] py-2.5 rounded-md hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(248,237,26,0.4)] disabled:opacity-50 transition-all font-bold"
        >
          {isLoading ? 'Processing...' : `Assign ${clientType === 'BUYER' ? 'Buyer' : 'Renter'}`}
        </button>
      </div>
    </form>
  );
}