import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartStyle = {
  background: "#010d1e",
  border: "1px solid rgba(17,38,59,0.4)",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 100,
};

export default function BarChartDashboard({ budgetList }) {
  return (
    <div className="neo-card">
      <p className="eyebrow text-xs mb-4">Activity</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={budgetList} margin={{ top: 7 }}>
          <XAxis dataKey="name" tick={{ fill: "#ccced0", fontSize: 11, fontWeight: 100 }} axisLine={{ stroke: "#11263b" }} tickLine={false} />
          <YAxis tick={{ fill: "#999ca1", fontSize: 11, fontWeight: 100 }} axisLine={{ stroke: "#11263b" }} tickLine={false} />
          <Tooltip contentStyle={chartStyle} />
          <Legend wrapperStyle={{ color: "#ccced0", fontSize: 12, fontWeight: 100 }} />
          <Bar dataKey="totalSpend" name="Spend" stackId="a" fill="#1c6cff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="amount" name="Budget" stackId="a" fill="#00215e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
