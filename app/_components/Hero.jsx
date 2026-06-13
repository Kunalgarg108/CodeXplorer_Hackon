import React from "react";
import Image from "next/image";
import Link from "next/link";

// Floating category tags data — the Copilot Money signature
const FLOATING_TAGS = [
  { label: "GROCERIES", emoji: "🛒", color: "#ff4433", rot: "-8deg", x: "8%", y: "22%", delay: "0s" },
  { label: "SAVINGS", emoji: "💰", color: "#00cc4b", rot: "6deg", x: "78%", y: "18%", delay: "0.8s" },
  { label: "TRAVEL", emoji: "✈️", color: "#00acfe", rot: "-5deg", x: "82%", y: "55%", delay: "1.2s" },
  { label: "DINING", emoji: "🍕", color: "#ff8833", rot: "10deg", x: "5%", y: "60%", delay: "0.4s" },
  { label: "HEALTH", emoji: "💊", color: "#ff33aa", rot: "-11deg", x: "70%", y: "78%", delay: "1.6s" },
  { label: "GOALS", emoji: "🎯", color: "#ffcc02", rot: "7deg", x: "20%", y: "80%", delay: "2s" },
  { label: "BUDGET", emoji: "📊", color: "#9019e6", rot: "-4deg", x: "88%", y: "36%", delay: "0.6s" },
];

function FloatingTag({ label, emoji, color, rot, x, y, delay, animClass }) {
  return (
    <div
      className={animClass || "float-tag"}
      style={{
        position: "absolute",
        left: x,
        top: y,
        "--rot": rot,
        transform: `rotate(${rot})`,
        animationDelay: delay,
        zIndex: 2,
      }}
    >
      <div
        className="category-tag"
        style={{ background: color }}
      >
        <span>{emoji}</span>
        <span style={{ fontWeight: 500, letterSpacing: "0.04em", fontSize: "11px" }}>{label}</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      style={{ background: "var(--color-midnight-canvas)", minHeight: "100vh" }}
      className="relative flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Subtle radial glow behind the hero text */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "500px",
          background: "radial-gradient(ellipse at center, rgba(28,108,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Floating tags */}
      {FLOATING_TAGS.map((tag, i) => (
        <FloatingTag
          key={tag.label}
          {...tag}
          animClass={i % 2 === 0 ? "float-tag" : "float-tag-2"}
        />
      ))}

      {/* Hero content */}
      <div
        style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 3, textAlign: "center" }}
        className="px-6 flex flex-col items-center gap-8"
      >
        {/* Eyebrow */}
        <div className="ai-badge">
          ✦ AI-Powered Finance
        </div>

        {/* Display heading */}
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(3rem, 8vw, 6rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: "var(--color-paper-white)",
          }}
        >
          Manage your{" "}
          <span style={{ color: "var(--color-signal-blue)" }}>money</span>
          <br />
          with clarity.
        </h1>

        {/* Sub-copy */}
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.125rem",
            lineHeight: 1.6,
            color: "var(--color-fog)",
            maxWidth: 520,
            letterSpacing: "-0.01em",
          }}
        >
          FinanSmart gives you an AI-driven personal finance advisor that tracks
          budgets, income streams, and expenses — all in one midnight canvas.
        </p>

        {/* CTA row */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={"/sign-in"}>
            <button
              className="btn-signal"
              style={{ fontSize: "15px", padding: "14px 32px", borderRadius: "14px" }}
            >
              Get started — it's free →
            </button>
          </Link>
          <Link href={"/dashboard"}>
            <button
              className="btn-ghost"
              style={{ fontSize: "15px", padding: "14px 28px", borderRadius: "14px" }}
            >
              View dashboard
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "8px",
            borderTop: "1px solid rgba(17,38,59,0.7)",
            paddingTop: "32px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {[
            { label: "Budgets tracked", val: "10k+" },
            { label: "Income sources", val: "50k+" },
            { label: "Expenses logged", val: "1M+" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-paper-white)",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.val}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-mist)", marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
