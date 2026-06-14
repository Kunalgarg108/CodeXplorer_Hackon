import mongoose from "mongoose";

const spendingThresholdSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    thresholdType: {
      type: String,
      enum: ["MONTHLY", "WEEKLY", "DAILY"],
      default: "MONTHLY",
    },
    thresholdAmount: { type: Number, required: true },
    warningPercentage: { type: Number, default: 90 },
    isActive: { type: Boolean, default: true },
    notifyVia: { type: [String], default: ["IN_APP"] },
  },
  { timestamps: true }
);

spendingThresholdSchema.index(
  { userId: 1, category: 1, thresholdType: 1 },
  { unique: true }
);
spendingThresholdSchema.index({ createdBy: 1, category: 1, thresholdType: 1 });

export default mongoose.model("SpendingThreshold", spendingThresholdSchema);
