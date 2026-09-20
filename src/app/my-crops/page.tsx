"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CROPS, CATEGORIES, SEASONS, formatPrice, getLivePrice, getCropName, getCropDesc } from "@/lib/cropData";
import { getCurrentUser, updatePortfolio } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import PortfolioPerformanceGraph from "@/components/PortfolioPerformanceGraph";
import { getPriceAlerts, deletePriceAlert, togglePriceAlert, PriceAlert, dispatchPriceNotification } from "@/lib/priceAlerts";
import PriceAlertModal from "@/components/PriceAlertModal";

export default function MyCropsPage() {
  const router = useRouter();
  const { language, addNotification } = useApp();
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [season, setSeason] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [addSearch, setAddSearch] = useState("");
  const [toAdd, setToAdd] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    setAlerts(getPriceAlerts());
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setPortfolio(user.portfolio || []);
    const p: Record<string, number> = {};
    CROPS.forEach(c => { p[c.id] = getLivePrice(c); });
    setPrices(p);
    const interval = setInterval(() => {
      const np: Record<string, number> = {};
      CROPS.forEach(c => { np[c.id] = getLivePrice(c); });
      setPrices(np);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const savePortfolio = (newPortfolio: string[]) => {
    setPortfolio(newPortfolio);
    const user = getCurrentUser();
    if (user) updatePortfolio(user.email, newPortfolio);
  };

  const remove = (id: string) => savePortfolio(portfolio.filter(p => p !== id));

  const addSelected = () => {
    const updated = [...new Set([...portfolio, ...toAdd])];
    savePortfolio(updated);
    setToAdd([]);
    setShowAddModal(false);
  };

  const myCrops = CROPS.filter(c => portfolio.includes(c.id));
  const filtered = myCrops.filter(c => {
    const name = (language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name).toLowerCase();
    return name.includes(search.toLowerCase()) &&
      (category === "All" || c.category === category) &&
      (season === "All" || c.season.includes(season));
  });

  const addableFiltered = CROPS.filter(c =>
    !portfolio.includes(c.id) &&
    (c.name.toLowerCase().includes(addSearch.toLowerCase()) || c.nameTA.includes(addSearch) || c.nameTE.includes(addSearch))
  );

  const getName = (c: typeof CROPS[0]) => getCropName(c, language);
  const getDesc = (c: typeof CROPS[0]) => getCropDesc(c, language);

  const L = {
    title: language === "ta" ? "என் பயிர்கள்" : language === "te" ? "నా పంటలు" : "My Crops",
    sub: language === "ta" ? "உங்கள் கண்காணிக்கப்படும் பயிர்கள்" : language === "te" ? "మీ ట్రాక్ చేయబడిన పంటలు" : "Manage your tracked crops portfolio",
    addCrop: language === "ta" ? "+ பயிர் சேர்க்க" : language === "te" ? "+ పంటను జోడించు" : "+ Add Crop",
    remove: language === "ta" ? "நீக்கு" : language === "te" ? "తొలగించు" : "Remove",
    search: language === "ta" ? "பயிர் தேடு..." : language === "te" ? "పంట కోసం వెతకండి..." : "Search crops...",
    viewForecast: language === "ta" ? "கணிப்பு பார்க்க" : language === "te" ? "అంచనా చూడండి" : "View Forecast",
    empty: language === "ta" ? "பயிர்கள் இல்லை! + பயிர் சேர்க்க கிளிக் செய்யுங்கள்" : language === "te" ? "పంటలు లేవు! పంటను జోడించడానికి + బటన్‌ను నొక్కండి" : "No crops yet! Click + Add Crop to get started",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{L.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{L.sub}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            📄 Export PDF Report
          </button>
          <button id="btn-add-crop" className="btn btn-primary" onClick={() => setShowAddModal(true)}>{L.addCrop}</button>
        </div>
      </div>

      <div className="page-content">
        {/* Portfolio Performance Graph */}
        <PortfolioPerformanceGraph portfolioIds={portfolio} />
        {/* Search & Filters */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
              <span className="input-group-icon">🔍</span>
              <input id="search-crops" className="input" placeholder={L.search} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} id={`filter-cat-${cat.toLowerCase()}`}
                  className={`filter-chip ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
            <select id="select-season" className="input" style={{ width: 140 }} value={season} onChange={e => setSeason(e.target.value)}>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Crop count */}
        <div style={{ marginBottom: 14, fontSize: 13, color: "var(--text-muted)" }}>
          Showing {filtered.length} of {myCrops.length} crops
        </div>

        {/* Crop grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{L.empty}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map(crop => {
              const livePrice = prices[crop.id] || crop.basePrice;
              const changePercent = ((livePrice - crop.basePrice) / crop.basePrice) * 100;
              const isUp = changePercent >= 0;
              return (
                <div key={crop.id} className="crop-card">
                  {/* Image */}
                  <div style={{ position: "relative", height: 170, background: `${crop.color}20`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src={crop.image} alt={crop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { const t = e.target as HTMLImageElement; t.style.display = "none"; if (t.parentElement) { t.parentElement.style.fontSize = "64px"; t.parentElement.textContent = crop.emoji; } }} />
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: crop.category === "Vegetables" ? "#e05252" : "var(--primary)" }}>
                      {crop.category}
                    </div>
                    {crop.season && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.5)", borderRadius: 99, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#fff" }}>
                        {crop.season}
                      </div>
                    )}
                  </div>

                  <div className="crop-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{getName(crop)}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{getDesc(crop).slice(0, 55)}...</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary-dark)" }}>{formatPrice(livePrice)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/{crop.unit}{crop.unit === "quintal" ? ` (${formatPrice(livePrice / 100)}/kg)` : ""}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isUp ? "#15803D" : "#B91C1C" }}>
                          {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {crop.msp > 0 && (
                      <div style={{ marginTop: 10, padding: "6px 10px", background: livePrice >= crop.msp ? "#F0FDF4" : "#FFF1F2", borderRadius: 8, fontSize: 12, fontWeight: 600, color: livePrice >= crop.msp ? "#15803D" : "#B91C1C" }}>
                        MSP: {formatPrice(crop.msp)} {livePrice >= crop.msp ? "✓ Above MSP" : "⚠️ Below MSP"}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button id={`btn-forecast-${crop.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => router.push(`/crop/${crop.id}`)}>
                        {L.viewForecast} ↗
                      </button>
                      <button id={`btn-remove-${crop.id}`} className="btn btn-danger btn-sm" onClick={() => remove(crop.id)}>
                        {L.remove}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Smart Mandi Price Threshold Alerts ── */}
      <div style={{ marginTop: 36, marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
                Smart Mandi Price Threshold Alerts
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.15)",
                color: "#047857",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "2px 8px",
                borderRadius: 12
              }}>
                Web Push Enabled
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Set custom price triggers (e.g. "Nellore Paddy &gt; ₹2,400/qtl"). Receive instant alerts on your lockscreen when rates fluctuate.
            </p>
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10, padding: "8px 16px", fontWeight: 700 }}
          >
            <span>+</span>
            <span>Set New Target Alert</span>
          </button>
        </div>

        {/* Alerts Grid */}
        {alerts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>No Target Price Alerts Set Yet</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 450, margin: "6px auto 16px auto" }}>
              Stay ahead of market fluctuations! Set threshold triggers to get notified the second mandi prices reach your selling goals.
            </p>
            <button onClick={() => setShowAlertModal(true)} className="btn btn-primary btn-sm">
              + Set Your First Price Alert
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {alerts.map(alert => {
              const crop = CROPS.find(c => c.id === alert.cropId);
              const currentLivePrice = prices[alert.cropId] || alert.lastCheckedPrice || crop?.basePrice || 0;
              const isMet = alert.condition === "above" ? currentLivePrice >= alert.targetPrice : currentLivePrice <= alert.targetPrice;

              return (
                <div
                  key={alert.id}
                  className="card"
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    border: alert.active
                      ? isMet
                        ? "1.5px solid #10B981"
                        : "1px solid var(--border)"
                      : "1px dashed var(--border)",
                    opacity: alert.active ? 1 : 0.65,
                    background: isMet && alert.active ? "rgba(16, 185, 129, 0.04)" : "var(--bg-card)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    {/* Top Row: Crop info + Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{crop?.emoji || "🌾"}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{alert.cropName}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>📍 {alert.mandiName}</div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: !alert.active ? "var(--bg)" : isMet ? "#DCFCE7" : "rgba(245, 158, 11, 0.15)",
                        color: !alert.active ? "var(--text-muted)" : isMet ? "#15803D" : "#B45309",
                        border: "1px solid var(--border)"
                      }}>
                        {!alert.active ? "Inactive" : isMet ? "🎯 Target Reached!" : "🟢 Active Tracking"}
                      </span>
                    </div>

                    {/* Condition Box */}
                    <div style={{
                      background: "var(--bg)",
                      borderLeft: `4px solid ${alert.condition === "above" ? "#15803D" : "#B91C1C"}`,
                      padding: "8px 12px",
                      borderRadius: "0 10px 10px 0",
                      marginBottom: 12
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                        Trigger Condition
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                        {alert.condition === "above" ? "📈 Rises Above (≥)" : "📉 Falls Below (≤)"} {formatPrice(alert.targetPrice)} {alert.unit}
                      </div>
                    </div>

                    {/* Live Comparison */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 14 }}>
                      <span style={{ color: "var(--text-muted)" }}>Current Live Market Rate:</span>
                      <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: 14 }}>
                        {formatPrice(currentLivePrice)} {alert.unit}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          togglePriceAlert(alert.id);
                          setAlerts(getPriceAlerts());
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        {alert.active ? "⏸️ Pause" : "▶️ Resume"}
                      </button>

                      <button
                        onClick={() => {
                          const testTitle = `🚨 Mandi Target Hit: ${alert.cropName}!`;
                          const testBody = `${alert.mandiName} reached ${formatPrice(currentLivePrice)}/qtl (Target was ${alert.condition === "above" ? ">" : "<"} ${formatPrice(alert.targetPrice)})`;
                          addNotification({ title: testTitle, message: testBody, type: "price" });
                          dispatchPriceNotification(testTitle, testBody);
                        }}
                        title="Simulate push notification test"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        📲 Test Push
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        deletePriceAlert(alert.id);
                        setAlerts(getPriceAlerts());
                      }}
                      title="Delete alert"
                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 15, padding: "4px" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PriceAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onAlertCreated={() => setAlerts(getPriceAlerts())}
      />

      {/* Add Crop Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "Playfair Display,serif", fontSize: 18, fontWeight: 700 }}>Add Crops to Portfolio</div>
              <button onClick={() => { setShowAddModal(false); setToAdd([]); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <input className="input" placeholder="Search crops..." value={addSearch} onChange={e => setAddSearch(e.target.value)} style={{ marginBottom: 14 }} />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {addableFiltered.map(crop => (
                <div key={crop.id}
                  id={`add-${crop.id}`}
                  onClick={() => setToAdd(prev => prev.includes(crop.id) ? prev.filter(x => x !== crop.id) : [...prev, crop.id])}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, cursor: "pointer", background: toAdd.includes(crop.id) ? "var(--accent)" : "transparent", border: `1.5px solid ${toAdd.includes(crop.id) ? "var(--primary)" : "transparent"}`, marginBottom: 6, transition: "all 0.15s" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: `${crop.color}30`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    <img src={crop.image} alt={crop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    {crop.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{getName(crop)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{crop.category} · {crop.season}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(crop.basePrice)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/{crop.unit}{crop.unit === "quintal" ? ` (${formatPrice(crop.basePrice / 100)}/kg)` : ""}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${toAdd.includes(crop.id) ? "var(--primary)" : "var(--border)"}`, background: toAdd.includes(crop.id) ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, flexShrink: 0 }}>
                    {toAdd.includes(crop.id) ? "✓" : ""}
                  </div>
                </div>
              ))}
              {addableFiltered.length === 0 && <div className="empty-state"><div className="empty-state-icon">🔍</div><div>No crops found</div></div>}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
              <button id="btn-confirm-add" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
                disabled={toAdd.length === 0} onClick={addSelected}>
                Add {toAdd.length > 0 ? `${toAdd.length} Crop${toAdd.length > 1 ? "s" : ""}` : "Crops"} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
