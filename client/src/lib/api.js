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

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),

  getBudgets: () => request("/budgets"),
  getBudget: (id) => request(`/budgets/${id}`),
  createBudget: (body) => request("/budgets", { method: "POST", body: JSON.stringify(body) }),
  updateBudget: (id, body) => request(`/budgets/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: "DELETE" }),

  getIncomes: () => request("/incomes"),
  createIncome: (body) => request("/incomes", { method: "POST", body: JSON.stringify(body) }),

  getExpenses: () => request("/expenses"),
  getExpensesByBudget: (budgetId) => request(`/expenses/budget/${budgetId}`),
  createExpense: (body) => request("/expenses", { method: "POST", body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),

  getAdvice: (body) => request("/advice", { method: "POST", body: JSON.stringify(body) }),

  getBudgetAlerts: () => request("/budget-alerts"),

  sendChatMessage: (body) => request("/chat", { method: "POST", body: JSON.stringify(body) }),

  getWellnessProfile: () => request("/wellness"),
  updateWellnessProfile: (body) => request("/wellness", { method: "PUT", body: JSON.stringify(body) }),
  analyzeBurnout: () => request("/wellness/analyze"),
  submitDailyCheckin: (body) => request("/wellness/checkin", { method: "POST", body: JSON.stringify(body) }),
  resolveBurnout: () => request("/wellness/resolve-burnout", { method: "POST" }),
};
