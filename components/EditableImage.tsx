'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  alt: string;
  onClick?: (src: string) => void;
  locked?: boolean;
}

export default function EditableImage({ id, defaultSrc, alt, onClick, locked = false }: EditableImageProps) {
  const [src, setSrc] = useState(defaultSrc);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`user_image_${id}`);
      if (saved) {
        setSrc(saved);
      }
    } catch (error) {
      console.error("Could not load saved image", error);
    }
  }, [id]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSrc(base64String);
        localStorage.setItem(`user_image_${id}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full group/editable">
      <div 
        className={`relative w-full h-full ${onClick ? 'cursor-zoom-in' : ''}`}
        onClick={() => onClick?.(src)}
      >
        <Image 
          src={src} 
          alt={alt} 
          fill
          className="object-contain"
          referrerPolicy="no-referrer"
          onError={() => setSrc('https://placehold.co/600x400/1e293b/1e293b')}
        />
      </div>

      {/* Upload Button */}
      {!locked && (
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover/editable:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-none shadow-lg transition-all hover:scale-110 active:scale-95"
            title="Upload Image"
          >
            <Camera size={16} />
          </button>
        </div>
      )}

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
