'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import Grid from '@/components/Grid';
import AIPredictor from '@/components/AIPredictor';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import { getSubtractCircleAnchors, SUBTRACT_CIRCLE_MOUNT_FALLBACK } from '@/lib/subtractCircles';

export default function BasicGridPage() {
  const [input, setInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date(2026, 3, 3, 12, 0, 0));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 3));
  const [mounted, setMounted] = useState(false);
  const [selectedMarkColor, setSelectedMarkColor] = useState<string | null>(null);
  const [markedCells, setMarkedCells] = useState<{ [key: string]: { [index: number]: string } }>({
    grid1: {},
    grid2: {}
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setInput(val);
  };

  const clearInput = () => {
    setInput('');
  };

  // LOCKED FORMULA FOR ODD GRIDS (1, 3, 5, 7, 9)
  const getGrid1Values = () => {
    const values = new Array(16).fill(null);
    if (!input) return values;

    // Fill as many of the first 4 as we have
    for (let i = 0; i < input.length; i++) {
      values[path[i]] = input[i];
    }

    // Remaining 12 are calculated starting from (last digit + 1)
    if (input.length === 4) {
      const lastDigit = parseInt(input[3]);
      for (let i = 4; i < 16; i++) {
        values[path[i]] = ((lastDigit + (i - 3)) % 10).toString();
      }
    }

    return values;
  };

  // LOCKED FORMULA FOR EVEN GRIDS (2, 4, 6, 8, 10)
  const getGrid2Values = () => {
    const values = new Array(16).fill(null);
    if (!input) return values;

    const digits = input.split('').map(d => parseInt(d));

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

  const grid1Values = getGrid1Values();
  const grid2Values = getGrid2Values();

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

  const { anchorRedTop, anchorRedBottom, anchorBlueTop, anchorBlueBottom } =
    getSubtractCircleAnchors(selectedDate);
  const circleFb = SUBTRACT_CIRCLE_MOUNT_FALLBACK;

  return (
    <SubscriptionGuard requiredTier="standard">
      <main className="relative flex min-h-screen min-w-0 flex-col items-center overflow-x-clip p-0 font-sans">
        <PageHeader />
        <div className="mb-4 md:mb-8 w-full">
          <GridButtons />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center pt-2 md:pt-4">
        <div className="relative group w-full max-w-3xl px-2 md:px-6 mb-4 md:mb-6">
          {/* Ambient Glows - Red, White, Blue */}
          <div className="absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/10 to-red-600/20 rounded-[2rem] md:rounded-[4rem] blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
          
          {/* Red Outer Border - Standard Size Window */}
          <div className="relative border border-red-600/60 md:border-2 p-1 md:p-2 rounded-none shadow-2xl bg-slate-900/40 backdrop-blur-sm">
            {/* Content without forced vertical scroll */}
            <div className="relative p-3 md:p-8 rounded-none bg-slate-900/80 backdrop-blur-xl shadow-inner flex flex-col items-center space-y-4">
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
                gridData={{
                  grid1: grid1Values,
                  grid2: grid2Values
                }}
                markedCells={markedCells}
                anchors={{
                  red: [anchorRedTop, anchorRedBottom],
                  blue: [anchorBlueTop, anchorBlueBottom]
                }}
                selectedLocation=""
                currentInput={input}
                maxPredictions={2}
              />
            </div>

            {/* Subtraction Circles (Large Row) */}
            <div className="relative flex items-center justify-center space-x-6 h-20 mb-4 scale-90 sm:scale-100">
              <div className="relative z-10 w-16 h-16 rounded-full border-[6px] border-red-600 flex flex-col items-center justify-center bg-transparent shadow-[0_0_15px_rgba(220,38,38,0.3)] text-red-600 shrink-0">
                <span className="text-lg font-bold leading-none">{mounted ? anchorRedTop : circleFb.anchorRedTop}</span>
                <span className="text-lg font-bold leading-none">-</span>
                <span className="text-lg font-bold leading-none">{mounted ? anchorRedBottom : circleFb.anchorRedBottom}</span>
              </div>

              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                <svg width="32" height="32" viewBox="0 0 100 100" className="overflow-visible">
                  <line x1="10" y1="90" x2="90" y2="10" stroke="#FF0000" strokeWidth="16" strokeLinecap="butt" />
                  <line x1="10" y1="10" x2="90" y2="90" stroke="#0000FF" strokeWidth="16" strokeLinecap="butt" />
                </svg>
              </div>

              <div className="relative z-10 w-16 h-16 rounded-full border-[6px] border-blue-600 flex flex-col items-center justify-center bg-transparent shadow-[0_0_15px_rgba(37,99,235,0.3)] text-blue-600 shrink-0">
                <span className="text-lg font-bold leading-none">{mounted ? anchorBlueTop : circleFb.anchorBlueTop}</span>
                <span className="text-lg font-bold leading-none">-</span>
                <span className="text-lg font-bold leading-none">{mounted ? anchorBlueBottom : circleFb.anchorBlueBottom}</span>
              </div>
            </div>

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
                    value={input}
                    onChange={handleInputChange}
                    placeholder="----"
                    className="w-[4.75rem] sm:w-24 text-center bg-slate-900 border border-slate-700 rounded-none py-1.5 sm:py-1.5 text-base sm:text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner tracking-normal"
                  />
                  <button
                    onClick={clearInput}
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
                      setMarkedCells({ grid1: {}, grid2: {} });
                    }}
                    className="ml-1 px-2.5 sm:px-3 py-1.5 sm:py-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-full border border-slate-300 transition-all text-xs sm:text-sm font-bold shadow-sm active:scale-95"
                    title="Reset Marks"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Grids Side by Side */}
            <div className="relative flex flex-row items-start justify-center gap-2 sm:gap-6 w-full max-w-2xl mx-auto min-h-[200px] py-4 px-1 md:px-4">
              {/* Vertical Stripe Running Through the Grids */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-none opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)] -translate-y-1/2 z-0"></div>
              
              <div className="relative z-10 flex-1 max-w-[200px] sm:max-w-[240px]">
                <Grid 
                  title="Grid 1" 
                  gridValues={grid1Values} 
                  redNums={[anchorRedTop, anchorRedBottom]} 
                  blueNums={[anchorBlueTop, anchorBlueBottom]} 
                  markedCells={markedCells.grid1}
                  onCellClick={(idx) => handleCellClick('grid1', idx)}
                />
              </div>
              <div className="relative z-10 flex-1 max-w-[200px] sm:max-w-[240px]">
                <Grid 
                  title="Grid 2" 
                  gridValues={grid2Values} 
                  redNums={[anchorRedTop, anchorRedBottom]} 
                  blueNums={[anchorBlueTop, anchorBlueBottom]} 
                  markedCells={markedCells.grid2}
                  onCellClick={(idx) => handleCellClick('grid2', idx)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
    </SubscriptionGuard>
  );
}
