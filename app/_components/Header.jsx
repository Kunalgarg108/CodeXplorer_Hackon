"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  const { user, isSignedIn } = useUser();

  return (
    <header
      style={{ background: "rgba(0,8,20,0.85)", backdropFilter: "blur(20px)" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center border-b border-[#11263b]/60"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--color-signal-blue)" }}
        >
          <Image src={"/chart-donut.svg"} alt="logo" width={22} height={22} />
        </div>
        <span
          className="font-display font-semibold text-lg tracking-tight"
          style={{ color: "var(--color-paper-white)" }}
        >
          FinanSmart
        </span>
      </div>

      {/* Nav actions */}
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <div className="flex gap-3 items-center">
          <Link href={"/dashboard"}>
            <button className="btn-ghost text-sm px-4 py-2">Dashboard</button>
          </Link>
          <Link href={"/sign-in"}>
            <button
              className="btn-signal text-sm px-5 py-2 flex items-center gap-2"
            >
              <span>Get Started</span>
              <span style={{ opacity: 0.7 }}>→</span>
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
