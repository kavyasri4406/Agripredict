"use client";

import { useState, useEffect } from "react";
import { CROPS, Crop, getMandiComparison, formatPrice, MandiInfo } from "@/lib/cropData";
import { useApp } from "@/lib/AppContext";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/lib/locationData";
import PriceAlertModal from "@/components/PriceAlertModal";

interface MandiComparisonProps {
  initialCropId?: string;
  compact?: boolean;
}

export default function MandiComparison({ initialCropId, compact = false }: MandiComparisonProps) {
  const { location, language } = useApp();
  const [selectedState, setSelectedState] = useState<string>(location.state || "Andhra Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(location.district || "Chittoor");
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || "rice");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMandiName, setAlertMandiName] = useState<string>("");
  const [alertPrice, setAlertPrice] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (initialCropId) setSelectedCropId(initialCropId);
  }, [initialCropId]);

  useEffect(() => {
    if (location.state) setSelectedState(location.state);
    if (location.district) setSelectedDistrict(location.district);
  }, [location.state, location.district]);
  const [search, setSearch] = useState<string>("");

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const [mandiData, setMandiData] = useState<MandiInfo[]>(() => getMandiComparison(selectedCrop, location.state));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveMandis() {
      setLoading(true);
      try {
        const res = await fetch(`/api/mandi-prices?crop=${encodeURIComponent(selectedCrop.name)}&state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.topMandis && data.topMandis.length > 0) {
            setMandiData(data.topMandis);
          }
        }
      } catch (err) {
        console.error("Live Mandi API error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLiveMandis();
    return () => { isMounted = false; };
  }, [selectedCropId, selectedState, selectedDistrict]);

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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: compact ? 18 : 22, fontWeight: 700, color: "var(--text)" }}>
                APMC Mandi Price Comparison
              </h3>
              <span style={{ fontSize: 11, background: "rgba(16, 185, 129, 0.12)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 9px", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <span className="live-dot" /> {loading ? "Syncing Google APMC..." : "🟢 Live Google APMC Data"}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Compare real-time prices across regional APMC markets in & near {location.state}
          </p>
        </div>

        {/* State, District & Crop Selectors */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedState}
            onChange={e => {
              const ns = e.target.value;
              setSelectedState(ns);
              const dists = STATE_DISTRICTS[ns];
              if (dists && dists.length > 0) setSelectedDistrict(dists[0].name);
            }}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10 }}
          >
            {(STATE_DISTRICTS[selectedState] || []).map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedCropId}
            onChange={e => setSelectedCropId(e.target.value)}
            className="input"
            style={{ width: "auto", fontWeight: 600, padding: "8px 14px", borderRadius: 10, borderColor: "var(--primary)" }}
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

      {/* Search Bar & Alert CTA */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Search Mandi or District..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 320, padding: "8px 14px", borderRadius: 10, fontSize: 13 }}
        />
        <button
          onClick={() => {
            setAlertMandiName(bestMandi.mandiName);
            setAlertPrice(bestMandi.price);
            setIsAlertModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10, padding: "8px 14px", fontWeight: 700 }}
        >
          <span>🔔</span>
          <span>Set Target Price Alert</span>
        </button>
      </div>

      {/* Mandi Price Comparison Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>APMC Mandi</th>
              <th>District & State</th>
              <th>Live Price</th>
              <th>Variance vs Avg</th>
              <th>Arrival Volume</th>
              <th>Trend</th>
              <th>Recommendation</th>
              <th>Alert</th>
            </tr>
          </thead>
          <tbody>
            {filteredMandis.map((mandi, idx) => {
              const isHigher = mandi.price >= avgPrice;
              return (
                <tr key={`mandi_row_${selectedCropId}_${mandi.mandiName}_${idx}`} style={{ background: mandi.isBestChoice ? "rgba(92,122,62,0.06)" : undefined }}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>{mandi.mandiName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{mandi.district}, {mandi.state}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
                      {formatPrice(mandi.price)}
                      <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, marginLeft: 6 }}>
                        (₹{Math.round(mandi.price / 100)}/kg)
                      </span>
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
                  <td>
                    <button
                      onClick={() => {
                        setAlertMandiName(mandi.mandiName);
                        setAlertPrice(mandi.price);
                        setIsAlertModalOpen(true);
                      }}
                      title={`Set price target alert for ${mandi.mandiName}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 8, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <span>🔔</span>
                      <span>Alert</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialCropId={selectedCropId}
        initialMandiName={alertMandiName}
        initialPrice={alertPrice}
        initialState={selectedState}
        initialDistrict={selectedDistrict}
      />
    </div>
  );
}
