'use client';

// 1. CAMBIO: Importamos useActionState de 'react' en lugar de 'react-dom'
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; 
import { authenticate } from '@/lib/actions';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function LoginForm() {
  // 2. CAMBIO: Usamos useActionState. 
  // Nota: Devuelve [state, dispatch, isPending].
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (errorMessage === '2FA_REQUIRED') {
      setShowTwoFactor(true);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (showTwoFactor && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [showTwoFactor]);

  return (
    <form action={dispatch} className="space-y-3 w-full max-w-md mx-auto">
      <div className="flex-1 rounded-xl bg-[#1a1a1a] border border-gray-800 px-8 pb-8 pt-8 shadow-2xl">
        
        <h1 className="mb-6 text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            {showTwoFactor ? '🛡️ 2-Step Verification' : '🔐 Admin Login'}
        </h1>
        
        <div className="w-full">
          
          {/* --- STEP 1: CREDENTIALS --- */}
          {!showTwoFactor && (
            <div className="space-y-5 animate-in fade-in">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      className="peer block w-full rounded-md border border-gray-700 bg-black py-3 pl-10 text-sm text-white placeholder:text-gray-600 focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] outline-none transition-all"
                      id="email"
                      type="email"
                      name="email"
                      placeholder="admin@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-[#f8ed1a]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="peer block w-full rounded-md border border-gray-700 bg-black py-3 pl-10 text-sm text-white placeholder:text-gray-600 focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] outline-none transition-all"
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-[#f8ed1a]">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {/* --- STEP 2: 2FA CODE --- */}
          {showTwoFactor && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
               
               <input type="hidden" name="email" value={email} />
               <input type="hidden" name="password" value={password} />

               <div className="bg-blue-900/20 border border-blue-800 text-blue-200 px-4 py-3 rounded mb-6 text-sm flex items-start gap-3">
                  <span className="text-xl">ℹ️</span>
                  <p className="leading-relaxed">Two-factor authentication is enabled for this account. Please verify your identity.</p>
               </div>

                <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-gray-400 text-center" htmlFor="code">
                    Authenticator Code (6 Digits)
                </label>
                <div className="relative mb-2">
                    <input
                        ref={codeInputRef}
                        className="peer block w-full rounded-md border border-gray-700 bg-black py-4 text-center text-2xl text-white font-mono tracking-[0.5em] outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all"
                        id="code"
                        type="text"
                        name="code"
                        placeholder="000000"
                        maxLength={6}
                        pattern="\d{6}"
                        inputMode="numeric"
                        required
                        autoComplete="one-time-code"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                    Open your Google Authenticator or Authy app.
                </p>
            </div>
          )}
        </div>

        <div className="mt-8">
             <LoginButton text={showTwoFactor ? 'Verify & Sign In' : 'Sign In'} />
        </div>
        
        {/* ERROR MESSAGES */}
        {errorMessage && errorMessage !== '2FA_REQUIRED' && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400" aria-live="polite">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}

function LoginButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button 
      className="w-full justify-center rounded-md bg-[#f8ed1a] px-3 py-3 text-sm font-black uppercase tracking-wide text-[#1a1a1a] shadow-lg hover:bg-yellow-400 hover:shadow-yellow-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#1a1a1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : text}
    </button>
  );
}