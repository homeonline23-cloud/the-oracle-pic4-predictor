'use client';

import { motion } from 'motion/react';

const TRACKS = [
  "1 one love, bob marley classic reggae songs",
  "2 andean pan flute, healing spiritual deep soul relaxation"
];

export default function ArtistTicker() {
  return (
    <div className="w-full overflow-hidden bg-black/20 border-y border-white/10 py-3 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-red-600/5 px-4"></div>
      <div className="relative flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
          className="flex items-center gap-16 px-8"
        >
          {/* Repeating tracks for seamless loop */}
          {[...TRACKS, ...TRACKS, ...TRACKS, ...TRACKS].map((track, idx) => (
            <div key={idx} className="flex items-center gap-4 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              <span 
                className="text-[12px] md:text-[14px] font-bold tracking-normal lowercase"
              >
                {track}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
