'use client';

import { useRef, useState } from 'react';

interface HtmlEditorProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  // NEW PROP: Receives the URL from the parent uploader
  latestUploadedImageUrl?: string | null; 
}

export default function HtmlEditor({ 
  label, 
  name, 
  defaultValue = '', 
  placeholder, 
  rows = 12, 
  required = false,
  latestUploadedImageUrl = null
}: HtmlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);

  const insertTag = (prefix: string, suffix: string, customSelection?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    // If we provided custom text (for the link), use it. Otherwise use user selection.
    const selectedText = customSelection !== undefined ? customSelection : text.substring(start, end);
    
    const before = text.substring(0, start);
    // If we are replacing selection with custom text, we need to adjust the 'after' index
    const afterIndex = customSelection !== undefined && start === end ? end : end; 
    const after = text.substring(afterIndex, text.length);

    const newValue = `${before}${prefix}${selectedText}${suffix}${after}`;
    setValue(newValue);

    setTimeout(() => {
      textarea.focus();
      // Move cursor after the inserted tag
      textarea.setSelectionRange(start + prefix.length + selectedText.length + suffix.length, start + prefix.length + selectedText.length + suffix.length);
    }, 0);
  };

  const insertAtCursor = (tag: string) => {
    insertTag(tag, '');
  };

  // --- MODIFIED LINK LOGIC ---
  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;

    let linkText = "";

    // 1. Get Text
    if (hasSelection) {
      // Use existing selection
      linkText = textarea.value.substring(start, end);
    } else {
      // Ask user for text
      const input = window.prompt('Enter the text to display:');
      if (input === null) return; // User cancelled
      linkText = input;
    }

    // 2. Get URL
    const url = window.prompt('Enter the Link URL:', 'https://');
    if (url === null) return; // User cancelled

    // 3. Insert
    const prefix = `<a href="${url}" target="_blank" class="text-[#529e14] hover:underline">`;
    const suffix = `</a>`;
    
    // If we had a selection, the standard insertTag works. 
    // If we entered new text, we pass it as the 3rd argument.
    insertTag(prefix, suffix, hasSelection ? undefined : linkText);
  };

  // --- MODIFIED IMAGE LOGIC ---
  const handleImage = () => {
    // strict check: Only allow insertion if a valid S3 URL is passed from parent
    if (!latestUploadedImageUrl) {
        alert("⚠️ No image detected.\n\nPlease upload an image in the 'Body Image Loader' section above first.");
        return;
    }

    const alt = window.prompt('Enter a short description (Alt Text) for this image:');
    if (alt === null) return; // User cancelled

    // Automatically insert the specific URL
    const imgTag = `\n<img src="${latestUploadedImageUrl}" alt="${alt}" class="w-full h-auto rounded-lg my-6 border border-gray-700 shadow-lg" />\n`;
    insertAtCursor(imgTag);
  };

  const handleList = () => {
    const listTemplate = `\n<ul class="list-disc list-inside my-4 space-y-2 text-gray-300">\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n`;
    insertAtCursor(listTemplate);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-800 rounded border border-gray-700 sticky top-0 z-20">
        {/* Headers */}
        <div className="flex gap-1">
            {['h2', 'h3'].map((tag) => (
            <button key={tag} type="button" onClick={() => insertTag(`<${tag}>`, `</${tag}>`)} className="px-2 py-1 text-xs font-bold uppercase bg-gray-700 text-gray-300 rounded hover:bg-[#f8ed1a] hover:text-black transition-colors">
                {tag.toUpperCase()}
            </button>
            ))}
        </div>

        <div className="w-px h-6 bg-gray-600 mx-1"></div>

        <button type="button" onClick={() => insertTag('<strong>', '</strong>')} className="px-2 py-1 text-xs font-bold bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black" title="Bold">B</button>
        <button type="button" onClick={() => insertTag('<em>', '</em>')} className="px-2 py-1 text-xs italic bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black" title="Italic">I</button>
        
        <button type="button" onClick={() => insertTag('<p class="mb-4">', '</p>')} className="px-2 py-1 text-xs font-bold bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black" title="Paragraph">¶</button>
        <button type="button" onClick={() => insertAtCursor('<br />')} className="px-2 py-1 text-xs font-bold bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black" title="Line Break">↵</button>
        <button type="button" onClick={handleList} className="px-2 py-1 text-xs font-bold bg-gray-700 text-gray-300 rounded hover:bg-white hover:text-black" title="List">List</button>

        <div className="w-px h-6 bg-gray-600 mx-1"></div>

        <button type="button" onClick={handleLink} className="px-2 py-1 text-xs bg-blue-900/50 text-blue-200 rounded hover:bg-blue-600 transition-colors">🔗 Link</button>
        
        {/* The Image Button */}
        <button 
            type="button" 
            onClick={handleImage} 
            title="Insert last uploaded image"
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${latestUploadedImageUrl ? 'bg-green-600 text-white hover:bg-green-500 shadow-md animate-pulse' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
            <span>🖼️</span> 
            {latestUploadedImageUrl ? 'Insert Uploaded Img' : 'Img'}
        </button>
      </div>

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
      <p className="text-[10px] text-gray-500 text-right">HTML & Tailwind CSS Supported</p>
    </div>
  );
}