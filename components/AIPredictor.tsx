'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Trash2, CheckCircle2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import { WINDOW_OUTER_SHELL } from '@/lib/constants';
import type { GridDataMap } from '@/lib/gridMarkColors';
import { buildMarkMemoryBankBlock } from '@/lib/gridMarkMemory';
import { buildPredictPrompt } from '@/lib/buildPredictPrompt';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import { parseApiJsonResponse } from '@/lib/parseApiResponse';
import { withTimeout } from '@/lib/withTimeout';
import { cn } from '@/lib/utils';

interface AIPredictorProps {
  gridData: {
    grid1: (string | null)[];
    grid2: (string | null)[];
    grid3?: (string | null)[];
    grid4?: (string | null)[];
    grid5?: (string | null)[];
    grid6?: (string | null)[];
    grid7?: (string | null)[];
    grid8?: (string | null)[];
    grid9?: (string | null)[];
    grid10?: (string | null)[];
    grid11?: (string | null)[];
    grid12?: (string | null)[];
    grid13?: (string | null)[];
    grid14?: (string | null)[];
    grid15?: (string | null)[];
    grid16?: (string | null)[];
    grid17?: (string | null)[];
    grid18?: (string | null)[];
    grid19?: (string | null)[];
    grid20?: (string | null)[];
  };
  markedCells: { [key: string]: { [index: number]: string } };
  anchors: {
    red: number[];
    blue: number[];
  };
  selectedLocation: string;
  currentInput: string;
  maxPredictions: number;
}

interface Prediction {
  number: string;
  reason: string;
}

import { useAuth } from '@/hooks/useAuth';
import { isGrid2DemoEmail } from '@/lib/demoAuth';

