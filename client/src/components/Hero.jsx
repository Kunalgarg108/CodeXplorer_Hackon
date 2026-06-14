import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingTags from "@/components/FloatingTags";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import {
  Lightbulb, Layers, Receipt, Coins, AreaChart, ShieldCheck,
  LayoutGrid, CircleDollarSign, PiggyBank, ReceiptText, ScanLine, Heart,
  Landmark, Wallet, Sparkles, ShoppingCart, Plane, Activity, TrendingUp, LineChart, Wind
} from "lucide-react";

/* ─── tiny scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── animated counter ─── */
function Counter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(start);
    }, 20);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Mock Dashboard for ContainerScroll ─── */
function MockDashboard() {
  return (
    <div className="w-full h-full flex bg-[#000814] text-white overflow-hidden font-body text-[11px] select-none text-left">
      {/* Mock Sidebar */}
      <div className="w-[190px] hidden md:flex flex-col border-r border-[#11263b]/60 bg-[#010d1e] p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-md bg-[#1c6cff] flex items-center justify-center shadow-[0_0_10px_rgba(28,108,255,0.4)]">
            <img src="/chart-donut.svg" alt="logo" className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-semibold text-sm">PocketBuddy</span>
        </div>
        <div className="space-y-1.5 flex-1 text-[10px]">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#1c6cff]/10 text-[#1c6cff] font-medium">
            <LayoutGrid className="w-3.5 h-3.5" /> Dashboard
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" /> Pocket Buddy AI
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <LineChart className="w-3.5 h-3.5 text-[#818cf8]" /> Transactions
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <CircleDollarSign className="w-3.5 h-3.5 text-[#00acfe]" /> Incomes
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <PiggyBank className="w-3.5 h-3.5 text-[#00cc4b]" /> Budgets
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <ReceiptText className="w-3.5 h-3.5 text-[#ff8833]" /> Expenses
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <ScanLine className="w-3.5 h-3.5 text-cyan-400" /> Menu Scanner
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <Heart className="w-3.5 h-3.5 text-tag-coral" /> Wellness Profile
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-fog hover:text-white hover:bg-[#001533]/30 transition-colors">
            <Activity className="w-3.5 h-3.5 text-[#00cc4b]" /> Fitness
          </div>
        </div>
        <div className="pt-4 border-t border-[#11263b]/40 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1c6cff]/20 flex items-center justify-center text-[10px] font-bold text-[#1c6cff] border border-[#1c6cff]/30">
            JD
          </div>
          <div>
            <div className="font-semibold text-[10px]">John Doe</div>
            <div className="text-[8px] text-mist">Active User</div>
          </div>
        </div>
      </div>

      {/* Mock Main Content */}
      <div className="flex-1 flex flex-col bg-[#000814] overflow-hidden">
        {/* Mock Topbar */}
        <div className="h-12 border-b border-[#11263b]/40 px-6 flex items-center justify-between flex-shrink-0 bg-[#010d1e]/50">
          <span className="font-display font-semibold text-sm text-white">Hi, John 👋</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-mist">June 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-[#1c6cff]/10 text-[#1c6cff] text-[9px] font-semibold border border-[#1c6cff]/20">Active</span>
          </div>
        </div>

        {/* Mock Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* AI Banner */}
          <div className="p-3.5 bg-gradient-to-r from-[#1c6cff]/15 to-[#001533]/5 border border-[#1c6cff]/20 rounded-xl flex items-start gap-2.5 text-left">
            <Sparkles className="w-3.5 h-3.5 text-[#1c6cff] shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="eyebrow text-[9px] text-[#1c6cff] uppercase tracking-wider mb-0.5">POCKETBUDDY AI INSIGHT</p>
              <p className="body-thin text-fog text-[10px] leading-relaxed">
                Your grocery spending is at <strong className="text-tag-coral font-semibold">85%</strong> of its limit. Meal prepping this week can save you up to <strong className="text-tag-lime font-semibold">$45</strong>.
              </p>
            </div>
          </div>

          {/* New 50/50 Grid: Financial Health + Status Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Financial Health */}
            <div className="p-4 bg-[#010d1e] border border-[#11263b]/50 rounded-xl flex flex-col justify-between h-[230px] text-left">
              <div>
                <p className="text-[10px] text-mist uppercase tracking-wider mb-1.5">Financial Health</p>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-[20px] font-bold text-white">$3,140</span>
                  <span className="text-[10px] text-mist">spent of $5,200 budget</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#11263b]/50 rounded-full h-2 overflow-hidden border border-[#11263b]/20">
                  <div className="bg-[#1c6cff] h-2 rounded-full" style={{ width: "60%" }} />
                </div>
                <div className="text-[9px] text-mist mt-1.5">
                  60% of budget used · $2,060 remaining
                </div>
              </div>

              {/* Stats tiles */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="p-2.5 rounded-lg bg-[#000814]/60 border border-[#11263b]/30 flex flex-col justify-between h-[65px]">
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[8px] text-mist font-semibold uppercase tracking-wider">Active Budgets</span>
                    <div className="p-1 rounded-full bg-[#11263b]/30 text-fog flex items-center justify-center w-4 h-4">
                      <Wallet className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white leading-none">3</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#000814]/60 border border-[#11263b]/30 flex flex-col justify-between h-[65px]">
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[8px] text-mist font-semibold uppercase tracking-wider">Income Streams</span>
                    <div className="p-1 rounded-full bg-[#1c6cff]/10 text-[#1c6cff] flex items-center justify-center w-4 h-4">
                      <TrendingUp className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#1c6cff] leading-none">$4,500</span>
                </div>
              </div>
            </div>

            {/* Right Card: Status Stack */}
            <div className="flex flex-col gap-3">
              {/* Today's Status Card */}
              <div className="p-4 bg-[#010d1e] border border-[#11263b]/50 rounded-xl flex flex-col justify-between h-[108px] text-left">
                <div className="flex justify-between items-start w-full">
                  <span className="text-[9px] text-mist font-semibold uppercase">TODAY'S STATUS</span>
                  <span className="text-[8px] font-semibold uppercase bg-tag-lime/15 text-tag-lime px-1.5 py-0.5 rounded">RELAXED</span>
                </div>
                <p className="text-[10px] text-fog font-light leading-relaxed my-1">
                  Today looks good — low stress supports recovery.
                </p>
                <div className="flex items-center gap-1 text-[8px] text-mist">
                  <Wind className="w-3 h-3 text-signal" /> Start 4-7-8 Breathing
                </div>
              </div>

              {/* Recovery Status Card */}
              <div className="p-4 bg-[#010d1e] border border-[#11263b]/50 rounded-xl flex flex-col justify-between h-[108px] text-left">
                <div className="flex justify-between items-start w-full">
                  <span className="text-[9px] text-mist font-semibold uppercase">RECOVERY STATUS</span>
                  <span className="text-[8px] font-semibold uppercase bg-tag-lime/15 text-tag-lime px-1.5 py-0.5 rounded">ALL CLEAR</span>
                </div>
                <p className="text-[10px] text-fog font-light leading-relaxed my-1">
                  No burnout pattern detected — wellness levels look stable.
                </p>
                <div className="text-[8px] text-[#1c6cff]">
                  View details →
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="p-4 bg-[#010d1e] border border-[#11263b]/50 rounded-xl flex flex-col justify-between h-[130px] text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-mist font-semibold">Spending Activity</span>
              <span className="text-[8px] text-[#1c6cff]">Weekly View</span>
            </div>
            <div className="flex items-end justify-between h-[85px] px-2 pt-1">
              {[
                { day: "M", val: "40%" },
                { day: "T", val: "65%" },
                { day: "W", val: "30%" },
                { day: "T", val: "85%" },
                { day: "F", val: "50%" },
                { day: "S", val: "95%" },
                { day: "S", val: "20%" },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2 md:w-2.5 bg-[#001533] rounded-t-sm h-[55px] relative overflow-hidden flex items-end">
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: bar.val,
                        background: i === 5 ? "linear-gradient(to top, #ff4433, #ff33aa)" : "linear-gradient(to top, #1c6cff, #00acfe)",
                        boxShadow: i === 5 ? "0 0 6px rgba(255, 68, 51, 0.3)" : "0 0 6px rgba(28, 108, 255, 0.3)"
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-mist">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── feature cards data ─── */
const FEATURES = [
  {
    icon: Lightbulb,
    title: "AI Financial Advice",
    desc: "Get real-time, personalized guidance powered by AI — tailored to your actual spending and income data.",
    accent: "#1c6cff",
  },
  {
    icon: Layers,
    title: "Budget Tracking",
    desc: "Create budgets, assign them emoji categories, and watch a live progress bar fill as you spend.",
    accent: "#00cc4b",
  },
  {
    icon: Receipt,
    title: "Expense Management",
    desc: "Log every expense in seconds. Delete, review and analyze what's draining your wallet the most.",
    accent: "#ff8833",
  },
  {
    icon: Coins,
    title: "Income Streams",
    desc: "Track multiple income sources side by side. Know exactly what's coming in every month.",
    accent: "#00acfe",
  },
  {
    icon: AreaChart,
    title: "Visual Analytics",
    desc: "Bar charts and progress meters turn raw numbers into instant visual insight at a glance.",
    accent: "#ff33aa",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "Your financial data stays yours. Authentication-protected routes and encrypted storage.",
    accent: "#9019e6",
  },
];

/* ─── FeatureCard ─── */
function FeatureCard({ icon: Icon, title, desc, accent, index }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
        background: "#010d1e",
        borderRadius: 24,
        padding: "28px 24px",
        border: "1px solid rgba(17,38,59,0.6)",
        boxShadow:
          "rgba(255,255,255,0.06) 4px 4px 12px inset, rgba(0,0,0,0.25) -4px -4px 12px inset",
      }}
      className="text-left"
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          border: `1px solid ${accent}44`,
        }}
      >
        <Icon style={{ width: 22, height: 22, color: accent }} />
      </div>
      <h3
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 18,
          fontWeight: 600,
          color: "#fff",
          marginBottom: 10,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "#ccced0", fontSize: 14, fontWeight: 300, lineHeight: 1.65 }}>
        {desc}
      </p>
    </div>
  );
}

/* ─── How it works steps ─── */
const STEPS = [
  { n: "01", title: "Create your budgets", desc: "Set spending limits for every category — groceries, travel, dining, health — with a fun emoji pick.", color: "#1c6cff" },
  { n: "02", title: "Log income & expenses", desc: "Add income streams and expenses in seconds. Every transaction is instantly reflected in your charts.", color: "#00cc4b" },
  { n: "03", title: "Get AI insights",       desc: "PocketBuddy AI reads your numbers and gives you plain-English advice on where to save and what to cut.", color: "#ff8833" },
];

function StepCard({ n, title, desc, color, index }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-40px)",
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
      }}
      className="text-left"
    >
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 36,
          fontWeight: 700,
          color: color,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          minWidth: 52,
          opacity: 0.8,
        }}
      >
        {n}
      </div>
      <div>
        <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ color: "#ccced0", fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Main Hero export ─── */
