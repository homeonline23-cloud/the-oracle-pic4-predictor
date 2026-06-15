'use client';

import { useEffect, useRef } from 'react';
import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import {
  applyPlaceToInputs,
  computeAutoMarks,
  markClassForColor,
  subscribeEmmaGridCommands,
  type EmmaGridCommand,
} from '@/lib/emmaGridCommands';
import { scanGridPatterns } from '@/lib/gridPatternScan';

type UseEmmaGridCommandsOptions = {
  maxPairs: number;
  inputs: string[];
  setInputs: (next: string[]) => void;
  markedCells: GridMarkedCells;
  setMarkedCells: (next: GridMarkedCells) => void;
  buildGridData: (inputs: string[]) => GridDataMap;
  setSelectedMarkColor?: (markClass: string | null) => void;
};

/** Grid pages listen here when Emma places numbers or applies marks. */
export function useEmmaGridCommands({
  maxPairs,
  inputs,
  setInputs,
  markedCells,
  setMarkedCells,
  buildGridData,
  setSelectedMarkColor,
}: UseEmmaGridCommandsOptions) {
  const inputsRef = useRef(inputs);
  const marksRef = useRef(markedCells);
  inputsRef.current = inputs;
  marksRef.current = markedCells;

  const optsRef = useRef({
    maxPairs,
    setInputs,
    setMarkedCells,
    buildGridData,
    setSelectedMarkColor,
  });
  optsRef.current = {
    maxPairs,
    setInputs,
    setMarkedCells,
    buildGridData,
    setSelectedMarkColor,
  };

  useEffect(() => {
    const handle = (command: EmmaGridCommand) => {
      const {
        maxPairs: pairs,
        setInputs: applyInputs,
        setMarkedCells: applyMarks,
        buildGridData: buildData,
        setSelectedMarkColor: applyColor,
      } = optsRef.current;

      const currentInputs = inputsRef.current;
      const currentMarks = marksRef.current;

      if (command.type === 'auto-mark') {
        const gridData = buildData(currentInputs);
        const scan = scanGridPatterns(
          gridData,
          currentMarks,
          currentInputs.filter((v) => /^\d{4}$/.test(v)),
        );
        const markClass = markClassForColor(command.color ?? 'yellow');
        applyMarks(
          computeAutoMarks(
            gridData,
            currentMarks,
            markClass,
            scan,
            currentInputs.filter((v) => /^\d{4}$/.test(v)),
          ),
        );
        applyColor?.(markClass);
        return;
      }

      const toPlace = command.inputs.filter((n) => /^\d{4}$/.test(n));
      if (toPlace.length === 0) return;

      const nextInputs = applyPlaceToInputs(currentInputs, toPlace, pairs);
      applyInputs(nextInputs);

      if (command.type !== 'place-and-mark') return;

      const gridData = buildData(nextInputs);
      const scan = scanGridPatterns(gridData, currentMarks, toPlace);
      const markClass = markClassForColor(command.color ?? 'yellow');
      applyMarks(computeAutoMarks(gridData, currentMarks, markClass, scan, toPlace));
      applyColor?.(markClass);
    };

    return subscribeEmmaGridCommands(handle);
  }, []);
}
