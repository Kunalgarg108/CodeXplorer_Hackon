import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finan-smart";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};

export default connectDB;
