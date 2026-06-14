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
import menuRoutes from "./routes/menu.js";
import wellnessRoutes from "./routes/wellness.js";
import budgetAlertRoutes from "./routes/budgetAlerts.js";
import chatRoutes from "./routes/chat.js";
import foodRecommendationRoutes from "./routes/foodRecommendations.js";
import fitnessRoutes from "./routes/fitness.js";
import currencyRoutes from "./routes/currency.js";
import thresholdRoutes from "./routes/thresholds.js";
import alertRoutes from "./routes/alerts.js";
import reportRoutes from "./routes/reports.js";

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
app.use("/api/menu", menuRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/budget-alerts", budgetAlertRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/food-recommendations", foodRecommendationRoutes);
app.use("/api/fitness", fitnessRoutes);
app.use("/api/currency", currencyRoutes);


app.use("/api/thresholds", thresholdRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);

const start = async () => {
  try {
    // Validate required env vars
    const required = ["OPENAI_API_KEY", "OPENAI_BASE_URL", "AWS_REGION"];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      console.warn(`⚠️  Missing env vars: ${missing.join(", ")}`);
    }


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
