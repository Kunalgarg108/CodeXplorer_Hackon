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
import { Sparkles, HeartPulse, RefreshCw, Moon, Wind, Apple, Shield, Smile } from "lucide-react";
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

  const getRecommendations = (level) => {
    if (level === "High") {
      return [
        { title: "Use the Breathing Spacer", desc: "Try our 4-7-8 breathing tool at the top to quickly reduce acute stress.", icon: Wind, color: "text-[#ff4433]" },
        { title: "Enforce a Sleep Schedule", desc: "Lock in a minimum of 7-8 hours tonight; close IDEs/notes 1 hour before bed.", icon: Moon, color: "text-[#1c6cff]" },
        { title: "Control Comfort Spending", desc: "Avoid stress-ordering food delivery. Try preparing a simple snack instead.", icon: Apple, color: "text-[#ff8833]" }
      ];
    }
    if (level === "Moderate") {
      return [
        { title: "Review Comfort Outlays", desc: "Impulse shopping might trigger when stressed. Monitor your weekly transactions.", icon: Shield, color: "text-[#ff8833]" },
        { title: "Take Active Micro-Breaks", desc: "Take a 5-minute screen-free walk for every 90 minutes of study or coding.", icon: Wind, color: "text-[#00cc4b]" },
        { title: "Optimize Sleep Windows", desc: "Aim for consistent sleep times even during exam prep to support memory retention.", icon: Moon, color: "text-[#1c6cff]" }
      ];
    }
    return [
      { title: "Maintain Current Habits", desc: "Your sleep, eating, and stress metrics are in a healthy equilibrium.", icon: Smile, color: "text-[#00cc4b]" },
      { title: "Keep Checking In Daily", desc: "Consistent check-ins help the AI advisor detect and prevent silent stress build-ups.", icon: HeartPulse, color: "text-[#1c6cff]" },
      { title: "Celebrate Balance", desc: "Sustained stability is a win! Treat yourself within budget limits.", icon: Sparkles, color: "text-[#ff8833]" }
    ];
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
      <CardInfo budgetList={budgetList} incomeList={incomeList} onlyAdvice={true} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-8 gap-6 items-start">
        {/* Left Column (Stats, Activity, Expenses) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <p className="eyebrow text-xs mb-3">Financial Stats</p>
            <CardInfo budgetList={budgetList} incomeList={incomeList} onlyCards={true} />
          </div>
          <BarChartDashboard budgetList={budgetList} />
          <ExpenseListTable expensesList={expensesList} refreshData={loadData} />
        </div>

        {/* Right Column (Wellness, Latest Budgets) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div>
            <p className="eyebrow text-xs mb-3">Burnout &amp; Stress Monitor</p>
            {analyzing ? (
              <div className="w-full skeleton-pulse min-h-[350px]" />
            ) : !wellnessProfile || !wellnessProfile.surveyCompleted ? (
              <div className="neo-card-glow border-signal/30 p-5 space-y-3 text-left flex flex-col justify-center min-h-[220px]">
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
              <DailyCheckinCard onSubmitSuccess={loadWellness} />
            ) : (
              <div className={`neo-card border-l-4 ${getRiskColor(burnoutAnalysis?.riskLevel)} p-5 flex flex-col gap-3.5`}>
                <div className="space-y-4 flex flex-col">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-paper" />
                        <h3 className="font-display font-semibold text-base text-paper">Burnout Status</h3>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-midnight border border-[#11263b]">
                        {burnoutAnalysis?.riskLevel} Risk {getRiskEmoji(burnoutAnalysis?.riskLevel)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold text-mist uppercase tracking-widest block mb-0.5">Analysis Summary</span>
                        <p className="text-sm font-light text-[#ccced0] leading-relaxed">
                          {burnoutAnalysis?.reason}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-midnight rounded-xl border border-[#11263b]/60 flex items-start gap-2.5">
                        <span className="text-lg shrink-0 mt-0.5" role="img" aria-label="lightbulb">💡</span>
                        <div>
                          <span className="text-xs font-semibold text-signal uppercase tracking-wider block mb-0.5">Suggested Action</span>
                          <p className="text-sm font-light text-[#ccced0] leading-relaxed">
                            {burnoutAnalysis?.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Recommendations Checklist */}
                  <div className="pt-3 border-t border-[#11263b]/40">
                    <span className="text-[10px] font-semibold text-mist uppercase tracking-widest block mb-2">Key Recommendations</span>
                    <div className="space-y-2">
                      {getRecommendations(burnoutAnalysis?.riskLevel).map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                          <div key={idx} className="flex items-start gap-2.5">
                            <div className={`p-1 rounded-lg bg-[#001533] border border-[#11263b]/50 shrink-0 ${item.color}`}>
                              <IconComponent className="w-3.5 h-3.5" />
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

                <div className="flex justify-between items-center pt-3 border-t border-[#11263b]/40 mt-1">
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
          </div>

          {/* Latest Budgets */}
          <div className="flex flex-col gap-3">
            <p className="eyebrow text-xs">Latest Budgets</p>
            <div className="flex flex-col gap-5">
              {budgetList?.length > 0
                ? budgetList.slice(0, 4).map((budget) => <BudgetItem budget={budget} key={budget.id} />)
                : [1, 2, 3].map((item) => (
                    <div key={item} className="h-[150px] w-full skeleton-pulse" />
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breathing Spacer Modal */}
      <BreathingSpacer isOpen={isBreathingOpen} onClose={handleCloseBreathing} />
    </div>
  );
}
