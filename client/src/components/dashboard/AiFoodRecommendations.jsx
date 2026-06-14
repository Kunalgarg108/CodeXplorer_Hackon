import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils, RefreshCw, Star, Filter, ArrowUpDown,
  Wallet, HeartPulse, BookOpen, Zap, Moon, Smile, Dumbbell,
  Sparkles,
} from "lucide-react";

// Badge definitions
const BADGES = {
  budget: { emoji: "💰", label: "Budget Friendly", tip: "Costs significantly less than your daily spending limit.", icon: Wallet },
  wellness: { emoji: "❤️", label: "Wellness Friendly", tip: "Recommended using your wellness profile.", icon: HeartPulse },
  exam: { emoji: "📚", label: "Exam Friendly", tip: "Supports concentration during exam preparation.", icon: BookOpen },
  energy: { emoji: "⚡", label: "Energy Boosting", tip: "Provides sustained energy for studying.", icon: Zap },
  stress: { emoji: "😊", label: "Stress Relief", tip: "Matches your stress and craving profile.", icon: Smile },
  sleep: { emoji: "🌙", label: "Sleep Friendly", tip: "Lighter option suitable for recovery.", icon: Moon },
  protein: { emoji: "💪", label: "High Protein", tip: "Supports focus and long study sessions.", icon: Dumbbell },
};

const getBadges = (item) => {
  const badges = [];
  if (item.budgetScore >= 40) badges.push("budget");
  if (item.wellnessScore >= 35) badges.push("wellness");
  const n = (item.name || "").toLowerCase();
  const c = (item.category || "").toLowerCase();
  const energy = ["juice", "smoothie", "fruit", "banana", "oats", "egg", "idli", "poha"];
  const exam = ["salad", "fruit", "oats", "dosa", "idli", "poha", "upma"];
  const stress = ["burger", "pizza", "sandwich", "noodle", "pasta", "fries", "momos", "roll", "wrap"];
  const sleep = ["soup", "salad", "tea", "toast", "light"];
  const protein = ["egg", "chicken", "paneer", "dal", "soya", "protein", "tuna", "fish"];

  if (energy.some((k) => n.includes(k) || c.includes(k))) badges.push("energy");
  if (exam.some((k) => n.includes(k) || c.includes(k))) badges.push("exam");
  if (stress.some((k) => n.includes(k) || c.includes(k))) badges.push("stress");
  if (sleep.some((k) => n.includes(k) || c.includes(k))) badges.push("sleep");
  if (protein.some((k) => n.includes(k) || c.includes(k))) badges.push("protein");
  return [...new Set(badges)].slice(0, 4);
};

