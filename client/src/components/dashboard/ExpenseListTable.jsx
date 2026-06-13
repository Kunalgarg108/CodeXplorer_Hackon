import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    await api.deleteExpense(expense.id);
    toast("Expense Deleted!");
    refreshData();
  };

  return (
    <div className="mt-6 neo-card">
      <p className="eyebrow text-xs mb-2">Latest Expenses</p>
      <div className="table-header">
        <span>Name</span>
        <span>Amount</span>
        <span>Date</span>
        <span>Action</span>
      </div>
      {expensesList.map((expense) => (
        <div key={expense.id} className="table-row last:rounded-b-card">
          <span>{expense.name}</span>
          <span className="text-signal">${expense.amount}</span>
          <span className="text-mist">{expense.createdAt}</span>
          <button onClick={() => deleteExpense(expense)} className="text-tag-coral hover:text-tag-ember cursor-pointer text-left font-thin">
            Delete
          </button>
        </div>
      ))}
      {expensesList.length === 0 && (
        <p className="text-mist text-sm font-thin p-4 text-center">No expenses yet</p>
      )}
    </div>
  );
}
