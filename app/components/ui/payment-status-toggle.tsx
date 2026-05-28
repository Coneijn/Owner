'use client';

import { useState, useTransition } from 'react';
import { togglePaymentStatus } from '@/lib/actions';
import { PaymentStatus } from '@prisma/client';

interface StatusToggleProps {
  paymentId: string;
  initialStatus: PaymentStatus;
}

export default function PaymentStatusToggle({ paymentId, initialStatus }: StatusToggleProps) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isPending) return;

    const confirmMsg = status === 'PENDING' 
      ? 'Change this payment status to PAID manually?' 
      : 'Change this payment status back to PENDING?';

    if (window.confirm(confirmMsg)) {
      startTransition(async () => {
        const result = await togglePaymentStatus(paymentId, status);
        if (result.success && result.newStatus) {
          setStatus(result.newStatus);
        } else {
          alert(result.message || 'An error occurred.');
        }
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-2 py-1 rounded text-[11px] font-black uppercase tracking-wider transition-all border shrink-0 min-w-[85px] text-center
        ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${status === 'PAID' 
          ? 'bg-[#529e14]/20 border-[#529e14] text-[#529e14] hover:bg-[#529e14]/30' 
          : 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
        }
      `}
      title="Click to manually change status"
    >
      {isPending ? '...' : status === 'PAID' ? '● Paid' : '● Pending'}
    </button>
  );
}