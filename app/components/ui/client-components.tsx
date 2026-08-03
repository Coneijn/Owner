'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import ImpersonateButton from './impersonate-button';

import {
  changePassword,
  createUser,
  deleteUser,
  resetUserPassword,
  sendAdminMagicLink,
  setupTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  updateUserName
} from '@/lib/user-actions';


// --- SHARED: SUBMIT BUTTON ---
function SubmitButton({ text, loadingText = 'Processing...', colorClass = 'bg-[#f8ed1a] text-[#1a1a1a] hover:bg-yellow-400' }: { text: string, loadingText?: string, colorClass?: string }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full py-3 px-4 rounded font-black uppercase tracking-wide transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </span>
      ) : text}
    </button>
  );
}

// ==========================================
// 1. TWO FACTOR MANAGER (2FA)
// ==========================================


// Si tienes las funciones en otro archivo, asegúrate de importarlas
// import { setupTwoFactor, confirmTwoFactor, disableTwoFactor } from './tus-servicios';

interface TwoFactorManagerProps {
  isEnabled: boolean;
  email: string;
  role: string; // <-- Nueva propiedad añadida
}

export function TwoFactorManager({ isEnabled, email, role }: TwoFactorManagerProps) {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // Si tu backend necesita saber el rol para generar el QR, podrías pasarlo aquí: setupTwoFactor(role)
      const result = await setupTwoFactor(); 
      if (result.qrCodeUrl) {
        setQrCode(result.qrCodeUrl);
        setIsSetupMode(true);
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error generating QR code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const result = await confirmTwoFactor(token);
      if (result.success) {
        setStatus({ type: 'success', msg: '2FA Enabled Successfully!' });
        setIsSetupMode(false);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
      } else {
        setStatus({ type: 'error', msg: result.error || 'Invalid code' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    const confirmed = window.confirm("Are you sure you want to disable 2FA? Your account will be less secure.");
    if (!confirmed) return;

    setLoading(true);
    setStatus(null);
    try {
      const result = await disableTwoFactor();
      if (result.success) {
        setStatus({ type: 'success', msg: '2FA has been disabled.' });
      } else {
        setStatus({ type: 'error', msg: result.error || 'Error disabling 2FA' });
      }
    } catch (error) {
        setStatus({ type: 'error', msg: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  // RENDER: ACTIVADO
  if (isEnabled) {
    return (
      <div className="space-y-4 animate-in fade-in">
        <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#529e14] p-2 rounded-full shadow-lg shadow-green-900/50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                2FA Active
                {/* Etiqueta dinámica con el rol del usuario */}
                <span className="bg-gray-700 text-gray-200 text-[10px] px-2 py-0.5 rounded-full tracking-wider">
                  {role}
                </span>
              </h3>
              <p className="text-gray-400 text-xs">Your <span className="lowercase">{role}</span> account ({email}) is secured.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDisable}
          disabled={loading}
          className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 hover:underline transition-all flex items-center gap-2"
        >
          {loading ? 'Processing...' : '⚠️ Disable 2FA'}
        </button>

         {status && (
            <div className={`p-3 rounded border text-xs font-bold ${status.type === 'success' ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
            {status.msg}
            </div>
        )}
      </div>
    );
  }

  // RENDER: DESACTIVADO (SETUP)
  return (
    <div className="space-y-6">
      {!isSetupMode ? (
        <button
          onClick={handleStartSetup}
          disabled={loading}
          className="bg-[#f8ed1a] hover:bg-yellow-400 text-[#1a1a1a] px-6 py-3 rounded font-black uppercase tracking-wide transition-all shadow-lg flex items-center gap-2"
        >
          {loading ? 'Generating...' : `🛡️ Setup 2FA For ${role}`}
        </button>
      ) : (
         <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 animate-in fade-in">
              <h3 className="text-[#f8ed1a] font-bold uppercase mb-4 text-sm">Scan this QR Code</h3>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="bg-white p-2 rounded-lg shadow-xl">
                    {qrCode && <img src={qrCode} alt="QR 2FA" width={150} height={150} />}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <p className="text-sm text-gray-300">
                    1. Open your Authenticator App.<br/>
                    2. Scan the image.<br/>
                    3. Enter the 6-digit code below.
                  </p>
                  
                  <div>
                    <input 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-black border border-gray-600 rounded p-3 text-white text-center font-mono text-xl tracking-widest focus:border-[#f8ed1a] outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => setIsSetupMode(false)}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-bold uppercase text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerify}
                        disabled={loading || token.length < 6}
                        className="flex-1 px-4 py-3 bg-[#529e14] hover:bg-[#458510] text-white rounded font-bold uppercase text-xs disabled:opacity-50 transition-colors shadow-lg"
                      >
                        {loading ? 'Verifying...' : 'Verify & Activate'}
                      </button>
                  </div>
                </div>
              </div>
        </div>
      )}

      {status && (
        <div className={`p-3 rounded border text-xs font-bold ${status.type === 'success' ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
// ==========================================
// 2. CHANGE PASSWORD FORM
// ==========================================
export function ChangePasswordForm() {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    try {
      const result = await changePassword(formData);
      
      if (result && result.error) {
        setMessage({ text: result.error, type: 'error' });
        const form = document.getElementById('change-password-form') as HTMLFormElement;
        form?.reset();
      } else if (result && result.success) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        const form = document.getElementById('change-password-form') as HTMLFormElement;
        form?.reset();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error: any) {
      // Si Next.js nos está pidiendo recargar/redirigir, lo dejamos pasar
      if (error?.message === 'NEXT_REDIRECT' || error?.digest?.includes('NEXT_REDIRECT')) {
        throw error; 
      }
      
      // Si es un fallo de verdad, entonces sí mostramos la alerta
      setMessage({ text: 'Verify your passwords and try again. They must match.', type: 'error' });
      const form = document.getElementById('change-password-form') as HTMLFormElement;
      form?.reset();
    }
  }

  // Función para borrar la alerta de error en cuanto el usuario empiece a teclear de nuevo
  function handleFormChange() {
    if (message?.type === 'error') {
      setMessage(null);
    }
  }

  return (
    <form id="change-password-form" action={handleSubmit} onChange={handleFormChange} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Current Password</label>
        <input name="currentPassword" type="password" required className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Password</label>
        <input name="newPassword" type="password" required minLength={6} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Confirm New Password</label>
        <input name="confirmPassword" type="password" required minLength={6} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] outline-none transition-colors" />
      </div>

      <div className="pt-2">
         <SubmitButton text="Update Password" />
      </div>

      {message && (
        <div className={`p-3 rounded text-sm font-bold ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-red-900/20 text-red-400 border border-red-800'}`}>
          {message.text}
        </div>
      )}
    </form>
  );
}

// ==========================================
// 3. CREATE USER FORM
// ==========================================
export function CreateUserForm() {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createUser(formData);
    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    } else if (result.success) {
      setMessage({ text: `User created! Default password: ${result.tempPassword}`, type: 'success' });
      const form = document.getElementById('create-user-form') as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <form id="create-user-form" action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
            <input name="name" type="text" required className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#529e14] outline-none transition-colors" />
        </div>
        <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">User type</label>
            <select name="role" className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#529e14] outline-none transition-colors">
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="agent">Agent</option>
            <option value="buyer">Buyer</option>
            <option value="renter">Renter</option>
            </select>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
        <input name="email" type="email" required className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#529e14] outline-none transition-colors" />
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Initial Password</label>
        <input name="password" type="password" required minLength={6} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#529e14] outline-none transition-colors" />
      </div>

      <div className="pt-2">
        <SubmitButton text="Create User" colorClass="bg-[#529e14] text-white hover:bg-[#458510]" />
      </div>

      {message && (
        <div className={`p-4 rounded text-sm font-bold border break-all ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
          {message.type === 'success' && <span className="block mb-1 text-xs uppercase opacity-70">Success - Save this credentials:</span>}
          {message.text}
        </div>
      )}
    </form>
  );
}

// ==========================================
// 4. USER LIST TABLE
// ==========================================
interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    isTwoFactorEnabled: boolean;
}

export function UserListTable({ users, currentUserEmail }: { users: User[], currentUserEmail: string | null | undefined }) {
    const [resetMsg, setResetMsg] = useState<{userId: string, msg: string} | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleEditClick = (user: User) => {
        setEditingUserId(user.id);
        setEditNameValue(user.name || '');
    };

    const handleSaveName = async (userId: string) => {
        setIsUpdating(true);
        const result = await updateUserName(userId, editNameValue);
        if (!result.success) {
            alert(result.error || 'Error updating name');
        }
        setEditingUserId(null);
        setIsUpdating(false);
    };

    const handleSendMagicLink = async (userId: string) => {
        if(!confirm('Are you sure you want to send a magic link to this user?')) return;
        
        const result = await sendAdminMagicLink(userId);
        if(result.success) {
            setResetMsg({ userId, msg: result.message || 'Sent successfully' });
        } else {
            alert(result.error || 'Error sending the link');
        }
    };

    const handleDelete = async (userId: string) => {
        if(!confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;
        await deleteUser(userId);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-black text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Seguridad (2FA)</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    {editingUserId === user.id ? (
                                        <div className="flex items-center gap-2 mb-1">
                                            <input
                                                type="text"
                                                value={editNameValue}
                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                disabled={isUpdating}
                                                className="bg-black border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-[#f8ed1a] outline-none"
                                            />
                                            <button onClick={() => handleSaveName(user.id)} disabled={isUpdating} className="text-green-400 hover:text-green-300 font-bold text-xs">Save</button>
                                            <button onClick={() => setEditingUserId(null)} disabled={isUpdating} className="text-gray-400 hover:text-white font-bold text-xs">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{user.name || 'Unnamed'}</span>
                                            <button onClick={() => handleEditClick(user)} className="text-gray-500 hover:text-white" title="Edit name">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <span className="text-xs">{user.email}</span>
                                    {currentUserEmail === user.email && (
                                        <span className="text-[10px] text-[#f8ed1a] font-bold uppercase mt-1">(You)</span>
                                    )}
                                </div>
                                {/* Show Reset Password Result Inline */}
                                {resetMsg?.userId === user.id && (
                                    <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 text-yellow-200 text-xs font-mono rounded">
                                        {resetMsg.msg}
                                        <button onClick={() => setResetMsg(null)} className="ml-2 text-white hover:underline">Dismiss</button>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-[#f8ed1a] text-black' : 'bg-gray-700 text-white'}`}>
                                    {user.role}
                                </span>
                            </td>

                              <td className="px-6 py-4">
                                {user.isTwoFactorEnabled ? (
                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-green-900/30 text-green-400 border border-green-800 flex items-center gap-1 w-max">
                                        🔒 Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1 w-max">
                                        🔓 Inactive
                                    </span>
                                )}
                            </td>

                            <td className="px-6 py-4">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                                {currentUserEmail !== user.email && (
                                    <>
                                    <ImpersonateButton targetUserId={user.id} targetUserName={user.name || user.email || 'Usuario'} />
                                    
                                    <button 
                                        onClick={() => handleSendMagicLink(user.id)}
                                        className="text-blue-400 hover:text-blue-300 font-bold text-xs uppercase hover:underline"
                                    >
                                        Magic Link
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                            className="text-red-500 hover:text-red-400 font-bold text-xs uppercase hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}