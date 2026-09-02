'use client';

import { UserPlus } from 'lucide-react';

export default function AddContactButton({ lang }: { lang: 'en' | 'es' }) {
  const phoneNumber = "9016604100";
  const text = lang === 'es' ? 'Agreganos a tus contactos' : 'Add us to your contacts';

  const handleAddContact = () => {
    // Generamos un archivo vCard para abrir la app de contactos
    const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN:Dueno a Dueno\nORG:Dueno a Dueno\nTEL;TYPE=WORK,VOICE:+19016604100\nEND:VCARD";
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Dueno_a_Dueno.vcf';
    document.body.appendChild(link);
    link.click();
    
    // Limpiamos el DOM
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @keyframes colorBlink {
          0%, 100% { background-color: #f8ed1a; color: #1a1a1a; }
          50% { background-color: #529e14; color: #ffffff; }
        }
        .btn-blink {
          animation: colorBlink 2s infinite;
        }
      `}</style>
      <button
        onClick={handleAddContact}
        className="
          btn-blink flex items-center justify-center gap-3 mx-auto mt-6
          px-6 py-4 rounded-lg font-black uppercase tracking-wide
          transition-transform active:scale-95 shadow-xl hover:scale-105
        "
        aria-label={text}
      >
        <UserPlus className="w-6 h-6" />
        <span>{text}</span>
      </button>
    </>
  );
}