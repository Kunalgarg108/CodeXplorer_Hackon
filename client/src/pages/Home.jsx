import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div style={{ background: "#000814", minHeight: "100vh" }}>
      <Header />
      <Hero />

      {/* Footer */}
      <footer style={{
        background: "#000814",
        borderTop: "1px solid rgba(17,38,59,0.6)",
        padding: "32px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1c6cff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/chart-donut.svg" alt="logo" width={16} height={16} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: "#fff" }}>PocketBuddy</span>
          </div>
          <p style={{ color: "#999ca1", fontSize: 13, fontWeight: 300 }}>
            © 2026 PocketBuddy. Built for financial clarity.
          </p>
        </div>
      </footer>
    </div>
  );
}
