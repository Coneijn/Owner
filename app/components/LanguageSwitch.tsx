'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentLang = searchParams.get('lang') === 'en' ? 'en' : 'es';

  const toggleLanguage = () => {
    const params = new URLSearchParams(searchParams);
    const newLang = currentLang === 'es' ? 'en' : 'es';
    params.set('lang', newLang);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      <span className={currentLang === 'es' ? 'font-bold text-blue-600' : 'text-gray-400'}>ES</span>
      <span className="text-gray-300">|</span>
      <span className={currentLang === 'en' ? 'font-bold text-blue-600' : 'text-gray-400'}>EN</span>
    </button>
  );
}