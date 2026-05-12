'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { VIDEO_SHELL, PUBLIC_ORACLE_HERO_VIDEO } from '@/lib/constants';
import EditableVideo from './EditableVideo';
import MusicPlayer from './MusicPlayer';

type PageHeaderProps = {
  /** Default: oracle hero clip. Ignored when `heroImageSrc` is set. */
  heroVideoSrc?: string;
  /** When set, shows a static hero image instead of video (reliable on all browsers). */
  heroImageSrc?: string;
  heroImageAlt?: string;
};

export default function PageHeader({
  heroVideoSrc = PUBLIC_ORACLE_HERO_VIDEO,
  heroImageSrc,
  heroImageAlt = 'The Oracle Pic 4 — grid intelligence and analysis.',
}: PageHeaderProps) {
  return (
    <div className={`${VIDEO_SHELL} mb-8 mt-4 md:mt-6`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative group"
      >
        <div className="pointer-events-none absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 rounded-none blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
        <div className="relative border-2 border-red-600/80 p-1 md:p-2 rounded-none shadow-2xl bg-slate-900/20 backdrop-blur-sm min-h-0">
          <div className="relative flex min-h-0 w-full flex-col bg-slate-950/40 p-2 backdrop-blur-xl md:p-4 h-auto rounded-none">
            <div className="mb-2 h-0.5 w-full bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-none opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)] md:mb-4 shrink-0"></div>
            <div className="min-h-0 w-full shrink-0">
              {heroImageSrc ? (
                <div className="relative aspect-video min-h-[10rem] w-full overflow-hidden rounded-none border border-white/10 bg-black">
                  <Image
                    key={heroImageSrc}
                    src={heroImageSrc}
                    alt={heroImageAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, min(896px, 92vw)"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <EditableVideo
                  key={heroVideoSrc}
                  className="aspect-video min-h-[10rem] w-full rounded-none"
                  defaultSrc={heroVideoSrc}
                  locked={true}
                />
              )}
            </div>
            <MusicPlayer isFixed={false} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
