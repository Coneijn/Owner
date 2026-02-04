'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentLang = searchParams.get('lang') === 'en' ? 'en' : 'es';
  const nextLang = currentLang === 'es' ? 'en' : 'es';

  const toggleLanguage = () => {
    const params = new URLSearchParams(searchParams);
    params.set('lang', nextLang);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="
        px-4 py-2
        rounded-full
        border-2 border-yellow-400
        bg-white
        text-black
        text-sm font-medium
        hover:bg-yellow-50
        transition-colors
      "
    >
      {nextLang === 'en' ? 'English' : 'Español'}
    </button>
  );
}
