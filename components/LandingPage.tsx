"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function FadeIn({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "down" | "left" | "right" | "none" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const dirMap = { up: { y: 40 }, down: { y: -40 }, left: { x: 40 }, right: { x: -40 }, none: {} };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const features = [
  { icon: "🗺️", title: "Live Crowd Heatmap", desc: "Real-time density across 12 key locations in Prayagraj. Color-coded from safe green to critical red, updated every 15 seconds.", tab:"map" },
  { icon: "🧠", title: "AI Command Center", desc: "Gemini AI generates live situation reports, field commander advisories, and public announcements based on actual crowd patterns.", tab:"ai" },
  { icon: "🛣️", title: "Dynamic Route Intelligence", desc: "5 live routes recalculated every 15 seconds. Automatically avoids congested zones and recommends alternates in real-time.", tab:"routes" },
  { icon: "🔔", title: "Congestion Alerts", desc: "Four severity levels — Low to Critical — auto-triggered the moment thresholds are breached. Shake animations on critical alerts.",tab:"overview" },
  { icon: "📈", title: "24-Hour Forecast", desc: "Hourly crowd predictions per location using time-of-day patterns and festival multipliers. Know the surge before it happens.", tab:"forecast" },
  { icon: "🙏", title: "Pilgrim View", desc: "A separate mobile-first interface for pilgrims — safe routes, warnings, and darshan tips in plain simple language.", tab:"pilgrim" },
];

const stats = [
  { value: 450, suffix: "M+", label: "Expected Pilgrims in 2028" },
  { value: 12, suffix: "", label: "Monitored Zones" },
  { value: 15, suffix: "s", label: "Data Refresh Rate" },
  { value: 6, suffix: "x", label: "Max Simulated Surge" },
];

