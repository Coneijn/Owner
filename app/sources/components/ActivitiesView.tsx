"use client";

import { useState } from "react";
import { PlusCircle, Presentation, Loader2, X } from "lucide-react";
import { createCourse, togglePublishCourse } from "@/lib/course-actions";
import Link from "next/link";

export default function ActivitiesView({ isAdmin, courses = [] }: { isAdmin: boolean, courses?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateCourse = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    
    const res = await createCourse(title, description);
    
    setIsSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-accent">Learning Paths</h2>
          <p className="text-gray-400 text-sm mt-1">Manage interactive courses and assessments</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-accent hover:brightness-105 text-brand-dark px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Create Course
          </button>
        )}
      </div>

      {/* Dinámica: Si no hay cursos muestra el vacío, si hay, los lista */}
      {courses.length === 0 ? (
        <div className="bg-brand-header border-2 border-dashed border-white/10 rounded-xl p-16 flex flex-col items-center justify-center text-center mt-8">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
             <Presentation className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            This is where you will build the "Trains" and "Wagons" for your users to learn step by step.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-brand-header border border-white/10 rounded-xl p-6 hover:shadow-lg hover:border-brand-accent/50 transition-all flex flex-col group">
              <h3 className="text-xl font-extrabold text-white mb-2">{course.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-3 mb-6 flex-grow font-medium">
                {course.description || "Sin descripción."}
              </p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                {isAdmin ? (
                  <button
                    onClick={async () => {
                      const res = await togglePublishCourse(course.id);
                      if (!res.success) alert("Error al cambiar estado: " + res.error);
                    }}
                    className={`text-xs font-bold px-3 py-1 rounded-md transition hover:scale-105 active:scale-95 shadow-sm ${course.isPublished ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                    title="Haz clic para cambiar el estado de publicación"
                  >
                    {course.isPublished ? 'Published 🟢' : 'Pubicate 🟡'}
                  </button>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1 rounded-md ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                )}
                
                {isAdmin && (
                  <Link 
                    href={`/sources/course/${course.id}`}
                    className="text-sm text-gray-200 font-bold hover:underline"
                  >
                    Manage Course &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear el Curso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">Create New Course</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Course Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wholesaling Real Estate 101"
                  className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition text-base font-semibold placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what users will learn..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition text-base font-semibold placeholder:text-gray-400 placeholder:font-normal resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCourse}
                disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 text-base"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "Creating..." : "Save Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}