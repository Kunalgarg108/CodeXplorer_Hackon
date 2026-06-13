import React, { useEffect, useState } from "react";
import { PiggyBank, ReceiptText, Wallet, Sparkles, CircleDollarSign } from "lucide-react";
import formatNumber from "@/utils/formatNumber";
import { api } from "@/lib/api";

export default function CardInfo({ budgetList, incomeList, onlyAdvice, onlyCards }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [financialAdvice, setFinancialAdvice] = useState("");

  useEffect(() => {
    if (budgetList.length > 0 || incomeList.length > 0) {
      let totalBudget_ = 0;
      let totalSpend_ = 0;
      let totalIncome_ = 0;
      budgetList.forEach((element) => {
        totalBudget_ += Number(element.amount);
        totalSpend_ += element.totalSpend || 0;
      });
      incomeList.forEach((element) => {
        totalIncome_ += element.totalAmount || Number(element.amount) || 0;
      });
      setTotalIncome(totalIncome_);
      setTotalBudget(totalBudget_);
      setTotalSpend(totalSpend_);
    }
  }, [budgetList, incomeList]);

  useEffect(() => {
    if (onlyCards) return; // Prevent duplicate advice API calls in cards-only instances

    if (totalBudget > 0 || totalIncome > 0 || totalSpend > 0) {
      api.getAdvice({ totalBudget, totalIncome, totalSpend })
        .then((data) => setFinancialAdvice(data.advice))
        .catch(() => setFinancialAdvice("Unable to load financial advice."));
    }
  }, [totalBudget, totalIncome, totalSpend, onlyCards]);

  const statCards = [
    { label: "Total Budget", value: `$${formatNumber(totalBudget)}`, icon: PiggyBank },
    { label: "Total Spend", value: `$${formatNumber(totalSpend)}`, icon: ReceiptText },
    { label: "No. Of Budget", value: budgetList?.length, icon: Wallet },
    { label: "Sum of Income Streams", value: `$${formatNumber(totalIncome)}`, icon: CircleDollarSign },
  ];

  if (onlyAdvice) {
    if (budgetList?.length === 0) return null;
    return (
      <div className="neo-card-glow mt-6 -mb-1 flex items-center justify-between">
        <div>
          <div className="flex mb-2 items-center gap-2">
            <p className="eyebrow text-xs">Finan Smart AI</p>
            <Sparkles className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo" />
          </div>
          <p className="body-thin text-fog text-sm md:text-base">{financialAdvice || "Loading financial advice..."}</p>
        </div>
      </div>
    );
  }

  if (onlyCards) {
    return (
      <div>
        {budgetList?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {statCards.map((card) => (
              <div key={card.label} className="neo-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-mist font-thin uppercase tracking-wider">{card.label}</p>
                  <p className="font-display font-semibold text-2xl text-paper mt-1">{card.value}</p>
                </div>
                <card.icon className="icon-well" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-[110px] w-full skeleton-pulse" />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback default full rendering (if props not provided)
  return (
    <div>
      {budgetList?.length > 0 ? (
        <div>
          <div className="neo-card-glow mt-6 -mb-1 flex items-center justify-between">
            <div>
              <div className="flex mb-2 items-center gap-2">
                <p className="eyebrow text-xs">Finan Smart AI</p>
                <Sparkles className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo" />
              </div>
              <p className="body-thin text-fog text-sm md:text-base">{financialAdvice || "Loading financial advice..."}</p>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {statCards.map((card) => (
              <div key={card.label} className="neo-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-mist font-thin uppercase tracking-wider">{card.label}</p>
                  <p className="font-display font-semibold text-2xl text-paper mt-1">{card.value}</p>
                </div>
                <card.icon className="icon-well" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[110px] w-full skeleton-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
