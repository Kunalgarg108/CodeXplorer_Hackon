import mongoose from "mongoose";

const menuJobSchema = new mongoose.Schema(
  {
    restaurant_name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("MenuJob", menuJobSchema);
