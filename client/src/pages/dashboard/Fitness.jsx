import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Activity, Footprints, Flame, Dumbbell,
  Droplets, UtensilsCrossed, ChevronDown,
  Loader2, AlertTriangle, Heart, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Helpers ---
const ProgressRing = ({ percent, size = 90, stroke = 7, color = "stroke-signal" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-indigo/30" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
        className={color} strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
};

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`text-[14px] font-medium px-4 py-2.5 rounded-xl border transition-all ${active ? "border-signal/60 bg-signal/15 text-white shadow-[0_0_8px_rgba(28,108,255,0.15)]" : "border-steel/30 bg-indigo/10 text-white/60 hover:text-white/80 hover:border-signal/30"}`}>
    {children}
  </button>
);

// --- Recommendation Logic (no AI) ---
function getRecommendations(assessment, stepGoal) {
  if (!assessment) return [];
  const recs = [];
  const { sittingHours, outsideFood, steps, exerciseLevel } = assessment;

  // Case 6: Good Activity Day (check first so it shows as positive)
  if (steps >= stepGoal) {
    recs.push({
      title: "Great Job! 🎉",
      icon: "🏆",
      color: "border-tag-lime/40 bg-tag-lime/5",
      message: "You reached your daily activity target. Keep it up!",
      exercises: ["Activity Goal Achieved", "Continue Current Routine", "Stay Hydrated"],
    });
  }

  // Case 1: High Sitting Hours
  if (sittingHours >= 6) {
    recs.push({
      title: "Desk Relief Routine",
      icon: "🪑",
      color: "border-[#a855f7]/40 bg-[#a855f7]/5",
      message: "You have been sitting for long hours today. Try these mobility exercises.",
      exercises: ["Neck Stretch – 30 sec", "Shoulder Rolls – 20 reps", "Back Stretch – 30 sec", "Standing Walk – 5 min"],
    });
  }

  // Case 2: Outside Food Once
  if (outsideFood === "once") {
    recs.push({
      title: "Light Recovery Walk",
      icon: "🚶",
      color: "border-signal/40 bg-signal/5",
      message: "Light activity helps digestion and recovery.",
      exercises: ["15 Minute Walk", "Extra Hydration"],
    });
  }

  // Case 3: Outside Food Twice
  if (outsideFood === "twice") {
    recs.push({
      title: "Recovery Workout",
      icon: "💪",
      color: "border-[#ff8833]/40 bg-[#ff8833]/5",
      message: "You consumed outside food multiple times today. A little extra movement is recommended.",
      exercises: ["20 Minute Walk", "Bodyweight Squats × 15", "Jumping Jacks × 30", "Drink Extra Water"],
    });
  }

  // Case 4: Outside Food More Than Twice
  if (outsideFood === "more") {
    recs.push({
      title: "Cardio Recovery Routine",
      icon: "🏃",
      color: "border-tag-coral/40 bg-tag-coral/5",
      message: "Today's food intake was high. Try some light cardio to stay active.",
      exercises: ["30 Minute Walk", "Jumping Jacks × 50", "High Knees × 30 sec", "Stretching"],
    });
  }

  // Case 5: Very Low Steps
  if (steps < 3000 && steps < stepGoal) {
    recs.push({
      title: "Daily Activity Boost",
      icon: "⚡",
      color: "border-[#ff8833]/40 bg-[#ff8833]/5",
      message: "You are below your activity target today.",
      exercises: ["Walk 20 Minutes", "Climb Stairs", "Light Stretching"],
    });
  }

  return recs;
}