export default function Hero() {
  const [statsRef, statsVisible] = useReveal();

  return (
    <>
      {/* ════════════════ HERO ════════════════ */}
      <section
        style={{
          background: "#000814",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* radial glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 700,
            height: 500,
            background:
              "radial-gradient(ellipse at center, rgba(28,108,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <FloatingTags />

        <ContainerScroll
          titleComponent={
            <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 3, textAlign: "center" }} className="px-6 flex flex-col items-center gap-6">
              {/* eyebrow */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg,#ff4433,#ff33aa,#9019e6)",
                  borderRadius: 9999,
                  padding: "5px 16px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                ✦ AI-Powered Finance Advisor
              </div>

              {/* headline */}
              <h1
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Manage your <span style={{ color: "#1c6cff" }}>money</span><br />
                with confidence.
              </h1>

              {/* sub */}
              <p
                style={{
                  color: "#ccced0",
                  fontSize: "1.1rem",
                  fontWeight: 300,
                  lineHeight: 1.65,
                  maxWidth: 500,
                  margin: "0 auto 16px",
                  letterSpacing: "-0.01em",
                }}
              >
                Track budgets, income streams &amp; expenses with personalized
                AI-driven financial advice — all on one midnight canvas.
              </p>

              {/* CTAs */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 32,
                }}
              >
                <Link to="/sign-up" style={{ textDecoration: "none" }}>
                  <button className="bg-[#1c6cff] hover:bg-[#0052e0] text-white font-semibold text-[15px] px-8 py-3.5 rounded-[14px] shadow-[0_8px_30px_rgba(28,108,255,0.4)] hover:shadow-[0_12px_35px_rgba(28,108,255,0.6)] hover:scale-[1.03] hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-300 border-none outline-none cursor-pointer">
                    Get started — it's free →
                  </button>
                </Link>
                <Link to="/sign-in" style={{ textDecoration: "none" }}>
                  <button className="bg-white/5 border border-white/10 hover:border-white/30 text-[#ccced0] hover:text-white font-medium text-[15px] px-8 py-3.5 rounded-[14px] hover:bg-white/10 hover:scale-[1.03] hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-300 outline-none cursor-pointer">
                    Log in
                  </button>
                </Link>
              </div>
            </div>
          }
        >
          <MockDashboard />
        </ContainerScroll>

        {/* stats row (acting as section divider/outro) */}
        <div
          ref={statsRef}
          style={{
            opacity: statsVisible ? 1 : 0,
            transform: statsVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            display: "flex",
            gap: 0,
            justifyContent: "center",
            borderTop: "1px solid rgba(17,38,59,0.8)",
            paddingTop: 32,
            paddingBottom: 64,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {[
            { val: 10000, suffix: "+", label: "Budgets tracked" },
            { val: 50000, suffix: "+", label: "Income sources" },
            { val: 1000000, suffix: "+", label: "Expenses logged" },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(17,38,59,0.8)" : "none",
                padding: "0 24px",
              }}
            >
              <div
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                <Counter to={s.val} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 12, color: "#999ca1", marginTop: 3, fontWeight: 300 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <SectionFeatures />

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <SectionHowItWorks />

      {/* ════════════════ CTA BAND ════════════════ */}
      <SectionCTA />
    </>
  );
}

/* ─── Features section ─── */
function SectionFeatures() {
  const [ref, visible] = useReveal();
  return (
    <section style={{ background: "#010d1e", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div ref={ref} style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.6s ease",
              color: "#1c6cff",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Everything you need
          </p>
          <h2
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Built for real<br />financial clarity
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works section ─── */
function SectionHowItWorks() {
  const [ref, visible] = useReveal();
  return (
    <section style={{ background: "#000814", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* left text */}
          <div>
            <p ref={ref}
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.6s ease",
                color: "#1c6cff",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              How it works
            </p>
            <h2
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 48,
              }}
            >
              Three steps to<br />financial control
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {STEPS.map((s, i) => <StepCard key={s.n} {...s} index={i} />)}
            </div>
          </div>

          {/* right visual */}
          <HowItWorksVisual />
        </div>
      </div>
    </section>
  );
}

function HowItWorksVisual() {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
      }}
      className="w-full flex justify-center"
    >
      {/* mock dashboard card */}
      <div
        style={{
          background: "#010d1e",
          borderRadius: 24,
          border: "1px solid rgba(17,38,59,0.7)",
          padding: 28,
          width: "100%",
          maxWidth: 480,
          boxShadow:
            "rgba(255,255,255,0.06) 4px 4px 12px inset, rgba(0,0,0,0.3) -4px -4px 12px inset, 0 0 60px rgba(28,108,255,0.08)",
        }}
        className="text-left"
      >
        {/* mini header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 600, fontSize: 14, color: "#fff" }}>
            Monthly Overview
          </span>
          <span style={{ background: "rgba(28,108,255,0.15)", color: "#1c6cff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
            June 2026
          </span>
        </div>

        {/* mini stat cards */}
        {[
          { label: "Total Budget", val: "$5,200", color: "#1c6cff", icon: Landmark },
          { label: "Total Spent",  val: "$3,140", color: "#ff4433", icon: Wallet },
          { label: "Remaining",    val: "$2,060", color: "#00cc4b", icon: Coins },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderRadius: 14,
              background: "#001533",
              border: "1px solid rgba(17,38,59,0.5)",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <s.icon style={{ width: 18, height: 18, color: s.color }} />
              <span style={{ color: "#ccced0", fontSize: 13, fontWeight: 300 }}>{s.label}</span>
            </div>
            <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 16, color: s.color }}>
              {s.val}
            </span>
          </div>
        ))}

        {/* mini progress bars */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 8 }}>
            <span style={{ color: "#ccced0", fontSize: 12, fontWeight: 300, display: "flex", alignItems: "center", gap: 6 }}>
              <ShoppingCart className="w-3.5 h-3.5 text-[#ff4433]" /> Groceries
            </span>
            <span style={{ color: "#ff4433", fontSize: 12, fontWeight: 600 }}>85%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", height: 6, borderRadius: 999, marginBottom: 16, marginTop: 4 }}>
            <div style={{ width: "85%", height: 6, borderRadius: 999, background: "#ff4433", transition: "width 1.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 8 }}>
            <span style={{ color: "#ccced0", fontSize: 12, fontWeight: 300, display: "flex", alignItems: "center", gap: 6 }}>
              <Plane className="w-3.5 h-3.5 text-[#00acfe]" /> Travel
            </span>
            <span style={{ color: "#00acfe", fontSize: 12, fontWeight: 600 }}>42%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", height: 6, borderRadius: 999, marginTop: 4 }}>
            <div style={{ width: "42%", height: 6, borderRadius: 999, background: "#00acfe" }} />
          </div>
        </div>

        {/* AI advice pill */}
        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            borderRadius: 14,
            background: "rgba(28,108,255,0.08)",
            border: "1px solid rgba(28,108,255,0.2)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <Sparkles style={{ width: 16, height: 16, color: "#1c6cff", flexShrink: 0, marginTop: 2 }} />
          <span style={{ color: "#ccced0", fontSize: 12, fontWeight: 300, lineHeight: 1.6 }}>
            <strong style={{ color: "#1c6cff", fontWeight: 600 }}>AI Tip:</strong> Your grocery spend is at 85%. Consider meal prepping this week to stay under budget.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── CTA band ─── */
function SectionCTA() {
  const [ref, visible] = useReveal();
  return (
    <section style={{ background: "#010d1e", padding: "100px 24px" }}>
      <div
        ref={ref}
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <p style={{ color: "#1c6cff", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          Start today
        </p>
        <h2
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Your finances deserve<br />
          <span style={{ color: "#1c6cff" }}>a midnight canvas.</span>
        </h2>
        <p style={{ color: "#ccced0", fontSize: 15, fontWeight: 300, lineHeight: 1.65, marginBottom: 36 }}>
          Join PocketBuddy and take control of every dollar — with AI clarity, not just spreadsheets.
        </p>
        <Link to="/sign-up" style={{ textDecoration: "none" }}>
          <button className="bg-[#1c6cff] hover:bg-[#0052e0] text-white font-semibold text-[15px] px-8 py-3.5 rounded-[14px] shadow-[0_8px_30px_rgba(28,108,255,0.4)] hover:shadow-[0_12px_35px_rgba(28,108,255,0.6)] hover:scale-[1.03] hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-300 border-none outline-none cursor-pointer">
            Get started for free →
          </button>
        </Link>
      </div>
    </section>
  );
}
