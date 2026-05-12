'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface EditableVideoProps {
  defaultSrc?: string;
  className?: string;
  locked?: boolean;
}

export default function EditableVideo({
  defaultSrc = '',
  className = '',
  locked = false,
}: EditableVideoProps) {
  const [videoSrc, setVideoSrc] = useState<string>(defaultSrc);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!locked) return;
    setVideoSrc(defaultSrc ?? '');
  }, [defaultSrc, locked]);

  useEffect(() => {
    setLoadError(null);
  }, [videoSrc]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;
    try {
      el.load();
      void el.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, [videoSrc]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoSrc(objectUrl);
    }
  };

  return (
    <div
      className={`group relative isolate overflow-hidden border border-white/10 rounded-none bg-black ${className}`}
    >
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 z-0 size-full object-cover pointer-events-none"
            onPlaying={() => setLoadError(null)}
            onError={() =>
              setLoadError(
                'Video laadt niet in deze browser — controleer of het een H.264 (AVC) .mp4 is en of het pad klopt.',
              )
            }
          />
          {locked && loadError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 p-4 text-center">
              <p className="text-[11px] font-semibold leading-snug tracking-normal text-yellow-100/95">
                {loadError}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-black/90 p-8 text-center text-slate-500">
          {!locked && <Upload className="mb-2 h-8 w-8 opacity-20" />}
          <p className="text-[11px] font-bold tracking-normal opacity-40">
            {locked ? 'Video Stream Offline' : 'Upload Video'}
          </p>
        </div>
      )}

      {!locked && (
        <>
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-4 bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-none border border-white/20 bg-white/10 p-3 text-white transition-all hover:scale-110 hover:bg-white/20"
              title="Preview Video (Temporary)"
            >
              <Upload size={20} />
            </button>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-[10px] font-medium tracking-normal text-white/60">
                Preview only. Upload to public folder for permanent use.
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
