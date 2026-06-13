import React from "react";

const TAG_COLORS = [
  "#1c6cff", "#00cc4b", "#ff8833", "#00acfe", "#9019e6",
  "#ffcc02", "#ff33aa", "#ea687c", "#94ae43", "#ff4433",
];

function IncomeItem({ budget, colorIdx = 0 }) {
  const accent = TAG_COLORS[colorIdx % TAG_COLORS.length];

  return (
    <div
      className="neo-card"
      style={{ padding: "18px 20px" }}
    >
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
              {budget.totalItem} stream{budget.totalItem !== 1 ? "s" : ""}
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
    </div>
  );
}

export default IncomeItem;
