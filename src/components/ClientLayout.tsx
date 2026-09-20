"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";

import NotificationManager from "@/components/NotificationManager";

const PUBLIC = ["/login"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useApp();
  const [ready, setReady] = useState(false);
  const isPublic = PUBLIC.includes(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isPublic) {
      const user = getCurrentUser();
      if (!user) { router.replace("/login"); return; }
    }
    setReady(true);
  }, [pathname, isPublic, router]);

  if (isPublic) return <>{children}</>;
  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading AgriPredict...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Mobile Top Header */}
      <div className="mobile-header" style={{
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--sidebar-border)",
        position: "sticky",
        top: 0,
        zIndex: 180,
      }}>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--sidebar-text)" }}
        >
          ☰
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--sidebar-text)" }}>AgriPredict</span>
        </div>
        <NotificationManager />
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 190,
              backdropFilter: "blur(2px)",
              animation: "fadeIn 0.2s ease-out"
            }}
          />
        )}
        <div className={`main-layout ${pathname === "/chatbot" ? "is-chatbot-layout" : ""}`} style={{ flex: 1 }}>{children}</div>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fade-in" style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 320,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          borderRadius: 16,
          padding: 16,
          zIndex: 9999,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          <div style={{ fontSize: 24 }}>
            {toast.type === "price" ? "💰" : toast.type === "weather" ? "🌦️" : "🔔"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "var(--primary)" }}>{toast.title}</div>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 4, lineHeight: 1.4 }}>{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
