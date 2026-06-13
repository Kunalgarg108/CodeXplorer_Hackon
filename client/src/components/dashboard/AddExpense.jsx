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
    <div className="border p-5 rounded-2xl">
      <h2 className="font-bold text-lg">Add Expense</h2>
      <div className="mt-2">
        <h2 className="text-black font-medium my-1">Expense Name</h2>
        <Input placeholder="e.g. Bedroom Decor" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="mt-2">
        <h2 className="text-black font-medium my-1">Expense Amount</h2>
        <Input placeholder="e.g. 1000" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <Button disabled={!(name && amount) || loading} onClick={addNewExpense} className="mt-3 w-full rounded-full">
        {loading ? <Loader className="animate-spin" /> : "Add New Expense"}
      </Button>
    </div>
  );
}
