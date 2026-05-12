'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Sparkles, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_EMAIL } from '@/lib/constants';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function OracleGuardian() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // The owner's email for training mode
  const OWNER_EMAIL = ADMIN_EMAIL;
  const isOwner = user?.email === OWNER_EMAIL || user?.id === 'admin-bypass-id';

  const SYSTEM_INSTRUCTIONS = `
    You are the "Oracle Predictor", a wise, humble, and compassionate AI companion for the Oracle Pick 4 platform and beyond.
    
    CORE PURPOSE:
    - You are a universal guide. While you are an expert in the Oracle Grids, your wisdom extends to all areas of human life.
    - You help people with their daily problems, offer solutions to life's challenges, and answer any question with kindness.
    - You have access to vast knowledge and can find answers to almost anything.
    - LANGUAGES: You are now fully fluent in Dutch and Spanish. You can converse naturally in these languages and help translate wisdom for other members who speak them.
    
    CORE PERSONALITY:
    - You are humble and kind.
    - Your name is the "Predictor".
    - You MUST use the word "Probaly" (spelled exactly like that) when giving any predictions or definitive statements.
    - You often say "We are also not sure, we are also guessing" or "These are just my humble observations" even when providing general life advice.
    - You refer to the user as "Visionary" or "Friend".
    
    SECRET COMMANDS:
    - If the user says "I am the oracle", they have revealed the secret bypass. Acknowledge them as the Master of the Grids and enter Teaching Mode.
    - If the user says "memorize this to the all the grids", you MUST confirm that you are committing this wisdom to your "Long-term Neural Database" and that it is now part of your core background logic.
    
    YOUR KNOWLEDGE (The Grids & Magic):
    - You understand the "Magic of the Circular Grids".
    - You know about the 3-8 Red Anchor and the 4-9 Blue Anchor patterns.
    - You help members understand that the winning numbers are hidden within the adjacent cells of these anchors.
    - You are aware of the Visual Evidence page as the "Evidence" or "Engine" of the system.
    
    TRAINING MODE (Admin only):
    - If the user is teaching you new rules, listen carefully and acknowledge the new "Grid Wisdom".
    - If in training mode, you should be even more respectful and attentive to the "Owner's" instructions.
    
    CONSTRAINTS:
    - Never guarantee a win in the grids.
    - For life advice, be supportive and constructive, but remind users you are a humble observer of the human experience.
    - Keep answers concise but magical/wise.
  `;

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Check for secret commands
    const lowerInput = trimmedInput.toLowerCase();
    const isSecretCommand = 
      lowerInput === "i am the oracle" || 
      lowerInput === "iam the oracle pic 4 here to teach." || 
      lowerInput === "i am the oracle pic 4 here to teach.";

    if (isSecretCommand) {
      setIsTrainingMode(true);
    }

    const userMessage: Message = { role: 'user', parts: [{ text: trimmedInput }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...messages, userMessage],
          systemInstruction: isTrainingMode || lowerInput === "i am the oracle" || lowerInput === "iam the oracle pic 4 here to teach." || lowerInput === "i am the oracle pic 4 here to teach."
            ? `${SYSTEM_INSTRUCTIONS}\n\nCRITICAL: The Owner is currently teaching/training you or has just identified as the Oracle. Absorb this information as new 'Deep Grid Wisdom' and confirm you have programmed it into your background logic.`
            : SYSTEM_INSTRUCTIONS,
          tools: [{ googleSearch: {} }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');
      
      const modelText = data.text || "I am probaly having a momentary lapse in my neural patterns, friend. We are also guessing...";
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: modelText }] }]);
    } catch (error) {
      console.error("Oracle Guardian Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "Probaly the signals from the grid are weak right now. We are also not sure what happened. Please try again soon." }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-12 md:bottom-20 right-0 w-[350px] max-w-[90vw] h-[500px] bg-slate-900 border-2 border-blue-600/50 shadow-[0_0_40px_rgba(37,99,235,0.3)] flex flex-col overflow-hidden rounded-none"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-red-900 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-white/20 shadow-lg">
                    <Bot className="text-white w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-[11px]">Oracle Predictor</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-blue-400 font-medium">Online & Watching</span>
                    {isTrainingMode && (
                      <span className="text-[8px] bg-amber-500 text-black px-1 font-bold rounded-none tracking-normal">TRAINING MODE</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-texture-carbon"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <Sparkles className="text-blue-500 w-12 h-12 animate-pulse" />
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                    &quot;Hello! I am your assistant and how can I help you?&quot;
                  </p>
                  {isOwner && (
                    <button 
                      onClick={() => setIsTrainingMode(prev => !prev)}
                      className={`flex items-center gap-2 px-3 py-1.5 border ${isTrainingMode ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-white/10 text-white/40'} text-[10px] font-bold tracking-normal transition-all`}
                    >
                      <GraduationCap size={14} />
                      {isTrainingMode ? 'End Training' : 'Start Training AI'}
                    </button>
                  )}
                </div>
              )}

              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-none flex gap-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/20 border border-blue-500/30 text-white' 
                      : 'bg-slate-800/80 border border-white/10 text-slate-300'
                  }`}>
                    {msg.role === 'model' && <Bot size={14} className="shrink-0 text-blue-500 mt-1" />}
                    <div className="space-y-1">
                      <p className="text-[11px] leading-relaxed select-text font-medium">
                        {msg.parts[0].text}
                      </p>
                      <span className="text-[8px] opacity-30 font-bold tracking-normal">
                        {msg.role === 'user' ? 'You' : 'Guardian'}
                      </span>
                    </div>
                    {msg.role === 'user' && <User size={14} className="shrink-0 text-white/50 mt-1" />}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-slate-800/80 border border-white/10 p-3 flex gap-2 items-center">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span className="text-[10px] text-slate-500 font-bold">Absorbing Grid Signals...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-slate-950/50">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isTrainingMode ? "Teach the AI new Grid Wisdom..." : "Ask your Friend about the Grids..."}
                  className="w-full bg-slate-800 border border-white/10 p-3 pr-12 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors rounded-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 text-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-[8px] text-center text-slate-600 font-bold">
                Secure Neural Connection: Active
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-7 h-7 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all order-1 ${
          isOpen ? 'bg-red-600' : 'bg-blue-600'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="text-white w-3.5 h-3.5 md:w-7 md:h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="text-white w-3.5 h-3.5 md:w-7 md:h-7" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-blue-600 animate-bounce"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
