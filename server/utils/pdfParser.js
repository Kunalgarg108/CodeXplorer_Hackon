import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(pdfBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

export function extractTransactionLines(text) {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const transactions = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const transaction = parseTransactionLine(trimmed);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}

function parseTransactionLine(line) {
  const patterns = [
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+(.+?)\s+([\d,]+\.?\d*)\s+(DEBIT|CREDIT|DR|CR|-|[DP])/i,
    /(.+?)\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+([\d,]+\.?\d*)\s+(DEBIT|CREDIT|DR|CR|-|[DP])/i,
    /^(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+(.+?)\s+([\d,]+(?:,\d{3})*\.?\d*)\s*$/,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      let date, merchant, amount, txnType;

      if (pattern === patterns[0]) {
        date = parseDate(match[1]);
        merchant = match[2].trim();
        amount = parseAmount(match[3]);
        txnType = parseTxnType(match[4]);
      } else if (pattern === patterns[1]) {
        merchant = match[1].trim();
        date = parseDate(match[2]);
        amount = parseAmount(match[3]);
        txnType = "DEBIT";
      } else {
        date = parseDate(match[1]);
        merchant = match[2].trim();
        amount = parseAmount(match[3]);
        txnType = "DEBIT";
      }

      if (date && merchant && amount > 0) {
        return { date, merchant, amount, transactionType: txnType };
      }
    }
  }

  return null;
}

function parseDate(dateStr) {
  const separators = ["-", "/"];
  for (const sep of separators) {
    if (dateStr.includes(sep)) {
      const parts = dateStr.split(sep);
      if (parts.length === 3) {
        let day = parseInt(parts[0]);
        let month = parseInt(parts[1]);
        let year = parseInt(parts[2]);

        if (year < 100) year += 2000;
        if (day > 31) [day, month] = [month, day];

        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
  }
  return null;
}

function parseAmount(amountStr) {
  const cleaned = amountStr.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

function parseTxnType(typeStr) {
  const normalized = typeStr.toUpperCase();
  if (normalized === "CR" || normalized === "P" || normalized === "+")
    return "CREDIT";
  if (normalized === "DR" || normalized === "D" || normalized === "-")
    return "DEBIT";
  if (normalized.includes("CREDIT")) return "CREDIT";
  return "DEBIT";
}

export function validateTransaction(txn) {
  if (!txn.date || isNaN(txn.date.getTime())) return false;
  if (!txn.merchant || txn.merchant.trim().length === 0) return false;
  if (txn.amount <= 0) return false;
  if (!["DEBIT", "CREDIT"].includes(txn.transactionType)) return false;
  return true;
}
