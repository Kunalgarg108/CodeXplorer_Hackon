import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartStyle = {
  background: "#010d1e",
  border: "1px solid rgba(17,38,59,0.4)",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 100,
};

const renderLegendText = (value) => {
  return <span className="text-fog font-medium ml-1.5">{value}</span>;
};

export default function BarChartDashboard({ budgetList, height = 220 }) {
  return (
    <div className="neo-card">
      <p className="text-sm md:text-base font-semibold text-paper mb-4">Activity</p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={budgetList} margin={{ top: 7 }}>
          <XAxis dataKey="name" tick={{ fill: "#ccced0", fontSize: 11, fontWeight: 100 }} axisLine={{ stroke: "#11263b" }} tickLine={false} />
          <YAxis tick={{ fill: "#999ca1", fontSize: 11, fontWeight: 100 }} axisLine={{ stroke: "#11263b" }} tickLine={false} />
          <Tooltip contentStyle={chartStyle} />
          <Legend formatter={renderLegendText} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="totalSpend" name="Spend" stackId="a" fill="#1c6cff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="amount" name="Budget" stackId="a" fill="#10316b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
