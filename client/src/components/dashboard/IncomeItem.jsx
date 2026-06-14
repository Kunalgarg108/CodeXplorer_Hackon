import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
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

export default function IncomeItem({ income, refreshData }) {
  const { format } = useCurrency();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteIncome(income.id);
      toast.success("Income deleted successfully.");
      if (refreshData) refreshData();
    } catch (err) {
      toast.error(err.message || "Failed to delete income.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="neo-card hover:shadow-neo-glow transition-shadow h-[170px] flex flex-col justify-between">
      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <span className="text-2xl p-3 bg-indigo rounded-tag shadow-neo">{income?.icon}</span>
          <div>
            <h2 className="font-display font-medium text-paper">{income.name}</h2>
            <p className="text-xs text-mist font-thin">Monthly income</p>
          </div>
        </div>
        <h2 className="font-display font-semibold text-tag-lime text-lg">{format(income.amount)}</h2>
      </div>

      <div className="flex justify-end mt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-1.5 text-tag-coral hover:text-tag-ember text-[13px] font-thin h-11 px-3 rounded-lg hover:bg-tag-coral/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Income?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This income source will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
