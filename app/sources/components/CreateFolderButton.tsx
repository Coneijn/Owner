"use client";

import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { createFolder } from "@/lib/source-actions";

export default function CreateFolderButton({ parentId }: { parentId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    setIsLoading(true);
    
    const res = await createFolder(folderName, parentId);
    
    if (res.success) {
      setIsOpen(false);
      setFolderName("");
    } else {
      alert("Error: " + res.error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        <FolderPlus className="w-4 h-4" />
        New Folder
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Create New Folder</h3>
            <input 
              type="text"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-bold"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={isLoading || !folderName.trim()}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg transition disabled:opacity-50 font-bold"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}