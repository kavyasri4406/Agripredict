"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, logout } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import NotificationManager from "@/components/NotificationManager";
import type { Language } from "@/lib/AppContext";

const PUBLIC = ["/login"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast, language, setLanguage, location, isDark, toggleDark } = useApp();
  const [ready, setReady] = useState(false);
  const isPublic = PUBLIC.includes(pathname);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isPublic) {
      const user = getCurrentUser();
      if (!user) { router.replace("/login"); return; }
    }
    setReady(true);
  }, [pathname, isPublic, router]);

  // Close more drawer on navigation
  useEffect(() => {
    setMoreDrawerOpen(false);
  }, [pathname]);

  if (isPublic) return <>{children}</>;
  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading AgriPredict Mobile...</div>
      </div>
    </div>
  );

  const NAV_TABS = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/crops", label: "Crops", icon: "🌾" },
    { href: "/chatbot", label: "AgriBot", icon: "🤖", isAction: true },
    { href: "/my-crops", label: "My Crops", icon: "⭐" },
  ];

  const DRAWER_ITEMS = [
    { href: "/schemes", icon: "🏛️", title: "Govt Schemes", desc: "Verified state & national farmer subsidies" },
    { href: "/analytics", icon: "📊", title: "Analytics & Trends", desc: "30-day forecast curves & farmer network" },
    { href: "/tools", icon: "🛠️", title: "Agri-Tools Suite", desc: "Arbitrage, pest diagnosis, risk advisor" },
    { href: "/documents", icon: "📄", title: "Doc Scanner / OCR", desc: "Scan notices & get plain language summaries" },
    { href: "/settings", icon: "⚙️", title: "Settings & Profile", desc: "Farm attributes, language & alerts" },
  ];

  const isTabActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="mobile-canvas-wrapper">
      <div className="mobile-app-device">
        
        {/* Top Mobile Status & App Bar */}
        <header className="mobile-app-header">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <div className="mobile-app-logo">🌾</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.3, color: "var(--primary)" }}>AgriPredict</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: -2 }}>
                📍 {location.district || "Madurai"}, {location.state ? (location.state.length > 12 ? location.state.slice(0, 10) + ".." : location.state) : "TN"}
              </div>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {/* Quick Lang Switcher */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              style={{
                background: "var(--bg-card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 99,
                padding: "3px 6px",
                fontSize: 11,
                fontWeight: 700,
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="en">EN</option>
              <option value="te">తెలుగు</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
              <option value="ml">മലയാളം</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>

            <NotificationManager />
          </div>
        </header>

        {/* Scrollable Mobile App Body */}
        <main className={`mobile-app-body ${pathname === "/chatbot" ? "is-chatbot-body" : ""}`}>
          {children}
        </main>

        {/* Native Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav">
          {NAV_TABS.map(tab => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`mobile-nav-tab ${active ? "active" : ""} ${tab.isAction ? "is-action-tab" : ""}`}
              >
                <span className="mobile-nav-icon">{tab.icon}</span>
                <span className="mobile-nav-label">{tab.label}</span>
              </Link>
            );
          })}

          {/* More / Menu Button */}
          <button
            onClick={() => setMoreDrawerOpen(prev => !prev)}
            className={`mobile-nav-tab ${moreDrawerOpen || ["/schemes", "/analytics", "/tools", "/documents", "/settings"].some(p => pathname.startsWith(p)) ? "active" : ""}`}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span className="mobile-nav-icon">☰</span>
            <span className="mobile-nav-label">More</span>
          </button>
        </nav>

        {/* Slide-over "More" Drawer Sheet */}
        {moreDrawerOpen && (
          <div className="mobile-drawer-overlay" onClick={() => setMoreDrawerOpen(false)}>
            <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-handle" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "0 4px" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>🌾 Features & Services</span>
                <button
                  onClick={() => setMoreDrawerOpen(false)}
                  style={{ background: "none", border: "none", fontSize: 18, color: "var(--text-muted)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DRAWER_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreDrawerOpen(false)}
                    className="mobile-drawer-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      textDecoration: "none",
                      background: pathname.startsWith(item.href) ? "var(--primary-light)" : "var(--bg)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: pathname.startsWith(item.href) ? "var(--primary)" : "var(--text)" }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{item.desc}</div>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>›</span>
                  </Link>
                ))}

                {/* Dark Mode & Logout */}
                <div style={{ display: "flex", gap: 8, marginTop: 6, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <button
                    onClick={toggleDark}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>

                  <button
                    onClick={() => logout()}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #FCA5A5",
                      background: "#FEF2F2",
                      color: "#DC2626",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toast && (
          <div className="mobile-app-toast">
            <div style={{ fontSize: 20 }}>
              {toast.type === "price" ? "💰" : toast.type === "weather" ? "🌦️" : "🔔"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--primary)" }}>{toast.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--text)", marginTop: 2, lineHeight: 1.35 }}>{toast.message}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
