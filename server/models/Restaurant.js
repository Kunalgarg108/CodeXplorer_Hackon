import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: "Uncategorized" },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    restaurant_name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    items: [menuItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
