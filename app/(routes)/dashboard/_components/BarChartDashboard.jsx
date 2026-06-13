import React from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const customTooltipStyle = {
  backgroundColor: "var(--color-indigo-surface)",
  border: "1px solid rgba(17,38,59,0.8)",
  borderRadius: "12px",
  color: "var(--color-paper-white)",
  fontSize: "13px",
  fontWeight: 300,
};

function BarChartDashboard({ budgetList }) {
  return (
    <div className="neo-card mb-5">
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--color-paper-white)",
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Activity Overview
      </h2>
      <ResponsiveContainer width={"100%"} height={280}>
        <BarChart
          data={budgetList}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-mist)", fontSize: 11, fontWeight: 300 }}
            axisLine={{ stroke: "rgba(17,38,59,0.8)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-mist)", fontSize: 11, fontWeight: 300 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={customTooltipStyle}
            cursor={{ fill: "rgba(28,108,255,0.05)" }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              color: "var(--color-fog)",
              fontWeight: 300,
            }}
          />
          <Bar
            dataKey="totalSpend"
            name="Spent"
            stackId="a"
            fill="#1c6cff"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="amount"
            name="Budget"
            stackId="a"
            fill="rgba(28,108,255,0.25)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartDashboard;
