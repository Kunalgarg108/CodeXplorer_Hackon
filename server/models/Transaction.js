import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    bankStatementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankStatement",
      default: null,
      index: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      default: null,
      index: true,
    },
    transactionDate: { type: Date, required: true, index: true },
    merchantName: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    transactionType: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
      default: "DEBIT",
    },
    category: { type: String, default: "Miscellaneous", index: true },
    subcategory: { type: String, default: "" },
    categoryConfidence: { type: Number, default: 0 },
    manuallySet: { type: Boolean, default: false },
    excludeFromAnalysis: { type: Boolean, default: false },
    isIgnored: { type: Boolean, default: false },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    rawText: { type: String, default: "" },
    source: {
      type: String,
      enum: ["MANUAL", "BANK_STATEMENT"],
      default: "MANUAL",
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ createdBy: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, category: 1, transactionDate: -1 });
transactionSchema.index({
  userId: 1,
  merchantName: 1,
  amount: 1,
  transactionDate: 1,
});

export default mongoose.model("Transaction", transactionSchema);
