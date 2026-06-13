import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: String, required: true },
    icon: { type: String, default: "😀" },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);
