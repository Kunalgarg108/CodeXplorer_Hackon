import React from "react";
import SmartBudgetAlerts from "@/components/dashboard/SmartBudgetAlerts";
import AiFinancialChat from "@/components/dashboard/AiFinancialChat";

export default function PocketBuddy() {
  return (
    <div className="p-6 md:p-10">
      <p className="eyebrow text-xs mb-3">AI Assistant</p>
      <h2 className="font-display font-bold text-[42px] leading-tight text-white mb-2">
        Pocket Buddy AI
      </h2>
      <p className="text-[18px] font-normal text-white/80 mb-10 max-w-2xl">
        AI-powered financial and wellness assistant for students.
      </p>

      {/* Two-column layout: Chat 70% | Alerts 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 items-start">
        {/* Left: AI Financial Chat */}
        <AiFinancialChat />

        {/* Right: Smart Budget Alerts */}
        <SmartBudgetAlerts />
      </div>
    </div>
  );
}
