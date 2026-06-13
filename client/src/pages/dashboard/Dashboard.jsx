import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import CardInfo from "@/components/dashboard/CardInfo";
import BarChartDashboard from "@/components/dashboard/BarChartDashboard";
import BudgetItem from "@/components/dashboard/BudgetItem";
import ExpenseListTable from "@/components/dashboard/ExpenseListTable";

export default function Dashboard() {
  const { user } = useAuth();
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);

  const loadData = async () => {
    const [budgets, incomes, expenses] = await Promise.all([
      api.getBudgets(),
      api.getIncomes(),
      api.getExpenses(),
    ]);
    setBudgetList(budgets);
    setIncomeList(incomes);
    setExpensesList(expenses);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  return (
    <div className="p-6 md:p-10">
      <p className="eyebrow text-xs mb-2">Overview</p>
      <h2 className="display-section mb-2">Hi, {user?.name} 👋</h2>
      <p className="text-muted-copilot text-sm mb-6">Here's what's happening with your money — let's manage your expenses.</p>
      <CardInfo budgetList={budgetList} incomeList={incomeList} />
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-8 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BarChartDashboard budgetList={budgetList} />
          <ExpenseListTable expensesList={expensesList} refreshData={loadData} />
        </div>
        <div className="grid gap-5">
          <p className="eyebrow text-xs">Latest Budgets</p>
          {budgetList?.length > 0
            ? budgetList.map((budget) => <BudgetItem budget={budget} key={budget.id} />)
            : [1, 2, 3, 4].map((item) => (
                <div key={item} className="h-[180px] w-full skeleton-pulse" />
              ))}
        </div>
      </div>
    </div>
  );
}
