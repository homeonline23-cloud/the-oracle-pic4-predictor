'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[100] p-1 md:p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-none shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-colors focus:outline-none flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-3.5 h-3.5 md:w-6 md:h-6" strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
