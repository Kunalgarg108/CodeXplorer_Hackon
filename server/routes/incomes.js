import express from "express";
import Income from "../models/Income.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const incomes = await Income.find({ createdBy: req.user.email }).sort({ _id: -1 });
    res.json(
      incomes.map((i) => ({
        id: i._id,
        name: i.name,
        amount: i.amount,
        icon: i.icon,
        createdBy: i.createdBy,
        totalAmount: Number(i.amount) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, amount, icon } = req.body;
    const income = await Income.create({
      name,
      amount,
      icon,
      createdBy: req.user.email,
    });
    res.status(201).json({
      id: income._id,
      name: income.name,
      amount: income.amount,
      icon: income.icon,
      createdBy: income.createdBy,
      totalAmount: Number(income.amount) || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
