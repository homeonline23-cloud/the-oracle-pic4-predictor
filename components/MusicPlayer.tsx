'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { motion } from 'motion/react';

// Put MP3 files in `public/audio/` — filenames must match exactly (copy from `public`).
const audioUrl = (file: string) => `/audio/${encodeURIComponent(file)}`;

// Matches files in `public/audio/` exactly (including any double “.mp3.mp3”).
const TRACKS = [
  {
    name: "Nature acoustic guitar",
    artist: "Music",
    url: audioUrl("1. nature-acoustic-guitar-music.mp3.mp3"),
  },
  {
    name: "Soul Relaxation",
    artist: "Andean Pan Flute",
    url: audioUrl("2 ANDEAN PAN FLUTE, Soul Relaxation.mp3.mp3"),
  },
  {
    name: "Classic country picks",
    artist: "Country",
    url: audioUrl("3 Best Classic Country Songs.mp3.mp3"),
  },
  {
    name: "Let It Be, Stuck On You mix",
    artist: "Mix",
    url: audioUrl("4 Mix- Let It Be, Stuck On You...etc.mp3.mp3"),
  },
  {
    name: "Country Music",
    artist: "Various",
    url: audioUrl("5 Country Music.mp3.mp3"),
  },
  {
    name: "Classic Music mix",
    artist: "Bob Marley",
    url: audioUrl("6 Bob Marley -Classic Music-mix.mp3.mp3"),
  },
];

export default function MusicPlayer({ isFixed = true }: { isFixed?: boolean }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentTrack.url]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn("Autoplay blocked or file missing:", err);
      });
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.warn("Audio play failed (file may be missing):", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  return (
    <>
      <audio
        key={currentTrack.url}
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
      />
      
      <div className={isFixed ? "fixed bottom-6 left-2 right-2 md:left-1/2 md:-translate-x-1/2 md:bottom-8 z-50 flex justify-center" : "mt-10 w-full flex justify-center"}>
        <motion.div 
          className={`flex items-center bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full py-2 px-4 md:px-6 shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_20px_rgba(37,99,235,0.15)] ${isFixed ? 'w-full max-w-[95vw] md:w-[800px]' : 'w-full'} gap-3 md:gap-6`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        >
          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={prevTrack}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-all hover:bg-white/5"
              title="Previous Track"
            >
              <SkipBack size={16} />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95"
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </button>

            <button
              onClick={nextTrack}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-all hover:bg-white/5"
              title="Next Track"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Ticker Area */}
          <div className="flex-grow overflow-hidden relative min-w-[120px] md:min-w-[300px]">
            <div className="flex whitespace-nowrap">
              <motion.div
                animate={{
                  x: ["0%", "-50%"],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 25,
                    ease: "linear",
                  },
                }}
                className="flex items-center gap-12"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-blue-400">{currentTrack.artist}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-[11px] font-medium text-white/90">{currentTrack.name}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            {/* Fade Edges */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-6 flex-shrink-0">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:bg-white/20 transition-colors"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
