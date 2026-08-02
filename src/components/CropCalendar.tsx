"use client";

import { useState, Fragment } from "react";
import { getCropCalendarData, MONTH_NAMES, CropCalendarItem } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Punjab",
  "Maharashtra",
  "Karnataka",
  "Rajasthan"
];

export default function CropCalendar() {
  const { location } = useApp();
  const [selectedState, setSelectedState] = useState<string>(location.state || "Andhra Pradesh");
  const [selectedSeason, setSelectedSeason] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const calendarItems = getCropCalendarData(selectedState);

  const filteredItems = calendarItems.filter(item =>
    selectedSeason === "All" || item.season === selectedSeason
  );

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header & State Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>📅</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              State Agricultural Crop Calendar
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Month-by-month sowing, irrigation, and harvesting timelines tailored for {selectedState}
          </p>
        </div>

        {/* State & Season Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>📍 {s}</option>
            ))}
          </select>

          <select
            value={selectedSeason}
            onChange={e => setSelectedSeason(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            <option value="All">🌱 All Seasons</option>
            <option value="Kharif">🌧️ Kharif (Monsoon)</option>
            <option value="Rabi">❄️ Rabi (Winter)</option>
            <option value="Annual">☀️ Annual / Perennial</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
        background: "var(--accent)",
        padding: "10px 16px",
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 12.5,
        fontWeight: 600
      }}>
        <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>Stage Legend:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#4CAF50" }} />
          <span>🌱 Sowing Period</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#3B82F6" }} />
          <span>💧 Irrigation & Flowering</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#E8B96A" }} />
          <span>🌾 Harvest & Threshing</span>
        </div>
      </div>

      {/* 12-Month Gantt Chart Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 180 }}>Crop & Season</th>
              {MONTH_NAMES.map((m, idx) => (
                <th key={m} style={{ textAlign: "center", padding: "10px 4px", fontSize: 11 }}>
                  {m}
                </th>
              ))}
              <th style={{ textAlign: "center" }}>Advisory</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <Fragment key={item.id}>
                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{item.cropEmoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{item.cropName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.season} • {item.waterRequirement} Water</div>
                      </div>
                    </div>
                  </td>

                  {/* 12 Month Grid cells */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
                    const isSowing = item.sowingMonths.includes(monthNum);
                    const isIrrigation = item.irrigationMonths.includes(monthNum);
                    const isHarvest = item.harvestMonths.includes(monthNum);

                    return (
                      <td key={monthNum} style={{ padding: 4, textAlign: "center", verticalAlign: "middle" }}>
                        <div style={{
                          height: 24,
                          borderRadius: 6,
                          background: isSowing
                            ? "#4CAF50"
                            : isHarvest
                            ? "#E8B96A"
                            : isIrrigation
                            ? "#3B82F6"
                            : "rgba(0,0,0,0.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700
                        }}>
                          {isSowing ? "🌱" : isHarvest ? "🌾" : isIrrigation ? "💧" : ""}
                        </div>
                      </td>
                    );
                  })}

                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      {expandedId === item.id ? "Hide Tip" : "View Tip"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Advisory Row */}
                {expandedId === item.id && (
                  <tr key={`${item.id}_tip`}>
                    <td colSpan={14} style={{ background: "var(--accent)", padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: 13, color: "var(--primary-dark)", lineHeight: 1.5 }}>
                        <strong>💡 Farming Advisory ({item.cropName} in {selectedState}):</strong> {item.advisory}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
