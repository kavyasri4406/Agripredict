"use client";

import { useState, useEffect } from "react";
import { CROPS, formatPrice } from "@/lib/cropData";
import { savePriceAlert, dispatchPriceNotification, PriceAlert } from "@/lib/priceAlerts";
import { useApp } from "@/lib/AppContext";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCropId?: string;
  initialMandiName?: string;
  initialPrice?: number;
  initialState?: string;
  initialDistrict?: string;
  onAlertCreated?: (alert: PriceAlert) => void;
}

const COMMON_MANDIS = [
  { name: "Nellore Mandi", district: "Nellore", state: "Andhra Pradesh" },
  { name: "Guntur Mandi", district: "Guntur", state: "Andhra Pradesh" },
  { name: "Madurai Central Market", district: "Madurai", state: "Tamil Nadu" },
  { name: "Chennai Koyambedu", district: "Chennai", state: "Tamil Nadu" },
  { name: "Kurnool APMC Market", district: "Kurnool", state: "Andhra Pradesh" },
  { name: "Coimbatore APMC Market", district: "Coimbatore", state: "Tamil Nadu" },
  { name: "Hubli APMC Yard", district: "Dharwad", state: "Karnataka" },
  { name: "Indore Mandi", district: "Indore", state: "Madhya Pradesh" }
];

export default function PriceAlertModal({
  isOpen,
  onClose,
  initialCropId,
  initialMandiName,
  initialPrice,
  initialState,
  initialDistrict,
  onAlertCreated
}: PriceAlertModalProps) {
  const { addNotification, language } = useApp();

  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || "rice");
  const [mandiName, setMandiName] = useState<string>(initialMandiName || "Nellore Mandi");
  const [district, setDistrict] = useState<string>(initialDistrict || "Nellore");
  const [state, setState] = useState<string>(initialState || "Andhra Pradesh");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState<number>(initialPrice ? Math.round(initialPrice * 1.1) : 2400);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const selectedCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];

  useEffect(() => {
    if (initialCropId) setSelectedCropId(initialCropId);
    if (initialMandiName) setMandiName(initialMandiName);
    if (initialPrice) {
      setTargetPrice(condition === "above" ? Math.round(initialPrice * 1.08) : Math.round(initialPrice * 0.92));
    }
    if (initialState) setState(initialState);
    if (initialDistrict) setDistrict(initialDistrict);
  }, [initialCropId, initialMandiName, initialPrice, initialState, initialDistrict, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (targetPrice <= 0) {
      alert("Please enter a valid target price greater than 0");
      return;
    }

    setIsSaving(true);
    const newAlert = savePriceAlert({
      cropId: selectedCrop.id,
      cropName: selectedCrop.name,
      mandiName,
      district,
      state,
      condition,
      targetPrice,
      unit: "₹/qtl",
      lastCheckedPrice: initialPrice || selectedCrop.basePrice
    });

    const alertTitle = `🔔 Target Price Alert Set!`;
    const alertBody = `We'll notify you when ${mandiName} ${selectedCrop.name} ${condition === "above" ? "crosses" : "drops below"} ₹${targetPrice.toLocaleString("en-IN")}/qtl`;

    // 1. In-app notification
    addNotification({
      title: alertTitle,
      message: alertBody,
      type: "price"
    });

    // 2. Dispatch native lockscreen push verification
    dispatchPriceNotification(alertTitle, alertBody);

    setSuccessMsg(alertBody);
    if (onAlertCreated) onAlertCreated(newAlert);

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(3px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }}>
      <div className="card" style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        width: "100%",
        maxWidth: 500,
        padding: 24,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.2s ease"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(245, 158, 11, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22
            }}>
              🔔
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                Set Smart Price Alert
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Instant browser & lockscreen notification when rates hit your target
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>

        {successMsg ? (
          <div style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid #10B981",
            borderRadius: 14,
            padding: 20,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#047857" }}>Price Alert Activated!</div>
            <p style={{ fontSize: 13, color: "var(--text)", marginTop: 6 }}>{successMsg}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Crop Selector */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                🌾 Select Crop
              </label>
              <select
                value={selectedCropId}
                onChange={e => {
                  setSelectedCropId(e.target.value);
                  const c = CROPS.find(crop => crop.id === e.target.value);
                  if (c) {
                    setTargetPrice(condition === "above" ? Math.round(c.basePrice * 1.1) : Math.round(c.basePrice * 0.9));
                  }
                }}
                className="input"
                style={{ width: "100%", borderRadius: 10, fontSize: 13.5 }}
              >
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name} (Current: {formatPrice(c.basePrice)}/qtl)
                  </option>
                ))}
              </select>
            </div>

            {/* Mandi Selector */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                🏢 Select Mandi / APMC Yard
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={mandiName}
                  onChange={e => {
                    const match = COMMON_MANDIS.find(m => m.name === e.target.value);
                    setMandiName(e.target.value);
                    if (match) {
                      setDistrict(match.district);
                      setState(match.state);
                    }
                  }}
                  className="input"
                  style={{ flex: 1, borderRadius: 10, fontSize: 13.5 }}
                >
                  {COMMON_MANDIS.map(m => (
                    <option key={m.name} value={m.name}>
                      📍 {m.name} ({m.district}, {m.state})
                    </option>
                  ))}
                  <option value="All Mandis">📍 All Regional Mandis</option>
                </select>
              </div>
            </div>

            {/* Condition: Above vs Below */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                ⚡ Trigger Condition
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCondition("above")}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: condition === "above" ? "2px solid #15803D" : "1px solid var(--border)",
                    background: condition === "above" ? "rgba(22,163,74,0.1)" : "var(--bg)",
                    color: condition === "above" ? "#15803D" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>📈</span>
                  <span>Rises Above (≥)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition("below")}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: condition === "below" ? "2px solid #B91C1C" : "1px solid var(--border)",
                    background: condition === "below" ? "rgba(185,28,28,0.1)" : "var(--bg)",
                    color: condition === "below" ? "#B91C1C" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>📉</span>
                  <span>Falls Below (≤)</span>
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                  🎯 Target Price (₹ per Quintal)
                </label>
                <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 600 }}>
                  Baseline: {formatPrice(selectedCrop.basePrice)}/qtl
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: 11, fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>
                  ₹
                </span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(Number(e.target.value) || 0)}
                  className="input"
                  style={{ width: "100%", paddingLeft: 34, borderRadius: 10, fontSize: 16, fontWeight: 700 }}
                  placeholder="e.g. 2400"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div style={{
              background: "var(--bg)",
              border: "1px dashed var(--border)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div>
                <strong>Notification Preview:</strong> You'll get an instant lockscreen alert when <strong>{mandiName}</strong> reaches <strong>₹{targetPrice.toLocaleString("en-IN")}/qtl</strong>.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: 12 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 2, borderRadius: 12, fontWeight: 700 }}
              >
                {isSaving ? "Activating Alert..." : "🔔 Set Price Alert"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
