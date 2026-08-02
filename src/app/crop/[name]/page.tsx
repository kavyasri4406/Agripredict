"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CROPS, generatePriceHistory, generateForecast, getRecommendation, formatPrice, getCropById, generatePriceHistoryByTimeframe, getMspStatus } from "@/lib/cropData";
import MandiComparison from "@/components/MandiComparison";
import { useApp } from "@/lib/AppContext";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useApp();
  const cropId = params.name as string;
  const crop = getCropById(cropId) || CROPS[0];

  const [history, setHistory] = useState<ReturnType<typeof generatePriceHistory>>([]);
  const [forecast, setForecast] = useState<ReturnType<typeof generateForecast>>([]);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getRecommendation> | null>(null);
  const [imgError, setImgError] = useState(false);
  const [tab, setTab] = useState<"chart" | "table">("chart");
  const [timeframe, setTimeframe] = useState<"1M" | "3M" | "1Y">("1M");

  useEffect(() => {
    const hist = generatePriceHistoryByTimeframe(crop, timeframe);
    const fc = generateForecast(crop, hist[hist.length - 1].price);
    const rec = getRecommendation(crop, hist, fc);
    setHistory(hist);
    setForecast(fc);
    setRecommendation(rec);
  }, [crop, timeframe]);

  const getName = () => language === "ta" ? crop.nameTA : language === "te" ? crop.nameTE : crop.name;
  const getDesc = () => language === "ta" ? crop.descTA : language === "te" ? crop.descTE : crop.description;
  const getReason = () => !recommendation ? "" : language === "ta" ? recommendation.reasonTA : language === "te" ? recommendation.reasonTE : recommendation.reason;

  const currentPrice = history.length > 0 ? history[history.length - 1].price : crop.basePrice;

  // Combine last 14 days history + 30 day forecast for the chart
  const chartData = [
    ...history.slice(-14).map(h => ({ date: h.date, actual: h.price, predicted: undefined, lower: undefined, upper: undefined })),
    ...forecast.map(f => ({ date: f.date, actual: undefined, predicted: f.predicted, lower: f.lower, upper: f.upper })),
  ];

  const actionColor = { BUY: "#15803D", SELL: "#B91C1C", HOLD: "#92400E" };
  const actionBg = { BUY: "#DCFCE7", SELL: "#FEE2E2", HOLD: "#FEF9C3" };
  const action = recommendation?.action || "HOLD";

  const L = {
    back: language === "ta" ? "← திரும்பு" : language === "te" ? "← వెనక్కి" : "← Back",
    forecast: language === "ta" ? "30 நாள் கணிப்பு" : language === "te" ? "30 రోజుల అంచనా" : "30-Day Price Forecast",
    currentPrice: language === "ta" ? "தற்போதைய விலை" : language === "te" ? "ప్రస్తుత ధర" : "Current Price",
    msp: language === "ta" ? "MSP விலை" : language === "te" ? "MSP ధర" : "MSP Price",
    aiRec: language === "ta" ? "AI பரிந்துரை" : language === "te" ? "AI సిఫారసు" : "AI Recommendation",
    confidence: language === "ta" ? "நம்பகத்தன்மை" : language === "te" ? "నమ్మకం" : "Confidence",
    factors: language === "ta" ? "பாதிக்கும் காரணிகள்" : language === "te" ? "ప్రభావితం చేసే అంశాలు" : "Influencing Factors",
    history: language === "ta" ? "விலை வரலாறு" : language === "te" ? "ధర చరిత్ర" : "Price History",
    report: language === "ta" ? "அறிக்கை உருவாக்கு" : language === "te" ? "నివేదిక రూపొందించు" : "Generate Report",
    chart: language === "ta" ? "வரைபடம்" : language === "te" ? "చార్ట్" : "Chart",
    table: language === "ta" ? "அட்டவணை" : language === "te" ? "పట్టిక" : "Table",
  };

  const FACTORS = [
    { icon: "🌦️", title: language === "ta" ? "வானிலை" : language === "te" ? "వాతావరణం" : "Weather", desc: language === "ta" ? "முக்கிய பகுதிகளில் வானிலை நிலைமைகள் கண்காணிக்கப்படுகின்றன" : language === "te" ? "ముఖ్య ప్రాంతాల్లో వాతావరణ పరిస్థితులు పర్యవేక్షించబడుతున్నాయి" : "Weather conditions being monitored across key growing regions", status: "Moderate" },
    { icon: "📦", title: language === "ta" ? "தேவை & வழங்கல்" : language === "te" ? "డిమాండ్ & సరఫరా" : "Demand & Supply", desc: language === "ta" ? "பண்டிகை காலத்தின் தேவை மற்றும் ஏற்றுமதி கொள்கைகள் முக்கிய காரணிகள்" : language === "te" ? "పండుగ కాల డిమాండ్ మరియు ఎగుమతి విధానాలు ముఖ్య అంశాలు" : "Festive season demand and export policies are key factors", status: "High" },
    { icon: "🚛", title: language === "ta" ? "தளவாடங்கள்" : language === "te" ? "లాజిస్టిక్స్" : "Logistics", desc: language === "ta" ? "எரிபொருள் விலைகள் மற்றும் போக்குவரத்து கிடைக்கும் தன்மை செலவுகளை பாதிக்கிறது" : language === "te" ? "ఇంధన ధరలు మరియు రవాణా అందుబాటు ఖర్చులను ప్రభావితం చేస్తున్నాయి" : "Fuel prices and transport availability are impacting logistics costs", status: "Low" },
    { icon: "🏛️", title: language === "ta" ? "அரசு கொள்கை" : language === "te" ? "ప్రభుత్వ విధానం" : "Govt Policy", desc: language === "ta" ? "MSP, FCI கொள்முதல் மற்றும் ஏற்றுமதி தடைகள் விலையை பாதிக்கின்றன" : language === "te" ? "MSP, FCI సేకరణ మరియు ఎగుమతి నిషేధాలు ధరను ప్రభావితం చేస్తాయి" : "MSP notifications, FCI procurement and export restrictions affect price", status: "Medium" },
  ];

  const statusColor: Record<string, string> = { High: "#B91C1C", Medium: "#92400E", Low: "#15803D", Moderate: "#1D4ED8" };
  const statusBg: Record<string, string> = { High: "#FEE2E2", Medium: "#FEF9C3", Low: "#DCFCE7", Moderate: "#DBEAFE" };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>{L.back}</button>
          {!imgError ? (
            <img src={crop.image} alt={crop.name} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }}
              onError={() => setImgError(true)} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${crop.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{crop.emoji}</div>
          )}
          <div>
            <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{getName()}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{crop.category} · {crop.season} Season · {crop.states.slice(0, 3).join(", ")}</div>
          </div>
        </div>
        <button id="btn-generate-report" className="btn btn-amber" onClick={() => window.print()}>🖨️ {L.report}</button>
      </div>

      <div className="page-content">
        {/* Price + action row */}
        <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 18 }}>
          <div className="stat-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.currentPrice}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--primary-dark)" }}>{formatPrice(currentPrice)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>per {crop.unit}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.msp}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: crop.msp > 0 ? "var(--secondary)" : "var(--text-muted)" }}>{crop.msp > 0 ? formatPrice(crop.msp) : "—"}</div>
            <div style={{ fontSize: 12, color: currentPrice >= crop.msp && crop.msp > 0 ? "#15803D" : crop.msp === 0 ? "var(--text-muted)" : "#B91C1C" }}>
              {crop.msp > 0 ? (currentPrice >= crop.msp ? "✓ Above MSP" : "⚠️ Below MSP") : "No MSP set"}
            </div>
          </div>
          <div className="stat-card" style={{ background: recommendation ? actionBg[action] : undefined }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.aiRec}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 6, color: recommendation ? actionColor[action] : "var(--text)" }}>{action}</div>
            <div style={{ fontSize: 12, color: recommendation ? actionColor[action] : "var(--text-muted)" }}>
              {action === "BUY" ? "Good time to buy" : action === "SELL" ? "Consider selling" : "Hold & watch"}
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{L.confidence}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--primary)" }}>{recommendation?.confidence || 75}%</div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${recommendation?.confidence || 75}%` }} />
            </div>
          </div>
        </div>

        {/* Chart + Factors */}
        <div className="split-layout-2col" style={{ gap: 16, marginBottom: 18 }}>
          {/* Chart card */}
          {/* Mandi Price Comparison Widget */}
        <div style={{ marginBottom: 20 }}>
          <MandiComparison initialCropId={crop.id} compact={true} />
        </div>

        <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>📈 {L.forecast}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Historical ({timeframe}) + Predicted (30d) with confidence band</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {/* Timeframe selector */}
                <div style={{ display: "flex", gap: 4, background: "var(--accent)", padding: 3, borderRadius: 8 }}>
                  {(["1M", "3M", "1Y"] as const).map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: timeframe === tf ? "var(--primary)" : "transparent",
                        color: timeframe === tf ? "#fff" : "var(--text-muted)",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}>
                      {tf}
                    </button>
                  ))}
                </div>

                {(["chart", "table"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: "5px 14px", borderRadius: 8, border: `1.5px solid ${tab === t ? "var(--primary)" : "var(--border)"}`, background: tab === t ? "var(--primary)" : "transparent", color: tab === t ? "#fff" : "var(--text-muted)", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
                    {t === "chart" ? L.chart : L.table}
                  </button>
                ))}
              </div>
            </div>

            {tab === "chart" ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4964B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C4964B" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickFormatter={v => v ? `₹${(v / 1000).toFixed(1)}K` : ""} width={70} />
                  <Tooltip formatter={(v: unknown, n: unknown) => [Number(v) ? formatPrice(Number(v)) : "—", String(n)]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 }} />
                  <Legend />
                  <Area type="monotone" dataKey="upper" fill="url(#bandGrad)" stroke="transparent" name="Upper Band" legendType="none" />
                  <Area type="monotone" dataKey="lower" fill="var(--bg)" stroke="transparent" name="Lower Band" legendType="none" />
                  <Line type="monotone" dataKey="actual" stroke="#5C7A3E" strokeWidth={2.5} dot={false} name="Actual Price" connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#C4964B" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Predicted Price" connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="table-wrap" style={{ maxHeight: 280, overflowY: "auto" }}>
                <table>
                  <thead><tr><th>Date</th><th>Price</th><th>Confidence Band</th><th>Type</th></tr></thead>
                  <tbody>
                    {chartData.slice(-20).map((row, i) => (
                      <tr key={i}>
                        <td>{row.date}</td>
                        <td style={{ fontWeight: 700 }}>{row.actual ? formatPrice(row.actual) : row.predicted ? formatPrice(row.predicted) : "—"}</td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {row.lower && row.upper ? `${formatPrice(row.lower)} – ${formatPrice(row.upper)}` : "—"}
                        </td>
                        <td>
                          <span className={`badge ${row.actual ? "badge-green" : "badge-amber"}`}>{row.actual ? "Actual" : "Forecast"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Factors sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>⚖️ {L.factors}</div>
            {FACTORS.map((f, i) => (
              <div key={i} className="card-sm" style={{ transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{f.title}</span>
                  </div>
                  <span style={{ background: statusBg[f.status], color: statusColor[f.status], fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{f.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}

            {recommendation && (
              <div className="card-sm" style={{ background: actionBg[action], border: `1px solid ${actionColor[action]}30` }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: actionColor[action], marginBottom: 6 }}>🤖 {L.aiRec}</div>
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{getReason()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Price history table */}
        {/* Mandi Price Comparison Widget */}
        <div style={{ marginBottom: 20 }}>
          <MandiComparison initialCropId={crop.id} compact={true} />
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🗃️ {L.history} — Last 30 Days</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Price</th><th>Volume</th><th>Weather</th><th>Change</th></tr>
              </thead>
              <tbody>
                {history.slice(-20).reverse().map((row, i, arr) => {
                  const prev = arr[i + 1];
                  const change = prev ? ((row.price - prev.price) / prev.price) * 100 : 0;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{row.date}</td>
                      <td style={{ fontWeight: 700, color: "var(--primary-dark)" }}>{formatPrice(row.price)}</td>
                      <td>{row.volume.toLocaleString("en-IN")}</td>
                      <td>{row.weather.includes("Rain") ? "🌧️" : row.weather.includes("Cloud") ? "⛅" : row.weather.includes("Fog") ? "🌫️" : "☀️"} {row.weather}</td>
                      <td style={{ fontWeight: 700, color: change >= 0 ? "#15803D" : "#B91C1C", fontSize: 13 }}>
                        {change !== 0 ? `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
