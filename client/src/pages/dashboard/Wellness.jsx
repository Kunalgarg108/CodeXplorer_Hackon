import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import WellnessSurvey from "@/components/WellnessSurvey";
import DailyCheckinCard from "@/components/dashboard/DailyCheckinCard";
import { 
  Heart, Activity, Calendar, Moon, BookOpen, Smile, Utensils,
  HeartPulse, RefreshCw, Wind, Apple, Shield, Sparkle, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import BreathingSpacer from "@/components/dashboard/BreathingSpacer";

const chartStyle = {
  background: "#010d1e",
  border: "1px solid rgba(17,38,59,0.5)",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 300,
};

export default function Wellness() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Today's Report state
  const [todayReport, setTodayReport] = useState(null);
  const [loadingTodayReport, setLoadingTodayReport] = useState(false);

  // Weekly Report state
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loadingWeeklyReport, setLoadingWeeklyReport] = useState(false);

  // Breathing Modal state
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  const getTodayReportFallback = (checkins) => {
    const todayStr = new Date().toDateString();
    const todayCheckin = checkins.find(c => new Date(c.date).toDateString() === todayStr);

    if (!todayCheckin) {
      return {
        riskLevel: "Low",
        reason: "No check-in submitted for today. Check in from your Dashboard page to view today's stress report.",
        tip: "Keep checking in daily to monitor your stress trends.",
        source: "Quick Analysis"
      };
    }

    const { sleepHours = 7, stressLevel = 3, eatingPattern = "Healthy" } = todayCheckin;

    let riskLevel = "Low";
    if (sleepHours < 5 && stressLevel >= 4) {
      riskLevel = "High";
    } else if (sleepHours < 6 || stressLevel >= 4) {
      riskLevel = "Moderate";
    }

    const reason = `Your sleep was ${sleepHours} hrs and stress level was ${stressLevel}/5 today. Eating pattern logged: ${eatingPattern}.`;

    let tip = "Keep up the healthy daily check-in habits and maintain a stable study-rest balance.";
    if (sleepHours < 6) {
      tip = "Prioritize sleep hygiene by aiming for a consistent sleep schedule and creating a relaxing bedtime routine.";
    } else if (eatingPattern === "Skipped meals" || eatingPattern === "Binged") {
      tip = "Ensure you have balanced nutritional intake at regular intervals and avoid skipping meals under pressure.";
    } else if (stressLevel >= 4) {
      tip = "Try taking a brief break and practicing a 4-7-8 breathing exercise to soothe your nervous system.";
    }

    return { riskLevel, reason, tip, source: "Quick Analysis" };
  };

  const getWeeklyReportFallback = (checkins) => {
    const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
    const thisWeek = sorted.filter(c => {
      const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const lastWeek = sorted.filter(c => {
      const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    });

    if (thisWeek.length === 0) {
      return {
        summary: "No check-ins logged in the last 7 days to calculate weekly statistics.",
        trendDirection: "flat",
        trendPercentage: 0,
        source: "Quick Analysis"
      };
    }

    let totalSleep = 0;
    let totalStress = 0;
    let skippedMealsCount = 0;
    thisWeek.forEach(c => {
      totalSleep += c.sleepHours || 0;
      totalStress += c.stressLevel || 0;
      if (c.eatingPattern === "Skipped meals") skippedMealsCount++;
    });
    const avgSleep = (totalSleep / thisWeek.length).toFixed(1);
    const avgStress = (totalStress / thisWeek.length).toFixed(1);

    let lastWeekAvgStress = 0;
    if (lastWeek.length > 0) {
      let totalLastStress = 0;
      lastWeek.forEach(c => totalLastStress += c.stressLevel || 0);
      lastWeekAvgStress = totalLastStress / lastWeek.length;
    }

    let trendDirection = "flat";
    let trendPercentage = 0;
    if (lastWeekAvgStress > 0 && Number(avgStress) > 0) {
      const diff = Number(avgStress) - lastWeekAvgStress;
      trendPercentage = Math.round((Math.abs(diff) / lastWeekAvgStress) * 100);
      if (diff > 0.05) trendDirection = "up";
      else if (diff < -0.05) trendDirection = "down";
    }

    const trendText = trendDirection === "flat" 
      ? "steady" 
      : `${trendDirection === "up" ? "higher" : "lower"} than last week`;

    const summary = `This week your average sleep was ${avgSleep} hrs (${trendText}) and stress averaged ${avgStress}/5. You skipped meals on ${skippedMealsCount} day(s).`;

    return {
      summary,
      trendDirection,
      trendPercentage,
      source: "Quick Analysis"
    };
  };

  const fetchTodayReport = async (checkins) => {
    setLoadingTodayReport(true);
    try {
      const data = await api.analyzeBurnout();
      setTodayReport(data);
    } catch (err) {
      console.warn("Failed to fetch Today's AI report, running fallback:", err);
      const fallbackData = getTodayReportFallback(checkins || profile?.dailyCheckins || []);
      setTodayReport(fallbackData);
    } finally {
      setLoadingTodayReport(false);
    }
  };

  const fetchWeeklyReport = async (checkins) => {
    setLoadingWeeklyReport(true);
    try {
      const data = await api.analyzeWeeklyReport();
      setWeeklyReport(data);
    } catch (err) {
      console.warn("Failed to fetch Weekly AI report, running fallback:", err);
      const fallbackData = getWeeklyReportFallback(checkins || profile?.dailyCheckins || []);
      setWeeklyReport(fallbackData);
    } finally {
      setLoadingWeeklyReport(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await api.getWellnessProfile();
      setProfile(data.wellnessProfile);
      // Fetch both reports with the loaded checkins list
      fetchTodayReport(data.wellnessProfile.dailyCheckins || []);
      fetchWeeklyReport(data.wellnessProfile.dailyCheckins || []);
    } catch (err) {
      toast.error("Failed to load wellness profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBreathing = async () => {
    setIsBreathingOpen(false);
    try {
      await api.resolveBurnout();
      await fetchProfile();
    } catch (err) {
      console.error("Failed to resolve burnout phase:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleComplete = () => {
    setEditing(false);
    fetchProfile();
  };

  const getRiskColor = (level) => {
    if (level === "High") return "border-[#ff4433] bg-[#ff4433]/5 text-[#ff4433]";
    if (level === "Moderate") return "border-[#ff8833] bg-[#ff8833]/5 text-[#ff8833]";
    return "border-[#00cc4b] bg-[#00cc4b]/5 text-[#00cc4b]";
  };

  const getRiskBadgeStyle = (level) => {
    if (level === "High") return "bg-[#ff4433]/15 text-[#ff4433] border-[#ff4433]/40 border";
    if (level === "Moderate") return "bg-[#ff8833]/15 text-[#ff8833] border-[#ff8833]/40 border";
    return "bg-[#00cc4b]/15 text-[#00cc4b] border-[#00cc4b]/40 border";
  };

  const getRiskEmoji = (level) => {
    if (level === "High") return "😫";
    if (level === "Moderate") return "😐";
    return "😊";
  };

  const getRecommendations = (level) => {
    if (level === "High") {
      return [
        { title: "Use the Breathing Spacer", desc: "Try our 4-7-8 breathing tool on your Dashboard to quickly relax.", icon: Wind, color: "text-[#ff4433]" },
        { title: "Enforce a Sleep Schedule", desc: "Lock in a minimum of 7-8 hours tonight; close screens 1 hr before bed.", icon: Moon, color: "text-[#1c6cff]" },
        { title: "Control Comfort Spending", desc: "Avoid stress-ordering food delivery. Prepare a simple snack instead.", icon: Apple, color: "text-[#ff8833]" }
      ];
    }
    if (level === "Moderate") {
      return [
        { title: "Review Comfort Outlays", desc: "Impulse shopping might trigger when stressed. Monitor your transactions.", icon: Shield, color: "text-[#ff8833]" },
        { title: "Take Active Micro-Breaks", desc: "Take a 5-minute screen-free walk for every 90 minutes of study or coding.", icon: Wind, color: "text-[#00cc4b]" },
        { title: "Optimize Sleep Windows", desc: "Aim for consistent sleep times even during exam prep to support memory.", icon: Moon, color: "text-[#1c6cff]" }
      ];
    }
    return [
      { title: "Maintain Current Habits", desc: "Your sleep, eating, and stress metrics are in a healthy equilibrium.", icon: Smile, color: "text-[#00cc4b]" },
      { title: "Keep Checking In Daily", desc: "Consistent inputs help the AI advisor detect and prevent silent stress.", icon: HeartPulse, color: "text-[#1c6cff]" },
      { title: "Celebrate Balance", desc: "Sustained stability is a win! Treat yourself within budget limits.", icon: Sparkle, color: "text-[#ff8833]" }
    ];
  };

  const renderWowBadge = () => {
    if (!weeklyReport) return null;
    const { trendDirection = "flat", trendPercentage = 0 } = weeklyReport;

    if (trendDirection === "up") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#ff4433]/10 border-[#ff4433]/30 text-[#ff4433] text-xs font-semibold w-fit">
          <ArrowUpRight className="w-4 h-4" />
          <span>{trendPercentage}% Stress Increase</span>
        </div>
      );
    }
    if (trendDirection === "down") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#00cc4b]/10 border-[#00cc4b]/30 text-[#00cc4b] text-xs font-semibold w-fit">
          <ArrowDownRight className="w-4 h-4" />
          <span>{trendPercentage}% Stress Decrease</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#999ca1]/10 border-[#999ca1]/30 text-[#999ca1] text-xs font-semibold w-fit">
        <Activity className="w-4 h-4" />
        <span>Steady / No WoW Change</span>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 md:p-10 text-fog font-thin text-left">Loading wellness profile...</div>;
  }

  if (editing || !profile || !profile.surveyCompleted) {
    return (
      <div className="p-6 md:p-10 space-y-6 text-left">
        <p className="eyebrow text-xs mb-2">Wellness &amp; Burnout Advisor</p>
        <h2 className="display-section mb-6">
          {profile?.surveyCompleted ? "Update Wellness Profile" : "Wellness Setup"}
        </h2>
        <WellnessSurvey 
          onComplete={handleComplete} 
          onSkip={() => {
            if (profile?.surveyCompleted) {
              setEditing(false);
            } else {
              toast.info("Survey skipped. Using baseline defaults.");
              fetchProfile();
            }
          }} 
        />
      </div>
    );
  }

  const todayStr = new Date().toDateString();
  const todayCheckin = profile.dailyCheckins?.find(c => new Date(c.date).toDateString() === todayStr);

  const chartData = (profile.dailyCheckins || [])
    .slice(-7)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(c => ({
      name: new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
      Sleep: c.sleepHours,
      Stress: c.stressLevel
    }));

  return (
    <div className="p-6 md:p-10 space-y-10 text-left">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#11263b]/40">
        <div>
          <p className="eyebrow text-xs mb-2">Wellness &amp; Burnout Advisor</p>
          <h2 className="display-section">My Wellness Profile</h2>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Button onClick={() => setEditing(true)} size="sm">
            Edit Responses
          </Button>
          <span className="text-[10px] text-mist font-thin">
            Last updated: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Burnout Alert Banner */}
      {todayReport?.burnoutPhase && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => setIsBreathingOpen(true)}
          className="bg-gradient-to-r from-[#ff4433]/20 via-[#ff4433]/15 to-[#ff4433]/5 border border-[#ff4433]/60 hover:border-[#ff4433] p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all shadow-[0_0_20px_rgba(255,68,51,0.15)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#ff4433]/5 animate-pulse pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4433] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ff4433]"></span>
            </span>
            <div>
              <h4 className="text-sm font-bold text-[#ff4433] font-display flex items-center gap-1.5">
                {todayReport?.isRecurrent ? "⚠️ Recurrent Burnout Alarm" : "🚨 Chronic Burnout Warning Active"}
              </h4>
              <p className="text-xs text-fog font-thin mt-1">
                {todayReport?.isRecurrent 
                  ? "This is a repeating burnout phase. Please take a longer break and focus on self-care."
                  : `You've recorded high stress (≥ 4/5) for ${todayReport?.consecutiveStressDays || 3} consecutive check-ins. Let's reset.`
                }
              </p>
            </div>
          </div>
          
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ff4433] text-white hover:bg-[#ff4433]/90 transition-colors shrink-0 relative z-10 shadow-md">
            Relax Now
          </button>
        </motion.div>
      )}

      {/* SECTION 1: Baseline Profile */}
      <div className="space-y-4 opacity-90 p-5 rounded-2xl bg-[#010d1e]/20 border border-[#11263b]/20">
        <p className="text-[10px] font-semibold text-signal uppercase tracking-widest block">
          YOUR BASELINE PROFILE
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Semester */}
          <div className="neo-card flex items-center gap-3 p-4 bg-[#010d1e]/60 border border-[#11263b]/20">
            <BookOpen className="w-7 h-7 p-1 text-paper bg-signal rounded-tag shadow-neo shrink-0" />
            <div>
              <p className="text-[10px] text-mist uppercase tracking-wider leading-none">Current Year</p>
              <p className="font-display font-medium text-sm text-paper mt-1">
                {profile.semester ? `Semester ${profile.semester}` : "Not set"}
              </p>
            </div>
          </div>

          {/* Next Exam */}
          <div className="neo-card flex items-center gap-3 p-4 bg-[#010d1e]/60 border border-[#11263b]/20">
            <Calendar className="w-7 h-7 p-1 text-paper bg-signal rounded-tag shadow-neo shrink-0" />
            <div>
              <p className="text-[10px] text-mist uppercase tracking-wider leading-none">Next Exam</p>
              <p className="font-display font-medium text-sm text-paper mt-1">
                {profile.examDate ? new Date(profile.examDate).toLocaleDateString() : "No exams"}
              </p>
            </div>
          </div>

          {/* Sleep Hours */}
          <div className="neo-card flex items-center gap-3 p-4 bg-[#010d1e]/60 border border-[#11263b]/20">
            <Moon className="w-7 h-7 p-1 text-paper bg-signal rounded-tag shadow-neo shrink-0" />
            <div>
              <p className="text-[10px] text-mist uppercase tracking-wider leading-none">Baseline Sleep</p>
              <p className="font-display font-medium text-sm text-paper mt-1">
                {profile.sleepHours} Hours
              </p>
            </div>
          </div>

          {/* Study Hours */}
          <div className="neo-card flex items-center gap-3 p-4 bg-[#010d1e]/60 border border-[#11263b]/20">
            <Activity className="w-7 h-7 p-1 text-paper bg-signal rounded-tag shadow-neo shrink-0" />
            <div>
              <p className="text-[10px] text-mist uppercase tracking-wider leading-none">Daily Study</p>
              <p className="font-display font-medium text-sm text-paper mt-1">
                {profile.studyHours} Hours
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stress Eating & Cravings */}
          <div className="neo-card p-5 bg-[#010d1e]/60 border border-[#11263b]/20 space-y-4">
            <div className="flex items-center gap-2.5">
              <Utensils className="w-6 h-6 p-1 text-paper bg-signal rounded-tag" />
              <h3 className="font-display font-medium text-sm text-paper">Stress Eating &amp; Cravings</h3>
            </div>
            <div className="space-y-3 pt-1 text-xs font-thin text-fog">
              <div>
                <p className="text-[10px] text-mist uppercase tracking-widest mb-1.5">What you do when stressed:</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.stressEatingPattern?.length > 0 ? (
                    profile.stressEatingPattern.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#001533] border border-[#11263b] text-[10px] text-paper">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-mist">None selected</span>
                  )}
                </div>
              </div>
              {profile.stressEatingPattern?.includes("Eat more") && (
                <div className="pt-1">
                  <p className="text-[10px] text-mist uppercase tracking-widest mb-1.5">What you crave:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.cravingType?.length > 0 ? (
                      profile.cravingType.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[#ff4433]/10 border border-[#ff4433]/20 text-[10px] text-tag-coral font-medium">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-mist">No cravings selected</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Self-rated wellness indicators */}
          <div className="neo-card p-5 bg-[#010d1e]/60 border border-[#11263b]/20 space-y-4">
            <div className="flex items-center gap-2.5">
              <Heart className="w-6 h-6 p-1 text-paper bg-signal rounded-tag" />
              <h3 className="font-display font-medium text-sm text-paper">Self-Rated Wellness</h3>
            </div>
            <div className="space-y-3 pt-1 font-thin text-fog text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#11263b]/20">
                <span className="text-mist">Baseline Stress Rating:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-semibold text-paper text-sm">
                    {profile.stressLevel} / 5
                  </span>
                  <span className="text-base">
                    {profile.stressLevel === 1 && "😊"}
                    {profile.stressLevel === 2 && "🙂"}
                    {profile.stressLevel === 3 && "😐"}
                    {profile.stressLevel === 4 && "😟"}
                    {profile.stressLevel === 5 && "😫"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mist">Part-time Job/Internship:</span>
                <span className="font-semibold text-paper text-xs">
                  {profile.hasJob ? "Yes (Active)" : "No Job Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Today's Report */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-xs font-semibold text-signal uppercase tracking-widest">
            Today's Report
          </p>
          <div className="flex items-center gap-2">
            {todayReport && (
              <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                todayReport.source === "AI Analysis" 
                  ? "bg-signal/15 text-signal border-signal/30" 
                  : "bg-[#999ca1]/15 text-[#999ca1] border-[#999ca1]/30"
              }`}>
                {todayReport.source}
              </span>
            )}
            <button 
              onClick={() => fetchTodayReport(profile.dailyCheckins)}
              disabled={loadingTodayReport}
              className="p-1 rounded bg-[#001533] border border-[#11263b] hover:text-white text-mist transition-colors disabled:opacity-50"
              title="Recalculate Today's Report"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTodayReport ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loadingTodayReport ? (
          <div className="h-[250px] w-full skeleton-pulse rounded-2xl" />
        ) : !todayCheckin ? (
          <div className="max-w-md mx-auto w-full">
            <DailyCheckinCard onSubmitSuccess={fetchProfile} />
          </div>
        ) : (
          <div className={`neo-card border-l-4 ${getRiskColor(todayReport?.riskLevel)} p-6 bg-[#010d1e]/30 rounded-2xl`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Today's Stats */}
              <div className="space-y-3 lg:border-r lg:border-[#11263b]/30 lg:pr-6">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#11263b]/30">
                  <span className="text-xs font-semibold text-paper">Today's Logged Metrics</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getRiskBadgeStyle(todayReport?.riskLevel)}`}>
                    {todayReport?.riskLevel} Risk {getRiskEmoji(todayReport?.riskLevel)}
                  </span>
                </div>

                {/* Sleep card */}
                <div className="flex items-center gap-3 p-3 bg-midnight/40 rounded-xl border border-[#11263b]/40">
                  <Moon className="w-5 h-5 text-[#1c6cff]" />
                  <div>
                    <span className="text-[10px] text-mist block">Sleep Hours</span>
                    <span className="text-sm font-semibold text-paper">{todayCheckin.sleepHours} hrs</span>
                  </div>
                </div>

                {/* Eating card */}
                <div className="flex items-center gap-3 p-3 bg-midnight/40 rounded-xl border border-[#11263b]/40">
                  <Utensils className="w-5 h-5 text-[#00cc4b]" />
                  <div>
                    <span className="text-[10px] text-mist block">Eating Pattern</span>
                    <span className="text-sm font-semibold text-paper">{todayCheckin.eatingPattern}</span>
                  </div>
                </div>

                {/* Stress card */}
                <div className="flex items-center gap-3 p-3 bg-midnight/40 rounded-xl border border-[#11263b]/40">
                  <Smile className="w-5 h-5 text-[#ff8833]" />
                  <div>
                    <span className="text-[10px] text-mist block">Stress Level</span>
                    <span className="text-sm font-semibold text-paper">{todayCheckin.stressLevel} / 5</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Summary & Actions */}
              <div className="space-y-4 lg:border-r lg:border-[#11263b]/30 lg:pr-6">
                <div>
                  <span className="text-[10px] font-semibold text-mist uppercase tracking-widest block mb-1">Analysis Summary</span>
                  <p className="text-sm font-light text-[#ccced0] leading-relaxed">
                    {todayReport?.reason}
                  </p>
                </div>
                
                <div className="p-4 bg-midnight rounded-xl border border-[#11263b]/60 flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5" role="img" aria-label="lightbulb">💡</span>
                  <div>
                    <span className="text-xs font-semibold text-signal uppercase tracking-wider block mb-0.5">Suggested Action</span>
                    <p className="text-sm font-light text-[#ccced0] leading-relaxed">
                      {todayReport?.tip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Recommendations checklist */}
              <div className="space-y-4">
                <span className="text-[10px] font-semibold text-mist uppercase tracking-widest block mb-1">Key Recommendations</span>
                <div className="space-y-3.5">
                  {getRecommendations(todayReport?.riskLevel).map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg bg-[#001533] border border-[#11263b]/50 shrink-0 ${item.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-paper block leading-tight">{item.title}</span>
                          <span className="text-[11px] text-fog font-thin block leading-normal mt-0.5">{item.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Weekly Report */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-xs font-semibold text-signal uppercase tracking-widest">
            Weekly Report
          </p>
          {weeklyReport && (
            <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
              weeklyReport.source === "AI Analysis" 
                ? "bg-signal/15 text-signal border-signal/30" 
                : "bg-[#999ca1]/15 text-[#999ca1] border-[#999ca1]/30"
            }`}>
              {weeklyReport.source}
            </span>
          )}
        </div>

        {loadingWeeklyReport ? (
          <div className="h-[250px] w-full skeleton-pulse rounded-2xl" />
        ) : profile.dailyCheckins?.length === 0 ? (
          <div className="neo-card border border-[#11263b]/20 p-6 text-center text-mist font-thin">
            No check-ins logged in the last 7 days. Once you check in on the dashboard, a weekly visualization will appear here!
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sleep vs Stress Chart Card */}
            <div className="neo-card p-5 bg-[#010d1e]/30 border border-[#11263b]/30 rounded-2xl">
              <p className="text-xs font-semibold text-paper mb-4">7-Day Wellness Trends: Sleep Hours vs. Stress Levels</p>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1c6cff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1c6cff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#11263b" opacity={0.3} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#999ca1", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#11263b" }} />
                  
                  {/* Sleep axis (left) */}
                  <YAxis yAxisId="sleep-axis" tick={{ fill: "#1c6cff", fontSize: 10 }} domain={[0, 10]} tickLine={false} axisLine={{ stroke: "#11263b" }} unit="h" />
                  
                  {/* Stress axis (right) */}
                  <YAxis yAxisId="stress-axis" orientation="right" tick={{ fill: "#ff4433", fontSize: 10 }} domain={[0, 5]} tickLine={false} axisLine={{ stroke: "#11263b" }} unit="/5" />
                  
                  <Tooltip contentStyle={chartStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Area yAxisId="sleep-axis" type="monotone" dataKey="Sleep" stroke="#1c6cff" fillOpacity={1} fill="url(#sleepGrad)" strokeWidth={2} name="Sleep Hours" />
                  <Line yAxisId="stress-axis" type="monotone" dataKey="Stress" stroke="#ff4433" strokeWidth={2.5} dot={{ r: 4, stroke: "#ff4433", strokeWidth: 2, fill: "#010d1e" }} activeDot={{ r: 6 }} name="Stress Level" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Averages and History side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left: Summary and WoW trend */}
              <div className="lg:col-span-1 neo-card p-5 bg-[#010d1e]/30 border border-[#11263b]/30 rounded-2xl space-y-4">
                <div>
                  <span className="text-[10px] font-semibold text-mist uppercase tracking-widest block mb-1">Weekly Summary</span>
                  <p className="text-sm font-light text-[#ccced0] leading-relaxed">
                    {weeklyReport?.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#11263b]/30 space-y-2">
                  <span className="text-[10px] font-semibold text-mist uppercase tracking-widest block">Week-over-Week Trend</span>
                  {renderWowBadge()}
                </div>
              </div>

              {/* Right: Daily check-in table history */}
              <div className="lg:col-span-2 neo-card p-5 bg-[#010d1e]/30 border border-[#11263b]/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#11263b]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-signal" />
                    <span className="text-xs font-semibold text-paper">Daily Check-in History</span>
                  </div>
                  <span className="text-xs text-mist font-thin">Last 7 entries</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#11263b] text-mist font-thin uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Sleep Hours</th>
                        <th className="py-2.5 px-3">Eating Pattern</th>
                        <th className="py-2.5 px-3">Stress Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#11263b]/20">
                      {profile.dailyCheckins.slice(-7).reverse().map((c, idx) => (
                        <tr key={idx} className="hover:bg-[#001533]/20 font-thin text-fog">
                          <td className="py-3 px-3">
                            {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3 px-3 font-semibold text-paper">{c.sleepHours} hrs</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] ${
                              c.eatingPattern === 'Healthy' ? 'bg-[#00cc4b]/10 text-tag-lime border border-[#00cc4b]/20' :
                              c.eatingPattern === 'Ate out' ? 'bg-[#00acfe]/10 text-tag-sky border border-[#00acfe]/20' :
                              c.eatingPattern === 'Skipped meals' ? 'bg-[#ff4433]/10 text-tag-coral border border-[#ff4433]/20' :
                              'bg-[#ff8833]/10 text-tag-tangerine border border-[#ff8833]/20'
                            }`}>
                              {c.eatingPattern}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-display font-semibold text-paper">
                            {c.stressLevel} / 5
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Breathing Spacer Modal */}
      <BreathingSpacer isOpen={isBreathingOpen} onClose={handleCloseBreathing} />
    </div>
  );
}
