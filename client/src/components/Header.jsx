import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        background: "rgba(1, 13, 30, 0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(28, 108, 255, 0.15)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        transition: "all 0.35s ease",
      }}
    >
      <div className="page-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} className="hover:opacity-90 transition-opacity">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #1c6cff, #00acfe)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(28, 108, 255, 0.5)",
          }}>
            <img src="/chart-donut.svg" alt="logo" width={22} height={22} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 18, color: "#fff", letterSpacing: "-0.01em" }}>
            PocketBuddy
          </span>
        </Link>

        {/* Nav actions */}
        {isSignedIn ? (
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <span 
                style={{
                  color: "#ccced0",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                onMouseLeave={(e) => e.target.style.color = "#ccced0"}
              >
                Dashboard
              </span>
            </Link>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: 10,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 500,
                color: "#ccced0",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#ffffff";
                e.target.style.borderColor = "#ffffff";
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#ccced0";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.25)";
                e.target.style.background = "transparent";
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link to="/sign-in" style={{ textDecoration: "none" }}>
              <span 
                style={{
                  color: "#ccced0",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                onMouseLeave={(e) => e.target.style.color = "#ccced0"}
              >
                Log in
              </span>
            </Link>
            <Link to="/sign-up" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "linear-gradient(135deg, #1c6cff, #00acfe)",
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 22px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 0 15px rgba(28, 108, 255, 0.4)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.03)";
                  e.target.style.boxShadow = "0 0 20px rgba(28, 108, 255, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 0 15px rgba(28, 108, 255, 0.4)";
                }}
              >
                Get started
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
