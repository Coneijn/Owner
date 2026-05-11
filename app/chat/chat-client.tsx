'use client'

import { useState } from "react"
import { sendMessage } from "@/app/actions/chat-actions"
import Link from "next/link"
import { logoutAction } from "@/lib/user-actions" // Usamos la nueva Server Action

// Agregamos isWebUser a los props
export default function ChatClient({ currentUserId, initialMessages, contacts, isWebUser }: any) {
  const [activeContact, setActiveContact] = useState<any>(null)
  const [text, setText] = useState("")

  const chatMessages = initialMessages.filter((m: any) => 
    ((m.senderId === currentUserId && m.recipientId === activeContact?.id) ||
    (m.senderId === activeContact?.id && m.recipientId === currentUserId)) &&
    m.content !== "--initiate conversation--" // Ocultamos el mensaje técnico
  )

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !activeContact) return
    const content = text
    setText("")
    await sendMessage(currentUserId, activeContact.id, content)
  }

  return (
    <div className="flex h-full border border-gray-200 rounded-xl overflow-hidden shadow-xl bg-white">
      {/* Sidebar de Contactos */}
      <div className="w-80 border-r border-gray-200 bg-brand-header text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-gray-800 bg-brand-dark text-brand-accent shadow-sm z-10 flex items-center justify-between">
          <span>Mensajes Internos</span>
          
          {isWebUser ? (
            <form action={logoutAction}>
              <button 
                type="submit"
                className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/20 hover:border-red-500 transition-all duration-200"
              >
                Cerrar Sesión
              </button>
            </form>
          ) : (
            <Link 
              href="/login" 
              className="text-[10px] uppercase tracking-wider bg-brand-header text-gray-400 px-2 py-1 rounded border border-gray-700 hover:text-brand-accent hover:border-brand-accent transition-all duration-200"
            >
              ← Volver
            </Link>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.map((c: any) => (
            <div 
              key={c.id} 
              onClick={() => setActiveContact(c)}
              className={`p-4 cursor-pointer transition-colors duration-200 ${
                activeContact?.id === c.id 
                  ? 'bg-brand-dark border-r-4 border-brand-accent' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <p className={`font-semibold ${activeContact?.id === c.id ? 'text-brand-accent' : 'text-gray-100'}`}>
                {c.name || 'Usuario'}
              </p>
              <p className={`text-xs ${activeContact?.id === c.id ? 'text-gray-300' : 'text-gray-400'}`}>
                {c.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ventana de Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeContact ? (
          <>
            <div className="p-4 border-b border-gray-200 font-bold bg-white text-brand-dark shadow-sm z-10">
              {activeContact.name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.map((m: any) => (
                <div key={m.id} className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                    m.senderId === currentUserId 
                      ? 'bg-brand-accent text-brand-dark rounded-tr-none font-medium' 
                      : 'bg-white border border-gray-200 rounded-tl-none text-brand-dark'
                  }`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${
                      m.senderId === currentUserId ? 'text-brand-dark opacity-80' : 'text-gray-500'
                    }`}>
                      {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex gap-3">
              <input 
                className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-dark bg-gray-50 text-brand-dark transition-all" 
                placeholder="Escribe un mensaje..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="bg-brand-dark text-brand-accent px-8 py-2.5 rounded-full font-bold hover:brightness-125 transition-all shadow-md active:scale-95">
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-50">💬</div>
              <p>Selecciona un contacto para empezar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}