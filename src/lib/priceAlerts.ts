// Smart Mandi Price Threshold Alerts Manager
// Stores, checks, and manages farmer price alerts with Web Push integration

export interface PriceAlert {
  id: string;
  cropId: string;
  cropName: string;
  mandiName: string;
  district: string;
  state: string;
  condition: "above" | "below";
  targetPrice: number;
  unit: string; // e.g. "₹/qtl" or "₹/kg"
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  lastCheckedPrice?: number;
}

const STORAGE_KEY = "agri_price_alerts";

const DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: "alert_default_1",
    cropId: "rice",
    cropName: "Rice (Paddy)",
    mandiName: "Nellore Mandi",
    district: "Nellore",
    state: "Andhra Pradesh",
    condition: "above",
    targetPrice: 2400,
    unit: "₹/qtl",
    active: true,
    createdAt: new Date().toISOString(),
    lastCheckedPrice: 2280
  },
  {
    id: "alert_default_2",
    cropId: "chilli",
    cropName: "Red Chilli",
    mandiName: "Guntur Mandi",
    district: "Guntur",
    state: "Andhra Pradesh",
    condition: "below",
    targetPrice: 15000,
    unit: "₹/qtl",
    active: true,
    createdAt: new Date().toISOString(),
    lastCheckedPrice: 16200
  }
];

export function getPriceAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return DEFAULT_ALERTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ALERTS));
      return DEFAULT_ALERTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load price alerts:", err);
    return DEFAULT_ALERTS;
  }
}

export function savePriceAlert(newAlertData: Omit<PriceAlert, "id" | "createdAt" | "active">): PriceAlert {
  const alerts = getPriceAlerts();
  const alert: PriceAlert = {
    ...newAlertData,
    id: "alert_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    active: true
  };

  const updated = [alert, ...alerts];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return alert;
}

export function deletePriceAlert(id: string): void {
  const alerts = getPriceAlerts();
  const updated = alerts.filter(a => a.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export function togglePriceAlert(id: string): boolean {
  const alerts = getPriceAlerts();
  let newState = true;
  const updated = alerts.map(a => {
    if (a.id === id) {
      newState = !a.active;
      return { ...a, active: newState };
    }
    return a;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newState;
}

export function updateAlertTriggered(id: string, currentPrice: number): void {
  const alerts = getPriceAlerts();
  const updated = alerts.map(a => {
    if (a.id === id) {
      return {
        ...a,
        lastTriggeredAt: new Date().toISOString(),
        lastCheckedPrice: currentPrice
      };
    }
    return a;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

/**
 * Dispatches both in-app notification & Native Web Push to lockscreen
 */
export async function dispatchPriceNotification(title: string, body: string): Promise<void> {
  try {
    await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        url: "/my-crops",
        tag: "mandi-price-alert"
      })
    });
  } catch (err) {
    console.warn("Could not send Web Push notification:", err);
  }
}
