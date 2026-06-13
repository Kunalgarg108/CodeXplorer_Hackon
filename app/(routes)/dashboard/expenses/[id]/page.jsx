"use client";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";
import { ArrowLeft, Pen, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditBudget from "../_components/EditBudget";
import { useUser } from "@clerk/nextjs";

function ExpensesScreen({ params }) {
  const { user } = useUser();
  const [budgetInfo, setbudgetInfo] = useState();
  const [expensesList, setExpensesList] = useState([]);
  const route = useRouter();

  useEffect(() => {
    user && getBudgetInfo();
  }, [user]);

  const getBudgetInfo = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .where(eq(Budgets.id, params.id))
      .groupBy(Budgets.id);

    setbudgetInfo(result[0]);
    getExpensesList();
  };

  const getExpensesList = async () => {
    const result = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.budgetId, params.id))
      .orderBy(desc(Expenses.id));
    setExpensesList(result);
  };

  const deleteBudget = async () => {
    const deleteExpenseResult = await db
      .delete(Expenses)
      .where(eq(Expenses.budgetId, params.id))
      .returning();

    if (deleteExpenseResult) {
      await db.delete(Budgets).where(eq(Budgets.id, params.id)).returning();
    }
    toast("Budget Deleted!");
    route.replace("/dashboard/budgets");
  };

  return (
    <div
      style={{
        background: "var(--color-midnight-canvas)",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => route.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "var(--color-deep-surface)",
              border: "1px solid rgba(17,38,59,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-fog)",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-paper-white)",
              letterSpacing: "-0.02em",
            }}
          >
            My Expenses
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <EditBudget budgetInfo={budgetInfo} refreshData={() => getBudgetInfo()} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,68,51,0.12)",
                  border: "1px solid rgba(255,68,51,0.3)",
                  color: "var(--color-tag-coral)",
                  fontSize: "14px",
                  fontWeight: 400,
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,68,51,0.22)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,68,51,0.12)")}
              >
                <Trash size={14} />
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent
              style={{
                background: "var(--color-deep-surface)",
                border: "1px solid rgba(17,38,59,0.8)",
                borderRadius: "20px",
                color: "var(--color-paper-white)",
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle style={{ color: "var(--color-paper-white)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription style={{ color: "var(--color-mist)", fontWeight: 300 }}>
                  This action cannot be undone. This will permanently delete your
                  current budget along with expenses and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(17,38,59,0.8)",
                    color: "var(--color-fog)",
                    borderRadius: "10px",
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteBudget()}
                  style={{
                    background: "rgba(255,68,51,0.2)",
                    color: "var(--color-tag-coral)",
                    border: "1px solid rgba(255,68,51,0.4)",
                    borderRadius: "10px",
                  }}
                >
                  Delete Budget
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Budget info + Add Expense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} colorIdx={0} />
        ) : (
          <div className="skeleton-dark" style={{ height: 150 }} />
        )}
        <AddExpense
          budgetId={params.id}
          user={user}
          refreshData={() => getBudgetInfo()}
        />
      </div>

      {/* Expense table */}
      <ExpenseListTable
        expensesList={expensesList}
        refreshData={() => getBudgetInfo()}
      />
    </div>
  );
}

export default ExpensesScreen;
