import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

const COLORS = [
  "#1c6cff", // neon blue
  "#00cc4b", // neon green
  "#ff4433", // neon red
  "#ff8833", // neon orange
  "#bb8fce", // violet
  "#f7dc6f", // yellow
  "#4ecdc4", // turquoise
  "#f8b88b", // peach
  "#98d8c8", // light green
];

export function AnalyticsDashboard({ filters = "" }) {
  const { format } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, trendsData] = await Promise.all([
        api.getAnalyticsSummary(filters),
        api.getAnalyticsTrends(
          `${filters}${filters ? "&" : "?"}granularity=daily`
        ),
      ]);
      setSummary(summaryData);
      setTrends(trendsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 neo-card">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-[#ff4433]/10 border border-[#ff4433]/20 text-[#ff4433]">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center text-fog py-12 neo-card">
        No data available for the selected period
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Total Spent",
      value: format(summary.stats.totalSpent || 0),
      color: "text-[#ff4433]",
      bg: "bg-[#ff4433]/10 border border-[#ff4433]/20",
    },
    {
      label: "Total Received",
      value: format(summary.stats.totalReceived || 0),
      color: "text-[#00cc4b]",
      bg: "bg-[#00cc4b]/10 border border-[#00cc4b]/20",
    },
    {
      label: "Net Spend",
      value: format(summary.stats.netSpend || 0),
      color: summary.stats.netSpend > 0 ? "text-[#ff8833]" : "text-[#00cc4b]",
      bg: summary.stats.netSpend > 0 ? "bg-[#ff8833]/10 border border-[#ff8833]/20" : "bg-[#00cc4b]/10 border border-[#00cc4b]/20",
    },
    {
      label: "Transactions",
      value: summary.stats.transactionCount || 0,
      color: "text-[#1c6cff]",
      bg: "bg-[#1c6cff]/10 border border-[#1c6cff]/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className={`${card.bg} rounded-2xl p-5`}>
            <p className="text-xs font-semibold text-fog mb-1 uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card">
          <h3 className="text-lg font-bold text-white mb-6 font-display">Spending by Category</h3>
          {summary.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary.byCategory.map((item) => ({
                    name: item.category,
                    value: item.amount,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#010d1e"
                  strokeWidth={2}
                >
                  {summary.byCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#010d1e', borderColor: '#11263b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => format(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-fog">
              No category data
            </div>
          )}
        </div>

        <div className="neo-card">
          <h3 className="text-lg font-bold text-white mb-6 font-display">Top Merchants</h3>
          {summary.topMerchants.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.topMerchants}>
                <CartesianGrid stroke="#11263b" strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="merchant"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  stroke="#11263b"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#11263b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#010d1e', borderColor: '#11263b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => format(value)}
                />
                <Bar dataKey="amount" fill="#1c6cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-fog">
              No merchant data
            </div>
          )}
        </div>
      </div>

      <div className="neo-card">
        <h3 className="text-lg font-bold text-white mb-6 font-display">Spending Trend</h3>
        {trends?.trends && trends.trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.trends}>
              <CartesianGrid stroke="#11263b" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#11263b" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#11263b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#010d1e', borderColor: '#11263b', borderRadius: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value) => format(value)}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#ff4433"
                strokeWidth={2.5}
                dot={{ r: 4, stroke: '#010d1e', strokeWidth: 1 }}
                name="Spent"
              />
              <Line
                type="monotone"
                dataKey="received"
                stroke="#00cc4b"
                strokeWidth={2.5}
                dot={{ r: 4, stroke: '#010d1e', strokeWidth: 1 }}
                name="Received"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-fog">
            No trend data
          </div>
        )}
      </div>

      <div className="neo-card">
        <h3 className="text-lg font-bold text-white mb-6 font-display">Category Breakdown</h3>
        <div className="divide-y divide-[#11263b]/30">
          {summary.byCategory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-sm font-semibold text-paper">{item.category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">
                  {format(item.amount)}
                </p>
                <p className="text-xs text-fog mt-0.5">
                  {item.count} transactions
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
