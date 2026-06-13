import Link from "next/link";
import React from "react";

// Tag colors cycle for budget items
const TAG_COLORS = [
  "#1c6cff", "#ff4433", "#00cc4b", "#ff8833", "#ff33aa",
  "#9019e6", "#ffcc02", "#00acfe", "#ea687c", "#94ae43",
];

function BudgetItem({ budget, colorIdx }) {
  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };

  const perc = calculateProgressPerc();
  const isDanger = perc >= 90;
  const accent = TAG_COLORS[colorIdx ?? 0];

  return (
    <Link href={"/dashboard/expenses/" + budget?.id}>
      <div
        className="neo-card cursor-pointer"
        style={{ padding: "18px 20px" }}
      >
        {/* Header row */}
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                background: `${accent}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              {budget?.icon}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "var(--color-paper-white)",
                  marginBottom: "2px",
                }}
              >
                {budget.name}
              </p>
              <p style={{ fontSize: "11px", color: "var(--color-mist)", fontWeight: 300 }}>
                {budget.totalItem} item{budget.totalItem !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              color: accent,
            }}
          >
            ${budget.amount}
          </span>
        </div>

        {/* Progress */}
        <div style={{ marginTop: "14px" }}>
          <div className="flex justify-between mb-2">
            <span style={{ fontSize: "11px", color: "var(--color-mist)", fontWeight: 300 }}>
              ${budget.totalSpend ?? 0} spent
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-mist)", fontWeight: 300 }}>
              ${budget.amount - (budget.totalSpend ?? 0)} left
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill${isDanger ? " danger" : ""}`}
              style={{
                width: `${perc}%`,
                background: isDanger ? "var(--color-tag-coral)" : accent,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BudgetItem;
