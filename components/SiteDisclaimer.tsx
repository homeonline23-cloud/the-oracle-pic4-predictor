import { cn } from '@/lib/utils';

type SiteDisclaimerProps = {
  /** Spacing / layout relative to surrounding content (e.g. `mt-8` under a text block). */
  className?: string;
};

/** Same informational disclaimer as About — centered, compact type. */
export default function SiteDisclaimer({ className }: SiteDisclaimerProps) {
  return (
    <div
      className={cn(
        'border-t border-white/10 pt-5 text-center w-full max-w-2xl mx-auto space-y-2',
        className
      )}
    >
      <p className="text-white font-bold text-[10px] md:text-xs tracking-wide">Disclaimer:</p>
      <p className="text-slate-400 text-[9px] md:text-[10px] leading-relaxed font-normal text-balance">
        This service is for informational and entertainment purposes only. It does not sell lottery tickets, place wagers, or guarantee results. Users are responsible for complying with local laws.
      </p>
    </div>
  );
}
