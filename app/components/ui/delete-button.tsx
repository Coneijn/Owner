'use client';

import { useState } from 'react';
import { deleteProperty } from '@/lib/actions';

export default function DeletePropertyButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationWord, setConfirmationWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Creamos un FormData manualmente para reutilizar tu server action existente
    const formData = new FormData();
    formData.append('id', id);
    
    await deleteProperty(formData);
    // No necesitamos setIsDeleting(false) ni cerrar el modal porque
    // el server action hará revalidatePath y recargará la página.
  };

  return (
    <>
      {/* Botón inicial (Trigger) */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-red-500 hover:text-red-400 ml-2 font-bold uppercase text-xs tracking-wide"
      >
        Delete
      </button>

      {/* Modal de Confirmación */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          {/* Se aumentó el ancho máximo a max-w-lg y se añadió text-center */}
          <div className="bg-[#1a1a1a] border border-gray-700 p-6 rounded-xl shadow-2xl max-w-lg w-full relative animate-in fade-in zoom-in duration-200 text-center">
            
            <h3 className="text-xl font-black text-white uppercase mb-4">Delete Property?</h3>
            
            {/* Se forzó el salto de línea con <br /> para dividir en dos renglones */}
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              This action cannot be undone.<br />To confirm, please type <span className="text-red-500 font-bold select-none">DELETE</span> below.
            </p>

            <input 
              type="text" 
              placeholder="Type DELETE"
              value={confirmationWord}
              onChange={(e) => setConfirmationWord(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors mb-6 font-bold text-center"
            />

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                    setIsOpen(false);
                    setConfirmationWord('');
                }}
                className="px-6 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={confirmationWord !== 'DELETE' || isDeleting}
                className={`px-6 py-2 rounded-lg text-sm font-bold text-white uppercase tracking-wide transition-all
                  ${confirmationWord === 'DELETE' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20' 
                    : 'bg-gray-700 cursor-not-allowed opacity-50'}
                `}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}