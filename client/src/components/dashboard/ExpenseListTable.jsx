import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import { Trash2 } from "lucide-react";

export default function ExpenseListTable({ expensesList, refreshData }) {
  const { format } = useCurrency();

  const deleteExpense = async (expense) => {
    await api.deleteExpense(expense.id);
    toast("Expense Deleted!");
    refreshData();
  };

  if (expensesList.length === 0) {
    return (
      <div className="neo-card p-8 text-center">
        <p className="text-mist text-sm sm:text-base font-thin">No expenses found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* DESKTOP TABLE — hidden on mobile */}
      <div className="hidden md:block neo-card">
        <p className="eyebrow text-xs mb-2">Latest Expenses</p>
        <div className="expense-table-header">
          <span>Name</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Action</span>
        </div>
        {expensesList.map((expense) => (
          <div key={expense.id} className="expense-table-row last:rounded-b-card">
            <span>{expense.name}</span>
            <span className="text-signal">{format(expense.amount)}</span>
            <span className="text-mist">{expense.createdAt}</span>
            <button
              onClick={() => deleteExpense(expense)}
              className="text-tag-coral hover:text-tag-ember cursor-pointer text-left font-thin"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* MOBILE CARDS — visible only on mobile */}
      <div className="md:hidden space-y-3">
        <p className="eyebrow text-[10px] mb-2">Latest Expenses</p>
        {expensesList.map((expense) => (
          <div key={expense.id} className="neo-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-paper font-medium text-[15px] truncate">{expense.name}</h4>
                <p className="text-mist text-[12px] font-thin mt-1">{expense.createdAt}</p>
              </div>
              <span className="text-signal font-semibold text-[16px] shrink-0">
                {format(expense.amount)}
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => deleteExpense(expense)}
                className="flex items-center gap-1.5 text-tag-coral hover:text-tag-ember text-[13px] font-thin h-11 px-3 rounded-lg hover:bg-tag-coral/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
