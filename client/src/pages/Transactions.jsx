import { useState } from "react";
import TransactionFilters from "@/components/dashboard/TransactionFilters";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import TransactionList from "@/components/dashboard/TransactionList";
import UploadBankStatement from "@/components/dashboard/UploadBankStatement";
import AlertsAndThresholds from "@/components/dashboard/AlertsAndThresholds";
import InsightCards from "@/components/dashboard/InsightCards";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Download, FileText, LayoutDashboard, AlertTriangle, Sparkles } from "lucide-react";

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

export default function TransactionsPage() {
  const [filters, setFilters] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    merchantName: "",
    amount: "",
    transactionType: "DEBIT",
    category: CATEGORIES[0],
    description: "",
  });
  const [refreshKey, setRefreshKey] = useState(0); // Trigger transaction list reload

  const handleExportCSV = async () => {
    try {
      await api.exportTransactionsCSV(filters);
      toast.success("CSV Statement downloaded!");
    } catch (error) {
      toast.error(error.message || "Failed to export CSV file.");
    }
  };

  const handlePrintPDF = async () => {
    try {
      let monthVal = "";
      if (filters) {
        const urlParams = new URLSearchParams(filters);
        const startDate = urlParams.get("startDate");
        if (startDate && startDate.match(/^\d{4}-\d{2}/)) {
          monthVal = startDate.substring(0, 7);
        }
      }
      await api.downloadSpendingReportPDF(monthVal);
      toast.success("Print dialog launched!");
    } catch (error) {
      toast.error(error.message || "Failed to print PDF report.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!addForm.merchantName || !addForm.amount || isNaN(addForm.amount) || Number(addForm.amount) <= 0) {
      toast.error("Please enter a valid merchant name and amount.");
      return;
    }

    try {
      await api.createTransaction({
        ...addForm,
        amount: Number(addForm.amount),
        source: "MANUAL",
      });
      toast.success("Manual transaction added successfully!");
      setIsAddModalOpen(false);
      setAddForm({
        transactionDate: new Date().toISOString().split("T")[0],
        merchantName: "",
        amount: "",
        transactionType: "DEBIT",
        category: CATEGORIES[0],
        description: "",
      });
      // Force refresh lists
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.message || "Failed to create transaction.");
    }
  };

  return (
    <div className="p-6 md:p-10 text-left space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow text-xs mb-2">Transaction Analysis</p>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start lg:items-center gap-4 mb-6">
          <h2 className="display-section mb-1">Transaction Analysis</h2>
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "analysis" && (
              <>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-[#1c6cff] hover:bg-[#1c6cff]/90 text-white font-semibold rounded-xl text-sm transition duration-150 shadow-neo flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Transaction
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-[#010d1e] hover:bg-[#001533] text-paper font-semibold border border-steel/40 rounded-xl text-sm transition duration-150 shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="px-4 py-2 bg-gradient-to-r from-[#1c6cff]/20 to-[#1c6cff]/5 hover:from-[#1c6cff]/30 hover:to-[#1c6cff]/15 text-[#1c6cff] font-semibold border border-[#1c6cff]/30 rounded-xl text-sm transition duration-150 shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Print PDF Report
                </button>
              </>
            )}
            <UploadBankStatement onSuccess={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-steel/30 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`py-3 px-6 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
            activeTab === "analysis"
              ? "border-[#1c6cff] text-[#1c6cff]"
              : "border-transparent text-mist hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard & Analysis
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`py-3 px-6 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
            activeTab === "alerts"
              ? "border-[#1c6cff] text-[#1c6cff]"
              : "border-transparent text-mist hover:text-white"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Alerts & Budgets
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`py-3 px-6 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
            activeTab === "insights"
              ? "border-[#1c6cff] text-[#1c6cff]"
              : "border-transparent text-mist hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Insights & Recommendations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_14fr] gap-6 items-start">
          <div className="lg:col-span-1">
            <TransactionFilters onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <AnalyticsDashboard key={`analytics-${refreshKey}`} filters={filters} />
            <TransactionList key={`list-${refreshKey}`} filters={filters} />
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <AlertsAndThresholds key={`alerts-${refreshKey}`} />
      )}

      {activeTab === "insights" && (
        <InsightCards key={`insights-${refreshKey}`} />
      )}

      {/* Add Manual Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-card bg-[#010d1e] w-full max-w-md border border-steel/50 animate-fade-slide-up relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white font-display">Add Manual Transaction</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-mist hover:text-white font-bold text-2xl transition duration-150 cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  name="transactionDate"
                  required
                  value={addForm.transactionDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">Merchant Name</label>
                <input
                  type="text"
                  name="merchantName"
                  placeholder="e.g. Swiggy"
                  required
                  value={addForm.merchantName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition placeholder-steel/70"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 500"
                    required
                    value={addForm.amount}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition placeholder-steel/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    name="transactionType"
                    value={addForm.transactionType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition"
                  >
                    <option value="DEBIT">Debit (Spent)</option>
                    <option value="CREDIT">Credit (Received)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">Category</label>
                <select
                  name="category"
                  value={addForm.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-fog uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Lunch with friends"
                  value={addForm.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:ring-2 focus:ring-[#1c6cff] focus:border-[#1c6cff] focus:outline-none transition placeholder-steel/70"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#1c6cff] hover:bg-[#1c6cff]/90 text-white font-semibold rounded-xl text-sm transition"
                >
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-steel/30 hover:bg-steel/50 text-fog font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