export default function AIPredictor({ gridData, markedCells, anchors, selectedLocation, currentInput, maxPredictions }: AIPredictorProps) {
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<string[]>([]);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const supabase = createClient();
  const { user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const isTesterDemo = isGrid2DemoEmail(user?.email);

  useEffect(() => {
    if (!loading) {
      setLoadingSeconds(0);
      return;
    }
    const tick = setInterval(() => setLoadingSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [loading]);

  const recordWinningNumber = async () => {
    if (!currentInput || currentInput.length !== 4) {
      setError("Please enter a valid 4-digit winning number.");
      return;
    }
    if (!user) {
      setError("You must be logged in to record winning numbers.");
      return;
    }

    setRecording(true);
    setError(null);

    try {
      const { error } = await withTimeout(
        supabase.from('winning_numbers').insert({
          number: currentInput,
          location: selectedLocation || 'Global',
          recorded_by: user.id,
        }),
        12000,
        'Save winning number',
      );
      if (error) throw error;
      setRecorded(true);
    } catch (err: unknown) {
      console.error('Error recording winning number:', err);
      const msg = err instanceof Error ? err.message : 'Save failed';
      setError(msg.includes('timed out') ? msg : 'Failed to record winning number. Please try again.');
    } finally {
      setRecording(false);
    }
  };

  const predictWinningNumbers = async () => {
    if (!user) {
      setError("Please sign in to run AI analysis.");
      return;
    }

    if (!gridData.grid1.some(v => v !== null)) {
      setError("Please enter 4 digits first to populate the grids.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingSeconds(0);

    try {
      if (!isAdmin && !isTesterDemo) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('predictions_used, predictions_limit')
          .eq('id', user.id)
          .maybeSingle();
        if (profileError) console.warn('Profile check skipped:', profileError.message);
        if (profile && profile.predictions_used >= profile.predictions_limit) {
          setError('Monthly prediction limit reached. Please upgrade your plan.');
          return;
        }
      }

      let history: string[] = [];
      let memoryBank = '';
      try {
        const [histRes, mem] = await Promise.all([
          supabase
            .from('winning_numbers')
            .select('number')
            .order('created_at', { ascending: false })
            .limit(20),
          buildMarkMemoryBankBlock(supabase),
        ]);
        history = histRes.data?.map((h) => h.number) || [];
        memoryBank = mem;
      } catch (prefetchErr) {
        console.warn('Predict prefetch skipped:', prefetchErr);
      }
      setHistoricalData(history);

      const prompt = buildPredictPrompt({
        gridData: gridData as GridDataMap,
        markedCells,
        anchors,
        maxPredictions,
        history,
        memoryBank,
      });

      const callGenerate = () =>
        fetchWithTimeout('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          timeoutMs: 90000,
          body: JSON.stringify({
            systemInstruction: 'Respond with valid JSON array only. No markdown.',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            responseMimeType: 'application/json',
          }),
        });

      let response = await callGenerate();
      if (response.status === 504 || response.status === 502) {
        await new Promise((r) => setTimeout(r, 1500));
        response = await callGenerate();
      }
      const data = await parseApiJsonResponse<{ text?: string; error?: string }>(response);
      if (!response.ok) {
        throw new Error(data.error || `Analysis failed (${response.status}). Please try again.`);
      }

      // Strip markdown code fences just in case the model still wraps JSON.
      const cleaned = String(data.text ?? '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error('AI response was not valid JSON.');
      }

      // Accept either a bare array or an object that wraps the array.
      const candidate = Array.isArray(parsed)
        ? parsed
        : (parsed as { predictions?: unknown }).predictions;

      if (!Array.isArray(candidate)) {
        throw new Error('AI response did not contain a predictions array.');
      }

      const result = candidate.filter(
        (p): p is Prediction =>
          !!p && typeof (p as Prediction).number === 'string' && typeof (p as Prediction).reason === 'string'
      );

      if (result.length === 0) {
        throw new Error('AI returned no valid predictions. Please enter 4 digits and try again.');
      }

      setPredictions(result);

      // Save history in the background so the spinner stops as soon as results are ready.
      void (async () => {
        try {
          await supabase.from('predictions').insert({
            user_id: user.id,
            predictions: result,
            location: selectedLocation || 'Global',
            input_numbers: currentInput,
          });

          if (!isAdmin && !isTesterDemo) {
            await supabase.rpc('increment_predictions_used');
          }
        } catch (saveErr) {
          console.error('Save prediction history error:', saveErr);
        }
      })();

    } catch (err) {
      console.error("AI Prediction Error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('API key not valid')) {
        setError('Invalid API Key. Please check your Gemini API key configuration.');
      } else if (/model not found|no longer available|404|NOT_FOUND/i.test(errorMessage)) {
        setError('AI model is updating on the server. Please wait one minute, refresh the page, and try again.');
      } else if (/timed out|timeout|504|502|FUNCTION_INVOCATION/i.test(errorMessage)) {
        setError(
          'Analysis took too long (the AI server may be busy). Wait 30 seconds and try again — make sure Enter 4 Digits is filled first.',
        );
      } else if (errorMessage.includes('Server error') || errorMessage.includes('error page')) {
        setError(errorMessage);
      } else if (/rate|quota|429|busy/i.test(errorMessage)) {
        setError('AI is busy right now. Please wait a minute and try again.');
      } else if (errorMessage.includes('not valid JSON') || errorMessage.includes('no valid predictions')) {
        setError(errorMessage);
      } else {
        setError(errorMessage || 'Failed to generate predictions. Please ensure you have entered 4 digits.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 md:mt-4 px-2 md:px-6">
      {/* Action Buttons Row */}
      <div className="flex flex-col gap-2 mb-4">
        {/* Record Button */}
        <button
          onClick={recordWinningNumber}
          disabled={recording || recorded || !currentInput || currentInput.length !== 4}
          className={`w-full py-2 rounded-none font-bold tracking-normal text-[10px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border ${
            recorded 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-slate-300'
          }`}
        >
          {recording ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : recorded ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          {recording ? 'Recording...' : recorded ? 'Winning Number Recorded' : 'Record as Winning Number'}
        </button>

        {/* Predict Button */}
        <button
          onClick={predictWinningNumbers}
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-500 hover:via-purple-500 hover:to-red-500 text-white rounded-none font-bold tracking-normal text-[11px] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Patterns…{loadingSeconds > 0 ? ` (${loadingSeconds}s)` : ''}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-bold flex items-center justify-center gap-1.5">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI</span>
                <span className="text-red-600 font-bold">Pic 4</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-400 to-white">Predictor</span>
              </span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-none flex items-center gap-2 text-red-400 text-[10px] font-bold"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        {predictions.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Blackboard / Notebook Window */}
            <div
              className={cn(
                'relative min-h-[300px] overflow-hidden rounded-none bg-black p-6',
                WINDOW_OUTER_SHELL
              )}
            >
              {/* Subtle Texture Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-texture-blackboard"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
                  <h3 className="text-amber-100 font-serif font-bold text-lg flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    Predicted Numbers
                  </h3>
                  
                  {/* Small Pill Clear Button */}
                  <button 
                    onClick={() => setPredictions([])}
                    className="px-3 py-1 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-none transition-all text-[9px] font-bold tracking-normal border border-white/10 flex items-center gap-1.5 active:scale-95"
                  >
                    <Trash2 size={10} />
                    Clear
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {predictions.map((pred, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 group"
                    >
                      <span className="text-2xl font-bold text-white font-mono tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:text-blue-400 transition-colors">
                        {pred.number}
                      </span>
                      <div className="flex-1 pt-1">
                        <p className="text-[9px] text-slate-400 leading-tight font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                          &quot;{pred.reason}&quot;
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chalk Dust Effect at bottom */}
                <div className="mt-8 pt-4 border-t border-white/5 flex flex-col items-center gap-1">
                  <p className="text-[9px] text-white/20 font-bold tracking-normal">
                    Pattern Analysis Complete
                  </p>
                  {historicalData.length > 0 && (
                    <p className="text-[8px] text-blue-400/40 font-medium tracking-normal">
                      Learned from {historicalData.length} historical winners
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Decorative Shadow */}
            <div className="absolute -inset-2 bg-black/20 blur-xl -z-10 rounded-none"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

