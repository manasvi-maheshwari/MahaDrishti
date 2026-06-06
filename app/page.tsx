"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Activity, Users, Navigation, Brain, Shield,
  TrendingUp, MapPin, Clock, Zap, ChevronRight, Radio, Thermometer, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import LandingPage from "@/components/LandingPage";

const CrowdMap = dynamic(() => import("@/components/CrowdMap"), { ssr: false });

interface Reading { locationId: string; count: number; density: number; trend: string; temperature: number; }
interface LocationData { id: string; name: string; type: string; lat: number; lng: number; capacity: number; zone: string; }
interface Alert { id: string; locationId: string; locationName: string; severity: "low"|"medium"|"high"|"critical"; message: string; timestamp: string; type: string; }
interface RouteOption { id: string; name: string; from: string; to: string; distance: string; estimatedTime: string; crowdLevel: string; status: "recommended"|"caution"|"avoid"; reason: string; }
interface ForecastPoint { hour: string; predicted: number; capacity: number; percentFull: number; }

const S = {
  saffron: "#FF6B1A",
  saffronLight: "#FF8C42",
  gold: "#FFD700",
  indigo: "#0D0A2E",
  indigoMid: "#1A1550",
  indigoLight: "#2D2570",
  cream: "#FFF8EE",
  muted: "#A89BB5",
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [view, setView] = useState<"authority"|"pilgrim">("authority");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [summary, setSummary] = useState({ totalPilgrims: 0, averageDensity: 0, criticalLocations: 0, highLocations: 0 });
  const [advisory, setAdvisory] = useState("");
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [simulationMultiplier, setSimulationMultiplier] = useState(1.0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("triveni");
  const [activeTab, setActiveTab] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("selectedTab") || "overview";
  }
  return "overview";
});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [crowdRes, alertsRes, routesRes] = await Promise.all([
        fetch(`/api/crowd-data?multiplier=${simulationMultiplier}`),
        fetch(`/api/alerts?multiplier=${simulationMultiplier}`),
        fetch(`/api/routes?multiplier=${simulationMultiplier}`),
      ]);
      const [crowdData, alertsData, routesData] = await Promise.all([
        crowdRes.json(), alertsRes.json(), routesRes.json(),
      ]);
      setReadings(crowdData.readings ?? []);
      setLocations(crowdData.locations ?? []);
      setSummary(crowdData.summary ?? {});
      setAlerts(alertsData.alerts ?? []);
      setRoutes(routesData.routes ?? []);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (e) { console.error(e); }
    finally { setIsRefreshing(false); }
  }, [simulationMultiplier]);

  const fetchForecast = useCallback(async () => {
    const res = await fetch(`/api/predict?locationId=${selectedLocation}`);
    const data = await res.json();
    setForecast(data.forecast ?? []);
  }, [selectedLocation]);

  const fetchAdvisory = async () => {
    setAdvisoryLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multiplier: simulationMultiplier }),
      });
      const data = await res.json();
      setAdvisory(data.advisory ?? "");
    } finally { setAdvisoryLoading(false); }
  };

  useEffect(() => {
    fetchData(); fetchForecast();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, [fetchData, fetchForecast]);

  useEffect(() => { fetchForecast(); }, [selectedLocation, fetchForecast]);

  const getDensityColor = (d: number) => d >= 0.85 ? "#ef4444" : d >= 0.70 ? S.saffron : d >= 0.50 ? S.gold : "#22c55e";
  const getSeverityStyle = (s: string) => ({
    critical: "border-l-red-500",
    high: "border-l-orange-400",
    medium: "border-l-yellow-400",
  } as Record<string,string>)[s] ?? "border-l-blue-400";

  const getStatusBadge = (s: string) => ({
    recommended: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", border: "rgba(34,197,94,0.3)" },
    caution: { bg: "rgba(255,215,0,0.15)", color: S.gold, border: "rgba(255,215,0,0.3)" },
    avoid: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  } as Record<string, { bg: string; color: string; border: string }>)[s] ?? { bg: "rgba(168,155,181,0.15)", color: S.muted, border: "rgba(168,155,181,0.3)" };

  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  const sliderLabel = simulationMultiplier < 1.5 ? "Normal Day" : simulationMultiplier < 3 ? "Festival Day" : simulationMultiplier < 5 ? "Snan Day" : "🚨 Mauni Amavasya";
  const sliderColor = simulationMultiplier < 1.5 ? "#22c55e" : simulationMultiplier < 3 ? S.gold : simulationMultiplier < 5 ? S.saffron : "#ef4444";

  const sliderBg = `linear-gradient(to right, ${
    simulationMultiplier < 1.5 ? "#22c55e" : simulationMultiplier < 3 ? "#eab308" : simulationMultiplier < 5 ? S.saffron : "#ef4444"
  } 0%, ${
    simulationMultiplier < 1.5 ? "#22c55e" : simulationMultiplier < 3 ? "#eab308" : simulationMultiplier < 5 ? S.saffron : "#ef4444"
  } ${((simulationMultiplier - 0.5) / 5.5) * 100}%, rgba(255,255,255,0.1) ${((simulationMultiplier - 0.5) / 5.5) * 100}%)`;

  if (showLanding)
  return (
    <LandingPage
      onEnter={() => {
  const savedTab = localStorage.getItem("selectedTab");
  const savedView = localStorage.getItem("selectedView");

  if (savedTab) {
    setActiveTab(savedTab);
  }

  if (savedView === "pilgrim") {
    setView("pilgrim");
    localStorage.removeItem("selectedView");
  }

  window.scrollTo({
  top: 0,
  behavior: "smooth",
});

  setShowLanding(false);
}}
    />
  );
  if (view === "pilgrim") return <PilgrimView routes={routes} alerts={alerts} onBack={() => setView("authority")} />;

  const cardStyle = {
    background: S.indigoMid,
    border: `1px solid rgba(255,107,26,0.15)`,
    borderRadius: "16px",
  };

  const tabItems = [
    {id:"overview",icon:Activity,label:"Overview"},
    {id:"map",icon:MapPin,label:"Live Map"},
    {id:"forecast",icon:TrendingUp,label:"Forecast"},
    {id:"routes",icon:Navigation,label:"Routes"},
    {id:"ai",icon:Brain,label:"AI Command"},
  ];

  return (
    <div style={{ minHeight: "100vh", background: S.indigo, color: S.cream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <header style={{
        background: `${S.indigoMid}F0`,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(255,107,26,0.2)`,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <button
              onClick={() => setShowLanding(true)}
              style={{
                background: "linear-gradient(135deg, var(--saffron,#FF6B1A), #CC4E00)",
                border: "none", borderRadius: "12px",
                width: "40px", height: "40px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: "20px", color:"white"
              }}
            >ॐ</button>
            <div>
              <h1 style={{ fontFamily: "'Yatra One', serif", fontSize: "18px", color: S.cream, margin: 0, lineHeight: 1 }}>MahaDrishti</h1>
              <p style={{ fontSize: "11px", color: S.muted, margin: "2px 0 0", letterSpacing: "0.5px" }}>AI Crowd Intelligence · Prayagraj 2028</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {criticalCount > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: "20px", padding: "4px 12px",
                }}
              >
                <Radio size={12} color="#ef4444" />
                <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>{criticalCount} Critical</span>
              </motion.div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: S.muted }}>
              <Clock size={12} />
              <span>Updated {lastUpdated}</span>
              <button
                onClick={fetchData}
                style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, marginLeft: "2px", padding: 0 }}
              >
                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView("pilgrim")}
              style={{
                background: "linear-gradient(135deg, #FF6B1A, #CC4E00)",
                border: "none", borderRadius: "20px", padding: "6px 16px",
                fontSize: "12px", fontWeight: 600, color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Users size={12} />Pilgrim View
            </motion.button>
          </div>
        </div>

        {/* Simulator bar */}
        <div style={{
          maxWidth: "1600px", margin: "0 auto",
          padding: "0.6rem 1.5rem",
          borderTop: "1px solid rgba(255,107,26,0.1)",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <Zap size={16} color={S.gold} />
          <span style={{ fontSize: "12px", color: S.muted, whiteSpace: "nowrap" }}>Crowd Simulator:</span>
          <input
  type="range"
  min="0.5"
  max="6"
  step="0.1"
  value={simulationMultiplier}
  onChange={(e) => setSimulationMultiplier(parseFloat(e.target.value))}
  className="crowd-slider"
  style={{
    flex: 1,
    maxWidth: "280px",
    background: sliderBg,
    "--thumb-color": sliderColor,
  } as React.CSSProperties}
/>
          <span style={{ fontSize: "13px", fontWeight: 700, color: sliderColor, minWidth: "36px" }}>{simulationMultiplier.toFixed(1)}×</span>
          <span style={{ fontSize: "12px", color: sliderColor, fontWeight: 500 }}>{sliderLabel}</span>
        </div>
      </header>

      {/* NAV TABS */}
      <div style={{ background: S.indigoMid, borderBottom: `1px solid rgba(255,107,26,0.1)`, position: "sticky", top: "97px", zIndex: 40 }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "4px", overflowX: "auto" }}>
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "12px 16px",
                background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? S.saffron : "transparent"}`,
                color: activeTab === tab.id ? S.saffron : S.muted,
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <tab.icon size={15} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "1.5rem" }}>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {[
                    {label:"Total Pilgrims",value:(summary.totalPilgrims||0).toLocaleString(),Icon:Users,color:"#60a5fa",glow:"rgba(96,165,250,0.2)"},
                    {label:"Avg. Density",value:`${Math.round((summary.averageDensity||0)*100)}%`,Icon:Activity,color:"#c084fc",glow:"rgba(192,132,252,0.2)"},
                    {label:"Critical Zones",value:String(summary.criticalLocations||0),Icon:AlertTriangle,color:"#f87171",glow:"rgba(248,113,113,0.2)"},
                    {label:"High Alert Zones",value:String(summary.highLocations||0),Icon:Thermometer,color:S.saffron,glow:"rgba(255,107,26,0.2)"},
                  ].map(kpi => (
                    <motion.div
                      key={kpi.label}
                      whileHover={{ y: -4, boxShadow: `0 12px 30px ${kpi.glow}` }}
                      style={{ ...cardStyle, padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "default" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: kpi.glow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <kpi.Icon size={20} color={kpi.color} />
                      </div>
                      <div>
                        <p style={{ fontSize: "24px", fontWeight: 700, color: S.cream, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{kpi.value}</p>
                        <p style={{ fontSize: "12px", color: S.muted, margin: 0 }}>{kpi.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
                  <div style={{ ...cardStyle, overflow: "hidden" }}>
                    <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid rgba(255,107,26,0.1)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>Live Location Status</h2>
                      <span style={{ fontSize: "11px", color: S.muted }}>{readings.length} zones monitored</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid rgba(255,107,26,0.1)` }}>
                            {["Location","Type","Count","Density","Trend"].map(h => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: h === "Location" || h === "Type" ? "left" : "right", fontSize: "11px", color: S.muted, fontWeight: 500 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {readings.map(r => {
                            const loc = locations.find(l => l.id === r.locationId);
                            const dc = getDensityColor(r.density);
                            return (
                              <tr key={r.locationId} style={{ borderBottom: `1px solid rgba(255,107,26,0.06)`, transition: "background 0.2s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,26,0.05)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                <td style={{ padding: "10px 14px", color: S.cream, fontWeight: 500 }}>{loc?.name ?? r.locationId}</td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span style={{ fontSize: "11px", background: "rgba(255,107,26,0.1)", color: S.muted, padding: "2px 8px", borderRadius: "4px" }}>{loc?.type}</span>
                                </td>
                                <td style={{ padding: "10px 14px", textAlign: "right", color: S.muted }}>{r.count.toLocaleString()}</td>
                                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                    <div style={{ width: "56px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", height: "5px" }}>
                                      <div style={{ height: "5px", borderRadius: "3px", width: `${Math.round(r.density*100)}%`, background: dc, transition: "width 0.5s" }} />
                                    </div>
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: dc, minWidth: "32px" }}>{Math.round(r.density*100)}%</span>
                                  </div>
                                </td>
                                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                                  <span style={{ fontSize: "12px", color: r.trend==="rising" ? "#f87171" : r.trend==="falling" ? "#4ade80" : S.muted }}>
                                    {r.trend==="rising" ? "↑ rising" : r.trend==="falling" ? "↓ falling" : "→ stable"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ ...cardStyle, overflow: "hidden" }}>
                    <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid rgba(255,107,26,0.1)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        <AlertTriangle size={14} color="#f87171" />Active Alerts
                      </h2>
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: alerts.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: alerts.length > 0 ? "#f87171" : "#4ade80", fontWeight: 600 }}>
                        {alerts.length} active
                      </span>
                    </div>
                    <div style={{ overflowY: "auto", maxHeight: "380px" }}>
                      {alerts.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: S.muted }}>
                          <Shield size={32} color="rgba(34,197,94,0.4)" style={{ margin: "0 auto 0.5rem", display: "block" }} />
                          All zones within safe limits
                        </div>
                      ) : alerts.map((alert, idx) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{
                            padding: "0.75rem 1rem",
                            borderBottom: `1px solid rgba(255,107,26,0.06)`,
                            borderLeft: `3px solid ${alert.severity === "critical" ? "#ef4444" : alert.severity === "high" ? S.saffron : S.gold}`,
                            background: alert.severity === "critical" ? "rgba(239,68,68,0.05)" : "transparent",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 700, color: alert.severity === "critical" ? "#f87171" : alert.severity === "high" ? S.saffron : S.gold, letterSpacing: "1px", textTransform: "uppercase" }}>{alert.severity}</span>
                            <span style={{ fontSize: "10px", color: S.muted }}>{new Date(alert.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
                          </div>
                          <p style={{ fontSize: "12px", color: "rgba(255,248,238,0.75)", lineHeight: 1.5, margin: 0 }}>{alert.message}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "1.25rem" }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: "0 0 1rem" }}>Current Crowd Density by Location</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={readings.map(r => ({name:locations.find(l=>l.id===r.locationId)?.name?.split(" ")[0]??r.locationId,density:Math.round(r.density*100)}))}>
                      <XAxis dataKey="name" tick={{fontSize:11,fill:S.muted}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize:11,fill:S.muted}} axisLine={false} tickLine={false} domain={[0,100]} />
                      <Tooltip contentStyle={{background:S.indigoMid,border:`1px solid rgba(255,107,26,0.2)`,borderRadius:8,color:S.cream,fontSize:12}} formatter={(val)=>[`${val}%`,"Density"]} />
                      <Bar dataKey="density" radius={[6,6,0,0]}>{readings.map((r,i)=><Cell key={i} fill={getDensityColor(r.density)} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* MAP */}
            {activeTab === "map" && (
              <div style={{ ...cardStyle, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1.25rem", borderBottom: `1px solid rgba(255,107,26,0.1)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>Live Crowd Heatmap — Prayagraj 2028</h2>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    {[{color:"#22c55e",label:"Safe"},{color:S.gold,label:"Moderate"},{color:S.saffron,label:"High"},{color:"#ef4444",label:"Critical"}].map(l=>(
                      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color }} />
                        <span style={{ color: S.muted }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{height:560}}><CrowdMap readings={readings} locations={locations} /></div>
              </div>
            )}

            {/* FORECAST */}
            {activeTab === "forecast" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ ...cardStyle, padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>24-Hour Crowd Forecast</h2>
                    <select
                      value={selectedLocation}
                      onChange={e=>setSelectedLocation(e.target.value)}
                      style={{ fontSize: "13px", background: S.indigo, border: `1px solid rgba(255,107,26,0.3)`, color: S.cream, borderRadius: "8px", padding: "6px 12px", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={forecast.slice(0,16)}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={S.saffron} stopOpacity={0.4}/><stop offset="95%" stopColor={S.saffron} stopOpacity={0}/></linearGradient>
                        <linearGradient id="capg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={S.muted} stopOpacity={0.15}/><stop offset="95%" stopColor={S.muted} stopOpacity={0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="hour" tick={{fontSize:11,fill:S.muted}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize:11,fill:S.muted}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{background:S.indigoMid,border:`1px solid rgba(255,107,26,0.2)`,borderRadius:8,color:S.cream,fontSize:12}} formatter={(val,name)=>[Number(val).toLocaleString(),name==="predicted"?"Predicted":"Capacity"]} />
                      <Area type="monotone" dataKey="capacity" stroke={S.muted} fill="url(#capg)" strokeDasharray="4 4" strokeWidth={1} />
                      <Area type="monotone" dataKey="predicted" stroke={S.saffron} fill="url(#cg)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.875rem" }}>
                  {forecast.filter(f=>f.percentFull < 45).slice(0,4).map(f=>(
                    <div key={f.hour} style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>Safe Window</span>
                      </div>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: S.cream, margin: "0 0 2px" }}>{f.hour}</p>
                      <p style={{ fontSize: "12px", color: S.muted, margin: 0 }}>{f.percentFull.toFixed(0)}% capacity</p>
                    </div>
                  ))}
                </div>

                <div style={{ ...cardStyle, overflow: "hidden" }}>
                  <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid rgba(255,107,26,0.1)` }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>Hourly Breakdown</h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid rgba(255,107,26,0.1)` }}>
                          {["Hour","Predicted","% Capacity","Status"].map(h=>(
                            <th key={h} style={{ padding: "10px 14px", textAlign: h==="Hour"?"left":"right", fontSize: "11px", color: S.muted, fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.map(f=>{
                          const dc = getDensityColor(f.percentFull/100);
                          const label = f.percentFull>=85?"Critical":f.percentFull>=65?"High":f.percentFull>=45?"Moderate":"Safe";
                          return (
                            <tr key={f.hour} style={{ borderBottom: `1px solid rgba(255,107,26,0.05)` }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,26,0.04)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <td style={{ padding: "10px 14px", color: S.cream, fontWeight: 500 }}>{f.hour}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", color: S.muted }}>{f.predicted.toLocaleString()}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                  <div style={{ width: "64px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", height: "5px" }}>
                                    <div style={{ height: "5px", borderRadius: "3px", width: `${Math.min(f.percentFull,100)}%`, background: dc }} />
                                  </div>
                                  <span style={{ fontSize: "12px", color: dc, minWidth: "30px" }}>{f.percentFull.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                                <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", background: `${dc}20`, color: dc, fontWeight: 600 }}>{label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ROUTES */}
            {activeTab === "routes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "rgba(255,107,26,0.08)", border: "1px solid rgba(255,107,26,0.2)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <Navigation size={18} color={S.saffron} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: S.saffronLight, margin: "0 0 2px" }}>Dynamic Route Intelligence</p>
                    <p style={{ fontSize: "12px", color: S.muted, margin: 0 }}>Routes recalculate every 15 seconds based on live crowd density. Real-time congestion avoidance.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
                  {routes.map((route, idx) => {
                    const sb = getStatusBadge(route.status);
                    return (
                      <motion.div
                        key={route.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ y: -4 }}
                        style={{ ...cardStyle, overflow: "hidden", cursor: "default" }}
                      >
                        <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid rgba(255,107,26,0.1)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>{route.name}</h3>
                          <span style={{ fontSize: "11px", padding: "3px 12px", borderRadius: "12px", background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {route.status}
                          </span>
                        </div>
                        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                            <span style={{ color: S.muted }}>From:</span>
                            <span style={{ color: S.cream }}>{route.from}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: S.saffron, flexShrink: 0 }} />
                            <span style={{ color: S.muted }}>To:</span>
                            <span style={{ color: S.cream }}>{route.to}</span>
                          </div>
                          <div style={{ display: "flex", gap: "1rem", fontSize: "12px", color: S.muted }}>
                            <span>📏 {route.distance}</span>
                            <span>⏱ {route.estimatedTime}</span>
                            <span>👥 <span style={{ color: route.crowdLevel==="low" ? "#4ade80" : route.crowdLevel==="medium" ? S.gold : "#f87171" }}>{route.crowdLevel}</span></span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "0.75rem", fontSize: "12px", color: "rgba(255,248,238,0.7)", lineHeight: 1.6 }}>
                            {route.reason}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI COMMAND */}
            {activeTab === "ai" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ ...cardStyle, overflow: "hidden" }}>
                  <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid rgba(255,107,26,0.1)`, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Brain size={18} color="#c084fc" />
                    <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>AI Command Center</h2>
                    <span style={{ fontSize: "11px", background: "rgba(192,132,252,0.15)", color: "#c084fc", padding: "2px 10px", borderRadius: "10px", border: "1px solid rgba(192,132,252,0.3)" }}>Powered by Google Gemini</span>
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    <p style={{ fontSize: "13px", color: S.muted, marginBottom: "1.25rem", lineHeight: 1.7 }}>
                      Gemini AI analyzes live crowd density, active alerts, and temporal patterns to generate real-time advisories for field commanders and pilgrims at MahaKumbh 2028.
                    </p>
                    <motion.button
                      onClick={fetchAdvisory}
                      disabled={advisoryLoading}
                      whileHover={{ scale: advisoryLoading ? 1 : 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: advisoryLoading ? "rgba(192,132,252,0.3)" : "linear-gradient(135deg, #9333ea, #7c3aed)",
                        border: "none", borderRadius: "10px",
                        padding: "10px 20px",
                        fontSize: "13px", fontWeight: 600, color: "#fff",
                        cursor: advisoryLoading ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Brain size={15} style={{ animation: advisoryLoading ? "pulse 1s infinite" : "none" }} />
                      {advisoryLoading ? "Analyzing situation..." : "Generate AI Advisory"}
                    </motion.button>

                    {advisory && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: "1.25rem", background: "rgba(147,51,234,0.08)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "12px", padding: "1.25rem" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c084fc" }}
                          />
                          <span style={{ fontSize: "11px", color: "#c084fc", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Live Advisory</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,248,238,0.85)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{advisory}</div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                  {[
                    {label:"AI Model",value:"Gemini 2.5 Flash"},
                    {label:"Refresh Rate",value:"15 sec"},
                    {label:"Zones Monitored",value:`${readings.length}`},
                    {label:"Active Routes",value:`${routes.length}`},
                  ].map(stat=>(
                    <div key={stat.label} style={{ ...cardStyle, padding: "1rem" }}>
                      <p style={{ fontSize: "11px", color: S.muted, margin: "0 0 4px" }}>{stat.label}</p>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: S.cream, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer style={{ borderTop: `1px solid rgba(255,107,26,0.1)`, marginTop: "2rem", padding: "1.25rem", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "rgba(168,155,181,0.5)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        MahaDrishti · Real-Time Crowd Intelligence
        </p>
      </footer>
    </div>
  );
}

function PilgrimView({routes, alerts, onBack}: {routes: RouteOption[]; alerts: Alert[]; onBack: ()=>void}) {
  const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "high");
  const safeRoutes = routes.filter(r => r.status === "recommended");
  return (
    <div style={{ minHeight: "100vh", background: S.indigo, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #FF6B1A, #CC4E00)", padding: "1.25rem 1rem" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "'Yatra One', serif", fontSize: "22px", color: "#fff", margin: 0 }}>🙏 MahaDrishti Guide</h1>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>Safe darshan for every pilgrim · Kumbh 2028</p>
          </div>
          <button
            onClick={onBack}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "6px 14px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Authority View
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {criticalAlerts.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
              <AlertTriangle size={16} color="#f87171" />
              <h2 style={{ fontWeight: 600, color: "#f87171", fontSize: "14px", margin: 0 }}>Active Warnings</h2>
            </div>
            {criticalAlerts.slice(0,3).map(a=>(
              <p key={a.id} style={{ fontSize: "13px", color: "#fca5a5", margin: "0 0 6px", lineHeight: 1.5 }}>
                ⚠ {a.locationName}: {a.severity==="critical" ? "Very crowded — avoid if possible" : "High crowd — proceed with caution"}
              </p>
            ))}
          </div>
        )}

        <div style={{ background: S.indigoMid, border: "1px solid rgba(255,107,26,0.15)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid rgba(255,107,26,0.1)", background: "rgba(34,197,94,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#4ade80", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <Navigation size={14} />Recommended Safe Routes
            </h2>
          </div>
          {safeRoutes.map(route=>(
            <div key={route.id} style={{ padding: "1rem", borderBottom: "1px solid rgba(255,107,26,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: S.cream, margin: 0 }}>{route.name}</h3>
                <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "2px 8px", borderRadius: "8px", fontWeight: 600 }}>Safe</span>
              </div>
              <div style={{ fontSize: "12px", color: S.muted, lineHeight: 1.8 }}>
                <p style={{ margin: "0 0 2px" }}>📍 {route.from} → {route.to}</p>
                <p style={{ margin: "0 0 2px" }}>📏 {route.distance} · ⏱ {route.estimatedTime}</p>
                <p style={{ margin: 0, color: "rgba(255,248,238,0.6)" }}>{route.reason}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "12px", padding: "1rem" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#60a5fa", margin: "0 0 0.75rem" }}>Safety Tips</h2>
          {[
            "Follow authority directions and marked routes at all times",
            "Keep your ID and mobile charged",
            "Meet at fixed points if separated from group",
            "Medical help available at Central Medical Hub",
            "Off-peak bathing: early morning 3–5 AM or after 8 PM",
          ].map(tip=>(
            <div key={tip} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#93c5fd", marginBottom: "6px", lineHeight: 1.5 }}>
              <ChevronRight size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}