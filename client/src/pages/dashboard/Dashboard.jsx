import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import BarChartDashboard from "@/components/dashboard/BarChartDashboard";
import { Sparkles, HeartPulse, RefreshCw, Moon, Wind, Apple, Shield, Smile, Receipt, TrendingUp, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import BreathingSpacer from "@/components/dashboard/BreathingSpacer";
import RecoveryStatusCard from "@/components/dashboard/RecoveryStatusCard";

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

  const todayCheckin = wellnessProfile?.dailyCheckins?.find(
    (c) => new Date(c.date).toDateString() === new Date().toDateString()
  );

  const getTodayStatusLabel = (checkin) => {
    if (!checkin) return "";
    const { sleepHours, stressLevel } = checkin;
    if (stressLevel >= 4) return "Stressful 😫";
    if (stressLevel === 3 || sleepHours < 6) return "Moderate 😐";
    return "Relaxed 😊";
  };

  const getTodayStatusBadgeStyle = (checkin) => {
    if (!checkin) return "";
    const { sleepHours, stressLevel } = checkin;
    if (stressLevel >= 4) return "bg-[#ff4433]/15 text-[#ff4433] border-[#ff4433]/40 border";
    if (stressLevel === 3 || sleepHours < 6) return "bg-[#ff8833]/15 text-[#ff8833] border-[#ff8833]/40 border";
    return "bg-[#00cc4b]/15 text-[#00cc4b] border-[#00cc4b]/40 border";
  };

  return (
    <div className="bg-midnight min-h-screen p-6 md:p-10 text-left space-y-[1.25rem]">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold font-display text-paper mb-1">{getGreeting()}, {user?.name} 👋</h2>
        <p className="text-mist text-sm md:text-base font-light">Here's your overview</p>
      </div>

      {/* AI Insight banner */}
      {financialAdvice && (
        <div 
          className="flex items-start gap-4 bg-gradient-to-r from-signal/15 to-[#001533]/5 border border-signal/20 rounded-[var(--border-radius-lg)] p-[1rem_1.25rem] shadow-neo"
        >
          <div className="w-8 h-8 rounded-full bg-[#001533] border border-signal/30 flex items-center justify-center shrink-0 mt-0.5 text-signal">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-signal uppercase tracking-[0.08em] block">
              FINANSMART AI INSIGHT
            </span>
            <p className="text-[14px] leading-[1.6] text-fog font-light">
              {financialAdvice}
            </p>
          </div>
        </div>
      )}

      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-stretch">
        {/* Left Column: Financial Health */}
        <div className="w-full neo-card p-[1.25rem] bg-deep border border-steel/30 rounded-[var(--border-radius-lg)] flex flex-col justify-between h-full">
          <div>
            <p className="text-[12px] font-semibold text-mist uppercase tracking-[0.05em] mb-2">Financial Health</p>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-[32px] font-bold text-paper font-display leading-none">
                ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-[14px] font-normal text-mist">
                spent of ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} budget
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-[#11263b]/50 rounded-full h-[6px] overflow-hidden border border-steel/10">
              <div 
                className="bg-signal h-[6px] rounded-full transition-all duration-500" 
                style={{ 
                  width: `${totalBudget > 0 ? Math.min((totalSpend / totalBudget) * 100, 100) : 0}%`,
                  minWidth: totalSpend > 0 ? "4px" : "0px"
                }}
              />
            </div>
            {/* Subtext below bar */}
            <div className="text-[12px] text-mist mt-2 font-light">
              {(totalBudget > 0 ? Math.min((totalSpend / totalBudget) * 100, 100) : 0).toFixed(0)}% of budget used · ${Math.max(0, totalBudget - totalSpend).toLocaleString()} remaining
            </div>
          </div>

          {/* Stats tiles */}
          <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
            <div className="p-3 rounded-[var(--border-radius-md)] bg-midnight/60 border border-steel/30">
              <span className="text-[11px] text-mist font-semibold uppercase tracking-wider block">Active Budgets</span>
              <span className="text-[22px] font-bold text-paper block mt-1 leading-none">{budgetList.length}</span>
            </div>
            <div className="p-3 rounded-[var(--border-radius-md)] bg-midnight/60 border border-steel/30">
              <span className="text-[11px] text-mist font-semibold uppercase tracking-wider block">Income Streams</span>
              <span className="text-[22px] font-bold text-signal block mt-1 leading-none">
                ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Footer row */}
          <div className="flex justify-between items-center border-t border-steel/30 pt-[14px] mt-[14px]">
            <div className="flex items-center gap-2 text-[12px] text-tag-lime">
              <TrendingUp className="w-4 h-4 text-tag-lime shrink-0" />
              <span>On track this month — surplus available for savings</span>
            </div>
            <Link to="/dashboard/budgets" className="text-[13px] text-signal hover:underline font-semibold shrink-0">
              View budgets →
            </Link>
          </div>
        </div>

        {/* Right Column: Stacked Cards */}
        <div className="flex flex-col gap-3">
          {/* Today's Status Card */}
          <div className="w-full neo-card bg-deep border border-steel/30 rounded-[var(--border-radius-lg)] p-[1rem_1.25rem] flex flex-col justify-between flex-1 relative">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] font-semibold text-mist uppercase tracking-[0.05em]">TODAY'S STATUS</span>
                {wellnessProfile?.surveyCompleted && hasCheckedInToday && todayCheckin && (
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    {
                      Relaxed: "bg-tag-lime/15 text-tag-lime border-tag-lime/40",
                      Moderate: "bg-tag-tangerine/15 text-tag-tangerine border-tag-tangerine/40",
                      Stressful: "bg-tag-coral/15 text-tag-coral border-tag-coral/40"
                    }[getTodayStatusLabel(todayCheckin).split(" ")[0]] || "bg-[#11263b]/50 text-mist border-steel/20"
                  }`}>
                    {getTodayStatusLabel(todayCheckin).split(" ")[0]}
                  </span>
                )}
              </div>

              {analyzing ? (
                <div className="h-10 skeleton-pulse rounded-lg mt-2" />
              ) : !wellnessProfile || !wellnessProfile.surveyCompleted ? (
                <div className="space-y-2 mt-2">
                  <p className="text-[13px] text-fog font-light leading-relaxed">
                    Take a 1-minute wellness survey to check your chronic burnout risk and unlock suggestions.
                  </p>
                  <Link to="/dashboard/wellness">
                    <span className="text-[13px] text-signal font-semibold hover:underline block mt-2">Start Survey →</span>
                  </Link>
                </div>
              ) : !hasCheckedInToday ? (
                <div className="space-y-2 mt-2">
                  <p className="text-[13px] text-fog font-light leading-relaxed">
                    You haven't logged today's daily check-in yet. Provide today's update to refresh your stress metrics.
                  </p>
                  <Link to="/dashboard/wellness">
                    <span className="text-[13px] text-signal font-semibold hover:underline block mt-2">Check In Now →</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  <p className="text-[13px] text-fog font-light leading-relaxed">
                    {burnoutAnalysis?.todayText || "Your stress and sleep metrics are updated for today."}
                  </p>
                  {burnoutAnalysis?.suggestedAction && (
                    <div className="flex items-start gap-1.5 text-[12px] text-mist leading-relaxed mt-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#ff8833] shrink-0 mt-0.5" />
                      <span>{burnoutAnalysis.suggestedAction}</span>
                    </div>
                  )}
                  {hasCheckedInToday && todayCheckin && (
                    <div className="pt-2">
                      <button
                        onClick={() => setIsBreathingOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-signal/30 text-signal bg-signal/5 hover:bg-signal/15 active:scale-[0.97] transition-all text-xs font-semibold w-fit"
                      >
                        <Wind className="w-3.5 h-3.5" /> Start 4-7-8 Breathing
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {wellnessProfile?.surveyCompleted && (
              <div className="mt-auto pt-3 border-t border-steel/30 mt-4">
                <Link to="/dashboard/wellness" className="text-sm text-signal hover:underline flex items-center gap-1 font-semibold">
                  View full report <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Recovery Status Card */}
          {wellnessProfile?.surveyCompleted && burnoutAnalysis && (
            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-[12px] font-semibold text-mist uppercase tracking-[0.05em] pl-0.5">RECOVERY STATUS</span>
              <RecoveryStatusCard 
                burnoutState={burnoutAnalysis.burnoutState}
                recoveryDaysCompleted={burnoutAnalysis.recoveryDaysCompleted}
                recoveryDaysRequired={burnoutAnalysis.recoveryDaysRequired}
                triggerDate={burnoutAnalysis.triggerDate}
                recoveryText={burnoutAnalysis.recoveryText}
                dailyCheckins={wellnessProfile.dailyCheckins}
                isDashboard={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Activity Section */}
      <BarChartDashboard 
        budgetList={budgetList} 
        height={260} 
        className="neo-card bg-deep border border-steel/30 rounded-[var(--border-radius-lg)] p-[1.25rem]"
      />

      {/* Bottom Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Latest Budgets */}
        <div className="neo-card bg-deep/30 border border-steel/30 rounded-[var(--border-radius-lg)] p-[1.25rem] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-steel/30 pb-3">
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
                      <span className="text-fog font-light">${budget.totalSpend || 0} / ${budget.amount}</span>
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
              <div className="text-center text-sm text-mist font-light py-4">
                No budgets configured yet
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Latest Expenses */}
        <div className="neo-card bg-deep/30 border border-steel/30 rounded-[var(--border-radius-lg)] p-[1.25rem] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-steel/30 pb-3">
            <span className="text-sm md:text-base font-semibold text-paper">Latest Expenses</span>
            <Link to="/dashboard/expenses" className="text-sm text-signal hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="divide-y divide-steel/20">
            {expensesList?.length > 0 ? (
              expensesList.slice(0, 4).map((expense) => (
                <div key={expense.id || expense._id} className="flex items-center justify-between py-2.5 last:pb-0 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#001533] border border-[#11263b]/40 text-signal shrink-0 shadow-neo">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-paper block leading-tight">{expense.name}</span>
                      <span className="text-xs text-mist font-light block leading-normal mt-1">{expense.createdAt}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-signal">${expense.amount}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-mist font-light py-6">
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
