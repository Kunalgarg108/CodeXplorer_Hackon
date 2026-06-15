<img width="1917" height="826" alt="Screenshot 2026-06-15 213711" src="https://github.com/user-attachments/assets/297298e2-773d-49c7-8768-7bb1019f31e3" /># PocketBuddy – AI Financial & Wellness Assistant for Students

> **An Intelligent, Secure, and Wellness-Focused Expense Hub powered by Amazon Web Services (AWS)**

---

## Amazon HackOn Highlight

**PocketBuddy** is a state-of-the-art personal finance management ecosystem designed specifically for students. It goes beyond basic expense logging by leveraging **AWS Cloud Services** and **Amazon Bedrock AI** to help students manage budgets, analyze bank statements, identify hidden subscription fees, compare merchant prices, and correlate physical health with financial stress.

### Central Pillars of AWS Integration
1. **Serverless AI Core via AWS Bedrock** : Financial advice, subscription detection heuristics, interactive chat, and wellness advice are orchestrated via **AWS Bedrock API** using the `@aws-sdk/client-bedrock-runtime` SDK and the high-throughput Bedrock Mantle OpenAI-compatible endpoints.
2. **AI-Driven Menu OCR Parsing** 📸: Students can photograph restaurant menus to extract dishes, categories, and prices into structured database records using a pipeline of local OCR (Tesseract) and **AWS Bedrock LLMs** (`openai.gpt-oss-120b` or Anthropic Claude models like `us.anthropic.claude-haiku-4-5-20251001-v1:0`).
3. **AWS Enterprise Security Practices** : Sensitive server-side keys including `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` are isolated within encrypted, non-public environment configurations. Authorization is maintained through strict token validation (JWT) for secure data flow.

---

## Project Screenshots

### 1. Landing Page
<img width="1919" height="827" alt="Screenshot 2026-06-15 213356" src="https://github.com/user-attachments/assets/c536309b-f525-4510-a43b-73e79996cc25" />
<img width="1919" height="824" alt="Screenshot 2026-06-15 213417" src="https://github.com/user-attachments/assets/025347dc-0340-4ef8-9922-daa6e04cab20" />


### 2. Student Dashboard Overview
<img width="1919" height="822" alt="Screenshot 2026-06-15 213500" src="https://github.com/user-attachments/assets/eec7f6cd-e67a-463f-b518-eef044336580" />


### 3. AWS Bedrock AI Insights & Interactive Chat
<img width="1919" height="821" alt="Screenshot 2026-06-15 213538" src="https://github.com/user-attachments/assets/9dc60917-f945-4fbe-970a-0f3613aaa793" />


### 4. Transaction Analysis & Classification
<img width="1918" height="835" alt="Screenshot 2026-06-15 213556" src="https://github.com/user-attachments/assets/d8ec3a9b-46b4-431e-92dc-e323e90238f6" />


### 5. Income
<img width="1919" height="826" alt="Screenshot 2026-06-15 213619" src="https://github.com/user-attachments/assets/9900f5cb-854a-4188-b773-ea6c19e7950d" />


### 6. Menu Scanner for Food advice
<img width="1713" height="830" alt="Screenshot 2026-06-15 213650" src="https://github.com/user-attachments/assets/abd9df36-d4ca-4239-8b0d-4ab3c69302a2" />


### 7. Wellness profile for student's mental health
<img width="1917" height="826" alt="Screenshot 2026-06-15 213711" src="https://github.com/user-attachments/assets/ea96076b-77fc-4c88-8c43-39b2e9dc3f8a" />
<img width="1919" height="824" alt="Screenshot 2026-06-15 213750" src="https://github.com/user-attachments/assets/b0c06c6c-ab85-4d40-8ced-a7026a0e14c3" />



### 8. Fitness
<img width="1919" height="824" alt="Screenshot 2026-06-15 213750" src="https://github.com/user-attachments/assets/6830bb86-7c80-4cab-84c2-26f8d6911b95" />
<img width="1919" height="827" alt="Screenshot 2026-06-15 213825" src="https://github.com/user-attachments/assets/8978fe75-a716-4037-a8c7-c4085337dadc" />


### 9. Profile
<img width="1919" height="822" alt="Screenshot 2026-06-15 213841" src="https://github.com/user-attachments/assets/73ee8c25-d113-459e-b915-964219311456" />






---

## Project Structure

