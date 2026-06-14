import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isSignedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(1,13,30,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(17,38,59,0.6)" : "1px solid transparent",
        transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
      }}
    >
      <div className="page-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "#1c6cff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(28,108,255,0.4)",
          }}>
            <img src="/chart-donut.svg" alt="logo" width={20} height={20} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: "#fff" }}>
            PocketBuddy
          </span>
        </Link>

        {/* Nav actions */}
        {isSignedIn ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/sign-in">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/sign-up">
              <Button size="sm" style={{ borderRadius: 10, padding: "8px 20px" }}>Get started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
