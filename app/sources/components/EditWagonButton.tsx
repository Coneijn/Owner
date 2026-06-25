"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import EditWagonModal from "./EditWagonModal";

export default function EditWagonButton({ wagon, courseId }: { wagon: any; courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-gray-400 hover:text-gray-900 transition-colors p-1"
        title="Edit Content"
      >
        <Edit3 className="w-5 h-5" />
      </button>
      
      {/* Nuestro Modal gigante se renderiza aquí y solo se abre si isOpen es true */}
      <EditWagonModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        wagon={wagon} 
        courseId={courseId} 
      />
    </>
  );
}