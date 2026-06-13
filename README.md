# Finan Smart - MERN Stack

AI-powered personal finance tracker built with MongoDB, Express, React, and Node.js.

## Tech Stack

- **MongoDB** - Database (Mongoose ODM)
- **Express** - REST API backend
- **React** - Frontend (Vite + React Router)
- **Node.js** - Server runtime

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy `server/.env.example` to `server/.env` and update values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finan-smart
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key   # optional, for AI advice
```

### 3. Start MongoDB

Make sure MongoDB is running on your machine. On Windows, start the MongoDB service or run:

```bash
mongod
```

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/   # Auth context
│       └── lib/       # API client
├── server/          # Express backend
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   └── middleware/  # JWT auth
└── package.json     # Root scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create budget |
| GET | `/api/incomes` | List incomes |
| POST | `/api/incomes` | Create income |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Add expense |
| POST | `/api/advice` | Get AI financial advice |

## Features

- User registration & login (JWT auth)
- Budget management with emoji icons
- Income stream tracking
- Expense tracking per budget
- AI-powered financial advice (OpenAI)
- Responsive dashboard with charts
