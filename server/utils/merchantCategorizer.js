import MerchantCategorization from "../models/MerchantCategorization.js";
import Merchant from "../models/Merchant.js";

const merchantRules = {
  "Food & Dining": {
    pattern:
      /(swiggy|zomato|ubereats|dunzo|dominos|kfc|mcdonalds|burger|pizza|restaurant|cafe|coffee|starbucks|blinkit|bigbasket|grocery|food|diner)/i,
    confidence: 90,
  },
  Transport: {
    pattern:
      /(uber|ola|rapido|taxi|ride|fuel|petrol|shell|bp|parking|metro|bus|train|flight)/i,
    confidence: 85,
  },
  Entertainment: {
    pattern:
      /(netflix|amazon|prime|hotstar|sony|zee|disney|movie|game|gaming|playstation|xbox|steam|spotify|music|book|kindle)/i,
    confidence: 80,
  },
  Shopping: {
    pattern:
      /(amazon|flipkart|myntra|uniqlo|h&m|clothing|shoes|apparel|fashion|nike|puma|adidas|mall|retail|store|shop)/i,
    confidence: 85,
  },
  Utilities: {
    pattern:
      /(bill|water|electric|gas|internet|mobile|phone|bsnl|airtel|jio|vodafone|recharge|subscription|insurance|rent)/i,
    confidence: 85,
  },
  "Health & Fitness": {
    pattern:
      /(gym|fitness|yoga|health|doctor|hospital|clinic|medicine|pharmacy|cult|peloton|exercise|wellness)/i,
    confidence: 80,
  },
  Education: {
    pattern:
      /(school|college|university|course|training|udemy|coursera|education|tuition|fees|exam|test)/i,
    confidence: 80,
  },
  Personal: {
    pattern:
      /(salon|haircut|spa|massage|beauty|makeup|barber|grooming|personal)/i,
    confidence: 75,
  },
};

export function categorizeMerchant(merchantName) {
  const normalized = merchantName.toLowerCase();

  for (const [category, rule] of Object.entries(merchantRules)) {
    if (rule.pattern.test(normalized)) {
      return {
        category,
        confidence: rule.confidence,
      };
    }
  }

  return {
    category: "Miscellaneous",
    confidence: 0,
  };
}

export function getMerchantCategoryByExact(merchantName) {
  const merchantLower = merchantName.toLowerCase();

  const exactMatches = {
    Swiggy: "Food & Dining",
    Zomato: "Food & Dining",
    "Uber Eats": "Food & Dining",
    Uber: "Transport",
    Ola: "Transport",
    Netflix: "Entertainment",
    Amazon: "Shopping",
    Spotify: "Entertainment",
    Flipkart: "Shopping",
    Myntra: "Shopping",
    "Cult.fit": "Health & Fitness",
    Blinkit: "Food & Dining",
    BigBasket: "Food & Dining",
  };

  for (const [merchant, category] of Object.entries(exactMatches)) {
    if (merchantLower.includes(merchant.toLowerCase())) {
      return {
        category,
        confidence: 95,
      };
    }
  }

  return categorizeMerchant(merchantName);
}

export async function categorizeTransactionMerchant(userId, userEmail, merchantName) {
  if (!merchantName) {
    return { category: "Miscellaneous", subcategory: "", confidence: 0 };
  }

  const normalized = merchantName.trim();

  // 1. Try Custom Rules
  try {
    const rules = await MerchantCategorization.find({
      createdBy: userEmail,
      isActive: true,
    }).sort({ priority: -1, updatedAt: -1 });

    for (const rule of rules) {
      let isMatch = false;
      const pattern = rule.merchantPattern.trim().toLowerCase();
      const testName = normalized.toLowerCase();

      if (rule.ruleType === "EXACT") {
        isMatch = testName === pattern;
      } else if (rule.ruleType === "REGEX") {
        try {
          const regex = new RegExp(rule.merchantPattern, "i");
          isMatch = regex.test(normalized);
        } catch (e) {
          // invalid regex
        }
      } else {
        // KEYWORD
        isMatch = testName.includes(pattern);
      }

      if (isMatch) {
        // Update stats async
        rule.appliedCount = (rule.appliedCount || 0) + 1;
        rule.lastApplied = new Date();
        await rule.save().catch((err) => console.error("Error saving rule stats:", err));

        return {
          category: rule.targetCategory,
          subcategory: rule.targetSubcategory || "",
          confidence: 100,
          ruleId: rule._id,
        };
      }
    }
  } catch (error) {
    console.error("Error evaluating custom categorization rules:", error);
  }

  // 2. Try Master Merchant DB
  try {
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const dbMerchant = await Merchant.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${escaped}$`, "i") } },
        { alternateNames: { $regex: new RegExp(`^${escaped}$`, "i") } },
      ],
    });

    if (dbMerchant) {
      return {
        category: dbMerchant.primaryCategory,
        subcategory: dbMerchant.subcategory || "",
        confidence: 95,
        merchantId: dbMerchant._id,
      };
    }
  } catch (error) {
    console.error("Error querying master merchant DB:", error);
  }

  // 3. Fallback to hardcoded rules
  const fallback = getMerchantCategoryByExact(normalized);
  return {
    category: fallback.category,
    subcategory: "",
    confidence: fallback.confidence,
  };
}