const timeline = [
  { date: "Jan 2028", event: "Makar Sankranti", intensity: "Very High", color: "#f97316" },
  { date: "Jan 2028", event: "Mauni Amavasya", intensity: "Critical", color: "#ef4444" },
  { date: "Feb 2028", event: "Basant Panchami", intensity: "High", color: "#f97316" },
  { date: "Feb 2028", event: "Maghi Purnima", intensity: "High", color: "#eab308" },
  { date: "Feb 2028", event: "Maha Shivratri", intensity: "Very High", color: "#f97316" },
];

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 5.5) % 92}%`,
      top: `${10 + (i * 7.3) % 80}%`,
      size: 2 + (i % 4),
      delay: (i * 0.4) % 4,
    }))
  );

  return (
    <div
  className="mandala-bg"
  style={{
    minHeight: "100vh",
    overflowX: "hidden",
  }}
>

      {/* HERO SECTION */}
      <section
        className="mandala-bg"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "2rem 1rem",
          overflow: "hidden",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      >
        {/* Radial glow behind hero */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px", height: "700px",
          background: "radial-gradient(ellipse, rgba(255,107,26,0.15) 0%, rgba(255,215,0,0.05) 40%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Floating particles */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: p.id % 3 === 0 ? "var(--gold)" : p.id % 3 === 1 ? "var(--saffron)" : "rgba(255,255,255,0.4)",
            }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3 + (p.id % 3), delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <motion.div
  className="float-anim"
  style={{
    width: "110px",
    height: "110px",
    marginBottom: "1.5rem",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  {/* Outer Ring */}
  <motion.div
    style={{
      position: "absolute",
      inset: "-8px",
      border: "1px solid rgba(255,215,0,0.25)",
      borderRadius: "50%",
    }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 25,
      repeat: Infinity,
      ease: "linear",
    }}
  />

  {/* Inner Ring */}
  <motion.div
    style={{
      position: "absolute",
      inset: "-2px",
      border: "1px solid rgba(255,215,0,0.4)",
      borderRadius: "50%",
    }}
    animate={{ rotate: -360 }}
    transition={{
      duration: 18,
      repeat: Infinity,
      ease: "linear",
    }}
  />

  {/* Golden Om */}
  <div
  style={{
    fontSize: "70px",
    lineHeight: 1,
    color: "#F5A84F",
    textShadow: "0 0 10px rgba(255,215,0,0.35)",
    zIndex: 2,
    transform: "translateY(6px)",
  }}
>
  ॐ
</div>
</motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", maxWidth: "800px" }}
        >
          <p style={{ color: "var(--saffron-light)", fontFamily: "'Yatra One', serif", fontSize: "clamp(12px, 2vw, 16px)", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "1rem" }}>
            MahaKumbh 2028 · Prayagraj
          </p>
          <h1
            className="shimmer-text"
            style={{ fontFamily: "'Yatra One', serif", fontSize: "clamp(48px, 10vw, 96px)", lineHeight: 1.05, margin: "0 0 1rem" }}
          >
            MahaDrishti
          </h1>
          <p style={{ color: "rgba(255,248,238,0.75)", fontSize: "clamp(16px, 2.5vw, 22px)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            AI-powered crowd intelligence for the world's largest human gathering.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 1.8vw, 16px)", marginBottom: "2.5rem" }}>
            Real-time heatmaps · Route optimization · Predictive alerts · Pilgrim safety
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="glow-saffron"
              style={{
                background: "linear-gradient(135deg, var(--saffron), var(--saffron-dark))",
                color: "#fff",
                border: "none",
                padding: "14px 36px",
                borderRadius: "50px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Enter Dashboard →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "transparent",
                color: "var(--gold)",
                border: "1px solid rgba(255,215,0,0.4)",
                padding: "14px 36px",
                borderRadius: "50px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Explore Features ↓
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)" }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div style={{ width: "24px", height: "40px", border: "2px solid rgba(255,215,0,0.4)", borderRadius: "12px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
            <motion.div
              style={{ width: "4px", height: "8px", background: "var(--gold)", borderRadius: "2px" }}
              animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section className="mandala-bg" style={{ padding: "5rem 2rem", background: "transparent"}}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ textAlign: "center", color: "var(--saffron-light)", fontFamily: "'Yatra One', serif", letterSpacing: "3px", textTransform: "uppercase", fontSize: "13px", marginBottom: "3rem" }}>
              The Scale of Kumbh 2028
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
            {stats.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.15}>
                <div
                  className="gradient-border"
                  style={{
  background: "rgba(13,10,46,0.85)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "2rem",
  textAlign: "center",
}}
                >
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: "clamp(40px, 6vw, 56px)", color: "var(--gold)", lineHeight: 1 }}>
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "0.5rem", lineHeight: 1.4 }}>{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: "5rem 2rem", background: "transparent" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Yatra One', serif", color: "var(--cream)", fontSize: "clamp(28px, 5vw, 48px)", textAlign: "center", marginBottom: "0.75rem" }}>
              Built for <span className="shimmer-text">Scale & Safety</span>
            </h2>
            <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "16px", marginBottom: "3.5rem", maxWidth: "560px", margin: "0 auto 3.5rem" }}>
              Every feature is purpose-built for the unique challenges of managing 450 million pilgrims across Prayagraj.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <motion.div
  onClick={() => {
  if (f.tab === "pilgrim") {
    localStorage.setItem("selectedView", "pilgrim");
  } else {
    localStorage.setItem("selectedTab", f.tab);
  }

  onEnter();
}}
  whileHover={{
    y: -6,
    boxShadow: "0 20px 40px rgba(255,107,26,0.2)",
  }}
  whileTap={{ scale: 0.98 }}
  style={{
    background: "rgba(13,10,46,0.8)",
    border: "1px solid rgba(255,107,26,0.2)",
    borderRadius: "16px",
    padding: "1.75rem",
    cursor: "pointer",
    transition: "border-color 0.3s",
  }}
>
                  <div style={{ fontSize: "36px", marginBottom: "1rem" }}>{f.icon}</div>
                  <h3 style={{ color: "var(--cream)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "18px", marginBottom: "0.6rem" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ padding: "5rem 2rem", background: "transparent" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Yatra One', serif", color: "var(--cream)", fontSize: "clamp(28px, 5vw, 48px)", textAlign: "center", marginBottom: "3.5rem" }}>
              How <span className="shimmer-text">MahaDrishti</span> Works
            </h2>
          </FadeIn>
          {[
            { step: "01", title: "Sensor Data Ingestion", desc: "Live crowd readings from 12 zones across Prayagraj are ingested every 15 seconds — ghats, temples, transport hubs, camps, and medical centres." },
            { step: "02", title: "AI Density Analysis", desc: "Each zone's density is calculated against capacity. Trend detection (rising/stable/falling) fires alerts automatically at 65%, 80%, and 92% thresholds." },
            { step: "03", title: "Route Recalculation", desc: "All 5 pilgrimage routes are recalculated in real-time, rerouting around congestion and flagging roads as Recommended, Caution, or Avoid." },
            { step: "04", title: "Gemini AI Advisory", desc: "Gemini serves as an AI command center, turning live crowd intelligence into actionable guidance for authorities and pilgrims." },
          ].map((item, i) => (
            <FadeIn key={item.step} delay={i * 0.15} direction="left">
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem", alignItems: "flex-start" }}>
                <div style={{
                  minWidth: "56px", height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--saffron-dark), var(--saffron))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Yatra One', serif", fontSize: "18px", color: "#fff",
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ color: "var(--cream)", fontWeight: 600, fontSize: "18px", marginBottom: "0.4rem" }}>{item.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* SNAN DATES TIMELINE */}
      <section style={{ padding: "5rem 2rem", background: "transparent" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Yatra One', serif", color: "var(--cream)", fontSize: "clamp(28px, 5vw, 48px)", textAlign: "center", marginBottom: "0.75rem" }}>
              Critical Snan Dates — 2028
            </h2>
            <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "15px", marginBottom: "3rem" }}>
              These are the peak surge days. MahaDrishti activates highest alert protocols automatically.
            </p>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {timeline.map((item, i) => (
              <FadeIn key={item.event} delay={i * 0.12}>
                <motion.div
                  whileHover={{ x: 8 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "1.5rem",
                    background: "rgba(255,107,26,0.05)",
                    border: `1px solid ${item.color}40`,
                    borderLeft: `4px solid ${item.color}`,
                    borderRadius: "12px",
                    padding: "1.25rem 1.5rem",
                    transition: "background 0.3s",
backdropFilter: "blur(10px)",
                  }}
                >
                  <div style={{ minWidth: "90px", color: "var(--text-muted)", fontSize: "13px" }}>{item.date}</div>
                  <div style={{ flex: 1, color: "var(--cream)", fontWeight: 500 }}>{item.event}</div>
                  <div style={{
                    background: `${item.color}20`,
                    color: item.color,
                    border: `1px solid ${item.color}50`,
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {item.intensity}
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section
        className="mandala-bg"
        style={{ padding: "6rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}
      >
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px", height: "500px",
          background: "radial-gradient(ellipse, rgba(255,107,26,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <FadeIn>
          <div style={{ position: "relative" }}>
            <p style={{ color: "var(--saffron-light)", fontFamily: "'Yatra One', serif", letterSpacing: "4px", textTransform: "uppercase", fontSize: "13px", marginBottom: "1rem" }}>
             MahaKumbh 2028
            </p>
            <h2 style={{ fontFamily: "'Yatra One', serif", fontSize: "clamp(32px, 6vw, 64px)", color: "var(--cream)", lineHeight: 1.1, marginBottom: "1.5rem" }}>
              Protecting Every<br /><span className="shimmer-text">Pilgrim. Every Moment.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
              MahaDrishti brings AI to the world's greatest gathering — making Kumbh 2028 safer, smarter, and more divine than ever.
            </p>
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="glow-saffron"
              style={{
                background: "linear-gradient(135deg, var(--saffron), var(--saffron-dark))",
                color: "#fff", border: "none",
                padding: "16px 48px",
                borderRadius: "50px",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Launch MahaDrishti →
            </motion.button>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer
  style={{
    borderTop: "1px solid rgba(255,107,26,0.15)",
    padding: "1rem",
    textAlign: "center",
    background: "linear-gradient(180deg, rgba(13,10,46,0.65) 0%, rgba(13,10,46,0.95) 100%)",
    backdropFilter: "blur(10px)",
  }}
>
        <p style={{ color: "rgba(168,155,181,0.5)", fontSize: "13px" }}>
          MahaDrishti · Real-Time Crowd Intelligence
        </p>
      </footer>
    </div>
  );
}