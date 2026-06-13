import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, PiggyBank, ReceiptText, ShieldCheck, CircleDollarSign, Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const menuList = [
  { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { name: "Incomes", icon: CircleDollarSign, path: "/dashboard/incomes" },
  { name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
  { name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
  { name: "Wellness Profile", icon: Heart, path: "/dashboard/wellness" },
  { name: "Upgrade", icon: ShieldCheck, path: "/dashboard/upgrade" },
];

export default function DashboardLayout() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && path === "/dashboard") {
      api.getBudgets().then((budgets) => {
        if (budgets.length === 0) navigate("/dashboard/budgets", { replace: true });
      }).catch(() => {});
    }
  }, [user, path, navigate]);

  return (
    <div className="min-h-screen bg-midnight">
      <div className="fixed md:w-64 hidden md:block z-40">
        <div className="h-screen p-6 bg-deep border-r border-steel/30 shadow-neo">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-btn bg-paper flex items-center justify-center">
              <img src="/chart-donut.svg" alt="logo" width={22} height={22} />
            </div>
            <span className="font-display font-medium text-paper">FinanSmart</span>
          </div>
          <nav className="mt-2">
            {menuList.map((menu, index) => (
              <Link to={menu.path} key={index}>
                <div className={`nav-link ${path === menu.path ? "nav-link-active" : ""}`}>
                  <menu.icon size={18} />
                  {menu.name}
                </div>
              </Link>
            ))}
          </nav>
          <div className="fixed bottom-8 left-6 right-6 md:right-auto md:w-52 flex gap-3 items-center p-4 neo-card">
            <div className="w-9 h-9 rounded-btn bg-signal text-paper flex items-center justify-center text-sm font-display font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-paper font-thin">{user?.name}</p>
              <Button variant="link" className="p-0 h-auto text-xs text-fog" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="md:ml-64 min-h-screen">
        <div className="p-4 border-b border-steel/30 flex justify-between items-center md:hidden bg-deep">
          <span className="font-display text-paper text-sm">FinanSmart</span>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
