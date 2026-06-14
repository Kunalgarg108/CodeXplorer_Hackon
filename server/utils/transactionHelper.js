import Transaction from "../models/Transaction.js";

export async function findDuplicateTransactions(userId, transactions) {
  const duplicates = [];
  const toCheck = [];

  for (const txn of transactions) {
    const existing = await Transaction.findOne({
      userId,
      transactionDate: {
        $gte: new Date(txn.date.getTime() - 3 * 24 * 60 * 60 * 1000),
        $lte: new Date(txn.date.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
      merchantName: { $regex: txn.merchant, $options: "i" },
      amount: {
        $gte: txn.amount * 0.95,
        $lte: txn.amount * 1.05,
      },
      isIgnored: false,
    });

    if (existing) {
      duplicates.push({
        newTransaction: txn,
        existingTransaction: existing,
      });
    } else {
      toCheck.push(txn);
    }
  }

  return { toCheck, duplicates };
}

export function groupTransactionsByMerchant(transactions) {
  const grouped = {};

  for (const txn of transactions) {
    const key = txn.merchant.toLowerCase();
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(txn);
  }

  return grouped;
}
