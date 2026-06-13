import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Budgets from "./pages/dashboard/Budgets";
import Incomes from "./pages/dashboard/Incomes";
import Expenses from "./pages/dashboard/Expenses";
import ExpenseDetail from "./pages/dashboard/ExpenseDetail";
import Upgrade from "./pages/dashboard/Upgrade";

function ProtectedRoute({ children }) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-midnight flex items-center justify-center text-fog font-thin">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="incomes" element={<Incomes />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="expenses/:id" element={<ExpenseDetail />} />
        <Route path="upgrade" element={<Upgrade />} />
      </Route>
    </Routes>
  );
}
