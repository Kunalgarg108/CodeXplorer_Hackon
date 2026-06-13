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
    <div className="p-10">
      <h2 className="font-bold text-3xl">My Expenses</h2>
      <ExpenseListTable refreshData={getAllExpenses} expensesList={expensesList} />
    </div>
  );
}
