import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, default: "" },
    alternateNames: { type: [String], default: [] },
    primaryCategory: { type: String, required: true, index: true },
    subcategory: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    website: { type: String, default: "" },
    averageTransaction: { type: Number, default: 0 },
    frequency: {
      type: String,
      enum: ["ONE_TIME", "RECURRING", "SUBSCRIPTION"],
      default: "ONE_TIME",
    },
    isNecessary: { type: Boolean, default: false },
    recommendedBudget: { type: Number, default: 0 },
    createdBy: { type: String, default: "" },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

merchantSchema.index({ name: "text", alternateNames: "text" });
merchantSchema.index({ primaryCategory: 1, subcategory: 1 });

export default mongoose.model("Merchant", merchantSchema);
