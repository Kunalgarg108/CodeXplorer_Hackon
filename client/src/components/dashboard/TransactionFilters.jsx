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
    <div className="w-full lg:w-64 bg-white rounded-lg border p-4 space-y-4">
      <h3 className="font-semibold text-lg">Filters</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleDateChange("startDate", e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">End Date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleDateChange("endDate", e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange("DEBIT")}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition ${
              filters.type === "DEBIT"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-gray-100 text-gray-600 border border-gray-300"
            }`}
          >
            Spent
          </button>
          <button
            onClick={() => handleTypeChange("CREDIT")}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition ${
              filters.type === "CREDIT"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-600 border border-gray-300"
            }`}
          >
            Received
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Merchant</label>
        <Input
          type="text"
          placeholder="Search merchant..."
          value={filters.merchant}
          onChange={(e) => handleMerchantChange(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleApply} className="flex-1">
          Apply
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
}

export default TransactionFilters;
