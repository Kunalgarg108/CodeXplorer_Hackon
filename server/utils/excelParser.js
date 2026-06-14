import XLSX from "xlsx";
import officeCrypto from "officecrypto-tool";

/**
 * Decrypts (if needed) and parses bank statements in Excel (.xlsx, .xls) or CSV format.
 * Auto-detects columns dynamically to support various bank layouts.
 * 
 * @param {Buffer} fileBuffer The raw uploaded file buffer.
 * @param {string} originalFileName The name of the file uploaded.
 * @param {string} password Optional password for decryption.
 */
export async function parseExcelOrCSV(fileBuffer, originalFileName, password = "") {
  let decryptedBuffer = null;
  let isEnc = false;
  
  try {
    isEnc = officeCrypto.isEncrypted(fileBuffer);
  } catch (err) {
    // Standard CSVs or plain text files will fail cfb checks and default to false
    isEnc = false;
  }
  
  if (isEnc) {
    if (!password) {
      throw new Error("PASSWORD_REQUIRED");
    }
    try {
      decryptedBuffer = await officeCrypto.decrypt(fileBuffer, { password });
    } catch (err) {
      throw new Error("INVALID_PASSWORD");
    }
  }
  
  const bufferToParse = decryptedBuffer || fileBuffer;
  
  let workbook;
  try {
    workbook = XLSX.read(bufferToParse, { type: "buffer", cellDates: true });
  } catch (err) {
    throw new Error(`Failed to read spreadsheet file: ${err.message}`);
  }
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error("No worksheets found in the file.");
  }
  
  // Convert worksheet to a 2D array of raw values
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  if (rows.length === 0) {
    throw new Error("The worksheet is empty.");
  }
  
  let headerRowIndex = -1;
  let dateColIndex = -1;
  let descColIndex = -1;
  let debitColIndex = -1;
  let creditColIndex = -1;
  let amountColIndex = -1;
  let typeColIndex = -1;
  
  const dateKeywords = /date/i;
  const descKeywords = /(desc|detail|particular|narration)/i;
  const debitKeywords = /(debit|dr|withdraw)/i;
  const creditKeywords = /(credit|cr|deposit)/i;
  const amountKeywords = /amount/i;
  const typeKeywords = /(type|dr\/cr|dr_cr)/i;
  
  // Scan first 50 rows for headers
  const maxScanRows = Math.min(rows.length, 50);
  for (let r = 0; r < maxScanRows; r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    
    let tempDateIdx = -1;
    let tempDescIdx = -1;
    let tempDebitIdx = -1;
    let tempCreditIdx = -1;
    let tempAmountIdx = -1;
    let tempTypeIdx = -1;
    
    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c]).trim();
      if (!cellVal) continue;
      
      if (dateKeywords.test(cellVal) && tempDateIdx === -1) {
        tempDateIdx = c;
      } else if (descKeywords.test(cellVal) && tempDescIdx === -1) {
        tempDescIdx = c;
      } else if (debitKeywords.test(cellVal) && tempDebitIdx === -1) {
        tempDebitIdx = c;
      } else if (creditKeywords.test(cellVal) && tempCreditIdx === -1) {
        tempCreditIdx = c;
      } else if (amountKeywords.test(cellVal) && tempAmountIdx === -1) {
        if (debitKeywords.test(cellVal)) {
          tempDebitIdx = c;
        } else if (creditKeywords.test(cellVal)) {
          tempCreditIdx = c;
        } else {
          tempAmountIdx = c;
        }
      } else if (typeKeywords.test(cellVal) && tempTypeIdx === -1) {
        tempTypeIdx = c;
      }
    }
    
    const hasDateAndDesc = tempDateIdx !== -1 && tempDescIdx !== -1;
    const hasDebitAndCredit = tempDebitIdx !== -1 && tempCreditIdx !== -1;
    const hasSingleAmount = tempAmountIdx !== -1;
    
    if (hasDateAndDesc && (hasDebitAndCredit || hasSingleAmount || tempDebitIdx !== -1 || tempCreditIdx !== -1)) {
      headerRowIndex = r;
      dateColIndex = tempDateIdx;
      descColIndex = tempDescIdx;
      debitColIndex = tempDebitIdx;
      creditColIndex = tempCreditIdx;
      amountColIndex = tempAmountIdx;
      typeColIndex = tempTypeIdx;
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    throw new Error("Could not detect statement table header. Please make sure columns for Date, Details, and Amount/Debit/Credit are visible.");
  }
  
  const transactions = [];
  let totalDebit = 0;
  let totalCredit = 0;
  
  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!Array.isArray(row) || row.length === 0) continue;
    
    const dateVal = row[dateColIndex];
    const descVal = row[descColIndex];
    
    if (!dateVal || !descVal) continue;
    
    const parsedDate = parseExcelDate(dateVal);
    if (!parsedDate || isNaN(parsedDate.getTime())) continue;
    
    const description = String(descVal).trim();
    if (!description) continue;
    
    // Stop parsing if we hit standard statement footer summaries
    if (/^(total|brought forward|carried forward|summary|page|balance b\/f|balance c\/f)/i.test(description)) {
      break;
    }
    
    let amount = 0;
    let transactionType = "DEBIT";
    
    if (debitColIndex !== -1 || creditColIndex !== -1) {
      const debitVal = debitColIndex !== -1 ? row[debitColIndex] : "";
      const creditVal = creditColIndex !== -1 ? row[creditColIndex] : "";
      
      const drAmt = parseExcelAmount(debitVal);
      const crAmt = parseExcelAmount(creditVal);
      
      if (drAmt > 0) {
        amount = drAmt;
        transactionType = "DEBIT";
        totalDebit += drAmt;
      } else if (crAmt > 0) {
        amount = crAmt;
        transactionType = "CREDIT";
        totalCredit += crAmt;
      } else {
        continue;
      }
    } else if (amountColIndex !== -1) {
      const amtVal = row[amountColIndex];
      const rawAmt = parseExcelAmount(amtVal);
      if (rawAmt === 0) continue;
      
      let isCredit = false;
      if (typeColIndex !== -1) {
        const typeVal = String(row[typeColIndex]).trim().toUpperCase();
        if (typeVal.includes("CR") || typeVal.includes("CREDIT") || typeVal.includes("DEP") || typeVal === "+") {
          isCredit = true;
        }
      } else {
        if (typeof amtVal === "number" && amtVal > 0) {
          isCredit = true;
        } else if (typeof amtVal === "string" && !amtVal.includes("-")) {
          isCredit = true;
        }
      }
      
      amount = rawAmt;
      if (isCredit) {
        transactionType = "CREDIT";
        totalCredit += rawAmt;
      } else {
        transactionType = "DEBIT";
        totalDebit += rawAmt;
      }
    } else {
      continue;
    }
    
    transactions.push({
      date: parsedDate,
      merchant: description,
      amount,
      transactionType,
    });
  }
  
  let startDate = null;
  let endDate = null;
  if (transactions.length > 0) {
    const dates = transactions.map(t => t.date.getTime());
    startDate = new Date(Math.min(...dates));
    endDate = new Date(Math.max(...dates));
  }
  
  let bank = "Unknown Bank";
  const lowerName = originalFileName.toLowerCase();
  if (lowerName.includes("sbi") || lowerName.includes("state bank")) {
    bank = "State Bank of India";
  } else if (lowerName.includes("pnb") || lowerName.includes("punjab")) {
    bank = "Punjab National Bank";
  } else if (lowerName.includes("hdfc")) {
    bank = "HDFC Bank";
  } else if (lowerName.includes("icici")) {
    bank = "ICICI Bank";
  }
  
  let accountNumber = "";
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    const rowStr = row.join(" ");
    const accMatch = rowStr.match(/(?:account\s*no|account\s*number|a\/c\s*no|a\/c\s*number|acc\s*no)\s*[:\-\s]\s*(\d+\w*)/i);
    if (accMatch) {
      accountNumber = accMatch[1];
      break;
    }
  }
  
  return {
    transactions,
    transactionCount: transactions.length,
    totalDebit,
    totalCredit,
    startDate,
    endDate,
    bank,
    accountNumber,
  };
}

function parseExcelDate(val) {
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    return excelDateToJSDate(val);
  }
  if (typeof val === "string") {
    const cleaned = val.trim();
    const dateMatch = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
    if (dateMatch) {
      let day = parseInt(dateMatch[1]);
      let month = parseInt(dateMatch[2]);
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += 2000;
      if (day > 31) {
        [day, month] = [month, day];
      }
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  
  const fractional_day = serial - 25569 - utc_days;
  let temp = fractional_day * 24;
  const hours = Math.floor(temp);
  temp = (temp - hours) * 60;
  const minutes = Math.floor(temp);
  temp = (temp - minutes) * 60;
  const seconds = Math.round(temp);
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

function parseExcelAmount(val) {
  if (typeof val === "number") return Math.abs(val);
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.abs(num);
  }
  return 0;
}
