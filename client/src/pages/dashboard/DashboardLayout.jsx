import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, PiggyBank, ReceiptText, ShieldCheck, CircleDollarSign,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const menuList = [
  { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { name: "Incomes", icon: CircleDollarSign, path: "/dashboard/incomes" },
  { name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
  { name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
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
    <div>
      <div className="fixed md:w-64 hidden md:block">
        <div className="h-screen p-5 border shadow-sm">
          <div className="flex flex-row items-center">
            <img src="/chart-donut.svg" alt="logo" width={40} height={25} />
            <span className="text-blue-800 font-bold text-xl">FinanSmart</span>
          </div>
          <div className="mt-5">
            {menuList.map((menu, index) => (
              <Link to={menu.path} key={index}>
                <h2 className={`flex gap-2 items-center text-gray-500 font-medium mb-2 p-4 cursor-pointer rounded-full hover:text-primary hover:bg-blue-100 ${path === menu.path && "text-primary bg-blue-100"}`}>
                  <menu.icon />
                  {menu.name}
                </h2>
              </Link>
            ))}
          </div>
          <div className="fixed bottom-10 p-5 flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <Button variant="link" className="p-0 h-auto text-xs" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="md:ml-64">
        <div className="p-5 shadow-sm border-b flex justify-end md:hidden">
          <Button variant="outline" className="rounded-full" onClick={logout}>Logout</Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
