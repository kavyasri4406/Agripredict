"use client";

import { useState } from "react";
import { CROPS, calculateKccLoan, formatPrice } from "@/lib/cropData";

export default function KccCalculator() {
  const [cropId, setCropId] = useState<string>("rice");
  const [acres, setAcres] = useState<number>(3);

  const selectedCrop = CROPS.find(c => c.id === cropId) || CROPS[0];
  const loan = calculateKccLoan(cropId, acres);

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>💳</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              Kisan Credit Card (KCC) Loan & EMI Calculator
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Estimate your sanctioned crop credit limit & Govt 3% interest subvention benefit (4.0% effective p.a.)
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid-cols-2-responsive" style={{ gap: 16, marginBottom: 22 }}>
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
            🌾 Select Primary Crop
          </label>
          <select
            value={cropId}
            onChange={e => setCropId(e.target.value)}
            className="input"
            style={{ fontWeight: 600, borderRadius: 10 }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name} ({c.season} Season)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
            📐 Cultivated Land Area (Acres)
          </label>
          <input
            type="number"
            min={0.5}
            max={50}
            step={0.5}
            value={acres}
            onChange={e => setAcres(Math.max(0.5, parseFloat(e.target.value) || 1))}
            className="input"
            style={{ fontWeight: 700, fontSize: 16, borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Sanctioned Limit Card */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
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
            Total Sanctioned KCC Credit Limit
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            {formatPrice(loan.totalSanctionLimit)}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
            Scale of Finance: {formatPrice(loan.cropLimit / acres)} / acre ({acres} Acres)
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
            Govt Subvention Interest Rate
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FEF9C3" }}>
            4.0% <span style={{ fontSize: 12, fontWeight: 500 }}>p.a.</span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>
            7% Base Rate - 3% Prompt Repayment Incentive
          </div>
        </div>
      </div>

      {/* Detailed Limit & Interest Breakdown Table */}
      <div className="grid-cols-2-responsive" style={{ gap: 16, marginBottom: 20 }}>
        {/* Loan Components */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            📋 Credit Limit Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Crop Cultivation Limit:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(loan.cropLimit)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Post-Harvest Household (10%):</span>
              <strong style={{ color: "var(--text)" }}>+{formatPrice(loan.postHarvestLimit)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Farm Asset Maintenance (20%):</span>
              <strong style={{ color: "var(--text)" }}>+{formatPrice(loan.farmAssetLimit)}</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
              <span>Total Sanctioned Limit:</span>
              <span style={{ color: "var(--primary-dark)" }}>{formatPrice(loan.totalSanctionLimit)}</span>
            </div>
          </div>
        </div>

        {/* Repayment & Interest */}
        <div className="card-sm" style={{ background: "var(--bg)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 12 }}>
            🏦 Repayment & EMI Schedule
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Annual Interest (at 4%):</span>
              <strong style={{ color: "#15803D" }}>{formatPrice(loan.annualInterestAmount)} / year</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Interest Saved via Subvention (3%):</span>
              <strong style={{ color: "var(--secondary)" }}>-{formatPrice(Math.round(loan.totalSanctionLimit * 0.03))} / year</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Estimated Monthly Installment:</span>
              <strong style={{ color: "var(--text)" }}>{formatPrice(loan.monthlyEmi)} / month</strong>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              💡 Zero collateral requirement up to ₹1.60 Lakh under RBI guidelines for Kisan Credit Cards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
