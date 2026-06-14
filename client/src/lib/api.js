const API_BASE = "/api";

const getToken = () => localStorage.getItem("token");

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const formRequest = async (endpoint, formData, options = {}) => {
  const token = getToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method: "POST",
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data;
};

export const api = {
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  updateProfile: (body) => request("/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

  getBudgets: () => request("/budgets"),
  getBudget: (id) => request(`/budgets/${id}`),
  createBudget: (body) =>
    request("/budgets", { method: "POST", body: JSON.stringify(body) }),
  updateBudget: (id, body) =>
    request(`/budgets/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: "DELETE" }),

  getIncomes: () => request("/incomes"),
  createIncome: (body) =>
    request("/incomes", { method: "POST", body: JSON.stringify(body) }),

  getExpenses: () => request("/expenses"),
  getExpensesByBudget: (budgetId) => request(`/expenses/budget/${budgetId}`),
  createExpense: (body) =>
    request("/expenses", { method: "POST", body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),

  getTransactions: (params = "") =>
    request(`/transactions${params ? `?${params}` : ""}`),
  getTransaction: (id) => request(`/transactions/${id}`),
  createTransaction: (body) =>
    request("/transactions", { method: "POST", body: JSON.stringify(body) }),
  updateTransaction: (id, body) =>
    request(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),

  uploadBankStatement: (file, password = "") => {
    const formData = new FormData();
    formData.append("statement", file);
    if (password) {
      formData.append("password", password);
    }
    return formRequest("/uploads/upload", formData);
  },
  getUploadPreview: (bankStatementId) =>
    request(`/uploads/upload-preview/${bankStatementId}`),
  confirmUpload: (bankStatementId) =>
    request(`/uploads/upload-confirm/${bankStatementId}`, { method: "POST" }),
  cancelUpload: (bankStatementId) =>
    request(`/uploads/upload-cancel/${bankStatementId}`, { method: "DELETE" }),

  getBankStatements: () => request("/bank-statements"),
  getBankStatement: (id) => request(`/bank-statements/${id}`),
  createBankStatement: (body) =>
    request("/bank-statements", { method: "POST", body: JSON.stringify(body) }),
  updateBankStatement: (id, body) =>
    request(`/bank-statements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getAnalyticsSummary: (params = "") =>
    request(`/transactions/analytics/summary${params ? `?${params}` : ""}`),
  getAnalyticsTrends: (params = "") =>
    request(`/transactions/analytics/trends${params ? `?${params}` : ""}`),

  getAdvice: (body) =>
    request("/advice", { method: "POST", body: JSON.stringify(body) }),

  getMerchantRules: () => request("/merchants/rules"),
  createMerchantRule: (body) =>
    request("/merchants/rules", { method: "POST", body: JSON.stringify(body) }),
  deleteMerchantRule: (id) =>
    request(`/merchants/rules/${id}`, { method: "DELETE" }),
  recategorizeTransaction: (id, body) =>
    request(`/transactions/${id}/categorize`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  bulkTransactionAction: (body) =>
    request("/transactions/bulk-action", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getBudgetAlerts: () => request("/budget-alerts"),
  sendChatMessage: (body) => request("/chat", { method: "POST", body: JSON.stringify(body) }),
  getFoodRecommendations: () => request("/food-recommendations"),

  getFitness: () => request("/fitness"),
  submitFitnessAssessment: (body) => request("/fitness/assessment", { method: "POST", body: JSON.stringify(body) }),
  createFitnessGoal: (body) => request("/fitness/goals", { method: "POST", body: JSON.stringify(body) }),
  updateFitnessGoal: (id, body) => request(`/fitness/goals/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFitnessGoal: (id) => request(`/fitness/goals/${id}`, { method: "DELETE" }),
  updateStepGoal: (body) => request("/fitness/step-goal", { method: "PUT", body: JSON.stringify(body) }),
  generateWorkout: (body) => request("/fitness/generate-workout", { method: "POST", body: JSON.stringify(body) }),

  getWellnessProfile: () => request("/wellness"),
  updateWellnessProfile: (body) => request("/wellness", { method: "PUT", body: JSON.stringify(body) }),
  analyzeBurnout: () => request("/wellness/analyze"),
  analyzeWeeklyReport: () => request("/wellness/weekly"),
  submitDailyCheckin: (body) => request("/wellness/checkin", { method: "POST", body: JSON.stringify(body) }),
  resolveBurnout: () => request("/wellness/resolve-burnout", { method: "POST" }),

  getThresholds: () => request("/thresholds"),
  createThreshold: (body) => request("/thresholds", { method: "POST", body: JSON.stringify(body) }),
  updateThreshold: (id, body) => request(`/thresholds/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteThreshold: (id) => request(`/thresholds/${id}`, { method: "DELETE" }),

  getAlerts: () => request("/alerts"),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: "PATCH" }),
  deleteAlert: (id) => request(`/alerts/${id}`, { method: "DELETE" }),

  getAIInsights: () => request("/advice/insights"),

  exportTransactionsCSV: async (params = "") => {
    const token = getToken();
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(`${API_BASE}/reports/transaction-export${params ? `?${params}` : ""}`, {
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to export CSV");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  downloadSpendingReportPDF: async (month = "") => {
    const token = getToken();
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(`${API_BASE}/reports/spending-report-pdf${month ? `?month=${month}` : ""}`, {
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to generate report");
    }
    const html = await res.text();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      throw new Error("Popup blocked! Please allow popups for this site.");
    }
  },
};
