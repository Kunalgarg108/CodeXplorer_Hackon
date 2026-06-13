import express from "express";
import getFinancialAdvice from "../utils/getFinancialAdvice.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { totalBudget, totalIncome, totalSpend } = req.body;
    const advice = await getFinancialAdvice(totalBudget, totalIncome, totalSpend);
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
