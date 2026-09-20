import fs from "fs";
import path from "path";
// @ts-ignore
import webpush from "web-push";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
  userAgent?: string;
  createdAt?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "push_subscriptions.json");

// Initialize WebPush VAPID
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BLy4eqWH8LXxPSm0yrV27MftxuZEJ8IpUY_7X_j-ZQkUwFVMPqk_9E1AxmOWFfb2pNeEDjNbyLuDvtRJPm1Eem8";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "roOK_boklP9pBCUkg6ZWk8EtSLdDHpj24z588fPOJ-E";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@agripredict.in";

try {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
} catch (e) {
  console.warn("Failed to set VAPID details:", e);
}

function ensureStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([]), "utf-8");
    }
  } catch (err) {
    console.warn("Could not ensure data directory:", err);
  }
}

export function getAllSubscriptions(): PushSubscriptionData[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveSubscription(sub: PushSubscriptionData): boolean {
  ensureStorage();
  try {
    const subs = getAllSubscriptions();
    // Check if endpoint already exists
    const index = subs.findIndex((s) => s.endpoint === sub.endpoint);
    if (index >= 0) {
      subs[index] = { ...subs[index], ...sub, createdAt: new Date().toISOString() };
    } else {
      subs.push({ ...sub, createdAt: new Date().toISOString() });
    }
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving subscription:", err);
    return false;
  }
}

export function removeSubscription(endpoint: string): boolean {
  ensureStorage();
  try {
    const subs = getAllSubscriptions();
    const filtered = subs.filter((s) => s.endpoint !== endpoint);
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error removing subscription:", err);
    return false;
  }
}

export async function broadcastPushNotification(payload: PushPayload): Promise<{
  success: boolean;
  totalSubscribers: number;
  sent: number;
  failed: number;
}> {
  ensureStorage();
  const subs = getAllSubscriptions();
  if (subs.length === 0) {
    return { success: true, totalSubscribers: 0, sent: 0, failed: 0 };
  }

  const jsonPayload = JSON.stringify({
    title: payload.title || "🌾 AgriPredict Alert",
    body: payload.body || "Mandi rates and agricultural advisories have been updated.",
    url: payload.url || "/market-prices",
    tag: payload.tag || "agripredict-update",
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    timestamp: Date.now()
  });

  let sent = 0;
  let failed = 0;
  const deadEndpoints: string[] = [];

  const promises = subs.map(async (subscription) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        jsonPayload
      );
      sent++;
    } catch (err: any) {
      failed++;
      // If subscription expired or was unsubscribed by user (404/410), prune it
      if (err.statusCode === 404 || err.statusCode === 410) {
        deadEndpoints.push(subscription.endpoint);
      } else {
        console.warn("Failed to deliver push to subscription:", err.message);
      }
    }
  });

  await Promise.allSettled(promises);

  // Clean up any dead subscriptions
  if (deadEndpoints.length > 0) {
    deadEndpoints.forEach((ep) => removeSubscription(ep));
  }

  return {
    success: true,
    totalSubscribers: subs.length,
    sent,
    failed
  };
}
