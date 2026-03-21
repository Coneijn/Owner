'use client';

import { useState } from 'react';
import { deletePost } from '@/lib/blog-actions';

export default function DeletePostButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este artículo permanentemente? Esta acción no se puede deshacer.");
    
    if (confirmed) {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append('id', id);
      await deletePost(formData);
      // El server action redirige, así que no necesitamos hacer nada más aquí
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-400 font-bold uppercase text-xs tracking-wide border border-red-900/50 hover:border-red-500 px-4 py-2 rounded transition-all"
    >
      {isDeleting ? 'Deleting...' : 'Delete Post'}
    </button>
  );
}