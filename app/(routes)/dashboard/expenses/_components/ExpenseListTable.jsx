import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    const result = await db
      .delete(Expenses)
      .where(eq(Expenses.id, expense.id))
      .returning();

    if (result) {
      toast("Expense Deleted!");
      refreshData();
    }
  };

  return (
    <div className="neo-card mt-5">
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--color-paper-white)",
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Latest Expenses
      </h2>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 120px 60px",
          padding: "10px 16px",
          borderRadius: "10px",
          background: "rgba(0,21,51,0.6)",
          marginBottom: "4px",
        }}
      >
        {["Name", "Amount", "Date", ""].map((col) => (
          <span
            key={col}
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--color-mist)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      {expensesList.length === 0 ? (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-mist)", fontSize: "14px", fontWeight: 300 }}>
          No expenses yet. Add one above.
        </div>
      ) : (
        expensesList.map((expense, index) => (
          <div
            key={expense.id ?? index}
            className="data-row"
            style={{ gridTemplateColumns: "1fr 100px 120px 60px" }}
          >
            <span style={{ color: "var(--color-paper-white)", fontWeight: 300 }}>
              {expense.name}
            </span>
            <span
              style={{
                color: "var(--color-signal-blue)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              ${expense.amount}
            </span>
            <span style={{ color: "var(--color-mist)", fontSize: "12px" }}>
              {expense.createdAt}
            </span>
            <button
              onClick={() => deleteExpense(expense)}
              style={{
                background: "rgba(255,68,51,0.12)",
                border: "none",
                borderRadius: "8px",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,68,51,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,68,51,0.12)")}
            >
              <Trash2 size={14} style={{ color: "var(--color-tag-coral)" }} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ExpenseListTable;
