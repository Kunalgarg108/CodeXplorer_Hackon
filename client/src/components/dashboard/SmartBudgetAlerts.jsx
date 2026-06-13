import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Flame,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

const priorityConfig = {
  high: {
    border: "border-[#ff4433]/50",
    bg: "bg-[#ff4433]/8",
    text: "text-[#ff6655]",
    icon: AlertTriangle,
    badge: "bg-[#ff4433] text-white shadow-[0_0_10px_rgba(255,68,51,0.3)]",
  },
  medium: {
    border: "border-[#ff8833]/50",
    bg: "bg-[#ff8833]/8",
    text: "text-[#ffaa55]",
    icon: Flame,
    badge: "bg-[#ff8833] text-white shadow-[0_0_10px_rgba(255,136,51,0.3)]",
  },
  low: {
    border: "border-signal/40",
    bg: "bg-signal/5",
    text: "text-signal",
    icon: Lightbulb,
    badge: "bg-signal/20 text-signal",
  },
};

const typeIcons = {
  overspend: AlertTriangle,
  approaching_limit: TrendingUp,
  burn_rate: Flame,
  weekly_spike: TrendingUp,
  savings_tip: PiggyBank,
};

export default function SmartBudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.getBudgetAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error("Failed to fetch budget alerts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-steel/30 bg-deep/80 backdrop-blur-sm p-6 space-y-3">
        <div className="h-5 w-40 skeleton-pulse rounded" />
        <div className="h-24 skeleton-pulse rounded-xl" />
        <div className="h-24 skeleton-pulse rounded-xl" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-steel/30 bg-deep/80 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-signal" />
          <h3 className="font-display font-bold text-[24px] text-white">
            Budget Alerts
          </h3>
        </div>
        <p className="text-[15px] text-white/50 font-thin">
          No alerts right now — your budgets look healthy! 🎉
        </p>
      </div>
    );
  }

  const highCount = alerts.filter((a) => a.priority === "high").length;
  const medCount = alerts.filter((a) => a.priority === "medium").length;

  return (
    <div className="rounded-2xl border border-steel/30 bg-gradient-to-b from-deep/90 to-midnight/80 backdrop-blur-sm p-6 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[24px] text-white">
            Smart Alerts
          </h3>
          <p className="text-[13px] text-white/50 font-thin mt-1">
            {highCount > 0 && (
              <span className="text-[#ff6655] font-medium">{highCount} critical</span>
            )}
            {highCount > 0 && medCount > 0 && " · "}
            {medCount > 0 && (
              <span className="text-[#ffaa55] font-medium">{medCount} warning</span>
            )}
            {(highCount > 0 || medCount > 0) && " · "}
            {alerts.length} total
          </p>
        </div>
        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className="text-white/40 hover:text-white transition-all p-2 rounded-lg hover:bg-indigo/30"
          title="Refresh alerts"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const config = priorityConfig[alert.priority] || priorityConfig.low;
          const TypeIcon = typeIcons[alert.type] || config.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.01 }}
              className={`rounded-xl border ${config.border} ${config.bg} p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]`}
            >
              <div className="flex items-start gap-3">
                <TypeIcon className={`w-4 h-4 mt-0.5 shrink-0 ${config.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.badge}`}
                    >
                      {alert.priority}
                    </span>
                    {alert.budgetName && (
                      <span className="text-[11px] text-white/40 font-thin">
                        {alert.budgetName}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] text-white font-thin leading-relaxed">
                    {alert.message}
                  </p>
                  {alert.action && (
                    <p className="text-[14px] text-white/60 font-thin mt-2 flex items-start gap-2">
                      <span className="text-signal shrink-0">→</span>
                      {alert.action}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
