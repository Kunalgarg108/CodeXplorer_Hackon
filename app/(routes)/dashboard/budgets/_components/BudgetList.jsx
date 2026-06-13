"use client";
import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "./BudgetItem";

const TAG_COLORS = [
  "#1c6cff", "#ff4433", "#00cc4b", "#ff8833", "#ff33aa",
  "#9019e6", "#ffcc02", "#00acfe", "#ea687c", "#94ae43",
];

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && getBudgetList();
  }, [user]);

  const getBudgetList = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id));

    setBudgetList(result);
  };

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--color-paper-white)",
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}
        >
          My Budgets
        </h1>
        <p style={{ color: "var(--color-mist)", fontSize: "14px", fontWeight: 300 }}>
          Manage and track all your spending categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget refreshData={() => getBudgetList()} />
        {budgetList?.length > 0
          ? budgetList.map((budget, index) => (
              <BudgetItem budget={budget} key={index} colorIdx={index % TAG_COLORS.length} />
            ))
          : [1, 2, 3, 4, 5].map((item, index) => (
              <div key={index} className="skeleton-dark" style={{ height: 150 }} />
            ))}
      </div>
    </div>
  );
}

export default BudgetList;