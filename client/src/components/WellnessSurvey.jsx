import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STRESS_RESPONSES = [
  "Eat more",
  "Eat less/skip meals",
  "Sleep more",
  "Can't sleep",
  "Scroll phone/social media",
  "Exercise",
  "Talk to friends",
  "Isolate myself"
];

const CRAVING_TYPES = [
  "Sweet/chocolatey",
  "Spicy",
  "Salty/fried",
  "Junk food",
  "Comfort food/home food"
];

const STRESS_LEVELS = [
  { val: 1, label: "Low", emoji: "😊" },
  { val: 2, label: "Mild", emoji: "🙂" },
  { val: 3, label: "Moderate", emoji: "😐" },
  { val: 4, label: "High", emoji: "😟" },
  { val: 5, label: "Extreme", emoji: "😫" }
];

export default function WellnessSurvey({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    semester: null,
    examDate: null,
    sleepHours: 6,
    stressEatingPattern: ["Eat less/skip meals"],
    cravingType: [],
    stressLevel: 3,
    studyHours: 6,
    hasJob: false
  });

  const [noExams, setNoExams] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("wellnessProfilePending") || localStorage.getItem("wellnessProfile");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setData(prev => ({ ...prev, ...parsed }));
        if (parsed.examDate === null) {
          setNoExams(true);
        }
      } catch (err) {
        console.error("Failed to parse cached wellness profile:", err);
      }
    }
  }, []);

  const updateField = (field, val) => {
    setData(prev => {
      const updated = { ...prev, [field]: val };
      // Cache locally as draft
      localStorage.setItem("wellnessProfilePending", JSON.stringify(updated));
      return updated;
    });
  };

  const handleMultiSelect = (field, item) => {
    const current = data[field] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateField(field, updated);
  };

  // Sync logic helper
  const syncProfile = async (profileData) => {
    try {
      await api.updateWellnessProfile(profileData);
      localStorage.removeItem("wellnessProfilePending");
      localStorage.setItem("wellnessProfile", JSON.stringify({ ...profileData, surveyCompleted: true }));
      return true;
    } catch (err) {
      console.warn("Failed to sync wellness profile to backend (likely offline):", err.message);
      return false;
    }
  };

  // Setup offline syncing event listener
  useEffect(() => {
    const handleReconnect = async () => {
      const pending = localStorage.getItem("wellnessProfilePending");
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          const success = await syncProfile(parsed);
          if (success) {
            toast.success("Offline survey progress synced successfully!");
            if (onComplete) onComplete();
          }
        } catch (err) {
          console.error("Reconnection sync error:", err);
        }
      }
    };
    window.addEventListener("online", handleReconnect);
    return () => window.removeEventListener("online", handleReconnect);
  }, [onComplete]);

  const handleNext = () => {
    // Skip Step 5 (Cravings) if "Eat more" is not selected in Step 4
    if (step === 4 && !data.stressEatingPattern.includes("Eat more")) {
      setStep(6);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 6 && !data.stressEatingPattern.includes("Eat more")) {
      setStep(4);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const finalData = {
      ...data,
      examDate: noExams ? null : data.examDate
    };

    const synced = await syncProfile(finalData);
    if (synced) {
      toast.success("Survey completed!");
    } else {
      toast.warning("Saved locally. We'll sync as soon as you're online!");
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="w-full max-w-lg neo-card p-8 mx-auto text-left relative overflow-hidden">
      {/* ProgressBar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-surface">
        <div 
          className="h-full bg-signal transition-all duration-300"
          style={{ width: `${(step / 8) * 100}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-semibold text-signal uppercase tracking-wider">
          Wellness Survey (Step {step}/8)
        </span>
        <button 
          onClick={handleSkip} 
          className="text-xs text-mist hover:text-white transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* STEP 1: Semester */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">What year/semester are you currently in?</h2>
          <div className="relative">
            <select
              value={data.semester || ""}
              onChange={(e) => updateField("semester", e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-[#001533] border border-[#11263b] text-white rounded-lg p-3 outline-none focus:border-signal"
            >
              <option value="">Select your semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s} ({Math.ceil(s/2)} Year)</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: Exam Date */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">When is your next exam?</h2>
          <div className="space-y-3">
            <input
              type="date"
              disabled={noExams}
              value={data.examDate ? data.examDate.substring(0, 10) : ""}
              onChange={(e) => updateField("examDate", e.target.value || null)}
              className="w-full bg-[#001533] border border-[#11263b] text-white rounded-lg p-3 outline-none focus:border-signal disabled:opacity-30"
            />
            <label className="flex items-center gap-2.5 text-fog cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={noExams}
                onChange={(e) => {
                  setNoExams(e.target.checked);
                  if (e.target.checked) {
                    updateField("examDate", null);
                  }
                }}
                className="rounded border-[#11263b] text-signal focus:ring-0 bg-[#001533] w-4 h-4"
              />
              <span className="text-sm font-thin">No exams scheduled currently</span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 3: Sleep Hours */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">On average, how many hours do you sleep per night?</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-mist mb-1">
              <span>Selected: <strong className="text-paper">{data.sleepHours} hrs</strong></span>
              <span>Baseline: 6 hrs</span>
            </div>
            <input
              type="range"
              min="3"
              max="9"
              value={data.sleepHours}
              onChange={(e) => updateField("sleepHours", Number(e.target.value))}
              className="w-full accent-signal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-mist px-1">
              <span>&lt;4 hrs</span>
              <span>5 hrs</span>
              <span>6 hrs</span>
              <span>7 hrs</span>
              <span>8 hrs</span>
              <span>9+ hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Stress Response */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">When you're stressed, what do you usually do?</h2>
          <p className="text-xs text-mist font-thin -mt-2">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
            {STRESS_RESPONSES.map((res) => {
              const active = data.stressEatingPattern.includes(res);
              return (
                <button
                  key={res}
                  onClick={() => handleMultiSelect("stressEatingPattern", res)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    active 
                      ? "bg-signal/15 border-signal text-paper" 
                      : "bg-[#001533]/40 border-[#11263b] text-fog hover:border-steel hover:bg-[#001533]/70"
                  }`}
                >
                  {res}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Cravings (Conditional) */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">If you eat when stressed, what do you crave?</h2>
          <p className="text-xs text-mist font-thin -mt-2">Select all that apply</p>
          <div className="grid grid-cols-1 gap-2">
            {CRAVING_TYPES.map((crav) => {
              const active = data.cravingType.includes(crav);
              return (
                <button
                  key={crav}
                  onClick={() => handleMultiSelect("cravingType", crav)}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    active 
                      ? "bg-signal/15 border-signal text-paper" 
                      : "bg-[#001533]/40 border-[#11263b] text-fog hover:border-steel hover:bg-[#001533]/70"
                  }`}
                >
                  {crav}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: Stress Level */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-xl text-paper font-semibold">How would you rate your current stress level?</h2>
          <div className="flex justify-between gap-3 pt-3">
            {STRESS_LEVELS.map((s) => {
              const active = data.stressLevel === s.val;
              return (
                <button
                  key={s.val}
                  onClick={() => updateField("stressLevel", s.val)}
                  className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${
                    active 
                      ? "bg-[#1c6cff]/15 border-signal text-paper transform -translate-y-1 shadow-neo-glow" 
                      : "bg-[#001533]/40 border-[#11263b] text-fog hover:border-steel"
                  }`}
                >
                  <span className="text-3xl mb-1">{s.emoji}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: Study Hours */}
      {step === 7 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">How many hours do you spend on academics/coding per day?</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-mist mb-1">
              <span>Daily commitment: <strong className="text-paper">{data.studyHours} hrs</strong></span>
              <span>Average: 6 hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={data.studyHours}
              onChange={(e) => updateField("studyHours", Number(e.target.value))}
              className="w-full accent-signal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-mist px-1">
              <span>0 hrs</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
              <span>12 hrs</span>
              <span>16+ hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: Part-time Job */}
      {step === 8 && (
        <div className="space-y-4">
          <h2 className="font-display font-medium text-xl text-paper">Do you currently have a part-time job/internship alongside studies?</h2>
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => updateField("hasJob", true)}
              className={`flex-1 p-4 rounded-xl border font-semibold text-sm transition-all ${
                data.hasJob === true
                  ? "bg-signal/15 border-signal text-[#1c6cff] shadow-neo-glow"
                  : "bg-[#001533]/40 border-[#11263b] text-fog hover:border-steel"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => updateField("hasJob", false)}
              className={`flex-1 p-4 rounded-xl border font-semibold text-sm transition-all ${
                data.hasJob === false
                  ? "bg-signal/15 border-signal text-[#1c6cff] shadow-neo-glow"
                  : "bg-[#001533]/40 border-[#11263b] text-fog hover:border-steel"
              }`}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t border-[#11263b]/30">
        {step > 1 ? (
          <Button variant="outline" size="sm" onClick={handleBack}>
            ← Back
          </Button>
        ) : (
          <div />
        )}

        {step < 8 ? (
          <Button size="sm" onClick={handleNext}>
            Next →
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit}>
            Complete Survey ✓
          </Button>
        )}
      </div>
    </div>
  );
}
