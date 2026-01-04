import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Trash2, Target, Play } from 'lucide-react';

const TimelineView = ({ tasks, onToggleTask, onDeleteTask, onStartFocus, category, theme }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Constants for timeline time range
  const START_TIME_HOURS = 6; // 6:00 AM
  const END_TIME_HOURS = 24; // Midnight
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    // Position from 6:00 AM to 11:59 PM
    const startMinutes = START_TIME_HOURS * 60;
    const endMinutes = END_TIME_HOURS * 60;
    const rangeMinutes = endMinutes - startMinutes;
    
    if (totalMinutes < startMinutes) return 0;
    if (totalMinutes >= endMinutes) return 100;
    
    return ((totalMinutes - startMinutes) / rangeMinutes) * 100;
  };

  const getTaskTimePosition = (taskTime) => {
    const [hours, minutes] = taskTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = START_TIME_HOURS * 60;
    const endMinutes = END_TIME_HOURS * 60;
    const rangeMinutes = endMinutes - startMinutes;
    
    if (totalMinutes < startMinutes) return 0;
    if (totalMinutes >= endMinutes) return 100;
    
    return ((totalMinutes - startMinutes) / rangeMinutes) * 100;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  const isDark = theme === 'dark';
  const currentPosition = getCurrentTimePosition();

  return (
    <div className="relative">
      {/* Timeline Container */}
      <div className="relative pl-12 py-8">
        {/* Vertical Line */}
        <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${isDark ? 'bg-purple-900/30' : 'bg-purple-300'}`}></div>
        
        {/* Current Time Indicator - Red Line */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            top: `${currentPosition}%` 
          }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 z-20 flex items-center"
          style={{ top: `${currentPosition}%` }}
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-4 h-4 rounded-full bg-red-500 border-4 border-red-500/20 shadow-lg shadow-red-500/50"
          ></motion.div>
          <div className="h-0.5 w-screen bg-gradient-to-r from-red-500 to-transparent animate-pulse"></div>
          <span className="absolute left-6 -top-2 text-xs font-bold text-red-500 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Maintenant
          </span>
        </motion.div>

        {/* Tasks */}
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task, index) => {
            const taskPosition = getTaskTimePosition(task.time);
            const isActive = Math.abs(taskPosition - currentPosition) < 5;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative mb-8"
                style={{ 
                  position: 'relative',
                  marginTop: index === 0 ? `${taskPosition}%` : '0'
                }}
              >
                {/* Time Dot */}
                <div className={`absolute -left-[2.15rem] top-3 w-3 h-3 rounded-full border-2 ${
                  task.done 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent' 
                    : isActive 
                    ? 'border-yellow-500 bg-yellow-500/20 animate-pulse' 
                    : `${isDark ? 'border-purple-500 bg-slate-900' : 'border-purple-400 bg-white'}`
                }`}></div>

                {/* Task Card */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`group relative rounded-2xl border p-5 transition-all ${
                    task.done 
                      ? `${isDark ? 'bg-slate-900/30' : 'bg-white/30'} border-purple-500/20 opacity-60`
                      : isActive
                      ? `${isDark ? 'bg-slate-800/70' : 'bg-white/90'} border-yellow-500/50 shadow-xl shadow-yellow-500/20 backdrop-blur-xl`
                      : `${isDark ? 'bg-slate-900/50' : 'bg-white/70'} border-purple-500/20 backdrop-blur-sm`
                  } hover:border-purple-500/50`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.done
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent'
                          : 'border-purple-500 hover:border-pink-500 hover:bg-purple-500/10'
                      }`}
                    >
                      {task.done && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle2 size={14} className="text-white" />
                        </motion.div>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${task.done ? 'line-through opacity-50' : ''}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`flex items-center gap-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                              <Clock size={12} />
                              {task.time}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isDark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {task.category}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!task.done && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onStartFocus(task)}
                              className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition"
                              title="Mode Focus"
                            >
                              <Play size={16} />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Active indicator */}
                      {isActive && !task.done && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-2 text-yellow-500 text-xs font-bold"
                        >
                          <Target size={12} className="animate-pulse" />
                          <span>C'est maintenant !</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <p className="text-lg mb-2">Timeline vide</p>
            <p className="text-sm">Ajoute une tâche pour commencer ta journée</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
