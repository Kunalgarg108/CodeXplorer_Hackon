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
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
        <div className="flex gap-3 items-center">
          <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer text-fog hover:text-paper" size={20} />
          <div>
            <p className="eyebrow text-xs">Budget Detail</p>
            <h2 className="display-section text-2xl">My Expenses</h2>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <EditBudget budgetInfo={budgetInfo} refreshData={getBudgetInfo} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex gap-2">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full skeleton-pulse" />
        )}
        <AddExpense budgetId={id} refreshData={getBudgetInfo} />
      </div>
      <div className="mt-6">
        <ExpenseListTable expensesList={expensesList} refreshData={getBudgetInfo} />
      </div>
    </div>
  );
}