```text
PocketBuddy/
├── client/                  # Frontend: React 18 + Vite
│   ├── public/              # Static assets
│   ├── src/                 # Application source code
│   │   ├── components/      # Reusable dashboard, UI, and animation components
│   │   │   ├── dashboard/   # Dashboard forms, widgets, and lists
│   │   │   └── ui/          # Radix & Shadcn UI primitives
│   │   ├── context/         # AuthContext for global session management
│   │   ├── lib/             # Centralized API request wrapper (api.js)
│   │   ├── pages/           # Page routers (Dashboard, Wellness, Auth, Home)
│   │   ├── App.jsx          # Main client application router
│   │   ├── index.css        # Core styles and Tailwind design directives
│   │   └── main.jsx         # React application entry point
│   ├── package.json         # Client dependency configuration
│   └── vite.config.js       # Vite configuration
│
├── server/                  # Backend: Node.js + Express
│   ├── config/              # Database connections (Mongoose)
│   ├── middleware/          # Security & authorization (JWT) middlewares
│   ├── models/              # MongoDB Mongoose schemas (User, Budget, Transactions)
│   ├── routes/              # Express endpoint routers (auth, advice, menu)
│   ├── services/            # Background logic (Bedrock OCR parser, currency service)
│   ├── utils/               # Centralized AI API clients (aiClient.js, advice helpers)
│   ├── index.js             # Express application entry point
│   └── package.json         # Server dependency configuration
│
├── package.json             # Root workspace package file (scripts for concurrently running frontend & backend)
└── README.md                # Main project documentation
```

---

## Technology Stack

| Component | Technology | Usage Description |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Responsive single-page application framework. |
| **Styling** | **Tailwind CSS** | Premium dark-themed UI layout with custom glassmorphism. |
| **Animations** | **Framer Motion** | Micro-interactions, transition triggers, and smooth component animations. |
| **Charts** | **Recharts** | Interactive budget allocation, transaction history, and wellness charts. |
| **Backend** | **Node.js + Express** | High-performance asynchronous REST API routing. |
| **Database** | **MongoDB + Mongoose** | NoSQL database modeling users, transactions, budgets, and thresholds. |
| **OCR Engines** | **Tesseract.js** | Extracts raw text from menu scans for parsing. |
| **Cloud AI Gateway** | **AWS Bedrock SDK** | Powered by `@aws-sdk/client-bedrock-runtime` for serverless AI operations. |
| **AI LLM Models** | **Amazon Bedrock Models** | `openai.gpt-oss-120b`, `amazon.nova-pro-v1:0`, or Claude models for natural language reasoning. |

---

## API Endpoints Reference

All API endpoints are prefixed with `/api` and require a JWT token in the `Authorization` header (`Bearer <token>`), except where marked as **Public**.

### 1. Authentication (`/api/auth`)
*   `POST /register`: Register a new user account (Public)
*   `POST /login`: Authenticate credentials & return JWT (Public)
*   `GET /me`: Fetch authenticated user profile details
*   `PUT /profile`: Update profile information

### 2. Budget Management (`/api/budgets`)
*   `GET /`: Retrieve all active budgets with progress limits
*   `GET /:id`: Retrieve a specific budget by ID
*   `POST /`: Create a new budget limit with custom emojis
*   `PUT /:id`: Modify budget parameters (limits, emojis, names)
*   `DELETE /:id`: Remove a budget record

### 3. Income Streams (`/api/incomes`)
*   `GET /`: Fetch all registered income streams
*   `POST /`: Add a new income category/amount
*   `DELETE /:id`: Delete an income record

### 4. Expense Management (`/api/expenses`)
*   `GET /`: Retrieve all logged expenses
*   `GET /budget/:budgetId`: Fetch expenses linked to a budget category
*   `POST /`: Create an expense (automatically deducts from matching budget)
*   `DELETE /:id`: Void/Delete an expense item

### 5. Transactions (`/api/transactions`)
*   `GET /`: List all credit/debit records with filtering, pagination, and sorting
*   `GET /:id`: Retrieve detailed metadata for a single transaction
*   `POST /`: Manually log a transaction
*   `DELETE /:id`: Delete a transaction entry
*   `GET /analytics/summary`: Aggregate monthly debits and category breakdowns
*   `GET /analytics/trends`: Generate historical weekly/monthly chart trends
*   `POST /bulk-action`: Batch update categories, tags, or exclusion status

### 6. Bank Statements (`/api/bank-statements`)
*   `GET /`: List all uploaded and processed statement meta summaries
*   `GET /:id`: Fetch detailed transactions belonging to a parsed statement
*   `POST /`: Create a statement record

### 7. File Uploads & OCR (`/api/uploads`)
*   `POST /upload`: Upload statement files (PDF, CSV, XLSX) for parsing
*   `GET /upload-preview/:bankStatementId`: Inspect parsed transactions before finalizing
*   `POST /upload-confirm/:bankStatementId`: Commit previewed transactions to database
*   `DELETE /upload-cancel/:bankStatementId`: Cancel the import and purge temp files

### 8. AWS Bedrock AI Advice (`/api/advice`)
*   `POST /` : Fetch personalized financial tips from **AWS Bedrock** based on budget rules
*   `GET /insights` : Trigger **AWS Bedrock** models to identify active subscription charges, category limit breaches, and spending patterns

### 9. Chatbot & Recommendations (`/api/chat` / `/api/food-recommendations`)
*   `POST /chat/` : Conversational assistant endpoint powered by **AWS Bedrock**
*   `GET /food-recommendations/` : Suggest healthy, budget-friendly student recipes based on current food spending via **AWS Bedrock**

