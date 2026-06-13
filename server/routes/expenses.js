import express from "express";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ createdBy: req.user.email }).select("_id");
    const budgetIds = budgets.map((b) => b._id);
    const expenses = await Expense.find({ budgetId: { $in: budgetIds } }).sort({ _id: -1 });
    res.json(
      expenses.map((e) => ({
        id: e._id,
        name: e.name,
        amount: e.amount,
        createdAt: e.createdAt,
        budgetId: e.budgetId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/budget/:budgetId", auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.budgetId,
      createdBy: req.user.email,
    });
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    const expenses = await Expense.find({ budgetId: budget._id }).sort({ _id: -1 });
    res.json(
      expenses.map((e) => ({
        id: e._id,
        name: e.name,
        amount: e.amount,
        createdAt: e.createdAt,
        budgetId: e.budgetId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, amount, budgetId, createdAt } = req.body;
    const budget = await Budget.findOne({ _id: budgetId, createdBy: req.user.email });
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    const expense = await Expense.create({
      name,
      amount: Number(amount),
      budgetId,
      createdAt,
    });
    res.status(201).json({
      id: expense._id,
      name: expense.name,
      amount: expense.amount,
      createdAt: expense.createdAt,
      budgetId: expense.budgetId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const budget = await Budget.findOne({
      _id: expense.budgetId,
      createdBy: req.user.email,
    });
    if (!budget) return res.status(403).json({ message: "Forbidden" });

    await Expense.deleteOne({ _id: expense._id });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
