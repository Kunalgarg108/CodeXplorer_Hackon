import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";

export function TransactionList({ filters = "" }) {
  const { format } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page, sortBy, sortOrder]);

  useEffect(() => {
    setSelectedIds([]);
  }, [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      params.append("limit", pagination.limit);
      params.append("page", pagination.page);

      const response = await api.getTransactions(params.toString());
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Mark this transaction as ignored?")) {
      try {
        await api.deleteTransaction(id);
        fetchTransactions();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleCategory = async (transaction) => {
    const categoriesList = [
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
    
    const newCategory = prompt(
      `Enter new category for "${transaction.merchantName}":\nValid options: ${categoriesList.join(", ")}`,
      transaction.category
    );
    
    if (newCategory && newCategory.trim() !== "" && newCategory !== transaction.category) {
      const matchedCategory = categoriesList.find(
        (c) => c.toLowerCase() === newCategory.trim().toLowerCase()
      ) || newCategory.trim();

      const saveRule = confirm(
        `Do you want to automatically categorize all future transactions from "${transaction.merchantName}" as "${matchedCategory}"?`
      );

      try {
        if (saveRule) {
          await api.recategorizeTransaction(transaction.id, { category: matchedCategory });
        } else {
          await api.updateTransaction(transaction.id, { category: matchedCategory });
        }
        fetchTransactions();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleExclude = async (transaction) => {
    try {
      await api.updateTransaction(transaction.id, {
        excludeFromAnalysis: !transaction.excludeFromAnalysis,
      });
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action, additionalData = {}) => {
    try {
      const body = {
        transactionIds: selectedIds,
        action,
        ...additionalData,
      };
      const response = await api.bulkTransactionAction(body);
      setSelectedIds([]);
      fetchTransactions();
      alert(response.message || "Bulk action completed successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const SortArrow = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-300">↕</span>;
    return sortOrder === "desc" ? <span>↓</span> : <span>↑</span>;
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading transactions: {error}
      </div>
    );
  }

  return (
    <div className="neo-card bg-[#010d1e] border border-steel/30 text-paper p-0 overflow-hidden">
      {selectedIds.length > 0 && (
        <div className="bg-[#001533] border-b border-steel/50 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-[#1c6cff] font-semibold">
            {selectedIds.length} transaction(s) selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction("CATEGORIZE", { category: e.target.value });
                  e.target.value = "";
                }
              }}
              className="px-3 py-1.5 bg-[#001533] border border-steel/50 rounded-xl text-paper text-sm focus:outline-none focus:ring-1 focus:ring-[#1c6cff]"
            >
              <option value="">Bulk Categorize...</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Utilities">Utilities</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Education">Education</option>
              <option value="Personal">Personal</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <button
              onClick={() => handleBulkAction("EXCLUDE", { excludeFromAnalysis: true })}
              className="px-3 py-1.5 bg-[#001533] border border-steel/50 text-fog hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Exclude
            </button>
            <button
              onClick={() => handleBulkAction("EXCLUDE", { excludeFromAnalysis: false })}
              className="px-3 py-1.5 bg-[#001533] border border-steel/50 text-fog hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Include
            </button>
            <button
              onClick={() => {
                if (confirm(`Mark ${selectedIds.length} transactions as ignored?`)) {
                  handleBulkAction("DELETE");
                }
              }}
              className="px-3 py-1.5 bg-[#ff4433]/15 text-[#ff4433] hover:bg-[#ff4433]/30 rounded-xl text-xs font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-steel/30 bg-[#001533]">
            <tr>
              <th className="px-4 py-3.5 text-left w-10">
                <input
                  type="checkbox"
                  checked={
                    transactions.length > 0 &&
                    selectedIds.length === transactions.length
                  }
                  onChange={handleSelectAll}
                  className="rounded bg-[#001533] border-steel/50 text-[#1c6cff] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-mist uppercase tracking-wider text-xs">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  Date <SortArrow column="date" />
                </button>
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-mist uppercase tracking-wider text-xs">Merchant</th>
              <th className="px-4 py-3.5 text-right font-semibold text-mist uppercase tracking-wider text-xs">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center justify-end gap-1 hover:text-white transition w-full"
                >
                  Amount <SortArrow column="amount" />
                </button>
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-mist uppercase tracking-wider text-xs">Type</th>
              <th className="px-4 py-3.5 text-left font-semibold text-mist uppercase tracking-wider text-xs">Category</th>
              <th className="px-4 py-3.5 text-center font-semibold text-mist uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-mist">
                  {loading ? "Loading transactions..." : "No transactions found"}
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={`border-b border-steel/20 hover:bg-[#1c6cff]/5 transition-colors ${
                    selectedIds.includes(txn.id) ? "bg-[#1c6cff]/10 hover:bg-[#1c6cff]/15" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(txn.id)}
                      onChange={() => handleSelectOne(txn.id)}
                      className="rounded bg-[#001533] border-steel/50 text-[#1c6cff] focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-fog font-light">
                    {new Date(txn.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{txn.merchantName}</span>
                      {txn.description && (
                        <span className="text-xs text-mist font-light">
                          {txn.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span
                      className={
                        txn.transactionType === "DEBIT"
                          ? "text-[#ff4433]"
                          : "text-[#00cc4b]"
                      }
                    >
                      {txn.transactionType === "DEBIT" ? "-" : "+"}{" "}
                      {format(txn.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        txn.transactionType === "DEBIT"
                          ? "bg-[#ff4433]/15 text-[#ff4433]"
                          : "bg-[#00cc4b]/15 text-[#00cc4b]"
                      }`}
                    >
                      {txn.transactionType === "DEBIT" ? "Spent" : "Received"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white font-medium">{txn.category}</span>
                      {txn.categoryConfidence > 0 && (
                        <span
                          className={`text-xs font-light ${
                            txn.categoryConfidence === 100
                              ? "text-[#00cc4b]"
                              : "text-mist"
                          }`}
                        >
                          {txn.categoryConfidence === 100
                            ? "Rule-matched"
                            : `${txn.categoryConfidence}% confidence`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleToggleCategory(txn)}
                        title="Edit category"
                        className="px-2.5 py-1 text-xs bg-[#1c6cff]/15 text-[#1c6cff] hover:bg-[#1c6cff]/30 rounded-lg transition font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleExclude(txn)}
                        title={txn.excludeFromAnalysis ? "Include in analysis" : "Exclude from analysis"}
                        className={`px-2.5 py-1 text-xs rounded-lg transition font-semibold ${
                          txn.excludeFromAnalysis
                            ? "bg-[#ff8833]/15 text-[#ff8833] hover:bg-[#ff8833]/30"
                            : "bg-[#001533] text-fog border border-steel/50 hover:bg-steel/30"
                        }`}
                      >
                        {txn.excludeFromAnalysis ? "Excluded" : "Include"}
                      </button>
                      <button
                        onClick={() => handleDelete(txn.id)}
                        title="Delete"
                        className="px-2.5 py-1 text-xs bg-[#ff4433]/15 text-[#ff4433] hover:bg-[#ff4433]/30 rounded-lg transition font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-steel/30 bg-[#001533]">
          <span className="text-sm text-mist font-light">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={pagination.page === 1}
              className="px-3.5 py-1.5 bg-steel/30 hover:bg-steel/50 border border-steel/50 text-fog rounded-xl text-xs font-semibold transition disabled:opacity-30 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.min(pagination.pages, pagination.page + 1),
                })
              }
              disabled={pagination.page === pagination.pages}
              className="px-3.5 py-1.5 bg-steel/30 hover:bg-steel/50 border border-steel/50 text-fog rounded-xl text-xs font-semibold transition disabled:opacity-30 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
