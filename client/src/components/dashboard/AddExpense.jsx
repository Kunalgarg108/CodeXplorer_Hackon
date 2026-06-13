import React, { useState } from "react";
import moment from "moment";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddExpense({ budgetId, refreshData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const addNewExpense = async () => {
    setLoading(true);
    try {
      await api.createExpense({
        name,
        amount,
        budgetId,
        createdAt: moment().format("DD/MM/YYYY"),
      });
      setAmount("");
      setName("");
      refreshData();
      toast("New Expense Added!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neo-card">
      <p className="eyebrow text-xs mb-4">Add Expense</p>
      <div className="mt-2">
        <label className="text-fog text-sm font-thin block mb-1">Expense Name</label>
        <Input placeholder="e.g. Bedroom Decor" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="mt-4">
        <label className="text-fog text-sm font-thin block mb-1">Expense Amount</label>
        <Input placeholder="e.g. 1000" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <Button disabled={!(name && amount) || loading} onClick={addNewExpense} className="mt-4 w-full">
        {loading ? <Loader className="animate-spin" /> : "Add New Expense"}
      </Button>
    </div>
  );
}
