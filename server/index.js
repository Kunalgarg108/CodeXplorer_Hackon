import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import budgetRoutes from "./routes/budgets.js";
import incomeRoutes from "./routes/incomes.js";
import expenseRoutes from "./routes/expenses.js";
import transactionRoutes from "./routes/transactions.js";
import bankStatementRoutes from "./routes/bankStatements.js";
import uploadRoutes from "./routes/uploads.js";
import adviceRoutes from "./routes/advice.js";
import merchantRoutes from "./routes/merchants.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bank-statements", bankStatementRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/advice", adviceRoutes);
app.use("/api/merchants", merchantRoutes);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
