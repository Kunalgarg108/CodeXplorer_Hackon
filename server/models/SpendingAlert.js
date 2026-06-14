import mongoose from "mongoose";

const spendingAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    alertType: {
      type: String,
      enum: ["THRESHOLD_EXCEEDED", "WARNING", "ANOMALY", "SUGGESTION"],
      required: true,
    },
    category: { type: String, required: true },
    alertTitle: { type: String, required: true },
    alertMessage: { type: String, required: true },
    currentSpent: { type: Number, default: 0 },
    thresholdAmount: { type: Number, default: 0 },
    percentageUsed: { type: Number, default: 0 },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

spendingAlertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
spendingAlertSchema.index({ createdBy: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("SpendingAlert", spendingAlertSchema);
