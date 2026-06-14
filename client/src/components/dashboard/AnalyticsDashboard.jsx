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

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B88B",
];

export function AnalyticsDashboard({ filters = "" }) {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center text-gray-500 py-8">
        No data available for the selected period
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Total Spent",
      value: `₹${summary.stats.totalSpent?.toFixed(2) || "0.00"}`,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Total Received",
      value: `₹${summary.stats.totalReceived?.toFixed(2) || "0.00"}`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Net Spend",
      value: `₹${summary.stats.netSpend?.toFixed(2) || "0.00"}`,
      color: summary.stats.netSpend > 0 ? "text-orange-600" : "text-green-600",
      bg: summary.stats.netSpend > 0 ? "bg-orange-50" : "bg-green-50",
    },
    {
      label: "Transactions",
      value: summary.stats.transactionCount || 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className={`${card.bg} rounded-lg p-4`}>
            <p className="text-sm text-gray-600 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
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
                >
                  {summary.byCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Top Merchants</h3>
          {summary.topMerchants.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.topMerchants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="merchant"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No merchant data
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
        {trends?.trends && trends.trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#FF6B6B"
                strokeWidth={2}
                name="Spent"
              />
              <Line
                type="monotone"
                dataKey="received"
                stroke="#4ECDC4"
                strokeWidth={2}
                name="Received"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="space-y-2">
          {summary.byCategory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-sm">{item.category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ₹{item.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
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