### 10. Menu Scanning (`/api/menu`)
*   `POST /upload`: Scan a restaurant menu image (Tesseract OCR + **AWS Bedrock** structured parsing)
*   `GET /job/:id`: Check status of asynchronous background parsing jobs

### 11. Custom Merchants & Rules (`/api/merchants`)
*   `GET /rules`: Fetch custom merchant classification regex patterns
*   `POST /rules`: Add a new pattern categorization rule (e.g., matching "AMZN" to Shopping)
*   `DELETE /rules/:id`: Delete a classification rule
*   `GET /alternatives`: Get cost-saving merchant alternatives (e.g. Swiggy vs Cooking)

### 12. Wellness & Financial Anxiety (`/api/wellness`)
*   `GET /`: Retrieve the user's wellness profile and stress trackers
*   `PUT /`: Update tracking parameters
*   `POST /checkin`: Perform a wellness check-in survey scoring financial anxiety
*   `POST /resolve-burnout` : Generate tailored anxiety-reduction tips via **AWS Bedrock**
*   `GET /analyze`: View financial anxiety trends over time
*   `GET /weekly`: Fetch weekly wellness indexes

### 13. Threshold Alerts (`/api/thresholds` / `/api/alerts`)
*   `GET /thresholds`: List alarm thresholds configured per category
*   `POST /thresholds`: Define a new budget limit alarm threshold
*   `PUT /thresholds/:id`: Update threshold settings
*   `DELETE /thresholds/:id`: Remove a category threshold
*   `GET /alerts`: Retrieve active notification messages and category breach warnings
*   `DELETE /alerts/:id`: Dismiss notifications

### 14. Document Reports (`/api/reports`)
*   `GET /transaction-export`: Download transaction records in CSV format
*   `GET /dashboard-snapshot`: Fetch current visual snapshot states
*   `GET /spending-report-pdf`: Generate and download a PDF report containing charts and spend categories

---

## How to Run the Project

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a remote [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

---

### Step 1: Install Dependencies
Install all project-wide, frontend, and backend packages using the workspace helper script:
```bash
npm run install:all
```

---

### Step 2: Configure Environment Variables
Copy or create a `.env` file inside the `server/` directory:
```bash
cp server/.env.example server/.env
```

Open the newly created `server/.env` file and configure it with your parameters:

```env
# Server Network Parameters
PORT=5000

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/finan-smart

# JWT Encryption Key
JWT_SECRET=your-super-secret-jwt-key-change-this

# =========================================================================
# AWS BEDROCK / BEDROCK MANTLE CONFIGURATION
# =========================================================================
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# Bedrock Mantle OpenAI-Compatible endpoints (for text and chat integration)
OPENAI_API_KEY=your_bedrock_mantle_api_key_here
OPENAI_BASE_URL=https://bedrock-mantle.ap-south-1.api.aws/v1
OPENAI_PROJECT_ID=default

# Models Utilized
OPENAI_MODEL=openai.gpt-oss-120b
VISION_MODEL=us.anthropic.claude-haiku-4-5-20251001-v1:0
# =========================================================================
```

> [!WARNING]
> Ensure that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` correspond to an IAM role/user with permissions to invoke Amazon Bedrock runtimes. Never commit the `.env` file to version control.

---

### Step 3: Run the Services

#### Option A: Run Concurrently (Recommended)
You can spin up both the Vite React Frontend and the Node Express Server with a single command:
```bash
npm run dev
```
*   **Vite Frontend Development Server**: [http://localhost:3000](http://localhost:3000)
*   **Express API Server**: [http://localhost:5000](http://localhost:5000)

#### Option B: Run Individually
*   **Start Backend only**: `npm run dev:server` (Server will watch code files and reload automatically)
*   **Start Frontend only**: `npm run dev:client`
*   **Start MongoDB (Windows shortcut)**: `npm run mongo` (Executes the local `start-mongo.bat` file)

---

## Highlights for the Amazon HackOn Judges

If you are reviewing this project for the hackathon, please note these points of innovation:

*   **Multimodal AI Orchestration**: We combine local lightweight libraries (Tesseract.js for initial text OCR extraction) with powerful Bedrock LLMs to keep costs low and response times fast, maintaining reliability.
*   **Student Wellness Priority**: Most finance trackers focus solely on numbers. Finan Smart recognizes that student finances directly impact mental wellness. Our **AWS Bedrock-powered Wellness Copilot** helps students manage budget anxiety and avoid burnout.
*   **Dynamic Currency System**: Support for real-time currency conversions (USD, INR, EUR, JPY) powered by internal exchange matrices, ensuring the AI prompt context is calculated using the currency chosen by the student.
*   **Robust Heuristics Fallbacks**: If AWS keys are not configured or external networks are down, our backend automatically falls back to rule-based patterns for subscriptions, merchant anomalies, and alternative suggestion pipelines. This guarantees uninterrupted uptime.
