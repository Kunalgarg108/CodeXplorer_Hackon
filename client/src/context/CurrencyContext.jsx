import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext(null);

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

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem("preferredCurrency") || "INR";
  });

  const setCurrency = (code) => {
    setCurrencyState(code);
    localStorage.setItem("preferredCurrency", code);
  };

  const rate = RATES_FROM_USD[currency] || 1;
  const symbol = SYMBOLS[currency] || "$";

  // Convert from USD (database currency) to selected currency
  const convert = (amountUSD) => {
    if (!amountUSD && amountUSD !== 0) return 0;
    return Number((amountUSD * rate).toFixed(2));
  };

  // Format with currency symbol
  const format = (amountUSD) => {
    const converted = convert(amountUSD);
    if (currency === "JPY") {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, rate, convert, format, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
