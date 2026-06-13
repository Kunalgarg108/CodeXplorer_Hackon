import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: String, required: true },
    icon: { type: String, default: "😀" },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
