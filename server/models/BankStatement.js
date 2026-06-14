import mongoose from "mongoose";

const bankStatementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    originalFileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    fileMimeType: { type: String, default: "application/pdf" },
    storageKey: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
    parsingStatus: {
      type: String,
      enum: ["PENDING", "PARSING", "SUCCESS", "FAILED"],
      default: "PENDING",
      index: true,
    },
    parsingError: { type: String, default: "" },
    statementStartDate: { type: Date, default: null },
    statementEndDate: { type: Date, default: null },
    bank: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    transactionCount: { type: Number, default: 0 },
    totalDebit: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },
    transactionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Transaction",
      default: [],
    },
    duplicatesFound: { type: Number, default: 0 },
    duplicateTransactionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Transaction",
      default: [],
    },
    reviewed: { type: Boolean, default: false },
    accepted: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    _tempTransactions: { type: Array, default: [] },
  },
  { timestamps: true }
);

bankStatementSchema.index({ userId: 1, uploadedAt: -1 });
bankStatementSchema.index({ createdBy: 1, uploadedAt: -1 });
bankStatementSchema.index({ userId: 1, parsingStatus: 1, uploadedAt: -1 });

export default mongoose.model("BankStatement", bankStatementSchema);
