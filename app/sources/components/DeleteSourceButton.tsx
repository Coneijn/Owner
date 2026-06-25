"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteFolder, deleteFileRecord } from "@/lib/source-actions";

interface Props {
  id: string;
  type: "folder" | "file";
}

export default function DeleteSourceButton({ id, type }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita navegar si est  dentro de un Link
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete this ${type === 'folder' ? 'folder' : 'file'}?`)) return;
    
    setIsDeleting(true);
    const res = type === "folder" ? await deleteFolder(id) : await deleteFileRecord(id);
    
    if (!res.success) {
      alert("Error: " + res.error);
      setIsDeleting(false);
    }
    // Si tiene éxito, Next.js revalidará la ruta automáticamente
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-gray-500 hover:text-red-600 p-1 transition disabled:opacity-50"
      title="Delete"
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}