"use client";

import { useState } from "react";
import { CROPS, getCropVolatilityList, formatPrice } from "@/lib/cropData";

export default function MarketHeatmap() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const volatilityList = getCropVolatilityList();

  const categories = ["All", ...Array.from(new Set(CROPS.map(c => c.category)))];

  const filteredCrops = volatilityList.filter(c =>
    activeCategory === "All" || c.category === activeCategory
  );

  const getHeatmapColor = (change: number) => {
    if (change >= 5) return { bg: "linear-gradient(135deg, #15803D, #166534)", text: "#fff", badge: "Peak Gainer 🚀" };
    if (change > 0) return { bg: "linear-gradient(135deg, #4CAF50, #2E7D32)", text: "#fff", badge: "Gaining 📈" };
    if (change === 0) return { bg: "var(--accent)", text: "var(--text)", badge: "Stable ⚖️" };
    if (change > -5) return { bg: "linear-gradient(135deg, #F87171, #DC2626)", text: "#fff", badge: "Dropping 📉" };
    return { bg: "linear-gradient(135deg, #B91C1C, #991B1B)", text: "#fff", badge: "Sharp Drop ⚠️" };
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🗺️</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              Market Price Trend Heatmap
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Color-coded weekly price movement matrix across national wholesale markets
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                fontSize: 12.5,
                border: "1.5px solid var(--border)",
                background: activeCategory === cat ? "var(--primary)" : "var(--bg-card)",
                color: activeCategory === cat ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
        background: "var(--accent)",
        padding: "10px 16px",
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 12,
        fontWeight: 600
      }}>
        <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>Heat Legend:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#15803D" }} />
          <span>+5%+ High Gain</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#4CAF50" }} />
          <span>+1% to +5% Gain</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--border)" }} />
          <span>Stable</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#B91C1C" }} />
          <span>-5%+ Sharp Drop</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {filteredCrops.map(item => {
          const style = getHeatmapColor(item.weeklyChangePercent);
          return (
            <div
              key={item.cropId}
              style={{
                background: style.bg,
                color: style.text,
                borderRadius: 16,
                padding: 16,
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 125,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>{item.cropEmoji}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.25)",
                    backdropFilter: "blur(4px)"
                  }}>
                    {style.badge}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>
                  {item.cropName}
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.85 }}>
                  {item.category}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 900 }}>
                  {formatPrice(item.currentPrice)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>
                  {item.weeklyChangePercent > 0 ? `+${item.weeklyChangePercent}%` : `${item.weeklyChangePercent}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
