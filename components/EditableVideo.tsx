'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';
import {
  PUBLIC_LOGO_VIDEO_OVERLAY,
  PUBLIC_ORACLE_HERO_VIDEO,
  PUBLIC_ORACLE_HERO_VIDEO_LEGACY,
  PUBLIC_ORACLE_HERO_VIDEO_FALLBACK,
} from '@/lib/constants';
import HeroVideoTitleOverlay from './HeroVideoTitleOverlay';

interface EditableVideoProps {
  defaultSrc?: string;
  className?: string;
  locked?: boolean;
  showLogoOverlay?: boolean;
  showHeroTitleCard?: boolean;
}

const HERO_SOURCES = [
  PUBLIC_ORACLE_HERO_VIDEO,
  PUBLIC_ORACLE_HERO_VIDEO_LEGACY,
  PUBLIC_ORACLE_HERO_VIDEO_FALLBACK,
] as const;

export default function EditableVideo({
  defaultSrc = '',
  className = '',
  locked = false,
  showLogoOverlay,
  showHeroTitleCard = false,
}: EditableVideoProps) {
  const overlay = showLogoOverlay ?? false;
  const [heroSrcIndex, setHeroSrcIndex] = useState(0);
  const [uploadSrc, setUploadSrc] = useState(defaultSrc);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeSrc = locked ? HERO_SOURCES[heroSrcIndex] : uploadSrc;

  useEffect(() => {
    if (!locked) {
      setUploadSrc(defaultSrc ?? '');
    }
  }, [defaultSrc, locked]);

  useEffect(() => {
    setLoadError(null);
    setIsPaused(true);
  }, [activeSrc]);

  const attemptPlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el || !activeSrc) return false;
    try {
      el.muted = true;
      const playPromise = el.play();
      if (playPromise) await playPromise;
      setIsPaused(false);
      setLoadError(null);
      return true;
    } catch {
      setIsPaused(true);
      return false;
    }
  }, [activeSrc]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeSrc) return;

    const tryPlay = () => {
      void attemptPlay();
    };

    el.load();
    el.addEventListener('canplay', tryPlay);
    el.addEventListener('loadeddata', tryPlay);

    const onVisible = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVisible);

    const retryTimer = window.setInterval(() => {
      if (el.paused && el.readyState >= 2) tryPlay();
    }, 2500);

    window.setTimeout(() => window.clearInterval(retryTimer), 15000);

    return () => {
      el.removeEventListener('canplay', tryPlay);
      el.removeEventListener('loadeddata', tryPlay);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(retryTimer);
    };
  }, [activeSrc, attemptPlay]);

  const handleVideoError = () => {
    if (locked && heroSrcIndex < HERO_SOURCES.length - 1) {
      setHeroSrcIndex((i) => i + 1);
      return;
    }
    setLoadError('Video could not load in this browser.');
    setIsPaused(true);
  };

  const handlePlayClick = () => {
    void attemptPlay();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const file = event.target.files?.[0];
    if (file) {
      setUploadSrc(URL.createObjectURL(file));
    }
  };

  const showOverlays = !loadError;

  return (
    <div
      className={`group relative isolate overflow-hidden border border-white/10 rounded-none bg-black ${className}`}
    >
      {activeSrc ? (
        <>
          <video
            ref={videoRef}
            key={activeSrc}
            src={activeSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 z-0 size-full object-cover object-center oracle-hero-video"
            onPlaying={() => {
              setIsPaused(false);
              setLoadError(null);
            }}
            onPause={() => setIsPaused(true)}
            onError={handleVideoError}
          />

          {locked && isPaused && !loadError && (
            <button
              type="button"
              onClick={handlePlayClick}
              className="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent p-0"
              aria-label="Play hero video"
            />
          )}

          {loadError && (
            <p className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-black/75 px-2 py-1.5 text-center text-[10px] font-medium text-yellow-100/90">
              {loadError}
            </p>
          )}

          {overlay && showOverlays && (
            <div
              className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
              aria-hidden
            >
              <Image
                src={PUBLIC_LOGO_VIDEO_OVERLAY}
                alt=""
                width={512}
                height={512}
                className="h-[38%] w-[38%] max-h-52 max-w-52 object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
                priority
              />
            </div>
          )}
          {showHeroTitleCard && showOverlays && <HeroVideoTitleOverlay />}
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
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-4 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-none border border-white/20 bg-white/10 p-3 text-white transition-all hover:scale-110 hover:bg-white/20"
              title="Preview Video (Temporary)"
            >
              <Upload size={20} />
            </button>
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
