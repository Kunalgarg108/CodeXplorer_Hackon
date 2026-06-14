# Finan Smart - Project Analysis & Documentation

**Project Name:** Finan Smart (MERN Stack)  
**Type:** AI-Powered Personal Finance Tracker  
**Created:** 2025  
**Status:** Active Development

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Models](#database-models)
6. [API Endpoints & Routes](#api-endpoints--routes)
7. [Authentication Flow](#authentication-flow)
8. [Core Features](#core-features)
9. [Frontend Components](#frontend-components)
10. [Environment Configuration](#environment-configuration)
11. [Development Workflow](#development-workflow)
12. [Key Dependencies](#key-dependencies)

---

## Project Overview

**Finan Smart** is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for personal finance management with AI-powered insights. Users can track budgets, incomes, and expenses with an intuitive dashboard and receive financial advice powered by OpenAI.

### Primary Purpose

- Budget creation and management with emoji-based categorization
- Income stream tracking
- Expense tracking and categorization
- AI-driven financial advice recommendations
- User authentication with JWT tokens
- Responsive dashboard with data visualization

### User Journey

1. **Sign Up/Login** → Authenticate with JWT
2. **Dashboard** → View financial overview with charts
3. **Create Budgets** → Set budget categories with emoji icons
4. **Track Income** → Log income sources
5. **Log Expenses** → Assign expenses to budgets
6. **Get AI Advice** → Receive financial recommendations from OpenAI

---

## Architecture

```
FINAN SMART ARCHITECTURE
│
├─── Frontend (Client) ─────────────────────────────┐
│    React 18 + Vite                                 │
│    ├── Pages (Sign In, Sign Up, Dashboard)         │
│    ├── Components (UI, Dashboard, Forms)           │
│    ├── Context (Auth Context for state mgmt)       │
│    └── API Client (Centralized fetch calls)        │
│                                                    │
├─── Backend (Server) ──────────────────────────────┤
│    Express.js + Node.js                            │
│    ├── Routes (auth, budgets, incomes, expenses)   │
│    ├── Models (User, Budget, Income, Expense)      │
│    ├── Middleware (JWT authentication)             │
│    ├── Utilities (Financial advice via OpenAI)     │
│    └── Database Connection (Mongoose)              │
│                                                    │
└─── Database ──────────────────────────────────────┘
     MongoDB (Local or Atlas)
```

### Communication Flow

1. **Frontend** makes API requests via centralized `api.js` client
2. **Express Server** validates JWT tokens via `auth.js` middleware
3. **Mongoose Models** interact with MongoDB
4. **Response** sent back to frontend, stored in React state/localStorage

---

## Tech Stack

### Backend Stack

| Technology | Version | Purpose                         |
| ---------- | ------- | ------------------------------- |
| Node.js    | 18+     | Runtime environment             |
| Express.js | ^4.21.0 | REST API framework              |
| MongoDB    | -       | NoSQL database                  |
| Mongoose   | ^8.6.0  | ODM for MongoDB                 |
| JWT        | ^9.0.2  | Token-based authentication      |
| bcryptjs   | ^2.4.3  | Password hashing                |
| OpenAI     | ^4.52.7 | AI-powered advice generation    |
| CORS       | ^2.8.5  | Cross-origin resource sharing   |
| dotenv     | ^16.4.5 | Environment variable management |

### Frontend Stack

| Technology    | Version  | Purpose                     |
| ------------- | -------- | --------------------------- |
| React         | ^18.3.1  | UI library                  |
| Vite          | ^5.4.2   | Build tool & dev server     |
| React Router  | ^6.26.0  | Client-side routing         |
| Tailwind CSS  | ^3.4.10  | Styling                     |
| Recharts      | ^2.12.5  | Data visualization (charts) |
| Radix UI      | Latest   | Accessible UI primitives    |
| Framer Motion | ^11.3.2  | Animation library           |
| Lucide React  | ^0.371.0 | Icon library                |
| Emoji Picker  | ^4.9.2   | Emoji selection for budgets |
| Sonner        | ^1.4.41  | Toast notifications         |
| Moment.js     | ^2.30.1  | Date/time formatting        |

### Build & Dev Tools

- **Concurrently** - Run frontend and backend simultaneously
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## Project Structure

```
CodeXplorer_Hackon/
│
├── 📁 root/
│   ├── package.json           # Root scripts (dev, install:all, etc.)
│   ├── README.md              # Main documentation
│   ├── next.config.mjs        # Next.js config (unused in current setup)
│   ├── jsconfig.json          # JS config
│   ├── drizzle.config.js      # ORM config (unused)
│   ├── tailwind.config.js     # Tailwind styling config
│   ├── postcss.config.mjs     # PostCSS config
│   ├── components.json        # Component library config
│   ├── middleware.ts          # Express middleware
│   └── start-mongo.bat        # MongoDB startup script (Windows)
│
├── 📁 server/                 # Backend - Express + Node.js
│   ├── package.json
│   ├── index.js               # Server entry point
│   │
│   ├── 📁 config/
│   │   └── db.js              # MongoDB connection
│   │
│   ├── 📁 middleware/
│   │   └── auth.js            # JWT authentication middleware
│   │
│   ├── 📁 models/             # Mongoose schemas
│   │   ├── User.js            # User model (name, email, password)
│   │   ├── Budget.js          # Budget model (name, amount, icon)
│   │   ├── Income.js          # Income model (name, amount, icon)
│   │   └── Expense.js         # Expense model (name, amount, budgetId)
│   │
│   ├── 📁 routes/             # API endpoints
│   │   ├── auth.js            # Auth routes (register, login, me)
│   │   ├── budgets.js         # Budget CRUD routes
│   │   ├── incomes.js         # Income CRUD routes
│   │   ├── expenses.js        # Expense CRUD routes
│   │   └── advice.js          # AI advice route
│   │
│   └── 📁 utils/
│       └── getFinancialAdvice.js # OpenAI integration
│
├── 📁 client/                 # Frontend - React + Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   ├── 📁 src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main app component
│   │   ├── index.css          # Global styles
│   │   │
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx # Global auth state management
│   │   │
│   │   ├── 📁 lib/
│   │   │   ├── api.js         # Centralized API client
│   │   │   └── utils.js       # Utility functions
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── FloatingTags.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   │
│   │   │   ├── 📁 dashboard/  # Dashboard-specific components
│   │   │   │   ├── AddExpense.jsx
│   │   │   │   ├── BarChartDashboard.jsx
│   │   │   │   ├── BudgetItem.jsx
│   │   │   │   ├── CardInfo.jsx
│   │   │   │   ├── CreateBudget.jsx
│   │   │   │   ├── CreateIncomes.jsx
│   │   │   │   ├── EditBudget.jsx
│   │   │   │   ├── ExpenseListTable.jsx
│   │   │   │   └── IncomeItem.jsx
│   │   │   │
│   │   │   └── 📁 ui/         # Reusable UI components
│   │   │       ├── alert-dialog.jsx
│   │   │       ├── button.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── input.jsx
│   │   │       ├── sonner.jsx
│   │   │       └── container-scroll-animation.jsx
│   │   │
│   │   ├── 📁 pages/          # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── 📁 dashboard/
│   │   │       ├── Budgets.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       └── DashboardLayout.jsx
│   │   │
│   │   └── 📁 utils/
│   │       └── formatNumber.js
│   │
│   ├── 📁 public/
│   └── tailwind.config.js
│
├── 📁 app/                    # Next.js app (appears unused - alternative stack)
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   │
│   ├── 📁 _components/
│   │   ├── Header.jsx
│   │   └── Hero.jsx
│   │
│   ├── 📁 (auth)/             # Auth route group
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/page.jsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/page.jsx
│   │
│   └── 📁 (routes)/           # Protected route group
│       └── dashboard/
│           ├── layout.jsx
│           ├── loading.jsx
│           ├── page.jsx
│           ├── _components/ (dashboard components)
│           ├── budgets/
│           ├── expenses/
│           ├── incomes/
│           └── upgrade/
│
├── 📁 components/             # Shared components
│   └── 📁 ui/                 # Reusable UI components
│
├── 📁 lib/
│   └── utils.js
│
├── 📁 utils/
│   ├── cn.js
│   ├── dbConfig.jsx
│   ├── getFinancialAdvice.js
│   ├── index.js
│   └── schema.jsx
│
└── 📁 public/
```

---

## Database Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Methods:**

- `pre('save')` - Hashes password before saving
- `comparePassword()` - Validates password during login

### Budget Model

```javascript
{
  _id: ObjectId,
  name: String (required),        // e.g., "Food", "Transport"
  amount: String (required),      // Budget limit
  icon: String (default: "😀"),  // Emoji representation
  createdBy: String (required),   // User ID
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Income Model

```javascript
{
  _id: ObjectId,
  name: String (required),        // e.g., "Salary", "Freelance"
  amount: String (required),      // Income amount
  icon: String (default: "😀"),  // Emoji representation
  createdBy: String (required),   // User ID
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Expense Model

```javascript
{
  _id: ObjectId,
  name: String (required),        // Expense description
  amount: Number (required, default: 0),
  budgetId: ObjectId (ref: "Budget", required),  // Links to budget
  createdAt: String (required),   // Date string
  timestamps: Timestamp
}
```

---

## API Endpoints & Routes

### Authentication Routes (`/api/auth`)

| Method | Endpoint         | Description        | Auth | Request                     |
| ------ | ---------------- | ------------------ | ---- | --------------------------- |
| POST   | `/auth/register` | Create new account | ❌   | `{ name, email, password }` |
| POST   | `/auth/login`    | Login user         | ❌   | `{ email, password }`       |
| GET    | `/auth/me`       | Get current user   | ✅   | -                           |

**Response (register/login):**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com"
  }
}
```

### Budget Routes (`/api/budgets`)

| Method | Endpoint       | Description        | Auth | Request                  |
| ------ | -------------- | ------------------ | ---- | ------------------------ |
| GET    | `/budgets`     | List all budgets   | ✅   | -                        |
| GET    | `/budgets/:id` | Get budget details | ✅   | -                        |
| POST   | `/budgets`     | Create budget      | ✅   | `{ name, amount, icon }` |
| PUT    | `/budgets/:id` | Update budget      | ✅   | `{ name, amount, icon }` |
| DELETE | `/budgets/:id` | Delete budget      | ✅   | -                        |

### Income Routes (`/api/incomes`)

| Method | Endpoint   | Description      | Auth | Request                  |
| ------ | ---------- | ---------------- | ---- | ------------------------ |
| GET    | `/incomes` | List all incomes | ✅   | -                        |
| POST   | `/incomes` | Create income    | ✅   | `{ name, amount, icon }` |

### Expense Routes (`/api/expenses`)

| Method | Endpoint                     | Description            | Auth | Request                                 |
| ------ | ---------------------------- | ---------------------- | ---- | --------------------------------------- |
| GET    | `/expenses`                  | List all expenses      | ✅   | -                                       |
| GET    | `/expenses/budget/:budgetId` | Get expenses by budget | ✅   | -                                       |
| POST   | `/expenses`                  | Create expense         | ✅   | `{ name, amount, budgetId, createdAt }` |
| DELETE | `/expenses/:id`              | Delete expense         | ✅   | -                                       |

### Advice Routes (`/api/advice`)

| Method | Endpoint  | Description   | Auth | Request       |
| ------ | --------- | ------------- | ---- | ------------- |
| POST   | `/advice` | Get AI advice | ✅   | `{ context }` |

**Response (advice):**

```json
{
  "advice": "Financial recommendation from OpenAI"
}
```

---

## Authentication Flow

### JWT-based Authentication

```
1. USER REGISTRATION
   │
   ├─→ Client POST /auth/register { name, email, password }
   ├─→ Server validates input
   ├─→ Check if email exists (prevent duplicate)
   ├─→ Hash password with bcryptjs (10 rounds)
   ├─→ Save user to MongoDB
   ├─→ Generate JWT token (7 days expiry)
   └─→ Return { token, user }
       └─→ Client stores token in localStorage

2. USER LOGIN
   │
   ├─→ Client POST /auth/login { email, password }
   ├─→ Find user by email
   ├─→ Compare provided password with hashed password
   ├─→ Generate JWT token
   └─→ Return { token, user }

3. PROTECTED REQUESTS
   │
   ├─→ Client includes Authorization header: "Bearer {token}"
   ├─→ Middleware (auth.js) validates token
   ├─→ Decode token and extract user info
   ├─→ Attach user to req.user
   └─→ Proceed to route handler OR reject if invalid

4. LOGOUT
   │
   └─→ Client removes token from localStorage
```

### JWT Token Structure

```javascript
payload: {
  id: user._id,
  email: user.email,
  name: user.name,
  iat: issued_time,
  exp: expiration_time (7 days)
}
secret: process.env.JWT_SECRET || "dev-secret"
```

---

## Core Features

### 1. **Budget Management**

- Create budgets with custom emoji icons
- Set budget amounts
- View budget details
- Edit existing budgets
- Delete budgets
- Track expenses against budgets

### 2. **Income Tracking**

- Add multiple income sources
- Assign emoji icons to income types
- View all income streams
- Display income in dashboard

### 3. **Expense Tracking**

- Log expenses with descriptions and amounts
- Assign expenses to specific budgets
- Track spending over time
- Delete incorrect entries
- View expense history in table format

### 4. **Financial Dashboard**

- Visual overview of budgets vs. spending
- Bar charts for budget spending analysis
- Summary cards showing financial metrics
- Responsive layout
- Real-time budget status

### 5. **AI Financial Advice**

- Integration with OpenAI API
- Generate personalized financial recommendations
- Analyze spending patterns
- Provide budget optimization suggestions

### 6. **User Authentication**

- Secure registration and login
- JWT token-based sessions
- Password hashing with bcryptjs
- Protected routes requiring authentication
- Persistent login via localStorage

---

## Frontend Components

### Page Structure

#### **Home Page** (`/`)

- Hero section with app introduction
- Call-to-action buttons (Sign Up / Sign In)
- Features overview
- Landing page design

#### **Sign Up Page** (`/sign-up`)

- Registration form
- Input fields: Name, Email, Password
- Form validation
- Submit to `/api/auth/register`
- Redirect to dashboard on success

#### **Sign In Page** (`/sign-in`)

- Login form
- Input fields: Email, Password
- Form validation
- Submit to `/api/auth/login`
- Redirect to dashboard on success

#### **Dashboard** (`/dashboard`)

- Main hub after login
- Layout with sidebar navigation
- Overview of financial status
- Quick access to budgets, incomes, expenses

### Dashboard Components

| Component             | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| **SideNav**           | Navigation menu for dashboard sections          |
| **DashboardHeader**   | Header with user info and settings              |
| **CardInfo**          | Summary cards (total income, expenses, budgets) |
| **BarChartDashboard** | Visual budget vs. spending chart                |
| **BudgetItem**        | Individual budget card display                  |
| **CreateBudget**      | Modal/Form to add new budget                    |
| **EditBudget**        | Modal/Form to modify existing budget            |
| **AddExpense**        | Modal/Form to log new expense                   |
| **ExpenseListTable**  | Table showing all expenses                      |
| **IncomeItem**        | Individual income display                       |
| **CreateIncomes**     | Modal/Form to add income source                 |

### UI Components (Shadcn-style)

| Component        | Framework | Purpose                    |
| ---------------- | --------- | -------------------------- |
| **Button**       | React     | Reusable button component  |
| **Input**        | React     | Text input field           |
| **Dialog**       | Radix UI  | Modal dialog component     |
| **AlertDialog**  | Radix UI  | Confirmation dialog        |
| **Sonner**       | Sonner    | Toast notifications        |
| **FloatingTags** | Custom    | Animated floating elements |

---

## Environment Configuration

### Backend (.env)

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/finan-smart

# Authentication
JWT_SECRET=your-secret-key-here

# AI Integration (Optional)
OPENAI_API_KEY=your-openai-api-key
```

### Frontend

- No `.env` file needed (uses relative API calls)
- API base URL: `/api`
- Tokens stored in `localStorage` under key `token`

---

## Development Workflow

### Initial Setup

```bash
# Install all dependencies (root, server, client)
npm run install:all
```

### Start Development Server

```bash
# Both frontend and backend concurrently
npm run dev

# Frontend only (Vite on port 3000)
npm run dev:client

# Backend only (Node on port 5000)
npm run dev:server
```

### Build for Production

```bash
# Build client (Vite)
npm run build
```

### Start Production Server

```bash
npm start
```

### MongoDB Setup (Windows)

```bash
# Run MongoDB startup script
start-mongo.bat

# Or manually:
mongod
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## Key Dependencies

### Backend Dependencies Analysis

| Package          | Version | Purpose                           |
| ---------------- | ------- | --------------------------------- |
| **express**      | ^4.21.0 | Web framework                     |
| **mongoose**     | ^8.6.0  | MongoDB ODM                       |
| **jsonwebtoken** | ^9.0.2  | JWT token generation/verification |
| **bcryptjs**     | ^2.4.3  | Password hashing                  |
| **cors**         | ^2.8.5  | Cross-origin requests             |
| **dotenv**       | ^16.4.5 | Environment variables             |
| **openai**       | ^4.52.7 | AI API integration                |

### Frontend Dependencies Analysis

| Package                | Version  | Purpose                  |
| ---------------------- | -------- | ------------------------ |
| **react**              | ^18.3.1  | UI library               |
| **react-router-dom**   | ^6.26.0  | Client routing           |
| **recharts**           | ^2.12.5  | Chart visualization      |
| **tailwindcss**        | ^3.4.10  | Utility CSS framework    |
| **framer-motion**      | ^11.3.2  | Animations               |
| **radix-ui**           | Latest   | Accessible UI primitives |
| **lucide-react**       | ^0.371.0 | Icons                    |
| **emoji-picker-react** | ^4.9.2   | Emoji selection          |
| **sonner**             | ^1.4.41  | Toast notifications      |
| **moment**             | ^2.30.1  | Date utilities           |

### Build Tools

| Tool             | Version | Purpose                  |
| ---------------- | ------- | ------------------------ |
| **vite**         | ^5.4.2  | Frontend build tool      |
| **concurrently** | ^8.2.2  | Run multiple npm scripts |
| **postcss**      | ^8.4.41 | CSS processing           |
| **tailwindcss**  | ^3.4.10 | CSS framework            |

---

## Important Notes

### Multi-Stack Configuration

- **Primary Stack**: React (Vite) + Express + MongoDB
- **Secondary Stack**: Next.js (app/ folder) - appears unused but configured
- Focus development on `client/` and `server/` folders

### API Client Pattern

All frontend API calls go through centralized `client/src/lib/api.js`:

- Handles token attachment automatically
- Centralized error handling
- Type consistency across requests

### Authentication Pattern

- **Context**: `AuthContext.jsx` provides global auth state
- **Persistence**: Token in localStorage survives page refresh
- **Protection**: Protected routes check `isSignedIn` prop from context

### Styling Approach

- **Tailwind CSS** for utility-first styling
- **Custom components** using Radix UI primitives
- **CSS Modules** not used - prefer Tailwind classes
- **Global styles** in `client/src/index.css`

### Data Flow Summary

```
User Input
    ↓
React Component
    ↓
api.js (centralized client)
    ↓
HTTP Request + JWT Token
    ↓
Express Route Handler
    ↓
auth.js Middleware (validates JWT)
    ↓
Mongoose Model (interact with DB)
    ↓
Response sent back
    ↓
React State Updated / Toast Notification
```

---

## Future Enhancement Opportunities

1. **Frontend Improvements**

   - Add chart export functionality
   - Implement budget comparison features
   - Add recurring expense templates

2. **Backend Improvements**

   - Implement pagination for large data sets
   - Add data aggregation endpoints
   - Implement rate limiting

3. **Features**

   - Multi-user data sharing
   - Savings goals tracking
   - Investment portfolio integration
   - Mobile app (React Native)

4. **DevOps**

   - Docker containerization
   - CI/CD pipeline setup
   - Environment-based deployment

5. **Security**
   - Implement refresh tokens
   - Add CSRF protection
   - Implement 2FA authentication

---

## Troubleshooting Guide

### Common Issues

**Issue**: MongoDB connection fails

- **Solution**: Ensure MongoDB is running (`mongod` on Windows) or update `MONGODB_URI` in `.env`

**Issue**: JWT token invalid

- **Solution**: Ensure `JWT_SECRET` is set in `.env`

**Issue**: CORS errors

- **Solution**: CORS is enabled on server for all origins by default

**Issue**: API calls return 401 Unauthorized

- **Solution**: Check token in localStorage, ensure it's being sent in Authorization header

**Issue**: Build fails with Vite

- **Solution**: Delete `node_modules` and `.vite` cache, then `npm install` and rebuild

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Maintained By**: Development Team
