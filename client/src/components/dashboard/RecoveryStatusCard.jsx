import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, AlertOctagon, Loader2 } from "lucide-react";

export default function RecoveryStatusCard({ 
  burnoutState = "normal", 
  recoveryDaysCompleted = 0, 
  recoveryDaysRequired = 3, 
  triggerDate,
  recoveryText,
  dailyCheckins = [],
  isDashboard = false
}) {
  const formattedDate = triggerDate 
    ? new Date(triggerDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : "recently";

  // Calculate trailing consecutive stress days (stress >= 4)
  let N = 0;
  if (dailyCheckins && dailyCheckins.length > 0) {
    const sorted = [...dailyCheckins].sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].stressLevel >= 4) N++;
      else break;
    }
  }

  // Define state metadata
  const badgeConfig = {
    normal: {
      label: "All clear",
      bgClass: "bg-tag-lime/15 text-tag-lime border border-tag-lime/40",
      icon: ShieldCheck,
      colorClass: "text-tag-lime",
      bgCircle: "bg-tag-lime/10 border-tag-lime/30",
      message: recoveryText || "No burnout pattern detected — your wellness levels have been stable.",
      footerExplanation: "Recovery resets if stress reaches 4/5 or higher for 5 consecutive days. Keep logging daily check-ins to maintain this status."
    },
    warning: {
      label: "Stress warning",
      bgClass: "bg-tag-tangerine/15 text-tag-tangerine border border-tag-tangerine/40",
      icon: AlertTriangle,
      colorClass: "text-tag-tangerine",
      bgCircle: "bg-tag-tangerine/10 border-tag-tangerine/30",
      message: recoveryText || `Stress has been elevated for ${N} consecutive days. Watch for a developing pattern.`,
      footerExplanation: `If high stress continues for ${Math.max(1, 5 - N)} more days, this will escalate to chronic burnout.`
    },
    chronic: {
      label: "High risk",
      bgClass: "bg-tag-coral/15 text-tag-coral border border-tag-coral/40",
      icon: AlertOctagon,
      colorClass: "text-tag-coral",
      bgCircle: "bg-tag-coral/10 border-tag-coral/30",
      message: recoveryText || `Chronic burnout flagged on ${formattedDate} after sustained high stress.`,
      footerExplanation: `Log ${recoveryDaysRequired} consecutive healthy days to begin recovery.`
    },
    recovering: {
      label: "Recovering",
      bgClass: "bg-tag-tangerine/15 text-tag-tangerine border border-tag-tangerine/40",
      icon: Loader2,
      colorClass: "text-tag-tangerine",
      bgCircle: "bg-tag-tangerine/10 border-tag-tangerine/30",
      message: recoveryText || `Recovering from burnout flagged on ${formattedDate}.`,
      footerExplanation: `${Math.max(0, recoveryDaysRequired - recoveryDaysCompleted)} more healthy day(s) and this will return to 'All clear'.`
    }
  };

  const state = badgeConfig[burnoutState] || badgeConfig.normal;

  // Render simplified view for Dashboard
  if (isDashboard) {
    return (
      <div className="w-full neo-card bg-deep border border-steel/30 rounded-[var(--border-radius-lg)] p-5 flex flex-col justify-between h-full flex-1">
        {/* Top Header */}
        <div className="flex justify-between items-center w-full">
          <p className="text-sm font-medium text-fog">Current state</p>
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${state.bgClass}`}>
            {state.label}
          </span>
        </div>

        {/* Message */}
        <div className="my-4 text-left">
          <p className="text-sm font-light text-fog leading-relaxed">
            {state.message}
          </p>
        </div>

        {/* Link pushed to bottom */}
        <div className="mt-auto pt-3 border-t border-steel/20 w-full text-left">
          <Link to="/dashboard/wellness" className="text-xs text-signal hover:underline flex items-center gap-1 font-semibold">
            View details <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  // Build the Last 7 Days stress history strip for full card
  const last7Days = [];
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    
    const checkin = dailyCheckins?.find(c => new Date(c.date).toDateString() === dateStr);
    
    let status = "none";
    let stress = null;
    if (checkin) {
      stress = checkin.stressLevel;
      if (stress <= 2) status = "healthy";
      else if (stress === 3) status = "elevated";
      else status = "high";
    }
    
    last7Days.push({
      label: daysOfWeek[(d.getDay() + 6) % 7], // Adjust to Mon-Sun
      status,
      stress
    });
  }

  const StateIcon = state.icon;

  return (
    <div className="w-full neo-card bg-deep border border-steel/30 rounded-[var(--border-radius-lg)] p-5 flex flex-col justify-between h-full flex-1 min-h-[250px]">
      {/* Top Header */}
      <div className="flex justify-between items-center w-full">
        <p className="text-sm font-medium text-fog">Current state</p>
        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${state.bgClass}`}>
          {state.label}
        </span>
      </div>

      {/* Center status block */}
      <div className="flex flex-col items-center justify-center text-center my-6 flex-1">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 text-xl border ${state.bgCircle} ${state.colorClass}`}>
          <StateIcon className={`w-6 h-6 ${burnoutState === "recovering" ? "animate-spin" : ""}`} />
        </div>
        <p className="text-sm font-medium text-paper max-w-[260px] leading-relaxed">
          {state.message}
        </p>
        
        {/* If state is "recovering", show progress bar here */}
        {burnoutState === "recovering" && (
          <div className="w-full max-w-[200px] mt-4 space-y-1.5 mx-auto">
            <div className="w-full bg-[#11263b]/50 rounded-full h-[6px] overflow-hidden border border-[#11263b]/20">
              <div 
                className="bg-signal h-[6px] rounded-full transition-all duration-500" 
                style={{ width: `${recoveryDaysRequired > 0 ? Math.min((recoveryDaysCompleted / recoveryDaysRequired) * 100, 100) : 0}%` }}
              />
            </div>
            <span className="text-[11px] text-mist block">{recoveryDaysCompleted}/{recoveryDaysRequired} healthy days</span>
          </div>
        )}
      </div>

      {/* Bottom block - pushed down via margin-top: auto */}
      <div className="mt-auto pt-4 border-t border-steel/20 w-full">
        <p className="text-[10px] font-semibold text-mist uppercase tracking-widest mb-2 text-left">LAST 7 DAYS</p>
        
        <div className="day-strip flex gap-1 h-1.5 w-full">
          {last7Days.map((day, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-sm ${
                day.status === "healthy" ? "bg-tag-lime" :
                day.status === "elevated" ? "bg-tag-tangerine" :
                day.status === "high" ? "bg-tag-coral" :
                "bg-steel/30"
              }`} 
              title={day.stress !== null ? `${day.label}: ${day.stress}/5` : `${day.label}: No check-in`}
            />
          ))}
        </div>
        
        <div className="day-labels flex justify-between text-[10px] text-mist mt-1 px-0.5 select-none">
          {last7Days.map((day, i) => (
            <span key={i} className="flex-1 text-center text-[9px]">{day.label}</span>
          ))}
        </div>
        
        <p className="text-[11px] leading-relaxed text-fog font-light mt-3 text-left">
          {state.footerExplanation}
        </p>
      </div>
    </div>
  );
}
