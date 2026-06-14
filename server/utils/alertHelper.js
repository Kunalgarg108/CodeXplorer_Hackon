import Transaction from "../models/Transaction.js";
import SpendingThreshold from "../models/SpendingThreshold.js";
import SpendingAlert from "../models/SpendingAlert.js";

/**
 * Checks category thresholds for a given user and category, then triggers or clears alerts.
 * @param {string} userId - User's Mongoose ObjectId
 * @param {string} userEmail - User's email
 * @param {string} category - Budget category (e.g. "Food & Dining")
 * @param {Date|string} transactionDate - Reference date to determine the target month
 */
export async function checkCategoryThresholds(userId, userEmail, category, transactionDate) {
  try {
    if (!category) return;

    // 1. Determine current calendar month boundaries
    const date = new Date(transactionDate);
    if (isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // 2. Aggregate total DEBIT transactions for this category in the target month
    const transactions = await Transaction.find({
      userId,
      category,
      transactionType: "DEBIT",
      isIgnored: false,
      excludeFromAnalysis: false,
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = transactions.reduce((sum, txn) => sum + txn.amount, 0);

    // 3. Find active threshold
    const threshold = await SpendingThreshold.findOne({
      userId,
      category,
      thresholdType: "MONTHLY",
      isActive: true,
    });

    // 4. If no threshold exists, delete any existing budget alerts for this category
    if (!threshold) {
      await SpendingAlert.deleteMany({
        userId,
        category,
        alertType: { $in: ["THRESHOLD_EXCEEDED", "WARNING"] },
      });
      return;
    }

    const limit = threshold.thresholdAmount;
    const percentageUsed = limit > 0 ? (totalSpent / limit) * 100 : 0;
    const warningPct = threshold.warningPercentage || 90;

    if (percentageUsed >= 100) {
      // Clean up warning alert if it exists
      await SpendingAlert.deleteMany({
        userId,
        category,
        alertType: "WARNING",
      });

      // Upsert a THRESHOLD_EXCEEDED alert
      await SpendingAlert.findOneAndUpdate(
        {
          userId,
          category,
          alertType: "THRESHOLD_EXCEEDED",
        },
        {
          createdBy: userEmail,
          alertTitle: `Budget Limit Exceeded: ${category}`,
          alertMessage: `You have spent ₹${totalSpent.toFixed(2)} of your ₹${limit.toFixed(2)} monthly budget for ${category} (${Math.round(percentageUsed)}% used).`,
          currentSpent: totalSpent,
          thresholdAmount: limit,
          percentageUsed,
          isRead: false,
          readAt: null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else if (percentageUsed >= warningPct) {
      // Clean up limit exceeded alert if it exists (in case user deleted expenses)
      await SpendingAlert.deleteMany({
        userId,
        category,
        alertType: "THRESHOLD_EXCEEDED",
      });

      // Upsert a WARNING alert
      await SpendingAlert.findOneAndUpdate(
        {
          userId,
          category,
          alertType: "WARNING",
        },
        {
          createdBy: userEmail,
          alertTitle: `Budget Limit Warning: ${category}`,
          alertMessage: `You have spent ₹${totalSpent.toFixed(2)} of your ₹${limit.toFixed(2)} monthly budget for ${category} (${Math.round(percentageUsed)}% used).`,
          currentSpent: totalSpent,
          thresholdAmount: limit,
          percentageUsed,
          isRead: false,
          readAt: null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      // Clean up both alerts if spending is below warning limit
      await SpendingAlert.deleteMany({
        userId,
        category,
        alertType: { $in: ["THRESHOLD_EXCEEDED", "WARNING"] },
      });
    }
  } catch (error) {
    console.error(`Error checking category thresholds for ${category}:`, error);
  }
}
