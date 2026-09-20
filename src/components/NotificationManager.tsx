"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  async function checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (e) {
      console.warn("Error checking subscription:", e);
    }
  }

  async function subscribeToPush() {
    if (!isSupported) {
      setStatusMsg("Push notifications not supported on this browser.");
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      // 1. Request user permission
      const userPerm = await Notification.requestPermission();
      setPermission(userPerm);

      if (userPerm !== "granted") {
        setStatusMsg("Notification permission was denied. Please allow in browser settings.");
        setLoading(false);
        return;
      }

      // 2. Fetch VAPID Public Key from server
      const keyRes = await fetch("/api/notifications/subscribe");
      const keyData = await keyRes.json();
      const vapidPublicKey = keyData.publicKey;

      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found");
      }

      // 3. Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 4. Subscribe with PushManager
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as any
        });
      }

      // 5. Send subscription to our Next.js backend
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      if (!res.ok) throw new Error("Failed to register subscription on server");

      setIsSubscribed(true);
      setStatusMsg("✅ Lockscreen alerts enabled! You will now receive real-time mandi updates.");
    } catch (err: any) {
      console.error("Subscription error:", err);
      setStatusMsg("❌ Failed to enable push: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/notifications/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint })
          });
          await sub.unsubscribe();
        }
      }
      setIsSubscribed(false);
      setStatusMsg("Notifications disabled.");
    } catch (e: any) {
      setStatusMsg("Error disabling: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendTestNotification() {
    setLoading(true);
    setStatusMsg("");

    const payload = {
      title: "🌾 AgriPredict Alerts Active",
      body: "Push notifications are working properly on this device.",
      url: "/market-prices",
      tag: "test-alert"
    };

    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg("🚀 Test notification dispatched! Check your phone/desktop notification shade.");
      } else {
        setStatusMsg("Alert note: " + (data.message || data.error));
      }
    } catch (e: any) {
      setStatusMsg("Error dispatching: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header Notification Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Real-Time Push Alerts"
        style={{
          position: "relative",
          background: isSubscribed ? "rgba(92,122,62,0.14)" : "var(--accent)",
          border: `1px solid ${isSubscribed ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 12,
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          color: "var(--text)",
          fontSize: 13,
          fontWeight: 600,
          transition: "all 0.2s ease"
        }}
      >
        <span style={{ fontSize: 16 }}>🔔</span>
        <span className="hidden sm:inline" style={{ fontSize: 12 }}>
          {isSubscribed ? "Alerts Active" : "Get Alerts"}
        </span>
        {isSubscribed && (
          <span
            style={{
              width: 8,
              height: 8,
              background: "#10B981",
              borderRadius: "50%",
              display: "inline-block"
            }}
          />
        )}
      </button>

      {/* Slide-out / Modal Drawer */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            right: 16,
            width: 360,
            maxWidth: "92vw",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
            padding: 20,
            zIndex: 1000,
            animation: "fadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
                  Real-Time Farmer Push Alerts
                </h4>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                  Native VAPID lockscreen notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          {/* Status Badge */}
          <div
            style={{
              background: isSubscribed ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${isSubscribed ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: 12.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: isSubscribed ? "#047857" : "#B45309"
            }}
          >
            <span>{isSubscribed ? "🟢" : "🟠"}</span>
            <span>
              {isSubscribed
                ? "This device is registered for phone lockscreen alerts!"
                : "Enable push to get live price jumps even when the app is closed."}
            </span>
          </div>

          {/* Main Action Button */}
          {!isSubscribed ? (
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 14
              }}
            >
              {loading ? "Registering Device..." : "📱 Enable Phone Lockscreen Alerts"}
            </button>
          ) : (
            <div style={{ marginBottom: 14, display: "flex", gap: 8 }}>
              <button
                onClick={unsubscribeFromPush}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, borderRadius: 10, fontSize: 11 }}
              >
                🔕 Mute Alerts
              </button>
            </div>
          )}

          {/* Single Test Notification Trigger */}
          {isSubscribed && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
              <button
                onClick={() => sendTestNotification()}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", borderRadius: 10, fontSize: 12, justifyContent: "center" }}
              >
                🧪 Send Test Lockscreen Alert
              </button>
            </div>
          )}

          {/* Status / Feedback Message */}
          {statusMsg && (
            <div
              style={{
                marginTop: 12,
                fontSize: 11.5,
                color: "var(--primary)",
                background: "rgba(92,122,62,0.08)",
                padding: "8px 12px",
                borderRadius: 10,
                lineHeight: 1.4
              }}
            >
              {statusMsg}
            </div>
          )}
        </div>
      )}
    </>
  );
}
