import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function TransactionFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: [],
    type: "",
    merchant: "",
  });

  const handleDateChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
  };

  const handleCategoryToggle = (category) => {
    const updated = {
      ...filters,
      category: filters.category.includes(category)
        ? filters.category.filter((c) => c !== category)
        : [...filters.category, category],
    };
    setFilters(updated);
  };

  const handleTypeChange = (type) => {
    setFilters({ ...filters, type: filters.type === type ? "" : type });
  };

  const handleMerchantChange = (value) => {
    setFilters({ ...filters, merchant: value });
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.category.length > 0) {
      params.append("category", filters.category.join(","));
    }
    if (filters.type) params.append("type", filters.type);
    if (filters.merchant) params.append("merchantName", filters.merchant);

    onFilterChange?.(params.toString());
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: [],
      type: "",
      merchant: "",
    });
    onFilterChange?.("");
  };

  return (
    <div className="w-full lg:w-64 neo-card space-y-4">
      <h3 className="font-semibold text-lg text-paper font-display">Filters</h3>
 
      <div className="space-y-2">
        <label className="text-xs font-semibold text-fog uppercase tracking-wider block">Start Date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleDateChange("startDate", e.target.value)}
          className="w-full px-3 py-2 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-1 focus:ring-[#1c6cff] focus:outline-none"
        />
      </div>
 
      <div className="space-y-2">
        <label className="text-xs font-semibold text-fog uppercase tracking-wider block">End Date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleDateChange("endDate", e.target.value)}
          className="w-full px-3 py-2 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-1 focus:ring-[#1c6cff] focus:outline-none"
        />
      </div>
 
      <div className="space-y-2">
        <label className="text-xs font-semibold text-fog uppercase tracking-wider block">Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange("DEBIT")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
              filters.type === "DEBIT"
                ? "bg-[#ff4433]/15 text-[#ff4433] border border-[#ff4433]/40"
                : "bg-[#001533] text-mist border border-steel/50 hover:text-white"
            }`}
          >
            Spent
          </button>
          <button
            onClick={() => handleTypeChange("CREDIT")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
              filters.type === "CREDIT"
                ? "bg-[#00cc4b]/15 text-[#00cc4b] border border-[#00cc4b]/40"
                : "bg-[#001533] text-mist border border-steel/50 hover:text-white"
            }`}
          >
            Received
          </button>
        </div>
      </div>
 
      <div className="space-y-2">
        <label className="text-xs font-semibold text-fog uppercase tracking-wider block">Category</label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer text-fog hover:text-white transition">
              <input
                type="checkbox"
                checked={filters.category.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                className="w-4 h-4 rounded bg-[#001533] border-steel/50 text-[#1c6cff] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>
 
      <div className="space-y-2">
        <label className="text-xs font-semibold text-fog uppercase tracking-wider block">Merchant</label>
        <Input
          type="text"
          placeholder="Search merchant..."
          value={filters.merchant}
          onChange={(e) => handleMerchantChange(e.target.value)}
          className="text-sm bg-[#001533] border-steel/50 text-paper rounded-xl focus:ring-1 focus:ring-[#1c6cff] placeholder-steel/70"
        />
      </div>
 
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleApply}
          className="flex-1 py-2 bg-[#1c6cff] hover:bg-[#1c6cff]/90 text-white font-semibold rounded-xl text-sm transition"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-2 bg-steel/30 hover:bg-steel/50 text-fog font-semibold rounded-xl text-sm transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
 
export default TransactionFilters;
