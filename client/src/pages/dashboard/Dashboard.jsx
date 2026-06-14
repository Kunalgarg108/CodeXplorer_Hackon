import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import BarChartDashboard from "@/components/dashboard/BarChartDashboard";
import { Sparkles, HeartPulse, RefreshCw, Moon, Wind, Apple, Shield, Smile, Receipt } from "lucide-react";
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

  // Financial Stats states
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [financialAdvice, setFinancialAdvice] = useState("");

  const loadData = async () => {
    try {
      const [budgets, incomes, expenses] = await Promise.all([
        api.getBudgets(),
        api.getIncomes(),
        api.getExpenses(),
      ]);
      setBudgetList(budgets);
      setIncomeList(incomes);
      setExpensesList(expenses);
    } catch (err) {
      console.error("Failed to load financial data:", err);
    }
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

  // Calculate totals
  useEffect(() => {
    let budgetTotal = 0;
    let spendTotal = 0;
    let incomeTotal = 0;

    budgetList.forEach((b) => {
      budgetTotal += Number(b.amount || 0);
      spendTotal += Number(b.totalSpend || 0);
    });

    incomeList.forEach((inc) => {
      incomeTotal += Number(inc.totalAmount || inc.amount || 0);
    });

    setTotalBudget(budgetTotal);
    setTotalSpend(spendTotal);
    setTotalIncome(incomeTotal);
  }, [budgetList, incomeList]);

  // Fetch advice and condense it
  useEffect(() => {
    if (totalBudget > 0 || totalIncome > 0 || totalSpend > 0) {
      api.getAdvice({ totalBudget, totalIncome, totalSpend })
        .then((data) => {
          const advice = data.advice || "";
          // Split by punctuation followed by space
          const sentences = advice.split(/(?<=[.!?])\s+/).filter(Boolean);
          const condensed = sentences.slice(0, 2).join(" ");
          setFinancialAdvice(condensed);
        })
        .catch(() => setFinancialAdvice("Focus on maintaining your budget limits and tracking daily transactions."));
    }
  }, [totalBudget, totalIncome, totalSpend]);

  useEffect(() => {
    if (user) {
      loadData();
      loadWellness();
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getRiskEmoji = (level) => {
    if (level === "High") return "😫";
    if (level === "Moderate") return "😐";
    return "😊";
  };

  const getRiskBadgeStyle = (level) => {
    if (level === "High") return "bg-[#ff4433]/15 text-[#ff4433] border-[#ff4433]/40 border";
    if (level === "Moderate") return "bg-[#ff8833]/15 text-[#ff8833] border-[#ff8833]/40 border";
    return "bg-[#00cc4b]/15 text-[#00cc4b] border-[#00cc4b]/40 border";
  };

  return (
    <div className="p-6 md:p-10 text-left space-y-6">
      {/* Burnout Alert Banner */}
      {burnoutAnalysis?.burnoutPhase && (
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
              <h4 className="text-sm md:text-base font-bold text-[#ff4433] font-display flex items-center gap-1.5">
                {burnoutAnalysis?.isRecurrent ? "⚠️ Recurrent Burnout Alarm" : "🚨 Chronic Burnout Warning Active"}
              </h4>
              <p className="text-xs md:text-sm text-fog font-thin mt-1">
                {burnoutAnalysis?.isRecurrent 
                  ? "This is a repeating burnout phase. Please take a longer break and focus on self-care."
                  : `You've recorded high stress (≥ 4/5) for ${burnoutAnalysis?.consecutiveStressDays || 3} consecutive check-ins. Let's reset.`
                }
              </p>
            </div>
          </div>
          
          <button className="text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#ff4433] text-white hover:bg-[#ff4433]/90 transition-colors shrink-0 relative z-10 shadow-md">
            Relax Now
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold font-display text-paper mb-1">{getGreeting()}, {user?.name} 👋</h2>
        <p className="text-muted-copilot text-base">Here's your overview</p>
      </div>

      {/* AI Insight banner */}
      {financialAdvice && (
        <div className="neo-card-glow p-4 flex items-center gap-3.5 bg-gradient-to-r from-signal/15 to-[#001533]/5 border border-signal/20 rounded-xl">
          <div className="p-2 rounded-lg bg-[#001533] border border-[#11263b]/50 shrink-0 text-signal shadow-neo">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-signal uppercase tracking-widest block mb-0.5">Finan Smart AI Insight</span>
            <p className="body-thin text-fog text-sm md:text-base leading-relaxed">{financialAdvice}</p>
          </div>
        </div>
      )}

      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[11fr_9fr] gap-6 items-start">
        {/* Left Card: Financial Health (55% width equivalent) */}
        <div className="w-full neo-card p-5 bg-[#010d1e] border border-[#11263b]/30 rounded-2xl flex flex-col justify-between min-h-[175px]">
          <div>
            <p className="text-xs md:text-sm font-semibold text-mist uppercase tracking-widest mb-1.5">Financial Health</p>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl md:text-4xl font-bold text-paper font-display">
                ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm text-mist font-medium">
                spent of ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} budget
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-[#11263b]/50 rounded-full h-1.5 mt-4 mb-4 overflow-hidden border border-[#11263b]/20">
              <div 
                className="bg-signal h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${totalBudget > 0 ? Math.min((totalSpend / totalBudget) * 100, 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Stats below progress bar */}
          <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-[#11263b]/30">
            <div className="p-3 rounded-xl bg-[#000814]/60 border border-[#11263b]/30">
              <span className="text-xs text-mist font-semibold uppercase tracking-wider block">Active Budgets</span>
              <span className="text-xl font-bold text-paper block mt-1">{budgetList.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#000814]/60 border border-[#11263b]/30">
              <span className="text-xs text-mist font-semibold uppercase tracking-wider block">Income Streams</span>
              <span className="text-xl font-bold text-signal block mt-1">
                ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Burnout Status (45% width equivalent) */}
        <div className="w-full neo-card p-5 bg-[#010d1e] border border-[#11263b]/30 rounded-2xl flex flex-col justify-between min-h-[175px] relative">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs md:text-sm font-semibold text-mist uppercase tracking-widest mt-0.5">Burnout Status</p>
              {wellnessProfile?.surveyCompleted && burnoutAnalysis && (
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getRiskBadgeStyle(burnoutAnalysis?.riskLevel)}`}>
                  {burnoutAnalysis?.riskLevel} Risk {getRiskEmoji(burnoutAnalysis?.riskLevel)}
                </span>
              )}
            </div>

            {analyzing ? (
              <div className="h-10 skeleton-pulse rounded-lg mt-2" />
            ) : !wellnessProfile || !wellnessProfile.surveyCompleted ? (
              <div className="space-y-2 mt-2">
                <p className="text-sm text-fog font-thin leading-relaxed">
                  Take a 1-minute wellness survey to check your chronic burnout risk and unlock suggestions.
                </p>
                <Link to="/dashboard/wellness">
                  <span className="text-sm text-signal font-semibold hover:underline block mt-2">Start Survey →</span>
                </Link>
              </div>
            ) : !hasCheckedInToday ? (
              <div className="space-y-2 mt-2">
                <p className="text-sm text-fog font-thin leading-relaxed">
                  You haven't logged today's daily check-in yet. Provide today's update to refresh your stress metrics.
                </p>
                <Link to="/dashboard/wellness">
                  <span className="text-sm text-signal font-semibold hover:underline block mt-2">Check In Now →</span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-fog font-thin mt-2 leading-relaxed">
                {burnoutAnalysis?.reason ? (
                  burnoutAnalysis.reason.split(/[.!?]/)[0] + "."
                ) : (
                  "Your stress and sleep metrics are updated for today."
                )}
              </p>
            )}
          </div>

          {wellnessProfile?.surveyCompleted && (
            <div className="pt-3 border-t border-[#11263b]/30 mt-4">
              <Link to="/dashboard/wellness" className="text-sm text-signal hover:underline flex items-center gap-1 font-semibold">
                View full report <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Activity Section */}
      <BarChartDashboard budgetList={budgetList} height={260} />

      {/* Bottom Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Latest Budgets */}
        <div className="neo-card p-5 bg-[#010d1e]/30 border border-[#11263b]/30 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#11263b]/30 pb-3">
            <span className="text-sm md:text-base font-semibold text-paper">Latest Budgets</span>
            <Link to="/dashboard/budgets" className="text-sm text-signal hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {budgetList?.length > 0 ? (
              budgetList.slice(0, 3).map((budget) => {
                const spendPercent = budget.amount > 0 ? Math.min((budget.totalSpend / budget.amount) * 100, 100) : 0;
                return (
                  <div key={budget.id || budget._id} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-paper">{budget.name}</span>
                      <span className="text-fog font-thin">${budget.totalSpend || 0} / ${budget.amount}</span>
                    </div>
                    <div className="w-full bg-[#11263b]/50 rounded-full h-1.5 overflow-hidden border border-[#11263b]/20">
                      <div 
                        className="bg-signal h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${spendPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-mist font-thin py-4">
                No budgets configured yet
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Latest Expenses */}
        <div className="neo-card p-5 bg-[#010d1e]/30 border border-[#11263b]/30 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#11263b]/30 pb-3">
            <span className="text-sm md:text-base font-semibold text-paper">Latest Expenses</span>
            <Link to="/dashboard/expenses" className="text-sm text-signal hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="divide-y divide-[#11263b]/20">
            {expensesList?.length > 0 ? (
              expensesList.slice(0, 4).map((expense) => (
                <div key={expense.id || expense._id} className="flex items-center justify-between py-2.5 last:pb-0 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#001533] border border-[#11263b]/40 text-signal shrink-0 shadow-neo">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-paper block leading-tight">{expense.name}</span>
                      <span className="text-xs text-mist font-thin block leading-normal mt-1">{expense.createdAt}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-signal">${expense.amount}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-mist font-thin py-6">
                No expenses logged yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breathing Spacer Modal */}
      <BreathingSpacer isOpen={isBreathingOpen} onClose={handleCloseBreathing} />
    </div>
  );
}
