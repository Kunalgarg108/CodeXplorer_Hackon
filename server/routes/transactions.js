import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import MerchantCategorization from "../models/MerchantCategorization.js";
import { auth } from "../middleware/auth.js";
import { categorizeTransactionMerchant } from "../utils/merchantCategorizer.js";

const router = express.Router();

const toTransactionResponse = (transaction) => ({
  id: transaction._id,
  userId: transaction.userId,
  createdBy: transaction.createdBy,
  bankStatementId: transaction.bankStatementId,
  merchantId: transaction.merchantId,
  transactionDate: transaction.transactionDate,
  merchantName: transaction.merchantName,
  amount: transaction.amount,
  transactionType: transaction.transactionType,
  category: transaction.category,
  subcategory: transaction.subcategory,
  categoryConfidence: transaction.categoryConfidence,
  manuallySet: transaction.manuallySet,
  excludeFromAnalysis: transaction.excludeFromAnalysis,
  isIgnored: transaction.isIgnored,
  description: transaction.description,
  tags: transaction.tags,
  rawText: transaction.rawText,
  source: transaction.source,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

router.get("/", auth, async (req, res) => {
  try {
    const {
      category,
      merchantName,
      bankStatementId,
      excludeIgnored,
      excludeFromAnalysis,
      limit = 100,
      page = 1,
    } = req.query;

    const filter = { createdBy: req.user.email };

    if (category) filter.category = category;
    if (merchantName)
      filter.merchantName = { $regex: merchantName, $options: "i" };
    if (bankStatementId && mongoose.Types.ObjectId.isValid(bankStatementId)) {
      filter.bankStatementId = new mongoose.Types.ObjectId(bankStatementId);
    }
    if (excludeIgnored === "true") filter.isIgnored = false;
    if (excludeFromAnalysis === "true") filter.excludeFromAnalysis = false;

    const safeLimit = Math.min(Number(limit) || 100, 200);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ transactionDate: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions: transactions.map(toTransactionResponse),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user.email,
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(toTransactionResponse(transaction));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      bankStatementId,
      merchantId,
      transactionDate,
      merchantName,
      amount,
      transactionType,
      category,
      subcategory,
      categoryConfidence,
      manuallySet,
      excludeFromAnalysis,
      isIgnored,
      description,
      tags,
      rawText,
      source,
    } = req.body;

    let finalCategory = category;
    let finalSubcategory = subcategory || "";
    let finalConfidence = Number(categoryConfidence) || 0;
    let finalMerchantId = merchantId || null;
    let finalManuallySet = Boolean(manuallySet);

    if (!finalCategory) {
      const categorization = await categorizeTransactionMerchant(
        req.user.id,
        req.user.email,
        merchantName
      );
      finalCategory = categorization.category;
      finalSubcategory = categorization.subcategory || "";
      finalConfidence = categorization.confidence;
      finalMerchantId = categorization.merchantId || finalMerchantId;
    } else {
      finalManuallySet = true;
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      createdBy: req.user.email,
      bankStatementId: bankStatementId || null,
      merchantId: finalMerchantId,
      transactionDate,
      merchantName,
      amount: Number(amount),
      transactionType,
      category: finalCategory || "Miscellaneous",
      subcategory: finalSubcategory,
      categoryConfidence: finalConfidence,
      manuallySet: finalManuallySet,
      excludeFromAnalysis: Boolean(excludeFromAnalysis),
      isIgnored: Boolean(isIgnored),
      description: description || "",
      tags: Array.isArray(tags) ? tags : [],
      rawText: rawText || "",
      source: source || "MANUAL",
    });

    res.status(201).json(toTransactionResponse(transaction));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const updates = {};
    const allowedFields = [
      "merchantId",
      "bankStatementId",
      "transactionDate",
      "merchantName",
      "amount",
      "transactionType",
      "category",
      "subcategory",
      "categoryConfidence",
      "manuallySet",
      "excludeFromAnalysis",
      "isIgnored",
      "description",
      "tags",
      "rawText",
      "source",
    ];

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    if ("amount" in updates) updates.amount = Number(updates.amount);
    if ("categoryConfidence" in updates)
      updates.categoryConfidence = Number(updates.categoryConfidence);
    if ("tags" in updates && !Array.isArray(updates.tags)) updates.tags = [];
    if (
      "merchantId" in updates &&
      updates.merchantId &&
      mongoose.Types.ObjectId.isValid(updates.merchantId)
    ) {
      updates.merchantId = new mongoose.Types.ObjectId(updates.merchantId);
    }
    if (
      "bankStatementId" in updates &&
      updates.bankStatementId &&
      mongoose.Types.ObjectId.isValid(updates.bankStatementId)
    ) {
      updates.bankStatementId = new mongoose.Types.ObjectId(
        updates.bankStatementId
      );
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.email },
      updates,
      { new: true }
    );

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(toTransactionResponse(transaction));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.email },
      { isIgnored: true, deletedAt: new Date() },
      { new: true }
    );

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json({
      message: "Transaction marked as ignored",
      transaction: toTransactionResponse(transaction),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/analytics/summary", auth, async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;

    const filter = {
      createdBy: req.user.email,
      isIgnored: false,
      excludeFromAnalysis: false,
    };

    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (type && ["DEBIT", "CREDIT"].includes(type))
      filter.transactionType = type;

    const [byCategory, byType, byMerchant, totalStats] = await Promise.all([
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$transactionType",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$merchantName",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalSpent: {
              $sum: {
                $cond: [{ $eq: ["$transactionType", "DEBIT"] }, "$amount", 0],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [{ $eq: ["$transactionType", "CREDIT"] }, "$amount", 0],
              },
            },
            transactionCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = totalStats[0] || {
      totalSpent: 0,
      totalReceived: 0,
      transactionCount: 0,
    };

    res.json({
      period: { startDate, endDate },
      stats: {
        totalSpent: stats.totalSpent,
        totalReceived: stats.totalReceived,
        netSpend: stats.totalSpent - stats.totalReceived,
        transactionCount: stats.transactionCount,
      },
      byCategory: byCategory.map((cat) => ({
        category: cat._id,
        amount: cat.total,
        count: cat.count,
      })),
      byType: byType.map((t) => ({
        type: t._id,
        amount: t.total,
        count: t.count,
      })),
      topMerchants: byMerchant.map((m) => ({
        merchant: m._id,
        amount: m.total,
        count: m.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/analytics/trends", auth, async (req, res) => {
  try {
    const { startDate, endDate, granularity = "daily" } = req.query;

    const filter = {
      createdBy: req.user.email,
      isIgnored: false,
      excludeFromAnalysis: false,
    };

    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (granularity) {
      case "weekly":
        dateFormat = { $week: "$transactionDate" };
        break;
      case "monthly":
        dateFormat = {
          $dateToString: { format: "%Y-%m", date: "$transactionDate" },
        };
        break;
      default:
        dateFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" },
        };
    }

    const trends = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: dateFormat,
          spent: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "DEBIT"] }, "$amount", 0],
            },
          },
          received: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "CREDIT"] }, "$amount", 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      granularity,
      period: { startDate, endDate },
      trends: trends.map((t) => ({
        date: t._id,
        spent: t.spent,
        received: t.received,
        net: t.spent - t.received,
        count: t.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/categorize", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const { category, subcategory = "", userConfirmed = true } = req.body;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user.email,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.category = category;
    transaction.subcategory = subcategory;
    transaction.categoryConfidence = 100;
    transaction.manuallySet = true;
    await transaction.save();

    // Auto-create/upsert rule for user
    if (transaction.merchantName) {
      const pattern = transaction.merchantName.trim();
      const existingRule = await MerchantCategorization.findOne({
        createdBy: req.user.email,
        merchantPattern: pattern,
      });

      if (existingRule) {
        existingRule.targetCategory = category;
        existingRule.targetSubcategory = subcategory;
        existingRule.isActive = true;
        await existingRule.save();
      } else {
        await MerchantCategorization.create({
          userId: req.user.id,
          createdBy: req.user.email,
          merchantPattern: pattern,
          targetCategory: category,
          targetSubcategory: subcategory,
          ruleType: "KEYWORD",
          priority: 1,
        });
      }
    }

    res.json({
      success: true,
      message: "Transaction recategorized and rule saved for future statements.",
      transaction: toTransactionResponse(transaction),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk-action", auth, async (req, res) => {
  try {
    const { transactionIds, action, category, subcategory = "", excludeFromAnalysis, tags } = req.body;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ message: "transactionIds must be a non-empty array" });
    }

    const validIds = transactionIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid transaction IDs provided" });
    }

    const query = { _id: { $in: validIds }, createdBy: req.user.email };

    if (action === "CATEGORIZE") {
      if (!category) {
        return res.status(400).json({ message: "Category is required for action CATEGORIZE" });
      }

      const txns = await Transaction.find(query);
      for (const txn of txns) {
        txn.category = category;
        txn.subcategory = subcategory;
        txn.categoryConfidence = 100;
        txn.manuallySet = true;
        await txn.save();

        if (txn.merchantName) {
          const pattern = txn.merchantName.trim();
          await MerchantCategorization.findOneAndUpdate(
            { createdBy: req.user.email, merchantPattern: pattern },
            {
              userId: req.user.id,
              createdBy: req.user.email,
              merchantPattern: pattern,
              targetCategory: category,
              targetSubcategory: subcategory,
              ruleType: "KEYWORD",
              priority: 1,
              isActive: true,
            },
            { upsert: true }
          );
        }
      }

      return res.json({ success: true, message: `Successfully categorized ${txns.length} transactions.` });
    }

    if (action === "EXCLUDE") {
      if (excludeFromAnalysis === undefined) {
        return res.status(400).json({ message: "excludeFromAnalysis is required for action EXCLUDE" });
      }

      const result = await Transaction.updateMany(query, {
        excludeFromAnalysis: Boolean(excludeFromAnalysis),
      });

      return res.json({
        success: true,
        message: `Successfully updated analysis exclusion for ${result.modifiedCount} transactions.`,
      });
    }

    if (action === "DELETE") {
      const result = await Transaction.updateMany(query, {
        isIgnored: true,
        deletedAt: new Date(),
      });

      return res.json({
        success: true,
        message: `Successfully soft-deleted ${result.modifiedCount} transactions.`,
      });
    }

    return res.status(400).json({ message: "Invalid action type" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
