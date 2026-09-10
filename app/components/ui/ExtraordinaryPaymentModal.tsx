'use client';
import { recordExtraordinaryPayment } from '@/lib/extraordinary-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExtraordinaryPaymentModalProps {
  agreementId: string;
  agreementType: 'LOAN' | 'LEASE';
}

export default function ExtraordinaryPaymentModal({ agreementId, agreementType }: ExtraordinaryPaymentModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valores del formulario
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [principal, setPrincipal] = useState<number | ''>('');
  const [interest, setInterest] = useState<number | ''>(0);
  const [escrow, setEscrow] = useState<number | ''>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Confirmación
  const [confirmText, setConfirmText] = useState('');

  const resetForm = () => {
    setTotalAmount('');
    setPrincipal('');
    setInterest(0);
    setEscrow(0);
    setConfirmText('');
    setError(null);
    setStep('form');
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    resetForm();
  };

  // Al escribir el total, por default asigna el 100% al principal
  const handleTotalChange = (val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    setTotalAmount(num);
    setPrincipal(num);
    setInterest(0);
    setEscrow(0);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const total = Number(totalAmount) || 0;
    const p = Number(principal) || 0;
    const i = Number(interest) || 0;
    const esc = Number(escrow) || 0;

    if (total <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (p + i + esc !== total) {
      setError(`Breakdown ($${(p + i + esc).toFixed(2)}) must match total ($${total.toFixed(2)}).`);
      return;
    }

    setStep('confirm');
  };

  const handleExecutePayment = async () => {
    if (confirmText !== 'CONFIRM') return;

    setLoading(true);
    setError(null);

    try {
      const res = await recordExtraordinaryPayment({
        agreementId,
        agreementType,
        totalDue: Number(totalAmount),
        principal: Number(principal),
        interest: Number(interest),
        escrow: Number(escrow),
        paymentDate,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to record payment');
      }

      handleClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-3 py-1.5 bg-[#f8ed1a] hover:bg-[#dcd216] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow"
      >
        + Extra Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
              {step === 'form' ? 'Record Extraordinary Payment' : 'Confirm Action'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              {step === 'form' 
                ? 'Defaults 100% to principal balance. You can adjust the split below.'
                : 'Please verify the transaction details carefully.'}
            </p>

            {error && (
              <div className="p-3 mb-4 rounded bg-red-900/30 border border-red-700 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {step === 'form' ? (
              <form onSubmit={handleProceedToConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f8ed1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-base font-bold text-[#f8ed1a] focus:outline-none focus:border-[#f8ed1a]"
                  />
                </div>

                {/* Desglose manual */}
                <div className="pt-3 border-t border-gray-800 space-y-3">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                    Adjust Distribution
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Principal</label>
                      <input
                        type="number"
                        step="0.01"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-[#111] border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Interest</label>
                      <input
                        type="number"
                        step="0.01"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-[#111] border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Escrow</label>
                      <input
                        type="number"
                        step="0.01"
                        value={escrow}
                        onChange={(e) => setEscrow(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-[#111] border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#f8ed1a] hover:bg-[#dcd216] text-black text-xs font-black uppercase rounded-lg transition-colors"
                  >
                    Review & Confirm
                  </button>
                </div>
              </form>
            ) : (
              /* Paso de Advertencia y Confirmación */
              <div className="space-y-4">
                <div className="bg-red-950/40 border border-red-700/60 rounded-xl p-4 text-center">
                  <span className="text-2xl mb-1 block">⚠️</span>
                  <p className="text-red-400 font-black text-sm uppercase tracking-wide">
                    This action cannot be undone, type CONFIRM to continue
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    A payment of <strong className="text-white">${Number(totalAmount).toFixed(2)}</strong> will be applied ({Number(principal).toFixed(2)} to principal).
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Type CONFIRM"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full bg-[#111] border border-red-800/80 rounded-lg px-3 py-2 text-center text-sm font-bold tracking-widest text-white uppercase focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStep('form')}
                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    disabled={confirmText !== 'CONFIRM' || loading}
                    onClick={handleExecutePayment}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-black uppercase rounded-lg transition-colors"
                  >
                    {loading ? 'Recording...' : 'Execute Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}