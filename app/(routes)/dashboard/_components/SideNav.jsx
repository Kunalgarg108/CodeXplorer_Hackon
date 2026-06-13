"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SideNav() {
  const menuList = [
    { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { id: 2, name: "Incomes", icon: CircleDollarSign, path: "/dashboard/incomes" },
    { id: 3, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
    { id: 4, name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
    { id: 5, name: "Upgrade", icon: ShieldCheck, path: "/dashboard/upgrade" },
  ];

  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, [path]);

  return (
    <div
      style={{
        height: "100vh",
        background: "var(--color-deep-surface)",
        borderRight: "1px solid rgba(17,38,59,0.7)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-signal-blue)" }}
        >
          <Image src={"./chart-donut.svg"} alt="logo" width={20} height={20} />
        </div>
        <span
          className="font-semibold text-base tracking-tight"
          style={{ color: "var(--color-paper-white)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          FinanSmart
        </span>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 flex flex-col gap-1">
        {menuList.map((menu) => {
          const isActive = path === menu.path;
          return (
            <Link href={menu.path} key={menu.id}>
              <div
                className="nav-item"
                style={{
                  background: isActive ? "rgba(28,108,255,0.15)" : "transparent",
                  color: isActive ? "var(--color-signal-blue)" : "var(--color-fog)",
                  fontWeight: isActive ? 500 : 300,
                  borderLeft: isActive
                    ? "2px solid var(--color-signal-blue)"
                    : "2px solid transparent",
                  borderRadius: "12px",
                  marginLeft: isActive ? "2px" : "0",
                }}
              >
                <menu.icon
                  size={18}
                  style={{ flexShrink: 0 }}
                />
                <span>{menu.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile footer */}
      <div
        className="flex items-center gap-3 px-3 py-3 rounded-xl"
        style={{ border: "1px solid rgba(17,38,59,0.6)", marginTop: "auto" }}
      >
        <UserButton />
        <span style={{ color: "var(--color-fog)", fontSize: "13px", fontWeight: 300 }}>
          Profile
        </span>
      </div>
    </div>
  );
}

export default SideNav;
