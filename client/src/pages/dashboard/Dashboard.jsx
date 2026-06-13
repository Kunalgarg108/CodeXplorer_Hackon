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
    <div className="p-8">
      <h2 className="font-bold text-4xl">Hi, {user?.name} 👋</h2>
      <p className="text-gray-500">Here's what happenning with your money, Lets Manage your expense</p>
      <CardInfo budgetList={budgetList} incomeList={incomeList} />
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-6 gap-5">
        <div className="lg:col-span-2">
          <BarChartDashboard budgetList={budgetList} />
          <ExpenseListTable expensesList={expensesList} refreshData={loadData} />
        </div>
        <div className="grid gap-5">
          <h2 className="font-bold text-lg">Latest Budgets</h2>
          {budgetList?.length > 0
            ? budgetList.map((budget) => <BudgetItem budget={budget} key={budget.id} />)
            : [1, 2, 3, 4].map((item) => (
                <div key={item} className="h-[180px] w-full bg-slate-200 rounded-lg animate-pulse" />
              ))}
        </div>
      </div>
    </div>
  );
}
