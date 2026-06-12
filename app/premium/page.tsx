'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Grid from '@/components/Grid';
import AnchorSubtractionCircles from '@/components/AnchorSubtractionCircles';
import AIPredictor from '@/components/AIPredictor';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import { ADMIN_EMAIL, WINDOW_OUTER_SHELL_RESPONSIVE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getSubtractCircleAnchors } from '@/lib/subtractCircles';
import { useAnchorClockTick, useSyncGridDateAtMidnight } from '@/hooks/useAnchorClockTick';
import { useGridLiveSync } from '@/hooks/useGridLiveSync';

export default function PremiumTenGridPage() {
  const { user, userRole } = useAuth();
  const [inputs, setInputs] = useState(['', '', '', '', '']);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [selectedMarkColor, setSelectedMarkColor] = useState<string | null>(null);
  const [markedCells, setMarkedCells] = useState<{ [key: string]: { [index: number]: string } }>({
    grid1: {}, grid2: {}, grid3: {}, grid4: {}, grid5: {}, grid6: {}, grid7: {}, grid8: {}, grid9: {}, grid10: {}
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

  const handleInputChange = (index: number, val: string) => {
    const sanitized = val.replace(/[^0-9]/g, '').slice(0, 4);
    const newInputs = [...inputs];
    newInputs[index] = sanitized;
    setInputs(newInputs);
  };

  const clearInput = (index: number) => {
    const newInputs = [...inputs];
    newInputs[index] = '';
    setInputs(newInputs);
  };

  // LOCKED FORMULA FOR ODD GRIDS (1, 3, 5, 7, 9)
  const getGrid1Values = (input: string) => {
    const values = new Array(16).fill(null);
    if (!input) return values;
    for (let i = 0; i < input.length; i++) values[path[i]] = input[i];
    if (input.length === 4) {
      const lastDigit = parseInt(input[3]);
      for (let i = 4; i < 16; i++) values[path[i]] = ((lastDigit + (i - 3)) % 10).toString();
    }
    return values;
  };

  // LOCKED FORMULA FOR EVEN GRIDS (2, 4, 6, 8, 10)
  const getGrid2Values = (input: string) => {
    const values = new Array(16).fill(null);
    if (!input) return values;
    const digits = input.split('').map(d => parseInt(d));
    for (let i = 0; i < digits.length; i++) values[i * 4] = digits[i].toString();
    if (digits.length === 4) {
      for (let i = 0; i < 4; i++) values[i * 4 + 1] = ((digits[i] + 1) % 10).toString();
      for (let i = 0; i < 4; i++) values[i * 4 + 2] = ((digits[i] - 1 + 10) % 10).toString();
      for (let i = 0; i < 4; i++) values[i * 4 + 3] = ((digits[i] + 5) % 10).toString();
    }
    return values;
  };
  // ==========================================
  // END OF LOCKED FORMULAS
  // ==========================================

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

  useGridLiveSync(markedCells, {
    grid1: getGrid1Values(inputs[0]),
    grid2: getGrid2Values(inputs[0]),
    grid3: getGrid1Values(inputs[1]),
    grid4: getGrid2Values(inputs[1]),
    grid5: getGrid1Values(inputs[2]),
    grid6: getGrid2Values(inputs[2]),
    grid7: getGrid1Values(inputs[3]),
    grid8: getGrid2Values(inputs[3]),
    grid9: getGrid1Values(inputs[4]),
    grid10: getGrid2Values(inputs[4]),
  });

  return (
    <SubscriptionGuard requiredTier="premium" allowGuestView>
      <main className="relative flex min-h-screen min-w-0 flex-col items-center overflow-x-hidden p-0 pb-20 font-sans">
        <PageHeader />
        <div className="mb-4 md:mb-8 w-full">
          <GridButtons />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full flex flex-col items-center pt-2 md:pt-4">
        
        <div className="relative group w-full max-w-3xl px-2 md:px-6 mb-4 md:mb-6">
          {/* Ambient Glows - Red, White, Blue */}
          <div className="absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/10 to-red-600/20 rounded-[2rem] md:rounded-[4rem] blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
          
          {/* Red Outer Border - Standard Size Window */}
          <div
            className={cn(
              'relative rounded-none bg-slate-900/40 p-1 backdrop-blur-sm md:p-2',
              WINDOW_OUTER_SHELL_RESPONSIVE
            )}
          >
            {/* Content without forced vertical scroll */}
            <div className="relative p-3 md:p-8 rounded-none bg-slate-900/80 backdrop-blur-xl shadow-inner flex flex-col items-center space-y-4">
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-white to-red-600 mb-4 rounded-none opacity-80"></div>
                
                {/* Date, Time, Year & Clock Row */}
              <div className="relative flex flex-wrap items-center justify-center space-x-3 bg-[#94B6C7] px-4 py-2 md:py-3 rounded-none shadow-sm border border-[#94B6C7] w-full max-w-2xl lg:max-w-2xl hover:bg-[#83a6b7] transition-colors group mb-6">
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
                  gridData={{
                    grid1: getGrid1Values(inputs[0]),
                    grid2: getGrid2Values(inputs[0]),
                    grid3: getGrid1Values(inputs[1]),
                    grid4: getGrid2Values(inputs[1]),
                    grid5: getGrid1Values(inputs[2]),
                    grid6: getGrid2Values(inputs[2]),
                    grid7: getGrid1Values(inputs[3]),
                    grid8: getGrid2Values(inputs[3]),
                    grid9: getGrid1Values(inputs[4]),
                    grid10: getGrid2Values(inputs[4])
                  }}
                  markedCells={markedCells}
                  anchors={{
                    red: [anchorRedTop, anchorRedBottom],
                    blue: [anchorBlueTop, anchorBlueBottom]
                  }}
                  selectedLocation=""
                  currentInput={inputs[0]}
                  maxPredictions={5}
                />
              </div>

              {/* 10 Grids in Pairs with Input Windows */}
              <div className="flex flex-col space-y-2 w-full">
                {[0, 1, 2, 3, 4].map((pairIndex) => {
                  const gridAIndex = pairIndex * 2 + 1;
                  const gridBIndex = pairIndex * 2 + 2;
                  const inputVal = inputs[pairIndex];
                  const gridAValues = getGrid1Values(inputVal);
                  const gridBValues = getGrid2Values(inputVal);

                  return (
                    <div key={pairIndex} className="flex flex-col items-center space-y-1.5 w-full border-b border-slate-100/10 pb-2 last:border-0">
                      
                      <AnchorSubtractionCircles
                        anchors={anchors}
                        mounted={mounted}
                        className="mb-4"
                      />

                      {/* Combined Input & Marking Tool Box */}
                      <div className="flex flex-col items-center space-y-2 bg-[#94B6C7] p-2.5 md:p-4 rounded-none shadow-md border border-[#94B6C7] w-full max-w-[230px] sm:max-w-[300px]">
                        {/* Enter 4 Digits Section */}
                        <div className="flex flex-col items-center">
                          <p className="text-xs md:text-[15px] text-slate-800 font-bold tracking-normal mb-1 shadow-sm text-center">
                            Enter 4 Digits
                          </p>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={inputVal}
                              onChange={(e) => handleInputChange(pairIndex, e.target.value)}
                              placeholder="----"
                              className="w-[4.75rem] sm:w-24 text-center bg-slate-900 border border-slate-700 rounded-none py-1.5 sm:py-1.5 text-base sm:text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner tracking-normal"
                            />
                            <button
                              onClick={() => clearInput(pairIndex)}
                              className="px-2.5 sm:px-3 py-1.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-none transition-all border border-slate-700 shadow-sm text-xs sm:text-sm font-bold tracking-normal"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-slate-400/50 my-1"></div>

                        {/* Marking Tool Section */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <span className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wide">Marking Tool</span>
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            {markColors.map((color) => (
                              <button
                                key={color.name}
                                onClick={() => setSelectedMarkColor(selectedMarkColor === color.class ? null : color.class)}
                                className={`
                                  w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all transform hover:scale-110
                                  ${color.class}
                                  ${selectedMarkColor === color.class ? 'ring-2 ring-blue-400 ring-offset-1 scale-110 border-white' : 'border-slate-400/30'}
                                `}
                                title={`Mark with ${color.name}`}
                              />
                            ))}
                            <button 
                              onClick={() => {
                                setSelectedMarkColor(null);
                                setMarkedCells({ 
                                  grid1: {}, grid2: {}, grid3: {}, grid4: {}, grid5: {}, 
                                  grid6: {}, grid7: {}, grid8: {}, grid9: {}, grid10: {} 
                                });
                              }}
                              className="ml-1 px-2.5 sm:px-3 py-1.5 sm:py-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full border border-slate-300 transition-all text-xs sm:text-sm font-bold shadow-sm active:scale-95"
                              title="Reset All Marks"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* The Pair of Grids */}
                      <div className="relative flex flex-row items-start justify-center gap-2 sm:gap-6 w-full max-w-2xl mx-auto py-4 px-1 md:px-4">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-none opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)] -translate-y-1/2 z-0"></div>
                        
                        <div className="relative z-10 flex-1 max-w-[200px] sm:max-w-[240px]">
                          <Grid 
                            title={`Grid ${gridAIndex}`} 
                            gridValues={gridAValues} 
                            redNums={[anchorRedTop, anchorRedBottom]} 
                            blueNums={[anchorBlueTop, anchorBlueBottom]} 
                            markedCells={markedCells[`grid${gridAIndex}`] || {}}
                            onCellClick={(idx) => handleCellClick(`grid${gridAIndex}`, idx)}
                          />
                        </div>
                        <div className="relative z-10 flex-1 max-w-[200px] sm:max-w-[240px]">
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

      {/* Membership Lock Overlay (skipped in `next dev` so local work is not blocked) */}
      {process.env.NODE_ENV !== 'development' &&
        (!user ||
          (userRole !== 'premium' &&
            userRole !== 'admin' &&
            user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase())) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-red-500/30 p-4 rounded-none max-w-[180px] w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-sm font-bold text-white tracking-normal mb-2 leading-none">
                Premium <span className="text-red-500">Locked</span>
              </h2>
              
              <p className="text-slate-400 mb-4 font-bold leading-relaxed tracking-normal text-[7px]">
                The 10-Grid Advanced Predictor is exclusive to Premium Members. 
                <br />
                <span className="text-slate-300 block mt-1">Upgrade your membership to unlock full access.</span>
              </p>
              
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/#pricing-plans"
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[7px] font-bold tracking-normal rounded-none transition-all shadow-md active:scale-[0.98]"
                >
                  Upgrade Now
                </Link>
                <Link 
                  href="/"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[7px] font-bold tracking-normal rounded-none transition-all border border-white/5"
                >
                  Back to Home
                </Link>
              </div>
              
              <p className="mt-4 text-[6px] text-slate-500 font-bold tracking-normal">
                Secure Access • 2026
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </main>
    </SubscriptionGuard>
  );
}
