'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAuth } from '@/hooks/useAuth';
import { ZoomIn, X } from 'lucide-react';
import EditableImage from '@/components/EditableImage';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import PlayResponsiblyBanner from '@/components/PlayResponsiblyBanner';
import SiteDisclaimer from '@/components/SiteDisclaimer';
import { WINDOW_OUTER_SHELL_RESPONSIVE } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Grid 24 sits in main grid immediately right of Grid 23; remaining files go below. */
const GRID_AFTER_23 = { src: '/grid 24.png', alt: 'Grid 24', id: 'evidence_grid_24' } as const;

const EXTRA_GRID_EVIDENCE = [
  { src: '/grid 27.png', alt: 'Grid 27', id: 'evidence_grid_27' },
  { src: '/grid 28 - Copy.png', alt: 'Grid 28', id: 'evidence_grid_28' },
  { src: '/grid 29.png', alt: 'Grid 29', id: 'evidence_grid_29' },
] as const;

const FRAME_COLORS = [
  { border: 'hover:border-blue-500/50', text: 'text-blue-500', bg: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
  { border: 'hover:border-red-500/50', text: 'text-red-500', bg: 'bg-red-600', shadow: 'shadow-red-500/20' },
  { border: 'hover:border-amber-500/50', text: 'text-amber-500', bg: 'bg-amber-600', shadow: 'shadow-amber-500/20' },
  { border: 'hover:border-emerald-500/50', text: 'text-emerald-500', bg: 'bg-emerald-600', shadow: 'shadow-emerald-500/20' },
] as const;

const gridStripes = 'absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-none opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)] -translate-y-1/2 z-0';

/** One evidence card — kept DRY for main + fixed rows. */
function EvidenceGridCard({
  defaultSrc,
  label,
  editableId,
  colorIdx,
  userRole,
  onOpen,
}: {
  defaultSrc: string;
  label: string;
  editableId: string;
  colorIdx: number;
  userRole: string | undefined;
  onOpen: (src: string, alt: string) => void;
}) {
  const color = FRAME_COLORS[colorIdx % FRAME_COLORS.length];

  return (
    <div
      className={`aspect-square relative group bg-slate-950/60 rounded-none border border-white/10 overflow-hidden flex flex-col items-center justify-center ${color.border} transition-all shadow-2xl`}
    >
      <div className="relative w-full h-full group">
        <EditableImage
          id={editableId}
          defaultSrc={defaultSrc}
          alt={label}
          onClick={(src) => onOpen(src, label)}
          locked={true}
        />
        <div
          className={`absolute top-2 right-2 px-1.5 py-0.5 ${color.bg} text-white font-bold text-[7px] md:text-[9px] tracking-normal italic z-20 shadow-lg pointer-events-none`}
        >
          Verified pattern
        </div>
        {userRole !== 'admin' && process.env.NODE_ENV !== 'development' && (
          <div className="absolute inset-0 bg-black/20 md:bg-black/60 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10 pointer-events-none">
            <div
              className={`flex items-center gap-2 px-6 py-2.5 ${color.bg} text-white rounded-none hover:opacity-90 transition-all font-bold text-[11px] tracking-normal shadow-xl`}
            >
              <ZoomIn size={18} />
              <span>View pattern</span>
            </div>
          </div>
        )}
      </div>
      <div
        className={`absolute top-3 left-3 px-2 py-0.5 bg-black/40 border border-white/10 rounded-none text-[8px] font-bold text-slate-500 tracking-normal group-hover:${color.text} transition-colors flex items-center gap-1.5`}
      >
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function EvidencePage() {
  const { userRole } = useAuth();
  const [selectedImg, setSelectedImg] = useState<{src: string, alt: string} | null>(null);

  // Static grid images from public folder
  const [images] = useState([
    '/grid 1.png', '/grid 2.png', '/grid 3.png', '/grid3-1.png', '/grid 4.png', '/grid 5.png', 
    '/grid 6.png', '/grid 7.jpeg', '/grid 8.png', '/grid 9.png', '/grid 10.png', 
    '/grid 11.png', '/grid 12.png', '/grid 13.png', '/grid 14-1.jpeg', '/grid 15.png', 
    '/grid 16.png', '/grid 17.png', '/grid 18.png', '/grid 19.png', '/grid 21 - Copy.png', 
    '/grid 25.png', '/grid 26.png'
  ]);

  useScrollReveal();

  return (
    <div className="min-h-screen pb-0 pt-4 flex flex-col items-center">
      {/* Same company/oracle presentation hero as other pages (`PUBLIC_ORACLE_HERO_VIDEO`). */}
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>

      <div className="max-w-3xl mx-auto px-2 md:px-6 w-full">
        <div className="relative group">
          {/* Ambient Glows */}
          <div className="absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 rounded-none blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
          
          {/* Red Outer Border - Standard Size Window */}
          <div
            className={cn(
              'relative min-h-0 rounded-none bg-slate-900/95 p-1 md:p-2',
              WINDOW_OUTER_SHELL_RESPONSIVE
            )}
          >
            
            {/* Content Box with Scroll */}
            <div className="relative min-h-0 overflow-y-auto rounded-none bg-slate-950/95 p-4 pb-6 custom-scrollbar md:p-8 md:pb-8">

              {/* Header — title + tagline above the blue-white-red stripe */}
              <div className="mb-10 flex flex-col items-center">
                <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 pb-5 text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Pattern Gallery
                  </h2>
                  <p className="text-sm font-semibold leading-relaxed text-white md:text-base">
                    Historical grid layouts for pattern review and comparison.
                  </p>
                </div>
                <div className="mx-4 h-0.5 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)] md:mx-8" />
              </div>

              {/* Block A: Grids 1–21 only (own grid → no orphaned cells before 22–24) */}
              <div className="relative max-w-3xl mx-auto px-2 md:px-6">
                <div className={gridStripes} />
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  {images.slice(0, 21).map((img, idx) => (
                    <EvidenceGridCard
                      key={`main-${idx}`}
                      defaultSrc={img}
                      label={`Grid ${idx + 1}`}
                      editableId={`grid_${idx + 1}`}
                      colorIdx={idx}
                      userRole={userRole ?? undefined}
                      onOpen={(src, alt) => setSelectedImg({ src, alt })}
                    />
                  ))}
                </div>
              </div>

              {/* Block B: exactly one row — Grid 22 | Grid 23 | Grid 24 (24 right of 23 from md breakpoint up) */}
              <div className="relative max-w-3xl mx-auto px-2 md:px-6 mt-8 md:mt-10">
                <div className={gridStripes} />
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  <EvidenceGridCard
                    key="row2-g22"
                    defaultSrc={images[21]}
                    label="Grid 22"
                    editableId="grid_22"
                    colorIdx={21}
                    userRole={userRole ?? undefined}
                    onOpen={(src, alt) => setSelectedImg({ src, alt })}
                  />
                  <EvidenceGridCard
                    key="row2-g23"
                    defaultSrc={images[22]}
                    label="Grid 23"
                    editableId="grid_23"
                    colorIdx={22}
                    userRole={userRole ?? undefined}
                    onOpen={(src, alt) => setSelectedImg({ src, alt })}
                  />
                  <EvidenceGridCard
                    key="row2-g24"
                    defaultSrc={GRID_AFTER_23.src}
                    label={GRID_AFTER_23.alt}
                    editableId={GRID_AFTER_23.id}
                    colorIdx={23}
                    userRole={userRole ?? undefined}
                    onOpen={(src, alt) => setSelectedImg({ src, alt })}
                  />
                </div>
              </div>

              {/* Block C: one row underneath — Grid 27 | Grid 28 | Grid 29 */}
              <div className="relative max-w-3xl mx-auto px-2 md:px-6 mt-8 md:mt-10">
                <div className={gridStripes} />
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  {EXTRA_GRID_EVIDENCE.map((item, i) => (
                    <EvidenceGridCard
                      key={item.id}
                      defaultSrc={item.src}
                      label={item.alt}
                      editableId={item.id}
                      colorIdx={images.length + 1 + i}
                      userRole={userRole ?? undefined}
                      onOpen={(src, alt) => setSelectedImg({ src, alt })}
                    />
                  ))}
                </div>
              </div>

              {/* Under grid archive — play responsibly (replaces prior “mainnet / encryption” strip). */}
              <PlayResponsiblyBanner />

              <SiteDisclaimer className="mt-6 px-1" />

            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90"
            onClick={() => setSelectedImg(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl aspect-square md:aspect-video bg-slate-900 rounded-none overflow-hidden border-[4px] border-blue-600/[0.82] shadow-[0_0_40px_rgba(37,99,235,0.45),0_12px_40px_rgba(0,0,0,0.65)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={selectedImg.src} 
                alt={selectedImg.alt} 
                fill 
                className="object-contain p-4"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedImg(null)}
                className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 text-white rounded-none transition-all"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
