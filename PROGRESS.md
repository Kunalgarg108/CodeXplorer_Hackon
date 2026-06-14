# Progress Tracker - Advanced Transaction Analysis Features

This document tracks our progress through the feature phases of the automated transaction analysis tool.

---

## 🟢 What Has Been Done (Completed)

### 1. Database & Model Foundations (Step 2)
* **`BankStatement`**: Schema for statement files, parsing metadata, temp transactions, and review indicators.
* **`Transaction`**: Expanded schema for transaction details, categorization confidence, exclusions, and soft delete state.
* **`Merchant`**: Master database model to link common merchants and store default categories.
* **`MerchantCategorization`**: Schema for user-defined pattern matching rules.
* **`SpendingThreshold`**: Schema to store category limits (daily, weekly, monthly).

### 2. PDF Ingestion & Parsing Engine (Step 3 & Step 4)
* **Text Parser (`pdfParser.js`)**: Robust regex pattern extractor to parse dates, merchants, amounts, and transaction types.
* **Ingestion APIs (`uploads.js` & `bankStatements.js`)**:
  * `POST /api/uploads/upload`: Upload, extract text, run categorizations, check duplicates, and store temporarily.
  * `GET /api/uploads/upload-preview/:id`: Fetch temporary statements.
  * `POST /api/uploads/upload-confirm/:id`: Save temporary entries to the database.
  * `DELETE /api/uploads/upload-cancel/:id`: Clean up temporary uploads.

### 3. Rules & Categorization Engine (Step 4 & Step 5)
* **Categorizer (`merchantCategorizer.js`)**:
  * Evaluates user custom rules first (`EXACT`, `REGEX`, `KEYWORD`).
  * Matches against the `Merchant` master collection next.
  * Falls back to hardcoded regex categorizations.
* **Transaction Control APIs (`transactions.js`)**:
  * `PATCH /api/transactions/:id/categorize`: Recategorizes single transaction and auto-saves a keyword rule.
  * `POST /api/transactions/bulk-action`: Bulk operations for categorizing, excluding from analysis, and soft deleting.

### 4. Client-side Integration (Conflict Resolution)
* **API Client (`api.js`)**: Unified endpoints for both transactions and wellness/buddy endpoints.
* **Page Layouts (`App.jsx` & `DashboardLayout.jsx`)**: Connected transaction routes, menu listings with icon color classes, and resolved all imports.
* **Transaction Table (`TransactionList.jsx`)**: Supports checkboxes, bulk action bars (categorize/exclude/delete), and inline category changes with rule-matching.
* **Visual Charts (`AnalyticsDashboard.jsx`)**: Supports Pie, Bar, and Line charts displaying spending by category, top merchants, and daily trends.

---

## 🟡 What We Are Doing Next (Next Steps)

We are now starting **Component 2: Alerts & Thresholds System**, followed by the AI Recommendations and UI Refinements.

### 1. Component 2: Alerts & Thresholds System (Next Up)
* **`SpendingAlert` Model**: New Mongoose model to store alerts (`THRESHOLD_EXCEEDED`, `WARNING`, `ANOMALY`).
* **Threshold APIs (`thresholds.js`)**: CRUD routes to manage category limits and compute current month spending progress on the fly.
* **Notification APIs (`alerts.js`)**: Fetch, mark-read, and delete alerts.
* **Helper Engine (`alertHelper.js`)**: Aggregate monthly spending for specific categories and generate warning alerts (e.g. at 90%) or limit-exceeded alerts (at 100%).
* **Trigger Hooking**: Run alert checks during transaction insertions, edits, deletions, and statement confirmations.

### 2. Component 3: AI Insights & Recommendations
* **Insights Endpoint (`advice.js` modification)**: Compute top categories, recurring subscriptions, and prompt OpenAI to generate summary advice.
* **Subscription Detection Heuristics**: Match recurring intervals (+-3 days) and amounts (+-10%) across consecutive months.

### 3. Component 4: Tabs & Card UI Panels
* **Layout Tabs (`Transactions.jsx`)**: Divide page into "Dashboard & Analysis", "Alerts & Budgets", and "AI Insights".
* **`AlertsAndThresholds.jsx`**: Panel to set category limits and display active alert banners.
* **`InsightCards.jsx`**: Component to list AI spending advice, detected subscriptions, and alternative merchant recommendations.
