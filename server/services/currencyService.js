/**
 * Currency service with hardcoded rates (no external API dependency).
 * Rates are approximate USD-based and sufficient for hackathon demo.
 * In production, replace with live API calls.
 */

const RATES_FROM_USD = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.5,
  AUD: 1.53,
  CAD: 1.36,
};

const SYMBOLS = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

export function getExchangeRates() {
  return { base: "USD", rates: RATES_FROM_USD };
}

export function convertCurrency(amount, from, to) {
  if (from === to) return amount;
  const fromRate = RATES_FROM_USD[from] || 1;
  const toRate = RATES_FROM_USD[to] || 1;
  const usdAmount = amount / fromRate;
  return Number((usdAmount * toRate).toFixed(2));
}

export function getCurrencySymbol(currency) {
  return SYMBOLS[currency] || "$";
}

export function getSupportedCurrencies() {
  return Object.keys(RATES_FROM_USD).map((code) => ({
    code,
    symbol: SYMBOLS[code],
    name: code,
  }));
}
