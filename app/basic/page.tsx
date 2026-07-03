'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar } from 'lucide-react';
import Grid from '@/components/Grid';
import AnchorSubtractionCircles from '@/components/AnchorSubtractionCircles';
import AIPredictor from '@/components/AIPredictor';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import { useAuth } from '@/hooks/useAuth';
import { getSubtractCircleAnchors } from '@/lib/subtractCircles';
import { useAnchorClockTick, useSyncGridDateAtMidnight } from '@/hooks/useAnchorClockTick';
import { useGridLiveSync } from '@/hooks/useGridLiveSync';
import { useEmmaGridCommands } from '@/hooks/useEmmaGridCommands';
import { usePersistGridMarks } from '@/hooks/usePersistGridMarks';
import { WINDOW_OUTER_SHELL_RESPONSIVE } from '@/lib/constants';
import type { GridDataMap } from '@/lib/gridMarkColors';
import { cn } from '@/lib/utils';

export default function BasicGridPage() {
  const { user } = useAuth();
  const [pairInputs, setPairInputs] = useState(['', '']);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [selectedMarkColor, setSelectedMarkColor] = useState<string | null>(null);
  const [markedCells, setMarkedCells] = useState<{ [key: string]: { [index: number]: string } }>({
    grid1: {},
    grid2: {},
    grid3: {},
    grid4: {},
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
      setCurrentTime(new Date());
      setSelectedDate(new Date());
    }, 0);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };
  
  // ==========================================
  // STRICTLY LOCKED SEQUENCE & FORMULAS - DO NOT CHANGE
  // This specific path formula and grid population logic is structurally locked by the owner.
  // IT APPLIES TO ALL GRIDS ACROSS THE ENTIRE PLATFORM (GRIDS 1 THROUGH 10).
  // ==========================================
  const path = [0, 5, 10, 15, 11, 7, 3, 2, 1, 4, 8, 12, 13, 14, 6, 9];

  const handlePairInputChange = (index: number, val: string) => {
    const sanitized = val.replace(/[^0-9]/g, '').slice(0, 4);
    const next = [...pairInputs];
    next[index] = sanitized;
    setPairInputs(next);
  };

  const clearPairInput = (index: number) => {
    const next = [...pairInputs];
    next[index] = '';
    setPairInputs(next);
  };

  // LOCKED FORMULA FOR ODD GRIDS (1, 3, 5, 7, 9)
  const getGrid1Values = (source: string) => {
    const values = new Array(16).fill(null);
    if (!source) return values;

    // Fill as many of the first 4 as we have
    for (let i = 0; i < source.length; i++) {
      values[path[i]] = source[i];
    }

    // Remaining 12 are calculated starting from (last digit + 1)
    if (source.length === 4) {
      const lastDigit = parseInt(source[3]);
      for (let i = 4; i < 16; i++) {
        values[path[i]] = ((lastDigit + (i - 3)) % 10).toString();
      }
    }

    return values;
  };

  // LOCKED FORMULA FOR EVEN GRIDS (2, 4, 6, 8, 10)
  const getGrid2Values = (source: string) => {
    const values = new Array(16).fill(null);
    if (!source) return values;

    const digits = source.split('').map(d => parseInt(d));

    // Column 1: The input digits (Top-Downward)
    for (let i = 0; i < digits.length; i++) values[i * 4] = digits[i].toString();

    if (digits.length === 4) {
      // Column 2: Add 1 to Column 1 (Top-Downward)
      for (let i = 0; i < 4; i++) values[i * 4 + 1] = ((digits[i] + 1) % 10).toString();

      // Column 3: Subtract 1 from Column 1 (Top-Downward)
      for (let i = 0; i < 4; i++) values[i * 4 + 2] = ((digits[i] - 1 + 10) % 10).toString();

      // Column 4: Mirror (Add 5) to Column 1 (Top-Downward)
      for (let i = 0; i < 4; i++) values[i * 4 + 3] = ((digits[i] + 5) % 10).toString();
    }

    return values;
  };
  // ==========================================
  // END OF LOCKED FORMULAS
  // ==========================================

  const buildFourGridData = (ins: string[]) => ({
    grid1: getGrid1Values(ins[0] ?? ''),
    grid2: getGrid2Values(ins[0] ?? ''),
    grid3: getGrid1Values(ins[1] ?? ''),
    grid4: getGrid2Values(ins[1] ?? ''),
  });

  const fourGridData = buildFourGridData(pairInputs);

  useGridLiveSync(markedCells, fourGridData, {
    pageTier: 'basic',
    inputs: pairInputs,
    selectedMarkColor,
  });

  const buildGridDataForEmma = useCallback(
    (ins: string[]): GridDataMap => buildFourGridData(ins),
    [],
  );

  useEmmaGridCommands({
    maxPairs: 2,
    inputs: pairInputs,
    setInputs: (next) => {
      setPairInputs([next[0] ?? '', next[1] ?? '']);
    },
    markedCells,
    setMarkedCells,
    buildGridData: buildGridDataForEmma,
    setSelectedMarkColor,
  });

  usePersistGridMarks({
    pageTier: 'basic',
    markedCells,
    setMarkedCells,
    gridData: fourGridData,
    inputs: pairInputs,
    userId: user?.id,
  });

  const handleCellClick = (gridId: string, index: number) => {
    if (!selectedMarkColor) return;
    
    setMarkedCells(prev => ({
      ...prev,
      [gridId]: {
        ...prev[gridId],
        [index]: prev[gridId][index] === selectedMarkColor ? '' : selectedMarkColor
      }
    }));
  };

  const markColors = [
    { name: 'yellow', class: 'bg-yellow-300 border-yellow-500 border-2 shadow-[0_0_8px_rgba(234,179,8,0.3)]' },
    { name: 'turquoise', class: 'bg-teal-300 border-teal-500 border-2 shadow-[0_0_8px_rgba(20,184,166,0.3)]' },
    { name: 'orange', class: 'bg-orange-300 border-orange-500 border-2 shadow-[0_0_8px_rgba(249,115,22,0.3)]' },
    { name: 'purple', class: 'bg-purple-300 border-purple-500 border-2 shadow-[0_0_8px_rgba(168,85,247,0.3)]' },
  ];

  const anchorTick = useAnchorClockTick();
  useSyncGridDateAtMidnight(setSelectedDate, setCurrentTime, anchorTick);
  const anchors = getSubtractCircleAnchors(selectedDate);
  const { anchorRedTop, anchorRedBottom, anchorBlueTop, anchorBlueBottom } = anchors;

  return (
    <SubscriptionGuard requiredTier="standard">
      <main className="relative flex min-h-screen min-w-0 flex-col items-center overflow-x-hidden p-0 font-sans">
        <PageHeader />
        <div className="mb-4 md:mb-8 w-full">
          <GridButtons />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center pt-2 md:pt-4">
        <div className="relative group w-full max-w-3xl px-2 md:px-6 mb-4 md:mb-6">
          {/* Ambient Glows - Red, White, Blue */}
          <div className="absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/10 to-red-600/20 rounded-[2rem] md:rounded-[4rem] blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
          
          {/* Red Outer Border - Standard Size Window */}
          <div
            className={cn(
              'relative rounded-none bg-slate-900/95 p-1 md:p-2',
              WINDOW_OUTER_SHELL_RESPONSIVE
            )}
          >
            {/* Content without forced vertical scroll */}
            <div className="relative p-3 md:p-8 rounded-none bg-slate-900/98 shadow-inner flex flex-col items-center space-y-4">
              <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-white to-red-600 mb-4 rounded-none opacity-80"></div>
              
              {/* Date, Time, Year & Clock Row */}
            <div className="relative flex flex-wrap items-center justify-center space-x-3 bg-[#94B6C7] px-4 py-2 md:py-3 rounded-none shadow-sm border border-[#94B6C7] w-full max-w-2xl lg:max-w-2xl hover:bg-[#83a6b7] transition-colors group">
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={handleDateChange}
                value={mounted && !isNaN(selectedDate.getTime()) ? selectedDate.toISOString().split('T')[0] : ''}
                title="Select Date"
              />
              <div className="flex items-center space-x-1.5 text-slate-800">
                <Calendar size={20} className="text-blue-700 group-hover:scale-110 transition-transform" />
                <span className="text-[16px] md:text-[20px] font-bold tracking-normal">
                  {mounted ? formatDate(selectedDate) : '--- --, ----'}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-500/50 hidden sm:block"></div>
              <div className="flex items-center space-x-1.5 text-slate-900">
                <Clock size={20} className="text-red-600" />
                <span className="text-[18px] md:text-[22px] font-mono font-bold tabular-nums">
                  {mounted ? formatTime(currentTime) : '--:--:-- --'}
                </span>
              </div>
            </div>

            {/* AI Predictor Section */}
            <div className="w-full max-w-2xl lg:max-w-2xl py-4 mx-auto">
              <AIPredictor
                gridData={fourGridData}
                markedCells={markedCells}
                anchors={{
                  red: [anchorRedTop, anchorRedBottom],
                  blue: [anchorBlueTop, anchorBlueBottom],
                }}
                selectedLocation=""
                currentInput={pairInputs[0]}
                watchInputs={pairInputs}
                maxPredictions={2}
              />
            </div>

            <div className="flex w-full flex-col space-y-2">
              {[0, 1].map((pairIndex) => {
                const gridAIndex = pairIndex * 2 + 1;
                const gridBIndex = pairIndex * 2 + 2;
                const inputVal = pairInputs[pairIndex];
                const gridAValues = getGrid1Values(inputVal);
                const gridBValues = getGrid2Values(inputVal);

                return (
                  <div
                    key={pairIndex}
                    className="flex w-full flex-col items-center space-y-1.5 border-b border-slate-100/10 pb-2 last:border-0"
                  >
                    <AnchorSubtractionCircles anchors={anchors} mounted={mounted} className="mb-4" />

                    <div className="flex w-full max-w-[230px] flex-col items-center space-y-2 rounded-none border border-[#94B6C7] bg-[#94B6C7] p-2.5 shadow-md sm:max-w-[300px] md:p-4">
                      <div className="flex flex-col items-center">
                        <p className="mb-1 text-center text-xs font-bold tracking-normal text-slate-800 shadow-sm md:text-[15px]">
                          Enter 4 Digits (pair {pairIndex + 1})
                        </p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={inputVal}
                            onChange={(e) => handlePairInputChange(pairIndex, e.target.value)}
                            placeholder="----"
                            className="w-[4.75rem] rounded-none border border-slate-700 bg-slate-900 py-1.5 text-center text-base font-bold tracking-normal text-white shadow-inner transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-24 sm:py-1.5 sm:text-xl"
                          />
                          <button
                            onClick={() => clearPairInput(pairIndex)}
                            className="rounded-none border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold tracking-normal text-slate-300 shadow-sm transition-all hover:bg-slate-700 sm:px-3 sm:text-sm"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="my-1 h-px w-full bg-slate-400/50" />

                      <div className="flex flex-col items-center space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-800 sm:text-xs">
                          Marking Tool
                        </span>
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {markColors.map((color) => (
                            <button
                              key={color.name}
                              onClick={() =>
                                setSelectedMarkColor(
                                  selectedMarkColor === color.class ? null : color.class,
                                )
                              }
                              className={`
                                h-6 w-6 transform rounded-full border-2 transition-all hover:scale-110 sm:h-7 sm:w-7
                                ${color.class}
                                ${selectedMarkColor === color.class ? 'scale-110 border-white ring-2 ring-blue-400 ring-offset-1' : 'border-slate-400/30'}
                              `}
                              title={`Mark with ${color.name}`}
                            />
                          ))}
                          <button
                            onClick={() => {
                              setSelectedMarkColor(null);
                              setMarkedCells({
                                grid1: {},
                                grid2: {},
                                grid3: {},
                                grid4: {},
                              });
                            }}
                            className="ml-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-red-100 hover:text-red-600 active:scale-95 sm:px-3 sm:text-sm"
                            title="Reset All Marks"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative mx-auto flex w-full max-w-2xl flex-row items-start justify-center gap-2 px-1 py-4 md:px-4 sm:gap-6">
                      <div className="absolute left-0 right-0 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                      <div className="relative z-10 max-w-[200px] flex-1 sm:max-w-[240px]">
                        <Grid
                          title={`Grid ${gridAIndex}`}
                          gridValues={gridAValues}
                          redNums={[anchorRedTop, anchorRedBottom]}
                          blueNums={[anchorBlueTop, anchorBlueBottom]}
                          markedCells={markedCells[`grid${gridAIndex}`] || {}}
                          onCellClick={(idx) => handleCellClick(`grid${gridAIndex}`, idx)}
                        />
                      </div>
                      <div className="relative z-10 max-w-[200px] flex-1 sm:max-w-[240px]">
                        <Grid
                          title={`Grid ${gridBIndex}`}
                          gridValues={gridBValues}
                          redNums={[anchorRedTop, anchorRedBottom]}
                          blueNums={[anchorBlueTop, anchorBlueBottom]}
                          markedCells={markedCells[`grid${gridBIndex}`] || {}}
                          onCellClick={(idx) => handleCellClick(`grid${gridBIndex}`, idx)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
    </SubscriptionGuard>
  );
}
