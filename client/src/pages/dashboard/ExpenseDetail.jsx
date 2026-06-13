import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BudgetItem from "@/components/dashboard/BudgetItem";
import AddExpense from "@/components/dashboard/AddExpense";
import ExpenseListTable from "@/components/dashboard/ExpenseListTable";
import EditBudget from "@/components/dashboard/EditBudget";

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [expensesList, setExpensesList] = useState([]);

  const getBudgetInfo = async () => {
    const [budget, expenses] = await Promise.all([
      api.getBudget(id),
      api.getExpensesByBudget(id),
    ]);
    setBudgetInfo(budget);
    setExpensesList(expenses);
  };

  useEffect(() => {
    getBudgetInfo();
  }, [id]);

  const deleteBudget = async () => {
    await api.deleteBudget(id);
    toast("Budget Deleted!");
    navigate("/dashboard/budgets");
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold gap-2 flex justify-between items-center">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
          My Expenses
        </span>
        <div className="flex gap-2 items-center">
          <EditBudget budgetInfo={budgetInfo} refreshData={getBudgetInfo} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex gap-2 rounded-full" variant="destructive">
                <Trash className="w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your current budget along with expenses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteBudget}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse" />
        )}
        <AddExpense budgetId={id} refreshData={getBudgetInfo} />
      </div>
      <div className="mt-4">
        <ExpenseListTable expensesList={expensesList} refreshData={getBudgetInfo} />
      </div>
    </div>
  );
}
