'use client';

import { useActionState, useState } from 'react';
import { updateOwnPassword, createNewUser, adminResetPassword } from '@/lib/user-actions';

// --- COMPONENTE: FORMULARIO CAMBIO DE PASSWORD ---
export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(updateOwnPassword, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase">Current Password</label>
        <input type="password" name="currentPassword" required className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase">New Password</label>
        <input type="password" name="newPassword" required className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase">Confirm New Password</label>
        <input type="password" name="confirmPassword" required className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#f8ed1a] sm:text-sm" />
      </div>

      {state?.message && (
        <p className={`text-sm font-bold ${state.success ? 'text-[#529e14]' : 'text-red-400'}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#f8ed1a] hover:bg-yellow-400 text-[#1a1a1a] px-4 py-2 rounded font-bold uppercase text-xs tracking-wide transition-colors"
        >
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}

// --- COMPONENTE: FORMULARIO NUEVO USUARIO ---
export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createNewUser, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase">Full Name</label>
        <input type="text" name="name" required className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase">Email Address</label>
        <input type="email" name="email" required className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase">Initial Password</label>
        <input type="password" name="password" required className="mt-1 block w-full rounded-md border-0 py-2 bg-gray-800 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-[#529e14] sm:text-sm" />
      </div>

      {state?.message && (
        <p className={`text-sm font-bold ${state.success ? 'text-[#529e14]' : 'text-red-400'}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#529e14] hover:bg-[#458510] text-white px-4 py-2 rounded font-bold uppercase text-xs tracking-wide transition-colors"
        >
          {isPending ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
}

// --- COMPONENTE: LISTA DE USUARIOS CON BOTÓN RESET ---
export function UserListTable({ users, currentUserEmail }: { users: any[], currentUserEmail: string }) {
  const [resetData, setResetData] = useState<{ name: string, pass: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReset = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de restablecer la contraseña para ${userName}?`)) return;
    
    setLoadingId(userId);
    const result = await adminResetPassword(userId);
    setLoadingId(null);

    if (result.success && result.newPassword) {
      setResetData({ name: userName, pass: result.newPassword });
    } else {
      alert('Error al restablecer contraseña');
    }
  };

  return (
    <div>
      {/* MODAL / ALERTA DE NUEVA CONTRASEÑA */}
      {resetData && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-[#f8ed1a] rounded-lg flex justify-between items-center animate-pulse">
          <div>
            <p className="text-[#f8ed1a] font-bold text-sm uppercase">Password Reset Successful</p>
            <p className="text-gray-300 text-sm mt-1">
              New password for <strong className="text-white">{resetData.name}</strong>: 
              <span className="ml-2 bg-black px-2 py-1 rounded text-[#f8ed1a] font-mono select-all cursor-text">{resetData.pass}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Copy this now. It will not be shown again.</p>
          </div>
          <button onClick={() => setResetData(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-700/30">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.email !== currentUserEmail && (
                    <button
                      onClick={() => handleReset(user.id, user.name || 'User')}
                      disabled={loadingId === user.id}
                      className="text-[#f8ed1a] hover:text-yellow-200 text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                    >
                      {loadingId === user.id ? 'Resetting...' : 'Reset Password'}
                    </button>
                  )}
                  {user.email === currentUserEmail && (
                    <span className="text-gray-600 text-xs italic">Current User</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}