"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Video, ListChecks, Plus, Trash2, UploadCloud, FolderDot } from "lucide-react";
import { getAvailableVideos, updateWagonContent } from "@/lib/course-actions";
import { getPresignedUrl } from "@/lib/s3-actions";

export default function EditWagonModal({ isOpen, onClose, wagon, courseId }: { isOpen: boolean; onClose: () => void; wagon: any; courseId: string; }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [availableVideos, setAvailableVideos] = useState<any[]>([]);

  // --- ESTADO MULTIMEDIA ---
  const [mediaMode, setMediaMode] = useState<"existing" | "upload">("existing");
  const [mediaUrl, setMediaUrl] = useState(wagon?.payload?.mediaUrl || "");
  const [mediaType, setMediaType] = useState(wagon?.payload?.mediaType || "");
  const [localFile, setLocalFile] = useState<File | null>(null);

  // --- ESTADO DEL BANCO DE PREGUNTAS ---
  // Inicializamos con las preguntas existentes o con una vacía por defecto
  const [questions, setQuestions] = useState<{text: string, options: {text: string, isCorrect: boolean}[]}[]>(
    wagon?.payload?.questions?.length > 0 
      ? wagon.payload.questions 
      : [{ text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]
  );

  useEffect(() => {
    if (isOpen) {
      getAvailableVideos().then(res => {
        if (res.success) setAvailableVideos(res.videos || []);
        setIsLoadingVideos(false);
      });
    }
  }, [isOpen]);

  // --- LÓGICA DE MANEJO DE PREGUNTAS ---
  const addQuestion = () => setQuestions([...questions, { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
  const removeQuestion = (qIdx: number) => setQuestions(questions.filter((_, i) => i !== qIdx));
  const updateQuestionText = (qIdx: number, text: string) => {
    const newQ = [...questions]; newQ[qIdx].text = text; setQuestions(newQ);
  };

  // --- LÓGICA DE MANEJO DE OPCIONES ---
  const addOption = (qIdx: number) => {
    const newQ = [...questions]; newQ[qIdx].options.push({ text: "", isCorrect: false }); setQuestions(newQ);
  };
  const removeOption = (qIdx: number, oIdx: number) => {
    const newQ = [...questions]; newQ[qIdx].options = newQ[qIdx].options.filter((_, i) => i !== oIdx); setQuestions(newQ);
  };
  const updateOptionText = (qIdx: number, oIdx: number, text: string) => {
    const newQ = [...questions]; newQ[qIdx].options[oIdx].text = text; setQuestions(newQ);
  };
  const setCorrectOption = (qIdx: number, oIdx: number) => {
    const newQ = [...questions];
    newQ[qIdx].options = newQ[qIdx].options.map((opt, i) => ({ ...opt, isCorrect: i === oIdx }));
    setQuestions(newQ);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let finalMediaUrl = mediaUrl;
      let finalMediaType = mediaType;

      // PROCESO S3: Si eligieron subir archivo directo y hay un archivo cargado
      if (mediaMode === "upload" && localFile) {
        const { signedUrl, publicUrl } = await getPresignedUrl(localFile.type, 'course-media');
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: localFile,
          headers: { "Content-Type": localFile.type },
        });
        
        if (!uploadResponse.ok) throw new Error("Fallo al subir archivo a AWS S3");

        finalMediaUrl = publicUrl;
        // Determinamos el tipo polimórfico
        if (localFile.type.startsWith("video/")) finalMediaType = "VIDEO";
        else if (localFile.type.startsWith("image/")) finalMediaType = "IMAGE";
        else finalMediaType = "DOCUMENT";
      } else if (mediaMode === "existing" && mediaUrl) {
         finalMediaType = "VIDEO"; // Lo que viene del gestor de Files por ahora son videos
      }

      // Limpiamos las cajas vacías antes de enviarlas a la Base de Datos
      const validQuestions = questions
        .filter(q => q.text.trim() !== "")
        .map(q => ({
          text: q.text,
          options: q.options.filter(o => o.text.trim() !== "")
        }));

      const res = await updateWagonContent(wagon.id, courseId, finalMediaUrl || null, finalMediaType || null, validQuestions);
      
      if (res.success) {
        onClose();
      } else {
        alert("Error: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un problema procesando el archivo o guardando los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-brand-header border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0 bg-brand-header z-10">
          <h3 className="text-2xl font-extrabold text-brand-accent tracking-tight">Edit: {wagon.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo Scrolleable */}
        <div className="p-8 overflow-y-auto space-y-12 bg-brand-dark">
          
          {/* SECCIÓN 1: MULTIMEDIA */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h4 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-600" /> 
              Step 1: Lesson Media
            </h4>
            
            {/* Pestañas de Modo */}
            <div className="flex p-1 bg-gray-100 rounded-lg w-full max-w-md">
              <button 
                onClick={() => setMediaMode("existing")}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${mediaMode === "existing" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Choose from Files
              </button>
              <button 
                onClick={() => setMediaMode("upload")}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${mediaMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Upload Directly
              </button>
            </div>

            {/* Renderizado Condicional del Gestor de Archivos */}
            {mediaMode === "existing" ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select an existing video from your global media files</label>
                <select 
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none font-semibold transition"
                  disabled={isLoadingVideos}
                >
                  <option value="">-- No video selected --</option>
                  {availableVideos.map(v => (
                    <option key={v.id} value={v.url}>{v.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <FolderDot className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium">
                    Files uploaded here will be orphaned to this specific lesson and won't appear in the global "Files" tab.
                  </p>
                </div>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                    {localFile ? (
                      <p className="text-sm font-bold text-gray-800">{localFile.name}</p>
                    ) : (
                      <p className="text-sm font-semibold text-gray-600">Click to browse your device</p>
                    )}
                  </div>
                  <input 
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setLocalFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: EXAMEN (MÚLTIPLES PREGUNTAS) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h4 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-6 h-6 text-green-600" /> 
                Step 2: Quiz Bank
              </h4>
              <button 
                onClick={addQuestion}
                className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {questions.length === 0 && (
              <p className="text-center text-gray-500 py-4 font-medium">No questions added yet. The user won't face an exam here.</p>
            )}
            
            <div className="space-y-8">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-gray-50 rounded-xl p-5 border border-gray-200 relative">
                  <button 
                    onClick={() => removeQuestion(qIdx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 p-2 rounded-lg shadow-sm transition"
                    title="Delete entire question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <label className="block text-sm font-extrabold text-gray-900 mb-2">Question {qIdx + 1}</label>
                  <input 
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Type the question here..."
                    className="w-full lg:w-4/5 px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none font-bold transition mb-4"
                  />

                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input 
                          type="radio"
                          name={`correctOption-${qIdx}`}
                          checked={opt.isCorrect}
                          onChange={() => setCorrectOption(qIdx, oIdx)}
                          className="w-5 h-5 text-green-600 focus:ring-green-600 cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className={`w-full max-w-md px-4 py-2.5 border rounded-xl outline-none font-semibold transition ${opt.isCorrect ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-300 bg-white text-gray-900 focus:border-gray-500'}`}
                        />
                        <button 
                          onClick={() => removeOption(qIdx, oIdx)} 
                          className="text-gray-400 hover:text-red-500 p-2" 
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addOption(qIdx)} 
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 mt-2 px-2 py-1 transition"
                    >
                      <Plus className="w-4 h-4" /> Add option
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Botonera Fija */}
        <div className="p-6 bg-brand-header border-t border-white/10 flex justify-end gap-3 shrink-0 z-10">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 text-gray-300 font-bold hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSubmitting} 
            className="flex items-center gap-2 bg-brand-accent hover:brightness-105 text-brand-dark font-bold px-8 py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Uploading & Saving..." : "Save Content"}
          </button>
        </div>
      </div>
    </div>
  );
}