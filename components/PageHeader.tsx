'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { VIDEO_SHELL, PUBLIC_ORACLE_HERO_VIDEO, WINDOW_OUTER_SHELL, WINDOW_PANEL_OUTER, WINDOW_PANEL_INNER, PANEL_EDGE_GLOW } from '@/lib/constants';
import { cn } from '@/lib/utils';
import EditableVideo from './EditableVideo';

type PageHeaderProps = {
  /** Default: oracle hero clip. Ignored when `heroImageSrc` is set. */
  heroVideoSrc?: string;
  /** When set, shows a static hero image instead of video (reliable on all browsers). */
  heroImageSrc?: string;
  heroImageAlt?: string;
  /** Sharp logo + title layout over video (home page). */
  showHeroTitleCard?: boolean;
};

export default function PageHeader({
  heroVideoSrc = PUBLIC_ORACLE_HERO_VIDEO,
  heroImageSrc,
  heroImageAlt = 'The Oracle Pic 4 — grid intelligence and analysis.',
  showHeroTitleCard = false,
}: PageHeaderProps) {
  return (
    <div className={`${VIDEO_SHELL} mb-8 mt-4 md:mt-6`}>
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <div className={PANEL_EDGE_GLOW}></div>
        <div
          className={cn(
            WINDOW_PANEL_OUTER,
            WINDOW_OUTER_SHELL
          )}
        >
          <div className={cn(WINDOW_PANEL_INNER, 'oracle-hero-frame')}>
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
                  showLogoOverlay={false}
                  showHeroTitleCard={showHeroTitleCard}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
