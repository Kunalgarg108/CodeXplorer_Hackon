import formatNumber from "@/utils";
import getFinancialAdvice from "@/utils/getFinancialAdvice";
import {
  PiggyBank,
  ReceiptText,
  Wallet,
  Sparkles,
  CircleDollarSign,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Copilot Money color tokens mapped to stat cards
const STAT_COLORS = [
  { accent: "#1c6cff", bg: "rgba(28,108,255,0.12)" },
  { accent: "#ff4433", bg: "rgba(255,68,51,0.12)" },
  { accent: "#00cc4b", bg: "rgba(0,204,75,0.12)" },
  { accent: "#00acfe", bg: "rgba(0,172,254,0.12)" },
];

function StatCard({ label, value, icon: Icon, colorIdx = 0 }) {
  const { accent, bg } = STAT_COLORS[colorIdx % STAT_COLORS.length];
  return (
    <div
      className="neo-card flex items-center justify-between"
      style={{ minHeight: 100 }}
    >
      <div>
        <p style={{ color: "var(--color-mist)", fontSize: "12px", fontWeight: 300, marginBottom: 6 }}>
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--color-paper-white)",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>
    </div>
  );
}

function CardInfo({ budgetList, incomeList }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [financialAdvice, setFinancialAdvice] = useState("");

  useEffect(() => {
    if (budgetList.length > 0 || incomeList.length > 0) {
      CalculateCardInfo();
    }
  }, [budgetList, incomeList]);

  useEffect(() => {
    if (totalBudget > 0 || totalIncome > 0 || totalSpend > 0) {
      const fetchFinancialAdvice = async () => {
        const advice = await getFinancialAdvice(totalBudget, totalIncome, totalSpend);
        setFinancialAdvice(advice);
      };
      fetchFinancialAdvice();
    }
  }, [totalBudget, totalIncome, totalSpend]);

  const CalculateCardInfo = () => {
    let totalBudget_ = 0;
    let totalSpend_ = 0;
    let totalIncome_ = 0;

    budgetList.forEach((element) => {
      totalBudget_ += Number(element.amount);
      totalSpend_ += element.totalSpend;
    });

    incomeList.forEach((element) => {
      totalIncome_ += element.totalAmount;
    });

    setTotalIncome(totalIncome_);
    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
  };

  return (
    <div>
      {budgetList?.length > 0 ? (
        <div>
          {/* AI Advice Card */}
          <div
            className="neo-card mt-4 mb-5 flex items-start gap-4"
            style={{ background: "var(--color-indigo-surface)" }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ff4433, #ff33aa, #9019e6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} style={{ color: "#fff" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--color-paper-white)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  FinanSmart AI
                </span>
              </div>
              <p style={{ color: "var(--color-fog)", fontSize: "14px", fontWeight: 300, lineHeight: 1.6 }}>
                {financialAdvice || "Analyzing your financial data…"}
              </p>
            </div>
          </div>

          {/* Stat cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Budget" value={`$${formatNumber(totalBudget)}`} icon={PiggyBank} colorIdx={0} />
            <StatCard label="Total Spent" value={`$${formatNumber(totalSpend)}`} icon={ReceiptText} colorIdx={1} />
            <StatCard label="No. of Budgets" value={budgetList?.length} icon={Wallet} colorIdx={2} />
            <StatCard label="Total Income" value={`$${formatNumber(totalIncome)}`} icon={CircleDollarSign} colorIdx={3} />
          </div>
        </div>
      ) : (
        <div>
          {/* AI advice skeleton */}
          <div className="skeleton-dark mt-4 mb-5" style={{ height: 80 }} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton-dark" style={{ height: 100 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CardInfo;
