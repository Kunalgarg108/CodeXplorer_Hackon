import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, PiggyBank, ReceiptText, CircleDollarSign, ScanLine,
  Heart, Sparkles, Activity,LineChart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const menuList = [
  { name: "Dashboard", icon: LayoutGrid, path: "/dashboard", colorClass: "text-[#1c6cff]" },
  { name: "Pocket Buddy AI", icon: Sparkles, path: "/dashboard/pocket-buddy", colorClass: "text-[#a855f7]" },
  { name: "Transactions", icon: LineChart, path: "/dashboard/transactions", colorClass: "text-[#818cf8]" },
  { name: "Incomes", icon: CircleDollarSign, path: "/dashboard/incomes", colorClass: "text-[#00acfe]" },
  { name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets", colorClass: "text-[#00cc4b]" },
  { name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses", colorClass: "text-[#ff8833]" },
  
  { name: "Menu Scanner", icon: ScanLine, path: "/dashboard/menu-scanner", colorClass: "text-cyan-400" },
  { name: "Wellness Profile", icon: Heart, path: "/dashboard/wellness", colorClass: "text-tag-coral" },
  { name: "Fitness", icon: Activity, path: "/dashboard/fitness", colorClass: "text-[#00cc4b]" },
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
      <div className="fixed md:w-[270px] hidden md:block z-40 h-screen">
        <div className="h-full p-6 bg-deep border-r border-steel/30 shadow-neo flex flex-col justify-between">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-3 mb-8 shrink-0">
              <div className="w-9 h-9 rounded-btn bg-paper flex items-center justify-center">
                <img src="/chart-donut.svg" alt="logo" width={22} height={22} />
              </div>
              <span className="font-display font-medium text-paper">FinanSmart</span>
            </div>
            <nav className="mt-2 overflow-y-auto flex-1 sidebar-scroll pr-1">
              {menuList.map((menu, index) => (
                <Link to={menu.path} key={index}>
                  <div className={`nav-link ${path === menu.path ? "nav-link-active" : ""}`}>
                    <menu.icon size={18} className={path === menu.path ? "text-[#1c6cff]" : menu.colorClass} />
                    {menu.name}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          <div
            className="mt-6 flex justify-between items-center p-4 neo-card cursor-pointer hover:border-signal/30 transition-all shrink-0 w-full"
            onClick={() => navigate("/dashboard/profile")}
          >
            <div className="w-9 h-9 rounded-btn bg-signal text-paper flex items-center justify-center text-sm font-display font-semibold transition-all duration-300 hover:scale-125 hover:shadow-[0_0_20px_rgba(28,108,255,0.6)]">
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <Button
              variant="link"
              className="p-0 h-auto text-xl text-white hover:text-fog"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="md:ml-[270px] min-h-screen">
        <div className="p-4 border-b border-steel/30 flex justify-between items-center md:hidden bg-deep">
          <span className="font-display text-paper text-sm">FinanSmart</span>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
