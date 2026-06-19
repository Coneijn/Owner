"use client";

import { useState } from "react";
import { PlusCircle, Loader2, X } from "lucide-react";
import { createWagon } from "@/lib/course-actions";

export default function AddWagonButton({ courseId }: { courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    
    const res = await createWagon(courseId, title);
    
    setIsSubmitting(false);
    if (res.success) {
      setIsOpen(false);
      setTitle("");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-brand-accent hover:brightness-105 text-brand-dark px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-sm"
      >
        <PlusCircle className="w-5 h-5" />
        Add Wagon
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">Add New Lesson</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">Lesson Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Module 1: Introduction"
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition text-base font-semibold placeholder:text-gray-400 placeholder:font-normal"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-3 font-medium">
                You will be able to add the video and quiz questions in the next step.
              </p>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 text-base"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Container"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}