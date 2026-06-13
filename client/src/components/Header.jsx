import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isSignedIn, logout } = useAuth();
  return (
    <div className="p-5 flex justify-between items-center border shadow-sm">
      <div className="flex flex-row items-center">
        <img src="/chart-donut.svg" alt="logo" width={40} height={25} />
        <span className="text-blue-800 font-bold text-xl">FinanSmart</span>
      </div>
      {isSignedIn ? (
        <div className="flex gap-3 items-center">
          <Link to="/dashboard">
            <Button variant="outline" className="rounded-full">Dashboard</Button>
          </Link>
          <Button variant="outline" className="rounded-full" onClick={logout}>Logout</Button>
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <Link to="/sign-in">
            <Button variant="outline" className="rounded-full">Dashboard</Button>
          </Link>
          <Link to="/sign-up">
            <Button className="rounded-full">Get Started</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
