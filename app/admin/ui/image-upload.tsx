'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getPresignedUrl } from '@/lib/s3-actions';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  value: string | string[]; 
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
}

export default function ImageUpload({ label, value, onChange, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const newUrls: string[] = [];

      for (const file of acceptedFiles) {
        const { signedUrl, publicUrl } = await getPresignedUrl(file.type);
        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        newUrls.push(publicUrl);
      }

      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        onChange([...currentUrls, ...newUrls]);
      } else {
        onChange(newUrls[0]);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  }, [multiple, value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple 
  });

  const removeImage = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(url => url !== urlToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold leading-6 text-[#f8ed1a] uppercase">{label}</label>
      
      {/* AREA DE PREVISUALIZACIÓN */}
      <div className="flex flex-wrap gap-4">
        {Array.isArray(value) ? (
          value.map((url, i) => (
             <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-600 group">
                <Image src={url} alt="Uploaded" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(url)} className="absolute top-0 right-0 bg-red-600 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
             </div>
          ))
        ) : value ? (
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-600 group">
             <Image src={value} alt="Uploaded" fill className="object-cover" />
             <button type="button" onClick={() => removeImage(value)} className="absolute top-0 right-0 bg-red-600 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
          </div>
        ) : null}
      </div>

      {/* ZONA DRAG & DROP */}
      <div 
        {...getRootProps()} 
        className={`
          mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
          ${isDragActive ? 'border-[#529e14] bg-[#529e14]/10' : 'border-gray-600 hover:border-[#f8ed1a] bg-gray-800'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {uploading ? (
             <div className="text-[#f8ed1a] font-bold animate-pulse">Uploading to S3...</div>
          ) : (
            <>
              <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
                <span className="relative rounded-md font-semibold text-[#f8ed1a] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#f8ed1a] focus-within:ring-offset-2 hover:text-yellow-300">
                  <span>Upload a file</span>
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}