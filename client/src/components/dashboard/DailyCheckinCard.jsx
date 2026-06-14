import React, { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarHeart } from "lucide-react";

const EATING_PATTERNS = [
  { val: "Healthy", label: "Healthy/Home-cooked" },
  { val: "Ate out", label: "Ate out/Fast food" },
  { val: "Skipped meals", label: "Skipped meals" },
  { val: "Binged", label: "Binged/Over-ate" }
];

const STRESS_LEVELS = [
  { val: 1, emoji: "😊" },
  { val: 2, emoji: "🙂" },
  { val: 3, emoji: "😐" },
  { val: 4, emoji: "😟" },
  { val: 5, emoji: "😫" }
];

export default function DailyCheckinCard({ onSubmitSuccess, className }) {
  const [sleepHours, setSleepHours] = useState(7);
  const [eatingPattern, setEatingPattern] = useState("Healthy");
  const [stressLevel, setStressLevel] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const checkinData = {
      sleepHours,
      eatingPattern,
      stressLevel
    };

    try {
      // Save local backup in case of offline sync requirement
      localStorage.setItem("lastDailyCheckin", JSON.stringify(checkinData));
      
      await api.submitDailyCheckin(checkinData);
      toast.success("Daily check-in saved! AI stress metrics updated.");
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.warn("Offline: saving check-in locally", err);
      // Fallback offline caching
      localStorage.setItem("pendingDailyCheckin", JSON.stringify(checkinData));
      toast.warning("Check-in saved locally (offline). We will sync on reconnect.");
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`neo-card-glow border-signal/20 p-6 flex flex-col justify-between text-left ${className || ""}`}>
      <div className="space-y-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarHeart className="w-5 h-5 text-[#1c6cff]" />
            <h3 className="font-display font-semibold text-sm text-paper">Daily Wellness Check-in</h3>
          </div>
          <p className="text-xs text-mist font-thin">How are you doing today? Keep your AI advisor updated.</p>
        </div>

        {/* Sleep slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-fog font-thin">
            <span>Hours slept last night:</span>
            <span className="font-semibold text-[#1c6cff]">{sleepHours} hrs</span>
          </div>
          <input
            type="range"
            min="3"
            max="9"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full accent-signal cursor-pointer"
          />
        </div>

        {/* Eating pattern */}
        <div className="space-y-2">
          <label className="text-[10px] text-fog font-thin block">How did you eat today?</label>
          <select
            value={eatingPattern}
            onChange={(e) => setEatingPattern(e.target.value)}
            className="w-full bg-[#001533] border border-[#11263b] text-fog text-xs rounded-lg p-2.5 outline-none focus:border-signal"
          >
            {EATING_PATTERNS.map((p) => (
              <option key={p.val} value={p.val}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stress level */}
        <div className="space-y-2">
          <label className="text-[10px] text-fog font-thin block">Today's stress level:</label>
          <div className="flex justify-between gap-2">
            {STRESS_LEVELS.map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setStressLevel(s.val)}
                className={`flex-1 p-2 rounded-lg border text-xl transition-all ${
                  stressLevel === s.val
                    ? "bg-[#1c6cff]/10 border-[#1c6cff] scale-105"
                    : "bg-[#001533]/40 border-[#11263b] opacity-60 hover:opacity-100"
                }`}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="sm"
          className="w-full mt-2"
        >
          {submitting ? "Saving..." : "Submit Check-in"}
        </Button>
      </div>
    </div>
  );
}
