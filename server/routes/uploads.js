import express from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import BankStatement from "../models/BankStatement.js";
import Transaction from "../models/Transaction.js";
import { parseExcelOrCSV } from "../utils/excelParser.js";
import { categorizeMerchant, categorizeTransactionMerchant } from "../utils/merchantCategorizer.js";
import { findDuplicateTransactions } from "../utils/transactionHelper.js";
import { checkCategoryThresholds } from "../utils/alertHelper.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (["xlsx", "xls", "csv"].includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed"));
    }
  },
});

router.post("/upload", auth, upload.single("statement"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.id;
    const createdBy = req.user.email;
    const password = req.body.password || "";

    const bankStatement = new BankStatement({
      userId,
      createdBy,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      fileMimeType: req.file.mimetype,
      storageKey: `${userId}-${Date.now()}-${req.file.originalname}`,
      uploadedAt: new Date(),
      parsingStatus: "PARSING",
    });

    await bankStatement.save();

    try {
      const parsedData = await parseExcelOrCSV(req.file.buffer, req.file.originalname, password);

      const validTransactions = [];
      for (const txn of parsedData.transactions) {
        const categorization = await categorizeTransactionMerchant(
          userId,
          createdBy,
          txn.merchant
        );
        validTransactions.push({
          ...txn,
          category: categorization.category,
          subcategory: categorization.subcategory || "",
          categoryConfidence: categorization.confidence,
          merchantId: categorization.merchantId || null,
        });
      }

      const { toCheck, duplicates } = await findDuplicateTransactions(
        userId,
        validTransactions
      );

      bankStatement.parsingStatus = "SUCCESS";
      bankStatement.transactionCount = toCheck.length;
      bankStatement.reviewed = duplicates.length > 0;
      bankStatement.duplicatesFound = duplicates.length;
      bankStatement.duplicateTransactionIds = duplicates.map((d) =>
        d.existingTransaction._id.toString()
      );
      
      // Save metadata
      bankStatement.statementStartDate = parsedData.startDate || null;
      bankStatement.statementEndDate = parsedData.endDate || null;
      bankStatement.bank = parsedData.bank || "";
      bankStatement.accountNumber = parsedData.accountNumber || "";
      bankStatement.totalDebit = parsedData.totalDebit || 0;
      bankStatement.totalCredit = parsedData.totalCredit || 0;

      const tempTransactions = toCheck.map((txn) => ({
        transactionDate: txn.date,
        merchantName: txn.merchant,
        amount: txn.amount,
        transactionType: txn.transactionType,
        category: txn.category,
        subcategory: txn.subcategory || "",
        categoryConfidence: txn.categoryConfidence || 0,
        source: "BANK_STATEMENT",
        userId,
        createdBy,
      }));

      bankStatement._tempTransactions = tempTransactions;
      await bankStatement.save();

      res.status(200).json({
        message: "Spreadsheet parsed successfully",
        bankStatementId: bankStatement._id,
        transactionCount: toCheck.length,
        duplicatesFound: duplicates.length,
        requiresReview: duplicates.length > 0,
      });
    } catch (parseError) {
      if (parseError.message === "PASSWORD_REQUIRED" || parseError.message === "INVALID_PASSWORD") {
        bankStatement.parsingStatus = "FAILED";
        bankStatement.parsingError = parseError.message;
        await bankStatement.save();
        
        return res.status(401).json({
          error: parseError.message,
          message: parseError.message === "PASSWORD_REQUIRED" 
            ? "This bank statement is password protected. Please enter the password." 
            : "Incorrect password. Please try again.",
          bankStatementId: bankStatement._id,
        });
      }
      
      bankStatement.parsingStatus = "FAILED";
      bankStatement.parsingError = parseError.message;
      await bankStatement.save();

      res.status(400).json({
        error: "Failed to parse spreadsheet",
        details: parseError.message,
        bankStatementId: bankStatement._id,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/upload-preview/:bankStatementId", auth, async (req, res) => {
  try {
    const bankStatement = await BankStatement.findOne({
      _id: req.params.bankStatementId,
      createdBy: req.user.email,
    });

    if (!bankStatement) {
      return res.status(404).json({ error: "Bank statement not found" });
    }

    if (bankStatement.parsingStatus !== "SUCCESS") {
      return res.status(400).json({
        error: "Statement not ready for preview",
        status: bankStatement.parsingStatus,
      });
    }

    const tempTransactions = bankStatement._tempTransactions || [];

    res.status(200).json({
      bankStatementId: bankStatement._id,
      fileName: bankStatement.originalFileName,
      transactionCount: tempTransactions.length,
      duplicatesFound: bankStatement.duplicatesFound,
      transactions: tempTransactions.map((txn) => ({
        date: txn.transactionDate,
        merchant: txn.merchantName,
        amount: txn.amount,
        type: txn.transactionType,
        category: txn.category,
        confidence: txn.categoryConfidence,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/upload-confirm/:bankStatementId", auth, async (req, res) => {
  try {
    const bankStatement = await BankStatement.findOne({
      _id: req.params.bankStatementId,
      createdBy: req.user.email,
    });

    if (!bankStatement) {
      return res.status(404).json({ error: "Bank statement not found" });
    }

    if (bankStatement.accepted) {
      return res
        .status(400)
        .json({ error: "This statement has already been confirmed" });
    }

    const tempTransactions = bankStatement._tempTransactions || [];
    const savedTransactionIds = [];

    for (const txn of tempTransactions) {
      const transaction = new Transaction(txn);
      await transaction.save();
      savedTransactionIds.push(transaction._id);
    }

    bankStatement.transactionIds = savedTransactionIds;
    bankStatement.accepted = true;
    await bankStatement.save();

    // Trigger alert threshold checks for all imported transactions
    try {
      const categoryDates = new Map();
      for (const txn of tempTransactions) {
        if (txn.transactionType === "DEBIT" && txn.category) {
          const dateVal = new Date(txn.transactionDate);
          const key = `${txn.category}_${dateVal.getFullYear()}_${dateVal.getMonth()}`;
          categoryDates.set(key, { category: txn.category, date: dateVal });
        }
      }
      for (const val of categoryDates.values()) {
        await checkCategoryThresholds(req.user.id, req.user.email, val.category, val.date);
      }
    } catch (alertErr) {
      console.error("Error triggering alerts on upload confirmation:", alertErr);
    }

    res.status(200).json({
      message: "Transactions confirmed and saved",
      bankStatementId: bankStatement._id,
      savedCount: savedTransactionIds.length,
      transactionIds: savedTransactionIds,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/upload-cancel/:bankStatementId", auth, async (req, res) => {
  try {
    const bankStatement = await BankStatement.findOne({
      _id: req.params.bankStatementId,
      createdBy: req.user.email,
    });

    if (!bankStatement) {
      return res.status(404).json({ error: "Bank statement not found" });
    }

    if (bankStatement.accepted) {
      return res
        .status(400)
        .json({ error: "Cannot cancel an already accepted statement" });
    }

    await BankStatement.deleteOne({ _id: bankStatement._id });

    res.status(200).json({
      message: "Bank statement upload cancelled",
      bankStatementId: bankStatement._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
