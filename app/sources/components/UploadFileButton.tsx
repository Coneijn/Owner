"use client";

import { useState } from "react";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { getPresignedUrl } from "@/lib/s3-actions"; // Usamos tu función existente
import { createFileRecord } from "@/lib/source-actions";

export default function UploadFileButton({ folderId }: { folderId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      // 1. Pedimos permiso a S3
      const { signedUrl, publicUrl } = await getPresignedUrl(file.type, 'sources');

      // 2. Subimos el archivo pesado directo a S3 desde el navegador
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Fallo al subir a S3");

      // 3. Guardamos el registro en nuestra Base de Datos usando el título personalizado o el nombre original
      const dbRes = await createFileRecord({
        name: customTitle.trim() || file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
        folderId: folderId,
      });

      if (dbRes.success) {
        setIsOpen(false);
        setFile(null);
        setCustomTitle("");
      } else {
        alert("Error al guardar en base de datos: " + dbRes.error);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al subir el archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-base font-semibold transition shadow-md"
      >
        <FileUp className="w-5 h-5" />
        Upload File
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-brand-header border border-white/10 p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-extrabold mb-6 text-brand-accent">Upload New File</h3>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-base font-semibold text-white mb-2">Select File</label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-brand-dark/50 hover:bg-brand-dark hover:border-brand-accent/50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-brand-accent transition-colors" />
                    {file ? (
                      <p className="text-base font-bold text-brand-accent truncate w-full max-w-[300px]">
                        {file.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-base text-gray-300 font-semibold mb-1">Click to browse files</p>
                        <p className="text-sm text-gray-500">Video or Image formats</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile) {
                        setCustomTitle(selectedFile.name.split('.').slice(0, -1).join('.'));
                      }
                    }}
                  />
                </label>
              </div>

              {file && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-base font-semibold text-gray-800 mb-2">Display Title</label>
                  <input 
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    onFocus={() => {
                      // Borramos el título para que puedan escribir de inmediato
                      const originalName = file.name.split('.').slice(0, -1).join('.');
                      if (customTitle === originalName) {
                        setCustomTitle("");
                      }
                    }}
                    onBlur={() => {
                      // Restauramos el título original si lo dejaron en blanco al salir
                      if (!customTitle.trim()) {
                        setCustomTitle(file.name.split('.').slice(0, -1).join('.'));
                      }
                    }}
                    placeholder={file.name.split('.').slice(0, -1).join('.')}
                    className="w-full px-4 py-3 bg-brand-dark text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition text-base font-medium placeholder:text-gray-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsOpen(false); setFile(null); setCustomTitle(""); }}
                className="px-5 py-2.5 text-gray-400 font-semibold hover:text-white hover:bg-white/10 rounded-lg transition text-base"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading || !file}
                className="flex items-center gap-2 bg-brand-accent hover:brightness-105 text-brand-dark font-bold px-5 py-2.5 rounded-lg transition shadow-md disabled:opacity-50 text-base"
              >
                {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isUploading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}