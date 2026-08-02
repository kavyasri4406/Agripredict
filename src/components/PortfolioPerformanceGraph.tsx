"use client";

import { useMemo } from "react";
import { CROPS, formatPrice, generatePriceHistoryByTimeframe } from "@/lib/cropData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface PortfolioPerformanceGraphProps {
  portfolioIds: string[];
}

export default function PortfolioPerformanceGraph({ portfolioIds }: PortfolioPerformanceGraphProps) {
  const trackedCrops = useMemo(() => {
    return CROPS.filter(c => portfolioIds.includes(c.id));
  }, [portfolioIds]);

  const { chartData, currentTotal, initialTotal, changeAmount, changePercent } = useMemo(() => {
    if (trackedCrops.length === 0) {
      return { chartData: [], currentTotal: 0, initialTotal: 0, changeAmount: 0, changePercent: 0 };
    }

    // Generate 30 days history for each tracked crop
    const histories = trackedCrops.map(crop => generatePriceHistoryByTimeframe(crop, "1M"));
    const dayCount = histories[0]?.length || 30;

    const data: { date: string; value: number }[] = [];

    for (let i = 0; i < dayCount; i++) {
      const date = histories[0][i]?.date || `Day ${i}`;
      let totalDayVal = 0;

      histories.forEach(hist => {
        if (hist[i]) {
          totalDayVal += hist[i].price;
        }
      });

      data.push({
        date,
        value: Math.round(totalDayVal)
      });
    }

    const initVal = data[0]?.value || 1;
    const currVal = data[data.length - 1]?.value || 1;
    const diff = currVal - initVal;
    const pct = parseFloat(((diff / initVal) * 100).toFixed(1));

    return {
      chartData: data,
      currentTotal: currVal,
      initialTotal: initVal,
      changeAmount: diff,
      changePercent: pct
    };
  }, [trackedCrops]);

  if (trackedCrops.length === 0) return null;

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20, marginBottom: 20 }}>
      {/* Header & Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>📈</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              Tracked Crops Portfolio Performance (30 Days)
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Cumulative market value trend for your {trackedCrops.length} tracked crops
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary-dark)" }}>
            {formatPrice(currentTotal)}
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: changeAmount >= 0 ? "#15803D" : "#B91C1C"
          }}>
            {changeAmount >= 0 ? `▲ +${formatPrice(changeAmount)} (+${changePercent}%)` : `▼ ${formatPrice(changeAmount)} (${changePercent}%)`}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 220, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={changeAmount >= 0 ? "#15803D" : "#B91C1C"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={changeAmount >= 0 ? "#15803D" : "#B91C1C"} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickFormatter={v => `₹${v}`} width={65} />
            <Tooltip
              formatter={(val: unknown) => [formatPrice(Number(val)), "Portfolio Value"]}
              contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={changeAmount >= 0 ? "#15803D" : "#B91C1C"}
              strokeWidth={2.5}
              fill="url(#portGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
