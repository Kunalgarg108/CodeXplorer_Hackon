import React from "react";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    style={{ width: 16, height: 16, flexShrink: 0, color: "var(--color-tag-lime)" }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

function FeatureItem({ text }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <CheckIcon />
      <span style={{ color: "var(--color-fog)", fontSize: "14px", fontWeight: 300 }}>{text}</span>
    </li>
  );
}

function Upgrade() {
  return (
    <div
      style={{
        background: "var(--color-midnight-canvas)",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: "48px" }}>
        <p style={{ color: "var(--color-signal-blue)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
          Plans & Pricing
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "var(--color-paper-white)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "12px",
          }}
        >
          Upgrade your<br />
          <span style={{ color: "var(--color-signal-blue)" }}>financial clarity</span>
        </h1>
        <p style={{ color: "var(--color-mist)", fontSize: "15px", fontWeight: 300, maxWidth: 480 }}>
          Choose the plan that works for your financial goals. Cancel anytime.
        </p>
      </div>

      {/* Pricing cards */}
      <div style={{ maxWidth: 760, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Starter Plan */}
        <div
          className="neo-card"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "var(--color-mist)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
              Starter
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "var(--color-paper-white)",
                  letterSpacing: "-0.03em",
                }}
              >
                $20
              </span>
              <span style={{ color: "var(--color-mist)", fontSize: "14px", fontWeight: 300 }}>/month</span>
            </div>
          </div>

          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, marginBottom: "28px" }}>
            <FeatureItem text="10 users included" />
            <FeatureItem text="2GB of storage" />
            <FeatureItem text="Email support" />
            <FeatureItem text="Help center access" />
          </ul>

          <a
            href="#"
            style={{
              display: "block",
              textAlign: "center",
              padding: "13px",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid rgba(28,108,255,0.4)",
              color: "var(--color-signal-blue)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.2s ease",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,108,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Get Started
          </a>
        </div>

        {/* Pro Plan — featured */}
        <div
          className="neo-card"
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(28,108,255,0.4)",
            background: "var(--color-indigo-surface)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Featured glow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, var(--color-signal-blue), var(--color-tag-violet))",
            }}
          />

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <p style={{ color: "var(--color-mist)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Pro
              </p>
              <span
                style={{
                  background: "rgba(28,108,255,0.2)",
                  color: "var(--color-signal-blue)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                }}
              >
                Popular
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "var(--color-paper-white)",
                  letterSpacing: "-0.03em",
                }}
              >
                $30
              </span>
              <span style={{ color: "var(--color-mist)", fontSize: "14px", fontWeight: 300 }}>/month</span>
            </div>
          </div>

          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, marginBottom: "28px" }}>
            <FeatureItem text="20 users included" />
            <FeatureItem text="5GB of storage" />
            <FeatureItem text="Email support" />
            <FeatureItem text="Help center access" />
            <FeatureItem text="Phone support" />
            <FeatureItem text="Community access" />
          </ul>

          <a
            href="#"
            className="btn-signal"
            style={{
              display: "block",
              textAlign: "center",
              padding: "13px",
              borderRadius: "12px",
              background: "var(--color-signal-blue)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}

export default Upgrade;
