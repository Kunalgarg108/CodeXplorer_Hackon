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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const priorityConfig = {
  high: {
    border: "border-[#ff4433]/60",
    bg: "bg-[#ff4433]/10",
    text: "text-tag-coral",
    icon: AlertTriangle,
    badge: "bg-[#ff4433] text-white",
  },
  medium: {
    border: "border-[#ff8833]/60",
    bg: "bg-[#ff8833]/10",
    text: "text-tag-tangerine",
    icon: Flame,
    badge: "bg-[#ff8833] text-white",
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
  const [expanded, setExpanded] = useState(true);
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
      <div className="neo-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 skeleton-pulse rounded" />
          <div className="h-4 w-32 skeleton-pulse rounded" />
        </div>
        <div className="h-16 skeleton-pulse rounded-btn" />
        <div className="h-16 skeleton-pulse rounded-btn" />
      </div>
    );
  }

  if (alerts.length === 0) return null;

  const highCount = alerts.filter((a) => a.priority === "high").length;
  const medCount = alerts.filter((a) => a.priority === "medium").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-card border-l-4 border-signal/60 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-btn bg-signal/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-signal" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-paper">
              Smart Budget Alerts
            </h3>
            <p className="text-[10px] text-mist font-thin">
              {highCount > 0 && (
                <span className="text-tag-coral font-medium">{highCount} critical</span>
              )}
              {highCount > 0 && medCount > 0 && " · "}
              {medCount > 0 && (
                <span className="text-tag-tangerine font-medium">{medCount} warning</span>
              )}
              {(highCount > 0 || medCount > 0) && " · "}
              {alerts.length} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="text-mist hover:text-white transition-colors p-1.5 rounded-btn hover:bg-indigo/40"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-mist hover:text-white transition-colors p-1.5 rounded-btn hover:bg-indigo/40"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            {alerts.map((alert, index) => {
              const config = priorityConfig[alert.priority] || priorityConfig.low;
              const TypeIcon = typeIcons[alert.type] || config.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-btn border ${config.border} ${config.bg} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <TypeIcon className={`w-4 h-4 mt-0.5 shrink-0 ${config.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.badge}`}
                        >
                          {alert.priority}
                        </span>
                        {alert.budgetName && (
                          <span className="text-[10px] text-mist font-thin">
                            {alert.budgetName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-paper font-thin leading-relaxed">
                        {alert.message}
                      </p>
                      {alert.action && (
                        <p className="text-xs text-fog font-thin mt-1.5 flex items-start gap-1.5">
                          <span className="text-signal shrink-0">→</span>
                          {alert.action}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
