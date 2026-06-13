import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Wind } from "lucide-react";

export default function BreathingSpacer({ isOpen, onClose }) {
  const [phase, setPhase] = useState("inhale"); // "inhale" (4s), "hold" (7s), "exhale" (8s)
  const [timeLeft, setTimeLeft] = useState(4);
  const [round, setRound] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // transition to next phase
            if (phase === "inhale") {
              setPhase("hold");
              return 7;
            } else if (phase === "hold") {
              setPhase("exhale");
              return 8;
            } else {
              setPhase("inhale");
              setRound((r) => r + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, phase, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPhase("inhale");
      setTimeLeft(4);
      setRound(1);
      setIsActive(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Render variables based on current breathing phase
  let bgGradient = "";
  let instructions = "";
  let subInstructions = "";
  let circleColor = "";
  let scaleTarget = 1;

  if (phase === "inhale") {
    bgGradient = "from-cyan-500/20 via-transparent to-violet-500/10";
    instructions = "Breathe In";
    subInstructions = "Inhale slowly through your nose...";
    circleColor = "from-cyan-400 to-indigo-500 shadow-[0_0_60px_rgba(34,211,238,0.6)]";
    scaleTarget = 1.6;
  } else if (phase === "hold") {
    bgGradient = "from-amber-500/20 via-transparent to-orange-500/10";
    instructions = "Hold";
    subInstructions = "Keep the breath held in your lungs...";
    circleColor = "from-amber-400 to-orange-500 shadow-[0_0_60px_rgba(245,158,11,0.6)]";
    scaleTarget = 1.6;
  } else {
    bgGradient = "from-teal-500/20 via-transparent to-emerald-500/10";
    instructions = "Exhale";
    subInstructions = "Exhale slowly through your mouth, making a whoosh sound...";
    circleColor = "from-teal-400 to-emerald-500 shadow-[0_0_60px_rgba(20,184,166,0.6)]";
    scaleTarget = 1.0;
  }

  const handleRestart = () => {
    setPhase("inhale");
    setTimeLeft(4);
    setRound(1);
    setIsActive(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg text-white transition-all duration-1000 bg-gradient-to-b ${bgGradient}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-8 max-w-md px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">Interactive Relaxation</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">4-7-8 Breathing Spacer</h2>
          <p className="text-xs text-white/55 font-thin mt-1">
            Reduce academic burnout and lower stress instantly. Follow the breathing guide.
          </p>
        </div>

        {/* Breathing Circle Container */}
        <div className="relative flex items-center justify-center w-80 h-80 my-8">
          {/* Ambient Outer Ring Pulse */}
          <motion.div
            animate={{
              scale: [scaleTarget - 0.05, scaleTarget + 0.05, scaleTarget - 0.05],
            }}
            transition={{
              duration: phase === "hold" ? 2.33 : 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full border border-white/5 bg-white/[0.01]"
          />

          {/* Central Breathing Orb */}
          <motion.div
            animate={{ scale: scaleTarget }}
            transition={{
              duration: phase === "inhale" ? 4 : phase === "hold" ? 7 : 8,
              ease: "easeInOut",
            }}
            className={`w-48 h-48 rounded-full bg-gradient-to-tr ${circleColor} flex flex-col items-center justify-center text-center p-6 relative`}
          >
            {/* Soft inner glow */}
            <div className="absolute inset-2 rounded-full bg-black/10 backdrop-blur-xs flex flex-col items-center justify-center">
              <span className="text-sm font-semibold tracking-wider uppercase opacity-80">{instructions}</span>
              <motion.span
                key={timeLeft}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold font-display mt-1"
              >
                {timeLeft}
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Instructional Text */}
        <div className="text-center h-16 max-w-sm px-6 mb-12">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-white/90"
          >
            {subInstructions}
          </motion.p>
          <p className="text-xs text-white/40 mt-1 font-thin">Round {round}</p>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-6 mb-16">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1c6cff] hover:bg-[#1c6cff]/90 transition-all font-semibold shadow-lg text-sm"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Resume
              </>
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white"
            title="Restart Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Footnote tips */}
        <div className="text-center text-[10px] text-white/30 max-w-xs px-4">
          Tip: Breathe in through your nose for 4 seconds, hold for 7 seconds, then exhale completely through your mouth for 8 seconds. Repeating this 4 times will activate your parasympathetic nervous system.
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
