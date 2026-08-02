"use client";

import { useState } from "react";
import { getCropVolatilityList, formatPrice, CropVolatilityInfo } from "@/lib/cropData";

export default function VolatilityAlerts() {
  const [filterRisk, setFilterRisk] = useState<string>("All");
  const volatilityList = getCropVolatilityList();

  const highCount = volatilityList.filter(c => c.riskLevel === "High").length;
  const modCount = volatilityList.filter(c => c.riskLevel === "Moderate").length;
  const lowCount = volatilityList.filter(c => c.riskLevel === "Low").length;

  const filteredList = volatilityList.filter(c =>
    filterRisk === "All" || c.riskLevel === filterRisk
  );

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              Price Volatility & Risk Alerts Engine
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Identifies crops experiencing rapid price fluctuations and provides mitigation strategies
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "All", label: `All (${volatilityList.length})` },
            { id: "High", label: `⚠️ High Risk (${highCount})` },
            { id: "Moderate", label: `⚖️ Moderate (${modCount})` },
            { id: "Low", label: `🛡️ Stable (${lowCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRisk(tab.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                fontSize: 12.5,
                border: "1.5px solid var(--border)",
                background: filterRisk === tab.id ? "var(--primary)" : "var(--bg-card)",
                color: filterRisk === tab.id ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volatility Overview Cards */}
      <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 22 }}>
        <div className="stat-card" style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", textTransform: "uppercase" }}>High Risk Crops</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "#B91C1C" }}>{highCount}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Rapid price swings</div>
        </div>

        <div className="stat-card" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase" }}>Moderate Volatility</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "#92400E" }}>{modCount}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Normal weekly shift</div>
        </div>

        <div className="stat-card" style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase" }}>Stable Commodities</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "#15803D" }}>{lowCount}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Low price risk</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>Avg Index</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: "var(--primary-dark)" }}>
            {Math.round(volatilityList.reduce((acc, c) => acc + c.volatilityScore, 0) / volatilityList.length)}%
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Market risk index</div>
        </div>
      </div>

      {/* Volatility Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Category</th>
              <th>Live Price</th>
              <th>Weekly Change</th>
              <th>Volatility Meter</th>
              <th>Risk Level</th>
              <th>Actionable Advisory</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(crop => (
              <tr key={crop.cropId}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{crop.cropEmoji}</span>
                    <strong style={{ fontSize: 14, color: "var(--text)" }}>{crop.cropName}</strong>
                  </div>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{crop.category}</td>
                <td>
                  <strong style={{ fontSize: 14 }}>{formatPrice(crop.currentPrice)}</strong>
                </td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: crop.weeklyChangePercent > 0 ? "#15803D" : crop.weeklyChangePercent < 0 ? "#B91C1C" : "var(--text-muted)"
                  }}>
                    {crop.weeklyChangePercent > 0 ? `▲ +${crop.weeklyChangePercent}%` : `▼ ${crop.weeklyChangePercent}%`}
                  </span>
                </td>
                <td style={{ width: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${crop.volatilityScore}%`,
                          background: crop.riskLevel === "High" ? "#B91C1C" : crop.riskLevel === "Moderate" ? "#F59E0B" : "#15803D"
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{crop.volatilityScore}%</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${crop.riskLevel === "High" ? "badge-red" : crop.riskLevel === "Moderate" ? "badge-yellow" : "badge-green"}`}>
                    {crop.riskLevel === "High" ? "⚠️ High Risk" : crop.riskLevel === "Moderate" ? "⚖️ Moderate" : "🛡️ Stable"}
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-muted)", maxWidth: 280 }}>
                  {crop.recommendedAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
