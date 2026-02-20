'use client';

import { useState, useTransition } from 'react';
import { deleteSellerProfile, assignPropertiesToSeller } from '@/lib/actions';
import Image from 'next/image';
import Link from 'next/link'; // Asegúrate de importar Link

type Seller = {
  id: string;
  sellerName: string | null;
  sellerType: string;
  sellerImage: string | null;
  _count: { properties: number };
};

type Property = {
  id: string;
  titleEn: string;
  address: string;
  sellerProfileId: string | null;
};

export default function SellersClient({ 
  sellers, 
  properties 
}: { 
  sellers: Seller[]; 
  properties: Property[];
}) {
  const [isPending, startTransition] = useTransition();

  // --- ESTADOS: MODAL DE BORRADO ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // --- ESTADOS: MODAL DE ASIGNACIÓN ---
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [sellerToAssign, setSellerToAssign] = useState<Seller | null>(null);
  
  // Arreglo que controla cuántos selectores (dropdowns) de propiedades hay en pantalla
  const [dropdowns, setDropdowns] = useState<string[]>(['']);

  // --- FUNCIONES: BORRADO ---
  const openDeleteModal = (seller: Seller) => {
    setSellerToDelete(seller);
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!sellerToDelete || deleteConfirmText !== 'DELETE') return;
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', sellerToDelete.id);
      await deleteSellerProfile(formData);
      setDeleteModalOpen(false);
      setSellerToDelete(null);
    });
  };

  // --- FUNCIONES: ASIGNACIÓN MÚLTIPLE ---
  const openAssignModal = (seller: Seller) => {
    setSellerToAssign(seller);
    setDropdowns(['']); // Iniciamos con un dropdown vacío por defecto
    setAssignModalOpen(true);
  };

  const updateDropdown = (index: number, value: string) => {
    const newDropdowns = [...dropdowns];
    newDropdowns[index] = value;
    setDropdowns(newDropdowns);
  };

  const handleAssign = () => {
    if (!sellerToAssign) return;

    startTransition(async () => {
      await assignPropertiesToSeller(sellerToAssign.id, dropdowns);
      setAssignModalOpen(false);
      setSellerToAssign(null);
    });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
      
      {/* --- TABLA DE VENDEDORES --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-xs uppercase text-gray-500 font-black tracking-wider border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">Profile</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Assigned Properties</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sellers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  No seller profiles found. Create one to get started.
                </td>
              </tr>
            )}
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 shrink-0">
                      {seller.sellerImage ? (
                        <Image src={seller.sellerImage} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-bold text-base">
                        {seller.sellerName || 'Unnamed Profile'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {seller.id.substring(0,8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    seller.sellerType === 'AGENT' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'
                  }`}>
                    {seller.sellerType}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-[#f8ed1a] font-black border border-gray-700">
                    {seller._count.properties}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  
                  {/* BTN: ASIGNAR PROPIEDADES */}
                  <button 
                    onClick={() => openAssignModal(seller)}
                    className="text-xs font-bold text-[#f8ed1a] hover:text-white uppercase tracking-wide transition-colors"
                  >
                    + Assign
                  </button>
                  

{/* BTN: EDITAR */}
<Link 
  href={`/admin/sellers/${seller.id}/edit`}
  className="text-xs font-bold text-blue-400 hover:text-white uppercase tracking-wide transition-colors"
>
  Edit
</Link>

                  {/* BTN: BORRAR */}
                  <button 
                    onClick={() => openDeleteModal(seller)}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wide transition-colors"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================= */}
      {/* MODAL 1: BORRADO SEGURO (Escribir DELETE)   */}
      {/* ========================================= */}
      {deleteModalOpen && sellerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-red-900/50 rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black uppercase text-white mb-2">Delete Seller?</h3>
            <p className="text-gray-400 text-sm mb-6">
              You are about to delete <strong className="text-white">{sellerToDelete.sellerName}</strong>. 
              Properties assigned to this seller will lose their "Meet Seller" info (it will be set to Null).
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-red-400 uppercase tracking-wide mb-2">
                Type "DELETE" to confirm
              </label>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none uppercase"
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-wide"
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE' || isPending}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-wide rounded-lg shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 2: ASIGNACIÓN MÚLTIPLE DE PROPIEDADES */}
      {/* ========================================= */}
      {assignModalOpen && sellerToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="mb-6 shrink-0">
              <h3 className="text-2xl font-black uppercase text-white mb-2">Assign Properties</h3>
              <p className="text-gray-400 text-sm">
                Linking homes to <strong className="text-[#f8ed1a]">{sellerToAssign.sellerName}</strong>.
              </p>
            </div>
            
            {/* Contenedor scrolleable para los dropdowns */}
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {dropdowns.map((selectedVal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <select 
                      value={selectedVal}
                      onChange={(e) => updateDropdown(index, e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#529e14] focus:border-transparent outline-none text-sm"
                    >
                      <option value="">-- Select a property --</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.titleEn} ({p.address.split(',')[0]}) {p.sellerProfileId === sellerToAssign.id ? '✓ (Already assigned)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Botón para remover este dropdown específico si hay más de uno */}
                  {dropdowns.length > 1 && (
                    <button 
                      onClick={() => setDropdowns(dropdowns.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-400 p-2"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {/* Botón para agregar otro Dropdown */}
              <button 
                onClick={() => setDropdowns([...dropdowns, ''])}
                className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 hover:border-[#f8ed1a] hover:text-[#f8ed1a] font-bold text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <span>+</span> Add Another Property
              </button>
            </div>

            <div className="flex justify-end gap-4 mt-8 shrink-0 pt-4 border-t border-gray-800">
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-wide"
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssign}
                disabled={isPending || dropdowns.every(val => val === '')}
                className="px-6 py-3 bg-[#529e14] hover:bg-[#458510] text-white text-sm font-black uppercase tracking-wide rounded-lg shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}