import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function TransactionList({ filters = "" }) {
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
    <div className="bg-white rounded-lg border">
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-blue-700 font-medium">
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
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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

            <Button
              onClick={() => handleBulkAction("EXCLUDE", { excludeFromAnalysis: true })}
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 border-gray-300 bg-white"
            >
              Exclude
            </Button>
            <Button
              onClick={() => handleBulkAction("EXCLUDE", { excludeFromAnalysis: false })}
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 border-gray-300 bg-white"
            >
              Include
            </Button>
            <Button
              onClick={() => {
                if (confirm(`Mark ${selectedIds.length} transactions as ignored?`)) {
                  handleBulkAction("DELETE");
                }
              }}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={
                    transactions.length > 0 &&
                    selectedIds.length === transactions.length
                  }
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  Date <SortArrow column="date" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold">Merchant</th>
              <th className="px-4 py-3 text-right font-semibold">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center justify-end gap-1 hover:text-blue-600 w-full"
                >
                  Amount <SortArrow column="amount" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  {loading ? "Loading..." : "No transactions found"}
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={`border-b hover:bg-gray-50 ${
                    selectedIds.includes(txn.id) ? "bg-blue-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(txn.id)}
                      onChange={() => handleSelectOne(txn.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(txn.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{txn.merchantName}</span>
                      {txn.description && (
                        <span className="text-xs text-gray-500">
                          {txn.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span
                      className={
                        txn.transactionType === "DEBIT"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {txn.transactionType === "DEBIT" ? "-" : "+"} ₹
                      {txn.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        txn.transactionType === "DEBIT"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {txn.transactionType === "DEBIT" ? "Spent" : "Received"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-700 font-medium">{txn.category}</span>
                      {txn.categoryConfidence > 0 && (
                        <span
                          className={`text-xs ${
                            txn.categoryConfidence === 100
                              ? "text-green-600 font-semibold"
                              : "text-gray-400"
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
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleToggleCategory(txn)}
                        title="Edit category"
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleExclude(txn)}
                        title={txn.excludeFromAnalysis ? "Include in analysis" : "Exclude from analysis"}
                        className={`px-2 py-1 text-xs rounded ${
                          txn.excludeFromAnalysis
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {txn.excludeFromAnalysis ? "Excluded" : "Include"}
                      </button>
                      <button
                        onClick={() => handleDelete(txn.id)}
                        title="Delete"
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            total)
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.min(pagination.pages, pagination.page + 1),
                })
              }
              disabled={pagination.page === pagination.pages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
