import mongoose from "mongoose";

const merchantCategorizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    merchantPattern: { type: String, required: true },
    targetCategory: { type: String, required: true, index: true },
    targetSubcategory: { type: String, default: "" },
    ruleType: {
      type: String,
      enum: ["EXACT", "REGEX", "KEYWORD"],
      default: "KEYWORD",
    },
    priority: { type: Number, default: 1 },
    appliedCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    lastApplied: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

merchantCategorizationSchema.index({ userId: 1, priority: -1, updatedAt: -1 });
merchantCategorizationSchema.index({ createdBy: 1, merchantPattern: 1 });

export default mongoose.model(
  "MerchantCategorization",
  merchantCategorizationSchema
);
