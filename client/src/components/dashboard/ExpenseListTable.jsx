import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    await api.deleteExpense(expense.id);
    toast("Expense Deleted!");
    refreshData();
  };

  return (
    <div className="mt-3">
      <h2 className="font-bold text-lg">Latest Expenses</h2>
      <div className="grid grid-cols-4 rounded-tl-xl rounded-tr-xl bg-slate-200 p-2 mt-3">
        <h2 className="font-bold">Name</h2>
        <h2 className="font-bold">Amount</h2>
        <h2 className="font-bold">Date</h2>
        <h2 className="font-bold">Action</h2>
      </div>
      {expensesList.map((expense) => (
        <div key={expense.id} className="grid grid-cols-4 bg-slate-50 rounded-bl-xl rounded-br-xl p-2">
          <h2>{expense.name}</h2>
          <h2>{expense.amount}</h2>
          <h2>{expense.createdAt}</h2>
          <h2 onClick={() => deleteExpense(expense)} className="text-red-500 cursor-pointer">Delete</h2>
        </div>
      ))}
    </div>
  );
}
