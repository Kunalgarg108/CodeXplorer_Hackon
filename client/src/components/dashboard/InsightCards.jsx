import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CHEAPER_ALTERNATIVES = {
  starbucks: { alternative: "local cafes or home-brewed coffee", savingPercent: 70, icon: "☕" },
  uber: { alternative: "public transit, carpooling, or bike sharing", savingPercent: 50, icon: "🚗" },
  ola: { alternative: "public transit or local auto/cab options", savingPercent: 50, icon: "🛺" },
  swiggy: { alternative: "cooking at home or enrolling in local mess service", savingPercent: 60, icon: "🍕" },
  zomato: { alternative: "cooking at home or dining in budget local eateries", savingPercent: 60, icon: "🍔" },
  amazon: { alternative: "comparing prices in local markets or waiting for holiday sales", savingPercent: 20, icon: "📦" },
  flipkart: { alternative: "comparing prices on local stores", savingPercent: 20, icon: "🛍️" },
};

export function InsightCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAIInsights();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load financial advice & insights.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center neo-card bg-[#010d1e] border border-steel/30 rounded-2xl">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#1c6cff] border-t-transparent mb-4"></div>
        <p className="font-semibold text-white">Analyzing statement history & transactions...</p>
        <p className="text-xs text-mist mt-1">Generating custom AI insights and checking subscription cycles</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[#ff4433]/10 text-[#ff4433] border border-[#ff4433]/20 rounded-2xl">
        <h3 className="text-lg font-bold mb-2">Error Loading Insights</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-[#ff4433] text-white rounded-xl text-xs font-semibold hover:bg-[#ff4433]/90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { insights = [], subscriptions = [], topMerchants = [], categoryBreakdown = {}, breaches = [], totalSpend = 0 } = data;

  const alternativeSuggestions = [];
  topMerchants.forEach((m) => {
    const lowerName = m.name.toLowerCase();
    for (const [key, val] of Object.entries(CHEAPER_ALTERNATIVES)) {
      if (lowerName.includes(key)) {
        alternativeSuggestions.push({
          merchantName: m.name,
          spent: m.amount,
          alternative: val.alternative,
          savingPercent: val.savingPercent,
          potentialSaving: m.amount * (val.savingPercent / 100),
          icon: val.icon,
        });
        break;
      }
    }
  });

  return (
    <div className="space-y-8 text-left">
      {/* 1. Bullet point AI Insights */}
      <div className="bg-gradient-to-br from-[#001533] to-[#010d1e] border border-steel/30 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#1c6cff]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-[#1c6cff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-xl font-bold tracking-tight font-display">AI Smart Recommendations</h2>
        </div>

        {insights.length === 0 ? (
          <p className="text-sm text-mist">No suggestions compiled. Add transactions to begin analysis.</p>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-150"
              >
                <span className="flex items-center justify-center bg-[#1c6cff]/20 text-[#1c6cff] font-bold rounded-lg h-7 w-7 text-xs flex-shrink-0 mt-0.5 border border-[#1c6cff]/30">
                  {index + 1}
                </span>
                <p className="text-sm md:text-base leading-relaxed text-fog">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Detected Subscriptions */}
        <div className="neo-card bg-[#010d1e] border-steel/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <span>🔄</span> Detected Subscriptions
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1c6cff]/15 text-[#1c6cff] border border-[#1c6cff]/30 uppercase tracking-wider">
              {subscriptions.length} Found
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="py-12 text-center text-mist border-2 border-dashed border-steel/20 rounded-xl bg-[#001533]/20">
              <p className="text-sm">No recurring monthly transactions identified.</p>
              <p className="text-xs text-mist mt-1">We watch for similar amounts recurring every 27-33 days.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub, i) => {
                const yearlyCost = sub.amount * 12;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-steel/30 bg-[#001533]/40 hover:bg-[#001533]/60 hover:border-steel/40 transition duration-150 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-white">{sub.merchantName}</h3>
                      <div className="flex items-center gap-2 text-xs text-mist font-light">
                        <span>{sub.frequency}</span>
                        <span>•</span>
                        <span>
                          Last: {new Date(sub.lastTransactionDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-white text-base">₹{sub.amount.toFixed(0)}/mo</p>
                      <p className="text-xs text-[#ff4433] font-semibold mt-0.5">
                        ₹{yearlyCost.toLocaleString()}/year
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="p-3 bg-[#1c6cff]/10 text-[#1c6cff] text-xs rounded-xl mt-3 flex items-start gap-2 border border-[#1c6cff]/20">
                <span>💡</span>
                <span>
                  <strong>Tip:</strong> Subscriptions consume student budgets quietly. Audit these recurring fees and pause anything you don't use daily.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Alternative Merchant Swaps */}
        <div className="neo-card bg-[#010d1e] border-steel/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6 font-display">
            <span>💡</span> Budget Hacks & Alternatives
          </h2>

          {alternativeSuggestions.length === 0 ? (
            <div className="py-12 text-center text-mist border-2 border-dashed border-steel/20 rounded-xl bg-[#001533]/20">
              <p className="text-sm">No premium merchant alternatives to suggest.</p>
              <p className="text-xs text-mist mt-1">We trigger recommendations when you spend at premium chains like Starbucks, Uber, Zomato, or Swiggy.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alternativeSuggestions.map((swap, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[#00cc4b]/20 bg-[#00cc4b]/5 flex items-start gap-4 hover:border-[#00cc4b]/40 transition duration-150"
                >
                  <span className="text-2xl p-2 bg-[#00cc4b]/10 rounded-xl flex-shrink-0">
                    {swap.icon}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-sm">{swap.merchantName} Swap</h3>
                      <span className="text-[10px] font-bold text-[#00cc4b] bg-[#00cc4b]/20 px-2 py-0.5 rounded-full border border-[#00cc4b]/30 uppercase tracking-wider">
                        Save {swap.savingPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-fog leading-relaxed">
                      Spent: <span className="font-semibold text-white">₹{swap.spent.toLocaleString()}</span>. 
                      Switching to <span className="font-semibold text-[#00cc4b]">{swap.alternative}</span> could save you up to <span className="font-bold text-[#00cc4b]">₹{swap.potentialSaving.toFixed(0)}</span> this month!
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Breaches and Summaries */}
      {breaches.length > 0 && (
        <div className="bg-[#ff4433]/5 border border-[#ff4433]/30 rounded-2xl p-6">
          <h3 className="text-base font-bold text-[#ff4433] mb-4 flex items-center gap-2 font-display">
            <span>🚨</span> Limit Breach Warnings
          </h3>
          <div className="space-y-3">
            {breaches.map((breach, index) => (
              <div key={index} className="flex flex-col md:flex-row justify-between md:items-center p-4 rounded-xl bg-[#010d1e] border border-steel/30 shadow-sm text-sm">
                <div>
                  <span className="font-bold text-white">{breach.category}</span>
                  <span className="text-mist mx-2">•</span>
                  <span className="text-fog">Spent: ₹{breach.currentSpent.toLocaleString()} of ₹{breach.thresholdAmount.toLocaleString()}</span>
                </div>
                <div className="text-[#ff4433] font-bold mt-1 md:mt-0">
                  Over limit by ₹{breach.excess.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InsightCards;