export default function Fitness() {
  const [fitness, setFitness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assessment form
  const [assessForm, setAssessForm] = useState({ studyHours: "", sittingHours: "", outsideFood: "no", waterIntake: "", exerciseLevel: "no", steps: "" });
  const [submittingAssess, setSubmittingAssess] = useState(false);

  // Section toggles
  const [showAssess, setShowAssess] = useState(true);

  useEffect(() => { loadFitness(); }, []);

  const loadFitness = async () => {
    try {
      const data = await api.getFitness();
      setFitness(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const todayAssessment = fitness?.dailyAssessments?.find(a => new Date(a.date).toDateString() === new Date().toDateString());

  // Steps
  const stepsToday = todayAssessment?.steps || 0;
  const stepGoal = fitness?.stepGoal || 7000;
  const stepPercent = Math.round((stepsToday / stepGoal) * 100);

  // Posture risk
  const sittingHrs = todayAssessment?.sittingHours || 0;
  const postureRisk = sittingHrs >= 8 ? "High" : sittingHrs >= 5 ? "Medium" : "Low";
  const postureColor = postureRisk === "High" ? "text-tag-coral" : postureRisk === "Medium" ? "text-[#ff8833]" : "text-tag-lime";

  // Outside food
  const outsideFood = todayAssessment?.outsideFood || "no";

  // Recommendations (application logic, no AI)
  const recommendations = getRecommendations(todayAssessment, stepGoal);

  // --- Handlers ---
  const handleAssessment = async () => {
    setSubmittingAssess(true);
    try {
      const data = await api.submitFitnessAssessment(assessForm);
      setFitness(data);
      toast.success("Daily activity logged!");
    } catch (e) { toast.error(e.message); }
    finally { setSubmittingAssess(false); }
  };

  if (loading) return <div className="p-10"><div className="h-40 skeleton-pulse rounded-2xl" /><div className="h-60 skeleton-pulse rounded-2xl mt-4" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <p className="eyebrow text-xs mb-3">Fitness</p>
      <h2 className="font-display font-bold text-[36px] text-white mb-1">Student Fitness</h2>
      <p className="text-[16px] text-white/60 font-thin mb-8">Track movement, exercise, posture, and build healthy habits.</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <OverviewCard icon={Activity} label="Activity Score" value={`${todayAssessment?.activityScore || 0}/100`} color="text-signal" />
        <OverviewCard icon={Footprints} label="Steps Today" value={stepsToday.toLocaleString()} sub={`Goal: ${stepGoal.toLocaleString()}`} color="text-tag-lime" />
        <OverviewCard icon={Flame} label="Current Streak" value={`${fitness?.currentStreak || 0} days`} sub={`Best: ${fitness?.longestStreak || 0}`} color="text-[#ff8833]" />
        <OverviewCard icon={Dumbbell} label="Total Workouts" value={fitness?.totalWorkoutDays || 0} color="text-cyan-400" />
      </div>

      {/* Step Challenge + Posture + Recovery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Step Challenge */}
        <div className="rounded-2xl border border-steel/20 bg-gradient-to-br from-indigo/15 to-deep p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <ProgressRing percent={stepPercent} />
            <span className="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-white">{stepPercent}%</span>
          </div>
          <div>
            <p className="text-white font-bold text-[18px]">Step Challenge</p>
            <p className="text-white/60 text-[15px] font-thin mt-1">{stepsToday.toLocaleString()} / {stepGoal.toLocaleString()}</p>
            <p className="text-white/40 text-[13px] mt-1">{Math.max(0, stepGoal - stepsToday).toLocaleString()} steps remaining</p>
          </div>
        </div>

        {/* Posture Risk */}
        <div className="rounded-2xl border border-steel/20 bg-gradient-to-br from-indigo/15 to-deep p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <AlertTriangle className={`w-5 h-5 ${postureColor}`} />
            <p className="text-white font-bold text-[18px]">Posture Health</p>
          </div>
          <p className={`text-[28px] font-bold ${postureColor}`}>{postureRisk} Risk</p>
          <p className="text-white/50 text-[14px] font-thin mt-2">{sittingHrs} hours sitting today</p>
          {postureRisk !== "Low" && (
            <div className="mt-4 space-y-2">
              <p className="text-white/70 text-[14px]">🧘 Neck & shoulder stretches</p>
              <p className="text-white/70 text-[14px]">🪑 Stand up every 45 minutes</p>
              <p className="text-white/70 text-[14px]">🔄 Back mobility exercises</p>
            </div>
          )}
        </div>

        {/* Outside Food Recovery */}
        <div className="rounded-2xl border border-steel/20 bg-gradient-to-br from-indigo/15 to-deep p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <UtensilsCrossed className="w-5 h-5 text-[#ff8833]" />
            <p className="text-white font-bold text-[18px]">Food Recovery</p>
          </div>
          <p className="text-[20px] font-bold text-white capitalize mb-3">
            Outside Food: {outsideFood === "no" ? "None" : outsideFood === "more" ? "Frequent" : outsideFood}
          </p>
          {outsideFood === "no" ? (
            <div className="rounded-xl bg-tag-lime/8 border border-tag-lime/20 p-4">
              <p className="text-tag-lime text-[15px] font-medium">✅ Great! No recovery needed</p>
              <p className="text-white/50 text-[13px] font-thin mt-1">Keep maintaining healthy eating habits</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-signal/5 border border-signal/20 p-3">
                <p className="text-white text-[15px]">💧 Drink 1-2L Extra Water Today</p>
              </div>
              <div className="rounded-xl bg-signal/5 border border-signal/20 p-3">
                <p className="text-white text-[15px]">🚶 Take a 15 Minute Walk</p>
              </div>
              {(outsideFood === "twice" || outsideFood === "more") && (
                <div className="rounded-xl bg-signal/5 border border-signal/20 p-3">
                  <p className="text-white text-[15px]">⚡ Reduce Heavy Snacks For The Rest Of The Day</p>
                </div>
              )}
              {outsideFood === "more" && (
                <div className="rounded-xl bg-[#ff8833]/8 border border-[#ff8833]/20 p-3">
                  <p className="text-white text-[15px]">🏃 30 Min Light Cardio Recommended</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daily Assessment */}
      <Section title="Daily Activity Assessment" icon={Activity} expanded={showAssess} toggle={() => setShowAssess(!showAssess)}>
        {todayAssessment ? (
          <div className="rounded-xl border border-tag-lime/30 bg-tag-lime/5 p-6">
            <p className="text-tag-lime font-bold text-[18px] mb-3">✓ Today's Assessment Complete</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Activity Score" value={`${todayAssessment.activityScore}/100`} />
              <Stat label="Steps" value={todayAssessment.steps.toLocaleString()} />
              <Stat label="Exercise" value={todayAssessment.exerciseLevel} />
              <Stat label="Study Hours" value={`${todayAssessment.studyHours} hrs`} />
              <Stat label="Sitting Hours" value={`${todayAssessment.sittingHours} hrs`} />
              <Stat label="Water" value={`${todayAssessment.waterIntake} glasses`} />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Study/Work Hours" value={assessForm.studyHours} onChange={(v) => setAssessForm(p => ({...p, studyHours: v}))} type="number" placeholder="e.g. 6" />
              <Field label="Sitting Hours (continuous)" value={assessForm.sittingHours} onChange={(v) => setAssessForm(p => ({...p, sittingHours: v}))} type="number" placeholder="e.g. 4" />
              <Field label="Water Intake (glasses)" value={assessForm.waterIntake} onChange={(v) => setAssessForm(p => ({...p, waterIntake: v}))} type="number" placeholder="e.g. 8" />
              <Field label="Steps Walked" value={assessForm.steps} onChange={(v) => setAssessForm(p => ({...p, steps: v}))} type="number" placeholder="e.g. 5000" />
            </div>
            <div>
              <p className="text-[14px] text-white/60 font-medium mb-3">Outside Food Consumed</p>
              <div className="flex flex-wrap gap-2">
                {[["no", "No"], ["once", "Once"], ["twice", "Twice"], ["more", "More Than Twice"]].map(([v, l]) => <Chip key={v} active={assessForm.outsideFood === v} onClick={() => setAssessForm(p => ({...p, outsideFood: v}))}>{l}</Chip>)}
              </div>
            </div>
            <div>
              <p className="text-[14px] text-white/60 font-medium mb-3">Exercise Today</p>
              <div className="flex flex-wrap gap-2">
                {[["no", "No"], ["light", "Light"], ["moderate", "Moderate"], ["intense", "Intense"]].map(([v, l]) => <Chip key={v} active={assessForm.exerciseLevel === v} onClick={() => setAssessForm(p => ({...p, exerciseLevel: v}))}>{l}</Chip>)}
              </div>
            </div>
            <Button onClick={handleAssessment} disabled={submittingAssess} className="gap-2 text-[15px] px-6 py-3 h-auto">
              {submittingAssess ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              Submit Assessment
            </Button>
          </div>
        )}
      </Section>

      {/* Recommended Workouts (application logic, no AI) */}
      {todayAssessment && recommendations.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-signal" />
            <h4 className="font-display font-bold text-[20px] text-white">Recommended Workouts</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-2xl border p-6 ${rec.color}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[28px]">{rec.icon}</span>
                  <h5 className="text-white font-bold text-[20px]">{rec.title}</h5>
                </div>
                <div className="space-y-2.5 mb-4">
                  {rec.exercises.map((ex, i) => (
                    <div key={i} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                      <p className="text-white text-[16px] font-thin">{ex}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-[14px] font-thin italic">{rec.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Achievements */}
      {(fitness?.currentStreak || 0) >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-2xl border border-[#ff8833]/30 bg-[#ff8833]/5 p-6">
          <p className="text-[#ff8833] font-bold text-[18px] mb-3">🏆 Streak Achievements</p>
          <div className="flex flex-wrap gap-3">
            {fitness.currentStreak >= 3 && <Badge label="🔥 3 Day Streak" color="border-[#ff8833]/40 bg-[#ff8833]/10" />}
            {fitness.currentStreak >= 7 && <Badge label="⭐ 7 Day Streak" color="border-signal/40 bg-signal/10" />}
            {fitness.currentStreak >= 15 && <Badge label="💎 15 Day Streak" color="border-[#a855f7]/40 bg-[#a855f7]/10" />}
            {fitness.currentStreak >= 30 && <Badge label="👑 30 Day Streak" color="border-tag-lime/40 bg-tag-lime/10" />}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// --- Sub-components ---
function Section({ title, icon: Icon, expanded, toggle, children }) {
  return (
    <div className="rounded-2xl border border-steel/20 bg-deep/80 backdrop-blur-sm mb-5 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-6 text-left">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-signal" />
          <h4 className="font-display font-bold text-[20px] text-white">{title}</h4>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <p className="text-[14px] text-white/60 font-medium mb-2">{label}</p>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[12px] text-white/40 font-thin uppercase tracking-wide">{label}</p>
      <p className="text-[16px] text-white font-semibold capitalize mt-0.5">{value}</p>
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, sub, color = "text-signal" }) {
  return (
    <div className="rounded-xl border border-steel/20 bg-gradient-to-br from-indigo/15 to-deep p-5">
      <Icon className={`w-5 h-5 mb-2 ${color}`} />
      <p className="text-[24px] font-bold text-white">{value}</p>
      <p className="text-[13px] text-white/50 font-thin">{label}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

function Badge({ label, color }) {
  return <span className={`text-[14px] px-4 py-2 rounded-xl border text-white/80 font-medium ${color}`}>{label}</span>;
}
