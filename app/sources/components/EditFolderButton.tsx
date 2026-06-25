"use client";

import { useState } from "react";
import { Edit3, Loader2 } from "lucide-react";
import { editFolder } from "@/lib/source-actions";

interface Props {
  id: string;
  currentName: string;
}

export default function EditFolderButton({ id, currentName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [folderName, setFolderName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!folderName.trim() || folderName === currentName) {
      setIsOpen(false);
      return;
    }
    
    setIsSaving(true);
    const res = await editFolder(id, folderName);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      alert("Error: " + res.error);
    }
    setIsSaving(false);
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="text-gray-500 hover:text-gray-900 p-1 transition"
        title="Edit"
      >
        <Edit3 className="w-3 h-3" />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-default"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Edit Folder</h3>
            <input 
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={(e) => { e.preventDefault(); setIsOpen(false); setFolderName(currentName); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit}
                disabled={isSaving || !folderName.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}