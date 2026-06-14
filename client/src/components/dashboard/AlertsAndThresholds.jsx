import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Health & Fitness",
  "Education",
  "Personal",
  "Miscellaneous",
];

export function AlertsAndThresholds() {
  const [thresholds, setThresholds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    thresholdAmount: "",
    warningPercentage: 90,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [thresholdsRes, alertsRes] = await Promise.all([
        api.getThresholds(),
        api.getAlerts(),
      ]);
      setThresholds(thresholdsRes.thresholds || []);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      toast.error(err.message || "Failed to load budget thresholds.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.thresholdAmount || isNaN(form.thresholdAmount) || Number(form.thresholdAmount) <= 0) {
      toast.error("Please enter a valid threshold amount.");
      return;
    }

    try {
      if (editingId) {
        const existing = thresholds.find((t) => t.id === editingId);
        await api.updateThreshold(editingId, {
          thresholdAmount: Number(form.thresholdAmount),
          warningPercentage: Number(form.warningPercentage),
        });
        toast.success(`Updated limit for ${existing?.category || "category"}.`);
      } else {
        await api.createThreshold({
          category: form.category,
          thresholdAmount: Number(form.thresholdAmount),
          warningPercentage: Number(form.warningPercentage),
        });
        toast.success(`Created spending limit for ${form.category}.`);
      }
      setForm({ category: CATEGORIES[0], thresholdAmount: "", warningPercentage: 90 });
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save threshold limit.");
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({
      category: t.category,
      thresholdAmount: t.thresholdAmount,
      warningPercentage: t.warningPercentage,
    });
  };

  const handleDelete = async (id, category) => {
    if (!window.confirm(`Are you sure you want to remove the limit for ${category}?`)) return;
    try {
      await api.deleteThreshold(id);
      toast.success(`Deleted limit for ${category}.`);
      if (editingId === id) {
        setEditingId(null);
        setForm({ category: CATEGORIES[0], thresholdAmount: "", warningPercentage: 90 });
      }
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete threshold.");
    }
  };

  const handleToggleActive = async (t) => {
    try {
      await api.updateThreshold(t.id, { isActive: !t.isActive });
      toast.success(`${t.isActive ? "Disabled" : "Enabled"} limit for ${t.category}.`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to toggle active status.");
    }
  };

  const handleDismissAlert = async (id) => {
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      toast.success("Alert dismissed.");
    } catch (err) {
      toast.error(err.message || "Failed to dismiss alert.");
    }
  };

  const handleMarkAlertRead = async (id) => {
    try {
      await api.markAlertRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
      toast.success("Alert marked as read.");
    } catch (err) {
      toast.error(err.message || "Failed to mark alert as read.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Alerts Banners */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4433] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff4433]"></span>
            </span>
            Active Spending Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden bg-[#010d1e] flex flex-col justify-between shadow-neo ${
                  alert.alertType === "THRESHOLD_EXCEEDED"
                    ? "border-[#ff4433]/50 bg-gradient-to-br from-[#ff4433]/10 to-transparent"
                    : "border-[#ff8833]/50 bg-gradient-to-br from-[#ff8833]/10 to-transparent"
                } ${alert.isRead ? "opacity-60" : ""}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                        alert.alertType === "THRESHOLD_EXCEEDED"
                          ? "bg-[#ff4433]/20 text-[#ff4433] border-[#ff4433]/30"
                          : "bg-[#ff8833]/20 text-[#ff8833] border-[#ff8833]/30"
                      }`}
                    >
                      {alert.alertType === "THRESHOLD_EXCEEDED" ? "Limit Exceeded" : "Warning"}
                    </span>
                    <span className="text-xs text-mist font-light">
                      {new Date(alert.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 font-display">{alert.alertTitle}</h3>
                  <p className="text-sm text-fog font-light mb-4 leading-relaxed">{alert.alertMessage}</p>
                </div>

                <div className="flex items-center gap-4 mt-auto pt-2 border-t border-steel/20">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAlertRead(alert._id)}
                      className="text-xs font-semibold text-[#1c6cff] hover:text-white transition"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDismissAlert(alert._id)}
                    className="text-xs font-semibold text-mist hover:text-[#ff4433] transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Budget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Set Limit Form */}
        <div className="lg:col-span-1 neo-card bg-[#010d1e] border-steel/30 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 font-display">
            {editingId ? "Edit Spending Limit" : "Set Spending Limit"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                disabled={!!editingId}
                className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition disabled:opacity-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">
                Monthly Limit Amount (₹)
              </label>
              <input
                type="number"
                name="thresholdAmount"
                placeholder="e.g. 5000"
                value={form.thresholdAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition placeholder-steel/70"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-fog uppercase tracking-wider">
                  Warning Threshold
                </label>
                <span className="text-sm font-bold text-[#1c6cff]">
                  {form.warningPercentage}%
                </span>
              </div>
              <input
                type="range"
                name="warningPercentage"
                min="50"
                max="100"
                value={form.warningPercentage}
                onChange={handleInputChange}
                className="w-full h-2 bg-steel/30 rounded-lg appearance-none cursor-pointer accent-[#1c6cff]"
              />
              <span className="text-xs text-mist block mt-1">
                Warn me when spending reaches {form.warningPercentage}% of the limit.
              </span>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#1c6cff] hover:bg-[#1c6cff]/90 text-white font-semibold rounded-xl text-sm transition"
              >
                {editingId ? "Save Changes" : "Set Limit"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ category: CATEGORIES[0], thresholdAmount: "", warningPercentage: 90 });
                  }}
                  className="px-4 py-2.5 bg-steel/30 hover:bg-steel/50 text-fog font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Limits List & Progress Bars */}
        <div className="lg:col-span-2 neo-card bg-[#010d1e] border-steel/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 font-display">Active Category Limits</h2>
          {loading && thresholds.length === 0 ? (
            <div className="py-12 text-center text-mist">Loading your category limits...</div>
          ) : thresholds.length === 0 ? (
            <div className="py-12 text-center text-mist border-2 border-dashed border-steel/20 rounded-xl bg-[#001533]/20">
              No category spending limits set yet. Use the form to establish your first monthly limit!
            </div>
          ) : (
            <div className="space-y-6">
              {thresholds.map((t) => {
                const isExceeded = t.currentSpent >= t.thresholdAmount;
                const isWarning =
                  !isExceeded &&
                  t.currentSpent >= (t.thresholdAmount * t.warningPercentage) / 100;
                
                let progressColor = "bg-[#00cc4b]";
                let badgeStyle = "bg-[#00cc4b]/10 text-[#00cc4b] border-[#00cc4b]/30";
                let statusText = "Good";

                if (isExceeded) {
                  progressColor = "bg-[#ff4433]";
                  badgeStyle = "bg-[#ff4433]/10 text-[#ff4433] border-[#ff4433]/30";
                  statusText = "Exceeded";
                } else if (isWarning) {
                  progressColor = "bg-[#ff8833]";
                  badgeStyle = "bg-[#ff8833]/10 text-[#ff8833] border-[#ff8833]/30";
                  statusText = "Warning";
                }

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border transition-all ${
                      t.isActive 
                        ? "bg-[#001533]/40 border-steel/30" 
                        : "bg-[#000814]/30 border-steel/10 opacity-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-display">{t.category}</h3>
                          {t.isActive && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle}`}>
                              {statusText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-mist font-light mt-0.5">
                          Limit: ₹{t.thresholdAmount.toLocaleString()} / month (Warn at {t.warningPercentage}%)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(t)}
                          title={t.isActive ? "Deactivate limit" : "Activate limit"}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition duration-150 ${
                            t.isActive
                              ? "bg-steel/30 hover:bg-steel/50 text-fog border-steel/40"
                              : "bg-[#1c6cff]/15 hover:bg-[#1c6cff]/30 text-[#1c6cff] border-[#1c6cff]/30"
                          }`}
                        >
                          {t.isActive ? "Pause" : "Resume"}
                        </button>
                        <button
                          onClick={() => handleEdit(t)}
                          disabled={!t.isActive}
                          className="p-1.5 hover:bg-steel/30 border border-steel/40 hover:border-steel/60 rounded-lg text-mist hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.category)}
                          className="p-1.5 hover:bg-[#ff4433]/15 border border-steel/40 hover:border-[#ff4433]/50 rounded-lg text-mist hover:text-[#ff4433] transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-steel/30 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(t.percentageUsed, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-fog font-medium">
                          Spent: ₹{t.currentSpent.toLocaleString()}
                        </span>
                        <span className="text-white">
                          {t.percentageUsed.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsAndThresholds;
