import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, PiggyBank, ReceiptText, CircleDollarSign, ScanLine,
  Heart, Sparkles, Activity, LineChart, Menu, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
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
  const { currency, setCurrency, currencies } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user && path === "/dashboard") {
      api.getBudgets().then((budgets) => {
        if (budgets.length === 0) navigate("/dashboard/budgets", { replace: true });
      }).catch(() => {});
    }
  }, [user, path, navigate]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const handleNavClick = (menuPath) => {
    navigate(menuPath);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-3 mb-8 shrink-0 hover:opacity-85 transition-opacity">
        <div className="w-9 h-9 rounded-btn bg-paper flex items-center justify-center">
          <img src="/chart-donut.svg" alt="logo" width={22} height={22} />
        </div>
        <span className="font-display font-medium text-paper text-lg">PocketBuddy</span>
      </Link>

      <nav className="flex-1 overflow-y-auto sidebar-scroll pr-1">
        {menuList.map((menu, index) => (
          <div
            key={index}
            onClick={() => handleNavClick(menu.path)}
            className={`nav-link cursor-pointer ${path === menu.path ? "nav-link-active" : ""}`}
          >
            <menu.icon size={18} className={path === menu.path ? "text-[#1c6cff]" : menu.colorClass} />
            {menu.name}
          </div>
        ))}
      </nav>

      <div className="mt-4 space-y-3 shrink-0">
        <div className="px-3 py-2 neo-card">
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5">Currency</p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-indigo/20 border border-steel/30 rounded-lg px-2.5 py-1.5 text-[13px] text-white font-thin focus:outline-none focus:border-signal/50 appearance-none cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code} className="bg-deep text-white">
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>

        <div
          className="flex justify-between items-center p-4 neo-card cursor-pointer hover:border-signal/30 transition-all w-full"
          onClick={() => handleNavClick("/dashboard/profile")}
        >
          <div className="w-9 h-9 rounded-btn bg-signal text-paper flex items-center justify-center text-sm font-display font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-base text-white hover:text-fog"
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
          >
            Logout
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-midnight">
      {/* Desktop Sidebar */}
      <div className="fixed md:w-[270px] hidden md:block z-40 h-screen">
        <div className="h-full p-6 bg-deep border-r border-steel/30 shadow-neo flex flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-deep border-b border-steel/30 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-indigo/30 transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link to="/" className="font-display font-medium text-paper text-base hover:opacity-85 transition-opacity">PocketBuddy</Link>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-deep border-r border-steel/30 shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-indigo/30 transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="md:ml-[270px] min-h-screen pt-[56px] md:pt-0">
        <Outlet />
      </div>
    </div>
  );
}
