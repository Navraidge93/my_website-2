import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, CheckCircle2, Clock, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

const FocusMode = ({ task, onClose, onComplete, theme }) => {
  const DEFAULT_FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionTime] = useState(DEFAULT_FOCUS_TIME_SECONDS);
  const isDark = theme === 'dark';

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto-trigger confetti when timer reaches 0
      triggerConfetti();
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleComplete = () => {
    triggerConfetti();
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionTime - timeLeft) / sessionTime) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
      >
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
        
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition backdrop-blur-sm border border-white/10"
        >
          <X size={24} />
        </motion.button>

        {/* Main Focus Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl"
        >
          <div className={`relative rounded-3xl border ${
            isDark ? 'bg-slate-900/80 border-purple-500/30' : 'bg-white/90 border-purple-300'
          } backdrop-blur-xl shadow-2xl overflow-hidden`}>
            
            {/* Progress Ring Background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-purple-500"
                  style={{
                    strokeDasharray: `${progress * 2.827} 282.7`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dasharray 1s linear'
                  }}
                />
              </svg>
            </div>

            <div className="relative p-12 space-y-8">
              {/* Task Info */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold border border-purple-500/20"
                >
                  <Target size={16} />
                  <span>MODE FOCUS</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {task.title}
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`flex items-center justify-center gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {task.time}
                  </span>
                  <span>•</span>
                  <span className="uppercase font-bold">{task.category}</span>
                </motion.div>
              </div>

              {/* Timer Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-center"
              >
                <div className={`text-7xl md:text-8xl font-bold tracking-tighter ${
                  timeLeft < 60 ? 'text-red-500 animate-pulse' : isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"
                  />
                </div>
                
                <p className={`mt-3 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {Math.floor(progress)}% complété
                </p>
              </motion.div>

              {/* Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4"
              >
                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsRunning(!isRunning)}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl shadow-purple-500/50 flex items-center justify-center hover:shadow-2xl hover:shadow-purple-500/70 transition-all"
                >
                  {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </motion.button>

                {/* Skip */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeLeft(0)}
                  className={`p-4 rounded-full ${
                    isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                  } transition`}
                  title="Passer"
                >
                  <SkipForward size={20} />
                </motion.button>
              </motion.div>

              {/* Complete Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={24} />
                  Marquer comme terminé
                </motion.button>
              </motion.div>

              {/* Motivational Quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className={`text-center text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
              >
                "Le succès est la somme de petits efforts répétés jour après jour."
              </motion.div>
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusMode;
