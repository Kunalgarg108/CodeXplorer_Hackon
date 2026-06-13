import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { Loader, Plus } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";

function AddExpense({ budgetId, user, refreshData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const addNewExpense = async () => {
    setLoading(true);
    const result = await db
      .insert(Expenses)
      .values({
        name: name,
        amount: amount,
        budgetId: budgetId,
        createdAt: moment().format("DD/MM/yyy"),
      })
      .returning({ insertedId: Budgets.id });

    setAmount("");
    setName("");
    if (result) {
      setLoading(false);
      refreshData();
      toast("New Expense Added!");
    }
    setLoading(false);
  };

  return (
    <div className="neo-card">
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
        Add Expense
      </h2>

      <div className="flex flex-col gap-4">
        <div>
          <label style={{ color: "var(--color-fog)", fontSize: "12px", fontWeight: 400, display: "block", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Expense Name
          </label>
          <Input
            placeholder="e.g. Bedroom Decor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              background: "var(--color-indigo-surface)",
              border: "1px solid rgba(17,38,59,0.8)",
              color: "var(--color-paper-white)",
              borderRadius: "12px",
              padding: "10px 14px",
            }}
          />
        </div>

        <div>
          <label style={{ color: "var(--color-fog)", fontSize: "12px", fontWeight: 400, display: "block", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Expense Amount
          </label>
          <Input
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              background: "var(--color-indigo-surface)",
              border: "1px solid rgba(17,38,59,0.8)",
              color: "var(--color-paper-white)",
              borderRadius: "12px",
              padding: "10px 14px",
            }}
          />
        </div>

        <button
          disabled={!(name && amount) || loading}
          onClick={() => addNewExpense()}
          className="btn-signal flex items-center justify-center gap-2"
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "12px",
            fontSize: "14px",
            opacity: !(name && amount) || loading ? 0.4 : 1,
            cursor: !(name && amount) || loading ? "not-allowed" : "pointer",
            marginTop: "4px",
          }}
        >
          {loading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <>
              <Plus size={16} />
              Add New Expense
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AddExpense;
