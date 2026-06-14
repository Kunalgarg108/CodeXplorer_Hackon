import express from "express";
import mongoose from "mongoose";
import SpendingThreshold from "../models/SpendingThreshold.js";
import Transaction from "../models/Transaction.js";
import SpendingAlert from "../models/SpendingAlert.js";
import { auth } from "../middleware/auth.js";
import { checkCategoryThresholds } from "../utils/alertHelper.js";

const router = express.Router();

// GET /api/thresholds - Get all category thresholds with monthly progress
router.get("/", auth, async (req, res) => {
  try {
    const thresholds = await SpendingThreshold.find({ userId: req.user.id });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const thresholdList = [];
    for (const t of thresholds) {
      // Aggregate this month's spent for this category
      const transactions = await Transaction.find({
        userId: req.user.id,
        category: t.category,
        transactionType: "DEBIT",
        isIgnored: false,
        excludeFromAnalysis: false,
        transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const currentSpent = transactions.reduce((sum, txn) => sum + txn.amount, 0);
      const percentageUsed = t.thresholdAmount > 0 ? (currentSpent / t.thresholdAmount) * 100 : 0;

      thresholdList.push({
        id: t._id,
        category: t.category,
        thresholdType: t.thresholdType,
        thresholdAmount: t.thresholdAmount,
        warningPercentage: t.warningPercentage,
        isActive: t.isActive,
        notifyVia: t.notifyVia,
        currentSpent,
        percentageUsed,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      });
    }

    res.json({ thresholds: thresholdList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/thresholds - Create or upsert a threshold for a category
router.post("/", auth, async (req, res) => {
  try {
    const { category, thresholdAmount, warningPercentage = 90, thresholdType = "MONTHLY", isActive = true } = req.body;

    if (!category || thresholdAmount === undefined) {
      return res.status(400).json({ message: "category and thresholdAmount are required" });
    }

    const threshold = await SpendingThreshold.findOneAndUpdate(
      {
        userId: req.user.id,
        category,
        thresholdType,
      },
      {
        createdBy: req.user.email,
        thresholdAmount: Number(thresholdAmount),
        warningPercentage: Number(warningPercentage),
        isActive: Boolean(isActive),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Re-check thresholds for this category to generate alerts immediately
    await checkCategoryThresholds(req.user.id, req.user.email, category, new Date());

    res.status(201).json({ threshold });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/thresholds/:id - Update threshold details
router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid threshold ID" });
    }

    const { thresholdAmount, warningPercentage, isActive } = req.body;
    const updates = {};
    if (thresholdAmount !== undefined) updates.thresholdAmount = Number(thresholdAmount);
    if (warningPercentage !== undefined) updates.warningPercentage = Number(warningPercentage);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const threshold = await SpendingThreshold.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!threshold) {
      return res.status(404).json({ message: "Threshold not found or unauthorized" });
    }

    // Re-check alerts for this category
    await checkCategoryThresholds(req.user.id, req.user.email, threshold.category, new Date());

    res.json({ threshold });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/thresholds/:id - Remove a threshold
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid threshold ID" });
    }

    const threshold = await SpendingThreshold.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!threshold) {
      return res.status(404).json({ message: "Threshold not found or unauthorized" });
    }

    // Clean up related alert notifications
    await SpendingAlert.deleteMany({
      userId: req.user.id,
      category: threshold.category,
      alertType: { $in: ["THRESHOLD_EXCEEDED", "WARNING"] },
    });

    res.json({ message: "Threshold deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
