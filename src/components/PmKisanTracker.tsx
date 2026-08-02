"use client";

import { useState } from "react";
import { getPmKisanBeneficiary, formatPrice } from "@/lib/cropData";

export default function PmKisanTracker() {
  const [query, setQuery] = useState<string>("98421074");
  const [record, setRecord] = useState(getPmKisanBeneficiary("98421074"));
  const [searched, setSearched] = useState(true);

  const handleSearch = () => {
    if (!query.trim()) return;
    setRecord(getPmKisanBeneficiary(query));
    setSearched(true);
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header & Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🏛️</span>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              PM-KISAN Samman Nidhi Installment Tracker
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Check your ₹6,000 annual direct benefit transfer status & payment timeline
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, maxWidth: 500 }}>
          <input
            type="text"
            placeholder="Enter Aadhaar Number / Mobile No / Registration No..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input"
            style={{ fontWeight: 600, fontSize: 14, borderRadius: 10 }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            🔍 Search
          </button>
        </div>
      </div>

      {searched && (
        <>
          {/* Status & Compliance Badges */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            boxShadow: "var(--shadow-card)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
                  👤 {record.beneficiaryName}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Reg No: <strong>{record.registrationNo}</strong> · {record.district}, {record.state}
                </div>
              </div>

              <div className="badge badge-green" style={{ padding: "6px 14px", fontSize: 13 }}>
                ✓ Active Beneficiary
              </div>
            </div>

            {/* Compliance checklist */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: record.ekycStatus ? "#15803D" : "#B91C1C" }}>
                <span>{record.ekycStatus ? "✅" : "❌"}</span>
                <span>e-KYC Status: {record.ekycStatus ? "Done" : "Pending"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: record.aadhaarSeeded ? "#15803D" : "#B91C1C" }}>
                <span>{record.aadhaarSeeded ? "✅" : "❌"}</span>
                <span>Aadhaar Bank Seeding: {record.aadhaarSeeded ? "Active" : "Incomplete"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: record.landSeedingStatus ? "#15803D" : "#B91C1C" }}>
                <span>{record.landSeedingStatus ? "✅" : "❌"}</span>
                <span>Land Seeding: {record.landSeedingStatus ? "Verified" : "Pending"}</span>
              </div>
            </div>
          </div>

          {/* Next Installment Banner */}
          <div style={{
            background: "linear-gradient(135deg, rgba(196,150,75,0.12) 0%, rgba(92,122,62,0.12) 100%)",
            border: "1px solid var(--secondary)",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>⏳</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>
                  Upcoming Installment
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>
                  {record.nextExpectedDate}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary-dark)" }}>
              +₹2,000 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>(Direct Transfer)</span>
            </div>
          </div>

          {/* Past Installment History Table */}
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--text)" }}>
            📜 PM-KISAN Payment History
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Installment No.</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Credit Status</th>
                  <th>Credited Bank Account</th>
                  <th>UTR Reference No</th>
                </tr>
              </thead>
              <tbody>
                {record.installments.map(ins => (
                  <tr key={ins.number}>
                    <td>
                      <strong style={{ color: "var(--primary-dark)" }}>{ins.number}th Installment</strong>
                    </td>
                    <td>
                      <strong style={{ color: "#15803D", fontSize: 14 }}>{formatPrice(ins.amount)}</strong>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text)" }}>{ins.date}</td>
                    <td>
                      <span className="badge badge-green">✓ {ins.status}</span>
                    </td>
                    <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{ins.bankName}</td>
                    <td>
                      <code style={{ fontSize: 11, background: "var(--accent)", padding: "2px 6px", borderRadius: 4 }}>
                        {ins.utrNo}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
