import express from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const budgetWithStats = async (filter) => {
  return Budget.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "expenses",
        localField: "_id",
        foreignField: "budgetId",
        as: "expenses",
      },
    },
    {
      $addFields: {
        totalSpend: { $sum: "$expenses.amount" },
        totalItem: { $size: "$expenses" },
      },
    },
    { $project: { expenses: 0 } },
    { $sort: { _id: -1 } },
  ]);
};

router.get("/", auth, async (req, res) => {
  try {
    const budgets = await budgetWithStats({ createdBy: req.user.email });
    res.json(
      budgets.map((b) => ({
        id: b._id,
        name: b.name,
        amount: b.amount,
        icon: b.icon,
        createdBy: b.createdBy,
        totalSpend: b.totalSpend || 0,
        totalItem: b.totalItem || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const budgets = await budgetWithStats({
      _id: new mongoose.Types.ObjectId(req.params.id),
      createdBy: req.user.email,
    });
    if (!budgets.length) return res.status(404).json({ message: "Budget not found" });
    const b = budgets[0];
    res.json({
      id: b._id,
      name: b.name,
      amount: b.amount,
      icon: b.icon,
      createdBy: b.createdBy,
      totalSpend: b.totalSpend || 0,
      totalItem: b.totalItem || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, amount, icon } = req.body;
    const budget = await Budget.create({
      name,
      amount,
      icon,
      createdBy: req.user.email,
    });
    res.status(201).json({
      id: budget._id,
      name: budget.name,
      amount: budget.amount,
      icon: budget.icon,
      createdBy: budget.createdBy,
      totalSpend: 0,
      totalItem: 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { name, amount, icon } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.email },
      { name, amount, icon },
      { new: true }
    );
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json({
      id: budget._id,
      name: budget.name,
      amount: budget.amount,
      icon: budget.icon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      createdBy: req.user.email,
    });
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    await Expense.deleteMany({ budgetId: budget._id });
    await Budget.deleteOne({ _id: budget._id });
    res.json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
