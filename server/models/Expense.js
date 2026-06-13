import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
