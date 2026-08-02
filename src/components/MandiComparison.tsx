"use client";

import { useState } from "react";
import { CROPS, Crop, getMandiComparison, formatPrice, MandiInfo } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";

interface MandiComparisonProps {
  initialCropId?: string;
  compact?: boolean;
}

export default function MandiComparison({ initialCropId, compact = false }: MandiComparisonProps) {
  const { location, language } = useApp();
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || "rice");
  const [search, setSearch] = useState<string>("");

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const mandiData = getMandiComparison(selectedCrop, location.state);

  const filteredMandis = mandiData.filter(m =>
    m.mandiName.toLowerCase().includes(search.toLowerCase()) ||
    m.district.toLowerCase().includes(search.toLowerCase())
  );

  const bestMandi = mandiData.find(m => m.isBestChoice) || mandiData[0];
  const avgPrice = Math.round(mandiData.reduce((acc, m) => acc + m.price, 0) / mandiData.length);

  return (
    <div className="card" style={{ padding: compact ? 16 : 24, borderRadius: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🏢</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: compact ? 18 : 22, fontWeight: 700, color: "var(--text)" }}>
              APMC Mandi Price Comparison
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Compare real-time prices across regional APMC markets in & near {location.state}
          </p>
        </div>

        {/* Selector Dropdown */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedCropId}
            onChange={e => setSelectedCropId(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name} ({formatPrice(c.basePrice)}/qntl)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Best Choice Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(92,122,62,0.12) 0%, rgba(196,150,75,0.12) 100%)",
        border: "1px solid var(--primary-light)",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontSize: 26,
            background: "var(--primary)",
            color: "#fff",
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            🏆
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Recommended Mandi for Best Profit
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>
              {bestMandi.mandiName} ({bestMandi.district})
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-dark)" }}>
            {formatPrice(bestMandi.price)} <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>/ quintal</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--success)", fontWeight: 700 }}>
            +{formatPrice(bestMandi.price - selectedCrop.basePrice)} higher than baseline
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search Mandi or District..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 320, padding: "8px 14px", borderRadius: 10, fontSize: 13 }}
        />
      </div>

      {/* Mandi Price Comparison Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>APMC Mandi</th>
              <th>District & State</th>
              <th>Distance</th>
              <th>Live Price</th>
              <th>Variance vs Avg</th>
              <th>Arrival Volume</th>
              <th>Trend</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {filteredMandis.map((mandi) => {
              const isHigher = mandi.price >= avgPrice;
              return (
                <tr key={mandi.id} style={{ background: mandi.isBestChoice ? "rgba(92,122,62,0.06)" : undefined }}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>{mandi.mandiName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{mandi.district}, {mandi.state}</div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{mandi.distanceKm} km</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
                      {formatPrice(mandi.price)}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: mandi.priceDiff > 0 ? "#15803D" : mandi.priceDiff < 0 ? "#B91C1C" : "var(--text-muted)"
                    }}>
                      {mandi.priceDiff > 0 ? `+${formatPrice(mandi.priceDiff)}` : formatPrice(mandi.priceDiff)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
                      📦 {mandi.arrivalsTons} Tons/day
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${mandi.trend === "up" ? "badge-green" : mandi.trend === "down" ? "badge-red" : "badge-gray"}`}>
                      {mandi.trend === "up" ? "↑ Rising" : mandi.trend === "down" ? "↓ Dropping" : "→ Stable"}
                    </span>
                  </td>
                  <td>
                    {mandi.isBestChoice ? (
                      <span className="badge badge-green" style={{ padding: "4px 10px", fontSize: 11 }}>
                        🏆 Highest Price
                      </span>
                    ) : isHigher ? (
                      <span className="badge badge-yellow" style={{ padding: "4px 10px", fontSize: 11 }}>
                        Good Return
                      </span>
                    ) : (
                      <span className="badge badge-gray" style={{ padding: "4px 10px", fontSize: 11 }}>
                        Baseline Market
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
