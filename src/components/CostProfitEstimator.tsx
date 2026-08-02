"use client";

import { useState } from "react";
import { CROPS, calculateCultivationCostAndProfit, formatPrice } from "@/lib/cropData";

export default function CostProfitEstimator() {
  const [cropId, setCropId] = useState<string>("rice");
  const [acres, setAcres] = useState<number>(3);
  const [customYield, setCustomYield] = useState<number>(25);
  const [customPrice, setCustomPrice] = useState<number>(2441);

  const selectedCrop = CROPS.find(c => c.id === cropId) || CROPS[0];

  const handleCropChange = (id: string) => {
    const c = CROPS.find(cr => cr.id === id) || CROPS[0];
    setCropId(id);
    setCustomPrice(c.basePrice);
    if (id === "rice") setCustomYield(25);
    else if (id === "wheat") setCustomYield(22);
    else if (id === "tomato") setCustomYield(120);
    else if (id === "onion") setCustomYield(100);
    else setCustomYield(15);
  };

  const res = calculateCultivationCostAndProfit(cropId, acres, customYield, customPrice);

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🧮</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              Cultivation Input Cost & Net Profit Estimator
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Calculate per-acre cost breakdown (seeds, fertilizer, labor) & net profit / ROI %
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            🌾 Select Crop
          </label>
          <select
            value={cropId}
            onChange={e => handleCropChange(e.target.value)}
            className="input"
            style={{ fontWeight: 600, borderRadius: 10 }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            📐 Area (Acres)
          </label>
          <input
            type="number"
            min={0.5}
            max={50}
            step={0.5}
            value={acres}
            onChange={e => setAcres(Math.max(0.5, parseFloat(e.target.value) || 1))}
            className="input"
            style={{ fontWeight: 700, borderRadius: 10 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            📦 Yield / Acre (qntl)
          </label>
          <input
            type="number"
            min={1}
            value={customYield}
            onChange={e => setCustomYield(Math.max(1, parseFloat(e.target.value) || 1))}
            className="input"
            style={{ fontWeight: 700, borderRadius: 10 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
            💰 Market Price (₹/qntl)
          </label>
          <input
            type="number"
            min={100}
            value={customPrice}
            onChange={e => setCustomPrice(Math.max(100, parseFloat(e.target.value) || 100))}
            className="input"
            style={{ fontWeight: 700, borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Net Profit & ROI Highlight Banner */}
      <div style={{
        background: res.isProfitable
          ? "linear-gradient(135deg, #15803D 0%, #3A5227 100%)"
          : "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)",
        color: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 22,
        boxShadow: "var(--shadow)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Estimated Net Return ({acres} Acres)
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            {res.isProfitable ? `+${formatPrice(res.netProfit)}` : formatPrice(res.netProfit)}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
            Gross Revenue: {formatPrice(res.grossRevenue)} ({res.expectedYieldTotalQuintals} Total Quintals)
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          padding: "12px 18px",
          borderRadius: 12,
          textAlign: "right"
        }}>
          <div style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Return on Investment (ROI)
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: res.isProfitable ? "#FEF9C3" : "#FEE2E2" }}>
            {res.roiPercent}%
          </div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>
            {res.isProfitable ? "✓ Highly Profitable Crop Cycle" : "⚠️ High Input Cost Warning"}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table & Chart */}
      <div className="grid-cols-2-responsive" style={{ gap: 16 }}>
        {/* Cost Breakdown */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            📋 Cultivation Expense Breakdown ({acres} Acres)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🌱 Seeds & Nursery:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.seedCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🧪 NPK Fertilizer & Manure:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.fertilizerCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🛡️ Pesticides & Fungicides:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.pesticideCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>👨‍🌾 Labor & Harvesting Wages:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.laborCost)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>🚜 Tractor & Machinery Rental:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.machineryCost)}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
              <span>Total Expenditure:</span>
              <span style={{ color: "#B91C1C" }}>{formatPrice(res.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            📊 Net Income Projection
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Total Harvest Volume:</span>
              <strong style={{ color: "var(--text)" }}>{res.expectedYieldTotalQuintals} Quintals</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Selling Price:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.sellingPricePerQuintal)} / qntl</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Gross Market Value:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(res.grossRevenue)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Total Cost Deducted:</span>
              <strong style={{ color: "#B91C1C" }}>-{formatPrice(res.totalCost)}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
              <span>Estimated Net Profit:</span>
              <span style={{ color: res.isProfitable ? "#15803D" : "#B91C1C" }}>
                {formatPrice(res.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
