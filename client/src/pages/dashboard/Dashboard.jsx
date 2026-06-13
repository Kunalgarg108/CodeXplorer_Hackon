import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import CardInfo from "@/components/dashboard/CardInfo";
import BarChartDashboard from "@/components/dashboard/BarChartDashboard";
import BudgetItem from "@/components/dashboard/BudgetItem";
import ExpenseListTable from "@/components/dashboard/ExpenseListTable";
import DailyCheckinCard from "@/components/dashboard/DailyCheckinCard";
import { Button } from "@/components/ui/button";
import { Sparkles, HeartPulse, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import BreathingSpacer from "@/components/dashboard/BreathingSpacer";

export default function Dashboard() {
  const { user } = useAuth();
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [wellnessProfile, setWellnessProfile] = useState(null);
  const [burnoutAnalysis, setBurnoutAnalysis] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  const loadData = async () => {
    const [budgets, incomes, expenses] = await Promise.all([
      api.getBudgets(),
      api.getIncomes(),
      api.getExpenses(),
    ]);
    setBudgetList(budgets);
    setIncomeList(incomes);
    setExpensesList(expenses);
  };

  const loadWellness = async () => {
    setAnalyzing(true);
    try {
      const wData = await api.getWellnessProfile();
      const profile = wData.wellnessProfile;
      setWellnessProfile(profile);

      // Check if user checked in today
      const checkins = profile?.dailyCheckins || [];
      const todayStr = new Date().toDateString();
      const checkedIn = checkins.some(c => new Date(c.date).toDateString() === todayStr);
      setHasCheckedInToday(checkedIn);

      // Perform burnout analysis
      const bData = await api.analyzeBurnout();
      setBurnoutAnalysis(bData);
    } catch (err) {
      console.error("Failed to load wellness or analyze burnout:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCloseBreathing = async () => {
    setIsBreathingOpen(false);
    try {
      await api.resolveBurnout();
      await loadWellness();
    } catch (err) {
      console.error("Failed to resolve burnout phase:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      loadWellness();
    }
  }, [user]);

  const getRiskColor = (level) => {
    if (level === "High") return "border-[#ff4433] text-tag-coral bg-[#ff4433]/10";
    if (level === "Moderate") return "border-[#ff8833] text-tag-tangerine bg-[#ff8833]/10";
    return "border-[#00cc4b] text-tag-lime bg-[#00cc4b]/10";
  };

  const getRiskEmoji = (level) => {
    if (level === "High") return "😫";
    if (level === "Moderate") return "😐";
    return "😊";
  };

  return (
    <div className="p-6 md:p-10 text-left">
      {/* Burnout Alert Banner */}
      {burnoutAnalysis?.burnoutPhase && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => setIsBreathingOpen(true)}
          className="mb-6 bg-gradient-to-r from-[#ff4433]/20 via-[#ff4433]/15 to-[#ff4433]/5 border border-[#ff4433]/60 hover:border-[#ff4433] p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all shadow-[0_0_20px_rgba(255,68,51,0.15)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#ff4433]/5 animate-pulse pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4433] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ff4433]"></span>
            </span>
            <div>
              <h4 className="text-sm font-bold text-[#ff4433] font-display flex items-center gap-1.5">
                {burnoutAnalysis?.isRecurrent ? "⚠️ Recurrent Burnout Alarm" : "🚨 Chronic Burnout Warning Active"}
              </h4>
              <p className="text-xs text-fog font-thin mt-1">
                {burnoutAnalysis?.isRecurrent 
                  ? "This is a repeating burnout phase. Please take a longer break and focus on self-care."
                  : `You've recorded high stress (&ge; 4/5) for ${burnoutAnalysis?.consecutiveStressDays || 3} consecutive check-ins. Let's reset.`
                }
              </p>
            </div>
          </div>
          
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ff4433] text-white hover:bg-[#ff4433]/90 transition-colors shrink-0 relative z-10 shadow-md">
            Relax Now
          </button>
        </motion.div>
      )}
      <p className="eyebrow text-xs mb-2">Overview</p>
      <h2 className="display-section mb-2">Hi, {user?.name} 👋</h2>
      <p className="text-muted-copilot text-sm mb-6">Here's what's happening with your money — let's manage your expenses.</p>
      <CardInfo budgetList={budgetList} incomeList={incomeList} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-8 gap-6">
        {/* Left Columns (Charts & Recent Expenses) */}
        <div className="lg:col-span-2 space-y-6">
          <BarChartDashboard budgetList={budgetList} />
          <ExpenseListTable expensesList={expensesList} refreshData={loadData} />
        </div>

        {/* Right Column (Wellness & Budgets) */}
        <div className="grid gap-6 content-start">
          {/* Burnout Risk Card / Daily Check-in */}
          <p className="eyebrow text-xs -mb-3">Burnout &amp; Stress Monitor</p>
          
          {analyzing ? (
            <div className="h-[180px] w-full skeleton-pulse" />
          ) : !wellnessProfile || !wellnessProfile.surveyCompleted ? (
            // Survey prompt if onboarding survey skipped
            <div className="neo-card-glow border-signal/30 p-5 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <h3 className="font-display font-semibold text-sm text-paper">Uncover your Burnout Risk!</h3>
              </div>
              <p className="body-thin text-fog text-xs leading-relaxed">
                Take a quick 1-minute wellness survey to get real-time AI stress analysis, personalized suggestions, and coping tips.
              </p>
              <Link to="/dashboard/wellness">
                <Button className="w-full mt-2" size="sm">Start Survey</Button>
              </Link>
            </div>
          ) : !hasCheckedInToday ? (
            // Show daily check-in form first if not submitted today
            <DailyCheckinCard onSubmitSuccess={loadWellness} />
          ) : (
            // Show risk details card if check-in is complete
            <div className={`neo-card border-l-4 ${getRiskColor(burnoutAnalysis?.riskLevel)} p-5 space-y-4`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-paper" />
                  <h3 className="font-display font-semibold text-sm text-paper">Burnout Status</h3>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-midnight border border-[#11263b]">
                  {burnoutAnalysis?.riskLevel} Risk {getRiskEmoji(burnoutAnalysis?.riskLevel)}
                </span>
              </div>
              <div className="space-y-3 font-thin text-xs text-fog leading-relaxed">
                <p>
                  <strong className="text-paper font-semibold block mb-0.5">Analysis Summary:</strong>
                  {burnoutAnalysis?.reason}
                </p>
                <p className="p-3.5 bg-midnight rounded-lg border border-[#11263b]/60">
                  <span className="text-signal font-semibold block mb-1">💡 Suggested Action:</span>
                  {burnoutAnalysis?.tip}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Link to="/dashboard/wellness" className="text-[10px] text-signal hover:underline">
                  Update wellness answers →
                </Link>
                <button 
                  onClick={loadWellness} 
                  className="text-mist hover:text-white transition-colors p-1"
                  title="Recalculate Stress Risk"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Latest Budgets */}
          <p className="eyebrow text-xs -mb-3">Latest Budgets</p>
          {budgetList?.length > 0
            ? budgetList.slice(0, 4).map((budget) => <BudgetItem budget={budget} key={budget.id} />)
            : [1, 2, 3].map((item) => (
                <div key={item} className="h-[150px] w-full skeleton-pulse" />
              ))}
        </div>
      </div>

      {/* Breathing Spacer Modal */}
      <BreathingSpacer isOpen={isBreathingOpen} onClose={handleCloseBreathing} />
    </div>
  );
}
