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
        px-5 py-3
        rounded-full
        border-4 border-[#529e14]
        bg-yellow-300
        text-black
        text-lg font-semibold
        hover:bg-yellow-50
        transition-colors
      "
    >
      {nextLang === 'en' ? 'English' : 'Español'}
    </button>
  );
}
