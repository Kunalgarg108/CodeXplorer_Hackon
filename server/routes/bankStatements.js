import express from "express";
import mongoose from "mongoose";
import BankStatement from "../models/BankStatement.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const toBankStatementResponse = (statement) => ({
  id: statement._id,
  userId: statement.userId,
  createdBy: statement.createdBy,
  originalFileName: statement.originalFileName,
  fileSize: statement.fileSize,
  fileMimeType: statement.fileMimeType,
  storageKey: statement.storageKey,
  uploadedAt: statement.uploadedAt,
  parsingStatus: statement.parsingStatus,
  parsingError: statement.parsingError,
  statementStartDate: statement.statementStartDate,
  statementEndDate: statement.statementEndDate,
  bank: statement.bank,
  accountNumber: statement.accountNumber,
  transactionCount: statement.transactionCount,
  totalDebit: statement.totalDebit,
  totalCredit: statement.totalCredit,
  transactionIds: statement.transactionIds,
  duplicatesFound: statement.duplicatesFound,
  duplicateTransactionIds: statement.duplicateTransactionIds,
  reviewed: statement.reviewed,
  accepted: statement.accepted,
  notes: statement.notes,
  createdAt: statement.createdAt,
  updatedAt: statement.updatedAt,
});

router.get("/", auth, async (req, res) => {
  try {
    const statements = await BankStatement.find({
      createdBy: req.user.email,
    }).sort({ uploadedAt: -1, _id: -1 });
    res.json({ statements: statements.map(toBankStatementResponse) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid bank statement id" });
    }

    const statement = await BankStatement.findOne({
      _id: req.params.id,
      createdBy: req.user.email,
    });

    if (!statement)
      return res.status(404).json({ message: "Bank statement not found" });
    res.json(toBankStatementResponse(statement));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const statement = await BankStatement.create({
      userId: req.user.id,
      createdBy: req.user.email,
      originalFileName: req.body.originalFileName || "",
      fileSize: Number(req.body.fileSize) || 0,
      fileMimeType: req.body.fileMimeType || "application/pdf",
      storageKey: req.body.storageKey || "",
      uploadedAt: req.body.uploadedAt || new Date(),
      parsingStatus: req.body.parsingStatus || "PENDING",
      parsingError: req.body.parsingError || "",
      statementStartDate: req.body.statementStartDate || null,
      statementEndDate: req.body.statementEndDate || null,
      bank: req.body.bank || "",
      accountNumber: req.body.accountNumber || "",
      transactionCount: Number(req.body.transactionCount) || 0,
      totalDebit: Number(req.body.totalDebit) || 0,
      totalCredit: Number(req.body.totalCredit) || 0,
      transactionIds: Array.isArray(req.body.transactionIds)
        ? req.body.transactionIds
        : [],
      duplicatesFound: Number(req.body.duplicatesFound) || 0,
      duplicateTransactionIds: Array.isArray(req.body.duplicateTransactionIds)
        ? req.body.duplicateTransactionIds
        : [],
      reviewed: Boolean(req.body.reviewed),
      accepted: Boolean(req.body.accepted),
      notes: req.body.notes || "",
    });

    res.status(201).json(toBankStatementResponse(statement));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid bank statement id" });
    }

    const updates = {};
    const allowedFields = [
      "originalFileName",
      "fileSize",
      "fileMimeType",
      "storageKey",
      "uploadedAt",
      "parsingStatus",
      "parsingError",
      "statementStartDate",
      "statementEndDate",
      "bank",
      "accountNumber",
      "transactionCount",
      "totalDebit",
      "totalCredit",
      "transactionIds",
      "duplicatesFound",
      "duplicateTransactionIds",
      "reviewed",
      "accepted",
      "notes",
    ];

    for (const field of allowedFields) {
      if (field in req.body) updates[field] = req.body[field];
    }

    if ("fileSize" in updates) updates.fileSize = Number(updates.fileSize);
    if ("transactionCount" in updates)
      updates.transactionCount = Number(updates.transactionCount);
    if ("totalDebit" in updates)
      updates.totalDebit = Number(updates.totalDebit);
    if ("totalCredit" in updates)
      updates.totalCredit = Number(updates.totalCredit);
    if ("duplicatesFound" in updates)
      updates.duplicatesFound = Number(updates.duplicatesFound);
    if ("transactionIds" in updates && !Array.isArray(updates.transactionIds))
      updates.transactionIds = [];
    if (
      "duplicateTransactionIds" in updates &&
      !Array.isArray(updates.duplicateTransactionIds)
    )
      updates.duplicateTransactionIds = [];

    const statement = await BankStatement.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.email },
      updates,
      { new: true }
    );

    if (!statement)
      return res.status(404).json({ message: "Bank statement not found" });
    res.json(toBankStatementResponse(statement));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
