'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Upload } from 'lucide-react';
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
  const [needsPlay, setNeedsPlay] = useState(true);
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
    setNeedsPlay(true);
  }, [activeSrc]);

  const attemptPlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el || !activeSrc) return false;
    try {
      el.muted = true;
      const playPromise = el.play();
      if (playPromise) await playPromise;
      return true;
    } catch {
      setNeedsPlay(true);
      return false;
    }
  }, [activeSrc]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeSrc) return;

    el.load();

    const onCanPlay = () => {
      void attemptPlay();
    };

    el.addEventListener('canplay', onCanPlay);
    const stuckTimer = window.setTimeout(() => {
      if (el.paused || el.currentTime < 0.05) {
        setNeedsPlay(true);
      }
    }, 1200);

    return () => {
      el.removeEventListener('canplay', onCanPlay);
      window.clearTimeout(stuckTimer);
    };
  }, [activeSrc, attemptPlay]);

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || el.paused || el.currentTime < 0.05) return;
    setNeedsPlay(false);
    setLoadError(null);
  };

  const handleVideoError = () => {
    if (locked && heroSrcIndex < HERO_SOURCES.length - 1) {
      setHeroSrcIndex((i) => i + 1);
      return;
    }
    setLoadError('Video could not load — tap Play, or use Chrome.');
    setNeedsPlay(true);
  };

  const handlePlayClick = async () => {
    const el = videoRef.current;
    if (!el) return;
    setLoadError(null);
    el.muted = true;
    try {
      el.load();
    } catch {
      /* ignore */
    }
    const ok = await attemptPlay();
    if (!ok) setNeedsPlay(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const file = event.target.files?.[0];
    if (file) {
      setUploadSrc(URL.createObjectURL(file));
    }
  };

  const showPlayOverlay = Boolean(activeSrc) && needsPlay && !loadError;
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
            className="absolute inset-0 z-0 size-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onPlaying={() => {
              setNeedsPlay(false);
              setLoadError(null);
            }}
            onPause={() => setNeedsPlay(true)}
            onError={handleVideoError}
          />

          {showPlayOverlay && (
            <button
              type="button"
              onClick={() => void handlePlayClick()}
              className="absolute inset-0 z-[25] flex cursor-pointer flex-col items-center justify-center gap-3 bg-black/50 text-white"
              aria-label="Play hero video"
            >
              <span className="flex size-16 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-lg">
                <Play className="ml-1 size-8 fill-white text-white" />
              </span>
              <span className="text-sm font-bold tracking-wide">Tap to play video</span>
            </button>
          )}

          {loadError && (
            <div className="absolute inset-x-0 bottom-0 z-[30] bg-black/90 p-3 text-center">
              <p className="text-[11px] font-semibold leading-snug text-yellow-100">{loadError}</p>
              <button
                type="button"
                onClick={() => void handlePlayClick()}
                className="mt-2 rounded-none border border-white/30 bg-blue-600 px-4 py-1.5 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
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
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-4 bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
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
