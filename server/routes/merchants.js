import express from "express";
import mongoose from "mongoose";
import MerchantCategorization from "../models/MerchantCategorization.js";
import Merchant from "../models/Merchant.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get user's custom categorization rules
router.get("/rules", auth, async (req, res) => {
  try {
    const rules = await MerchantCategorization.find({
      createdBy: req.user.email,
    }).sort({ priority: -1, updatedAt: -1 });
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Upsert custom categorization rule
router.post("/rules", auth, async (req, res) => {
  try {
    const {
      merchantPattern,
      targetCategory,
      targetSubcategory,
      ruleType = "KEYWORD",
      priority = 1,
      notes = "",
    } = req.body;

    if (!merchantPattern || !targetCategory) {
      return res.status(400).json({ message: "merchantPattern and targetCategory are required" });
    }

    // Try to find if a similar pattern exists for this user to upsert
    const existingRule = await MerchantCategorization.findOne({
      createdBy: req.user.email,
      merchantPattern: merchantPattern.trim(),
    });

    if (existingRule) {
      existingRule.targetCategory = targetCategory;
      existingRule.targetSubcategory = targetSubcategory || "";
      existingRule.ruleType = ruleType;
      existingRule.priority = Number(priority);
      existingRule.notes = notes;
      await existingRule.save();
      return res.json({ message: "Rule updated successfully", rule: existingRule });
    }

    const rule = await MerchantCategorization.create({
      userId: req.user.id,
      createdBy: req.user.email,
      merchantPattern: merchantPattern.trim(),
      targetCategory,
      targetSubcategory: targetSubcategory || "",
      ruleType,
      priority: Number(priority),
      notes,
    });

    res.status(201).json({ message: "Rule created successfully", rule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete custom categorization rule
router.delete("/rules/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid rule ID" });
    }

    const result = await MerchantCategorization.deleteOne({
      _id: req.params.id,
      createdBy: req.user.email,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Rule not found or unauthorized" });
    }

    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get similar merchant alternatives / search
router.get("/alternatives", auth, async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category parameter is required" });
    }

    // Fetch up to 10 merchants in this category
    const merchants = await Merchant.find({
      primaryCategory: category,
    }).limit(10);

    res.json({ merchants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