const getScoreBarColor = (score) => {
  if (score >= 90) return "bg-tag-lime";
  if (score >= 70) return "bg-signal";
  if (score >= 50) return "bg-[#ff8833]";
  return "bg-tag-coral";
};

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 ${
      active
        ? "border-signal/60 bg-signal/15 text-white shadow-[0_0_8px_rgba(28,108,255,0.15)]"
        : "border-steel/30 bg-indigo/10 text-white/60 hover:border-signal/40 hover:text-white/80"
    }`}
  >
    {children}
  </button>
);

const Tooltip = ({ children, tip }) => {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-deep border border-steel/40 text-[11px] text-white/80 font-thin whitespace-nowrap z-50 shadow-lg"
          >
            {tip}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

const SORT_OPTIONS = [
  { key: "score", label: "Highest Score" },
  { key: "price_asc", label: "Lowest Price" },
  { key: "wellness", label: "Wellness Match" },
  { key: "budget", label: "Budget Match" },
];

const CATEGORY_OPTIONS = ["Snacks", "South Indian", "North Indian", "Beverages", "Healthy", "Desserts", "Fast Food"];

const WELLNESS_OPTIONS = [
  { key: "exam", label: "Exam Friendly", emoji: "📚" },
  { key: "stress", label: "Stress Relief", emoji: "😊" },
  { key: "sleep", label: "Sleep Friendly", emoji: "🌙" },
  { key: "energy", label: "Energy Boosting", emoji: "⚡" },
  { key: "protein", label: "High Protein", emoji: "💪" },
  { key: "budget", label: "Budget Friendly", emoji: "💰" },
];

export default function AiFoodRecommendations() {
  const { format } = useCurrency();
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);

  // Filters
  const [maxPrice, setMaxPrice] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [wellnessFilter, setWellnessFilter] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [showFilters, setShowFilters] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.getFoodRecommendations();
      setAllRecommendations(data.recommendations || []);
      setMessage(data.message || null);
    } catch (err) {
      console.error("Failed to fetch food recommendations:", err);
      setMessage("Failed to load recommendations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const filteredRecommendations = useMemo(() => {
    let items = [...allRecommendations];

    // Price filter (prices are already in USD)
    if (maxPrice !== null) {
      items = items.filter((item) => item.price <= maxPrice);
    }

    // Score filter
    if (minScore > 0) {
      items = items.filter((item) => item.score >= minScore);
    }

    // Category filter
    if (categoryFilter) {
      items = items.filter((item) =>
        (item.category || "").toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Wellness filter
    if (wellnessFilter) {
      items = items.filter((item) => {
        const badges = getBadges(item);
        return badges.includes(wellnessFilter);
      });
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "wellness":
        items.sort((a, b) => b.wellnessScore - a.wellnessScore);
        break;
      case "budget":
        items.sort((a, b) => b.budgetScore - a.budgetScore);
        break;
      default:
        items.sort((a, b) => b.score - a.score);
    }

    return items;
  }, [allRecommendations, maxPrice, minScore, categoryFilter, wellnessFilter, sortBy]);

  if (loading) {
    return (
      <div className="neo-card p-6 space-y-4 mt-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 skeleton-pulse rounded" />
          <div className="h-5 w-48 skeleton-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 skeleton-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (allRecommendations.length === 0) {
    return (
      <div className="neo-card p-6 mt-6 border-l-4 border-steel/40">
        <div className="flex items-center gap-3 mb-3">
          <Utensils className="w-5 h-5 text-mist" />
          <h3 className="font-display font-bold text-white text-xl">AI Food Recommendations</h3>
        </div>
        <p className="text-[16px] text-white/60 font-thin">
          {message || "Please scan a restaurant menu first to receive personalized food recommendations."}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-signal/10 flex items-center justify-center shadow-[0_0_12px_rgba(28,108,255,0.15)]">
            <Utensils className="w-5 h-5 text-signal" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-[22px]">
              AI Food Recommendations
            </h3>
            <p className="text-[13px] text-white/50 font-thin">
              Ranked from your scanned menus using budget + wellness scoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg border transition-all ${
              showFilters ? "border-signal/50 bg-signal/10 text-white" : "border-steel/30 text-white/60 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          <button
            onClick={() => fetchRecommendations(true)}
            disabled={refreshing}
            className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-indigo/30"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-xl border border-steel/20 bg-deep/80 backdrop-blur-sm p-5 space-y-4 overflow-hidden"
          >
            {/* Price range */}
            <div>
              <p className="text-[12px] text-white/50 font-thin mb-2 uppercase tracking-wide">Price Range</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All", value: null },
                  { label: `Under ${format(5)}`, value: 5 },
                  { label: `Under ${format(10)}`, value: 10 },
                  { label: `Under ${format(15)}`, value: 15 },
                  { label: `Under ${format(20)}`, value: 20 },
                ].map((opt) => (
                  <Chip key={opt.label} active={maxPrice === opt.value} onClick={() => setMaxPrice(opt.value)}>
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Score filter */}
            <div>
              <p className="text-[12px] text-white/50 font-thin mb-2 uppercase tracking-wide">Minimum Score</p>
              <div className="flex flex-wrap gap-2">
                {[0, 50, 60, 70, 80, 90].map((s) => (
                  <Chip key={s} active={minScore === s} onClick={() => setMinScore(s)}>
                    {s === 0 ? "All" : `${s}+`}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-[12px] text-white/50 font-thin mb-2 uppercase tracking-wide">Category</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={categoryFilter === null} onClick={() => setCategoryFilter(null)}>All</Chip>
                {CATEGORY_OPTIONS.map((cat) => (
                  <Chip key={cat} active={categoryFilter === cat} onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}>
                    {cat}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Wellness filter */}
            <div>
              <p className="text-[12px] text-white/50 font-thin mb-2 uppercase tracking-wide">Wellness</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={wellnessFilter === null} onClick={() => setWellnessFilter(null)}>All</Chip>
                {WELLNESS_OPTIONS.map((opt) => (
                  <Chip key={opt.key} active={wellnessFilter === opt.key} onClick={() => setWellnessFilter(wellnessFilter === opt.key ? null : opt.key)}>
                    {opt.emoji} {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-[12px] text-white/50 font-thin mb-2 uppercase tracking-wide">Sort By</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Chip key={opt.key} active={sortBy === opt.key} onClick={() => setSortBy(opt.key)}>
                    <ArrowUpDown className="w-3 h-3 inline mr-1" />
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <p className="text-[12px] text-white/40 font-thin">
        Showing {filteredRecommendations.length} recommendation{filteredRecommendations.length !== 1 ? "s" : ""}
        {(maxPrice || minScore > 0 || categoryFilter || wellnessFilter) && " (filtered)"}
      </p>

      {/* Recommendation Cards */}
      {filteredRecommendations.length === 0 ? (
        <div className="rounded-xl border border-steel/20 bg-indigo/10 p-8 text-center">
          <p className="text-[16px] text-white/50 font-thin">No items match your current filters. Try adjusting them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendations.map((item, index) => {
            const badges = getBadges(item);
            const barColor = getScoreBarColor(item.score);

            return (
              <motion.div
                key={`${item.name}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-2xl border border-steel/20 bg-gradient-to-br from-indigo/20 via-deep/60 to-midnight/40 backdrop-blur-sm p-5 hover:border-signal/30 hover:shadow-[0_0_20px_rgba(28,108,255,0.08)] transition-all duration-200"
              >
                {/* Top row: name + price */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-[17px] leading-tight">{item.name}</h4>
                    {item.restaurant && (
                      <p className="text-[12px] text-white/40 font-thin mt-0.5">{item.restaurant}</p>
                    )}
                  </div>
                  <p className="text-signal font-bold text-[18px] shrink-0">{format(item.price)}</p>
                </div>

                {/* Score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white/50 font-thin">Score</span>
                    <span className="text-[12px] text-white font-semibold">{item.score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-indigo/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {badges.map((badgeKey) => {
                      const badge = BADGES[badgeKey];
                      if (!badge) return null;
                      return (
                        <Tooltip key={badgeKey} tip={badge.tip}>
                          <span className="text-[11px] px-2 py-1 rounded-md border border-steel/20 bg-indigo/20 text-white/70 cursor-default hover:bg-signal/10 hover:border-signal/30 transition-all">
                            {badge.emoji} {badge.label}
                          </span>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}

                {/* AI Reason */}
                {item.reason && (
                  <div className="rounded-lg bg-signal/5 border border-signal/15 p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-signal shrink-0 mt-0.5" />
                      <p className="text-[13px] text-white/70 font-thin leading-relaxed italic">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Category label */}
                <div className="mt-3 text-[11px] text-white/40">
                  {item.category}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
