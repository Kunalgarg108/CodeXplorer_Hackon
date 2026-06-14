import express from "express";
import { getExchangeRates, getSupportedCurrencies, getCurrencySymbol } from "../services/currencyService.js";

const router = express.Router();

// GET /api/currency/rates - get all exchange rates
router.get("/rates", (req, res) => {
  const data = getExchangeRates();
  res.json(data);
});

// GET /api/currency/supported - get supported currencies
router.get("/supported", (req, res) => {
  res.json(getSupportedCurrencies());
});

export default router;
