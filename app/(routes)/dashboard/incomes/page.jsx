import React from "react";
import IncomeList from "./_components/IncomeList";

function Income() {
  return (
    <div
      style={{
        background: "var(--color-midnight-canvas)",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--color-paper-white)",
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}
        >
          My Income Streams
        </h1>
        <p style={{ color: "var(--color-mist)", fontSize: "14px", fontWeight: 300 }}>
          Track all your income sources in one place
        </p>
      </div>
      <IncomeList />
    </div>
  );
}

export default Income;
