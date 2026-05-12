'use client';

import React from 'react';

interface GridProps {
  title: string;
  gridValues: (string | null)[];
  redNums: number[];
  blueNums: number[];
  markedCells: { [index: number]: string };
  onCellClick: (index: number) => void;
}

export default function Grid({ title, gridValues, redNums, blueNums, markedCells, onCellClick }: GridProps) {
  return (
    <div className="flex flex-col items-center space-y-1 w-full">
      <span className="text-xs sm:text-sm font-bold text-slate-500 tracking-normal">{title}</span>
      <div className="grid grid-cols-4 gap-1 w-full p-2 bg-[#94B6C7] rounded-none border-2 border-[#94B6C7] shadow-inner">
        {Array.from({ length: 16 }).map((_, idx) => {
          const value = gridValues[idx];
          const numValue = value !== null ? parseInt(value) : null;
          const isRed = numValue !== null && redNums.includes(numValue);
          const isBlue = numValue !== null && blueNums.includes(numValue);
          const markClass = markedCells[idx] || '';

          return (
            <div
              key={idx}
              onClick={() => onCellClick(idx)}
              className={`aspect-square rounded-full shadow-sm border border-[#d0e0e8] flex items-center justify-center cursor-pointer transition-all active:scale-95 ${markClass ? markClass : 'bg-[#EEF4F6] hover:bg-[#e0eaf0]'}`}
            >
              {(value !== null || markClass) && (
                <div className={`
                  w-7 h-7 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all
                  ${!markClass ? 'bg-white/50' : ''}
                  ${isRed ? 'border-[3px] sm:border-4 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110 z-10' : ''}
                  ${isBlue ? 'border-[3px] sm:border-4 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-110 z-10' : ''}
                `}>
                  <span className={`
                    font-bold text-sm sm:text-xl
                    ${isRed ? 'text-red-700' : isBlue ? 'text-blue-700' : 'text-slate-800'}
                  `}>
                    {value}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
