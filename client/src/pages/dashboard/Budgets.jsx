import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import CreateBudget from "@/components/dashboard/CreateBudget";
import BudgetItem from "@/components/dashboard/BudgetItem";

export default function Budgets() {
  const { user } = useAuth();
  const [budgetList, setBudgetList] = useState([]);

  const getBudgetList = async () => {
    const result = await api.getBudgets();
    setBudgetList(result);
  };

  useEffect(() => {
    if (user) getBudgetList();
  }, [user]);

  return (
    <div className="p-6 md:p-10">
      <p className="eyebrow text-xs mb-2">Budgets</p>
      <h2 className="display-section mb-8">My Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget refreshData={getBudgetList} />
        {budgetList?.length > 0
          ? budgetList.map((budget) => <BudgetItem budget={budget} key={budget.id} />)
          : [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="w-full skeleton-pulse h-[150px]" />
            ))}
      </div>
    </div>
  );
}
