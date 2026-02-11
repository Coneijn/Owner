'use client';

import { useRef, useState } from 'react';

interface HtmlEditorProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export default function HtmlEditor({ 
  label, 
  name, 
  defaultValue = '', 
  placeholder, 
  rows = 8, 
  required = false 
}: HtmlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);

  // Función mágica para insertar etiquetas
  const insertTag = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    // Si no hay texto seleccionado y es un enlace, el comportamiento es distinto, 
    // pero para headers usualmente queremos envolver algo.
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = `${before}${prefix}${selectedText}${suffix}${after}`;
    
    setValue(newValue);

    // Recuperar el foco y ajustar el cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Manejador para el botón de Link
  const handleLink = () => {
    const url = window.prompt('Pega la URL aquí (ej: https://google.com):');
    if (url) {
      insertTag(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      
      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-800 rounded border border-gray-700">
        {/* Botones de Encabezados */}
        {['h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => insertTag(`<${tag}>`, `</${tag}>`)}
            className="px-2 py-1 text-xs font-bold uppercase bg-gray-700 text-gray-300 rounded hover:bg-[#f8ed1a] hover:text-black transition-colors"
            title={`Insertar Encabezado ${tag.toUpperCase()}`}
          >
            {tag.toUpperCase()}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Botones de Formato Básico */}
        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>')}
          className="px-2 py-1 text-xs font-bold bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black transition-colors"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          className="px-2 py-1 text-xs italic bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black transition-colors"
        >
          I
        </button>

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Botón de Link */}
        <button
          type="button"
          onClick={handleLink}
          className="px-3 py-1 text-xs font-bold uppercase bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center gap-1"
        >
          🔗 Link
        </button>
      </div>

      {/* TEXTAREA */}
      <textarea
        ref={textareaRef}
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-gray-900 rounded p-3 text-white border border-gray-700 focus:border-[#f8ed1a] outline-none font-mono text-sm leading-relaxed"
      />
      <p className="text-[10px] text-gray-500 text-right">HTML Supported</p>
    </div>
  );
}