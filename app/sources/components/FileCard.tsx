"use client";

import { useState } from "react";
import { FileVideo, X, Maximize2, PlayCircle } from "lucide-react";
import DeleteSourceButton from "./DeleteSourceButton";

export default function FileCard({ file, isAdmin }: { file: any, isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  return (
    <>
      {/* File Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-400 transition-all cursor-pointer flex flex-col"
      >
        {/* Preview */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden relative">
          {isVideo ? (
            <>
              <video 
                src={file.url} 
                className="w-full h-full object-cover" 
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <PlayCircle className="w-14 h-14 text-white opacity-90 drop-shadow-md" strokeWidth={1.5} />
              </div>
            </>
          ) : isImage ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <FileVideo className="w-12 h-12 text-gray-400" />
          )}
          
          {/* Expand Icon */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1.5 rounded-md text-white">
             <Maximize2 className="w-5 h-5" />
          </div>
        </div>

        {/* File Info */}
        <div className="p-4 bg-white">
          <p className="text-base font-bold text-gray-800 truncate" title={file.name}>
            {file.name}
          </p>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div 
            className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm p-1.5 rounded-md shadow-sm border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <DeleteSourceButton id={file.id} type="file" />
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-6xl flex flex-col items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition"
            >
              <X className="w-10 h-10" />
            </button>

            {/* Media Content */}
            {isVideo ? (
              <video 
                src={file.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl bg-black"
              />
            ) : isImage ? (
              <img 
                src={file.url} 
                alt={file.name} 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="text-white text-xl">Unsupported preview format</div>
            )}
            
            {/* Floating Title */}
            <h3 className="text-white text-xl font-semibold mt-6 bg-black/60 px-8 py-3 rounded-full backdrop-blur-md">
              {file.name}
            </h3>
          </div>
        </div>
      )}
    </>
  );
}