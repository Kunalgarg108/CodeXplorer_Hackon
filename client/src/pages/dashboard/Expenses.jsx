import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import ExpenseListTable from "@/components/dashboard/ExpenseListTable";

export default function Expenses() {
  const { user } = useAuth();
  const [expensesList, setExpensesList] = useState([]);

  const getAllExpenses = async () => {
    const result = await api.getExpenses();
    setExpensesList(result);
  };

  useEffect(() => {
    if (user) getAllExpenses();
  }, [user]);

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <p className="eyebrow text-[10px] sm:text-xs mb-1 sm:mb-2">Expenses</p>
      <h2 className="display-section text-2xl sm:text-3xl mb-4 sm:mb-8">My Expenses</h2>
      <ExpenseListTable refreshData={getAllExpenses} expensesList={expensesList} />
    </div>
  );
}
