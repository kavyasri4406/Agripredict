"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getCurrentUser, logout, updateUserLocation } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/lib/locationData";
import type { User } from "@/lib/auth";

const NAV = [
  { href: "/", icon: "🏠", label: "Dashboard", labelTA: "முகப்பு", labelTE: "డాష్‌బోర్డ్" },
  { href: "/crops", icon: "🌾", label: "Crops", labelTA: "பயிர்கள்", labelTE: "పంటలు" },
  { href: "/my-crops", icon: "⭐", label: "My Crops", labelTA: "என் பயிர்கள்", labelTE: "నా పంటలు" },
  { href: "/analytics", icon: "📊", label: "Analytics", labelTA: "பகுப்பாய்வு", labelTE: "విశ్లేషణలు" },
  { href: "/schemes", icon: "🏛️", label: "Govt Schemes", labelTA: "அரசு திட்டங்கள்", labelTE: "ప్రభుత్వ పథకాలు" },
  { href: "/tools", icon: "🛠️", label: "Agri-Tools", labelTA: "விவசாய கருவிகள்", labelTE: "వ్యవసాయ సాధనాలు" },
  { href: "/chatbot", icon: "🤖", label: "AI Chatbot", labelTA: "AI சாட்", labelTE: "AI చాట్" },
  { href: "/documents", icon: "📄", label: "Doc Scanner", labelTA: "ஆவண ஸ்கேனர்", labelTE: "డాక్ స్కానర్" },
  { href: "/settings", icon: "⚙️", label: "Settings", labelTA: "அமைப்புகள்", labelTE: "సెట్టింగులు" },
];


function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleDark, notifications, markAllRead, markAsRead, clearNotifications, unreadCount, location, setLocation, language, setLanguage } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [showNotif, setShowNotif] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getLabel = (item: typeof NAV[0]) => {
    if (language === "ta") return item.labelTA;
    if (language === "te") return item.labelTE;
    return item.label;
  };

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  const notifTypeIcon = (type: string) => ({ price: "💰", weather: "🌦️", system: "🔔" }[type] || "🔔");

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Mobile Close Button */}
      {mobileOpen && (
        <button
          onClick={onClose}
          style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--sidebar-text)" }}
        >
          ✕
        </button>
      )}
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌾</div>
        <div>
          <div className="sidebar-logo-text">AgriPredict</div>
          <div className="sidebar-logo-sub">AI Market Intelligence</div>
        </div>
      </div>



      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV.map(item => (
          <button key={item.href} id={`nav-${item.href.replace("/", "") || "home"}`}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
            onClick={() => {
            router.push(item.href);
            if (onClose) onClose();
          }}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{getLabel(item)}</span>
          </button>
        ))}
      </nav>

      {/* Footer controls */}
      <div className="sidebar-footer">
        {/* Alert Center Button */}
        <div style={{ position: "relative", marginBottom: 10 }} ref={notifRef}>
          <button id="btn-notifications" title="Notifications"
            style={{
              width: "100%",
              background: "var(--sidebar-card)",
              border: "none",
              borderRadius: 10,
              padding: "10px 14px",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--sidebar-text)",
              fontWeight: 700,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
            onClick={() => setShowNotif(!showNotif)}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-sidebar-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--sidebar-card)"}
          >
            <span>🔔</span>
            <span>Alert Center</span>
            {unreadCount > 0 && (
              <span style={{
                background: "#E05252",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 99,
                display: "inline-block",
                marginLeft: 4
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotif && (
            <div style={{
              position: "fixed",
              left: "calc(var(--sidebar-width) + 12px)",
              bottom: "76px",
              width: "340px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-lg)",
              zIndex: 600,
              overflow: "hidden",
              animation: "fadeUp 0.25s ease-out"
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--accent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--primary-dark)" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ background: "#E05252", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: 11, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>Read All</button>
                  <span style={{ color: "var(--border-dark)" }}>|</span>
                  <button onClick={clearNotifications} style={{ background: "none", border: "none", fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>Clear All</button>
                </div>
              </div>
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🔔</div>
                    No notifications yet
                  </div>
                ) : notifications.map((n, idx) => (
                  <div key={`${n.id}_${idx}`} style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: n.read ? "transparent" : "rgba(92,122,62,0.04)",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    position: "relative"
                  }}
                    onClick={() => markAsRead(n.id)}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(92,122,62,0.04)")}
                  >
                    {!n.read && (
                      <div style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                    )}
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingLeft: n.read ? 0 : 4 }}>
                      <span style={{ fontSize: 18, marginTop: 1 }}>{notifTypeIcon(n.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: n.read ? 600 : 700, fontSize: 13, color: "var(--text)" }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, opacity: 0.75 }}>{timeAgo(n.time)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User login/logout only (no profile display duplicated) */}
        {user ? (
          <button id="btn-logout" style={{
            width: "100%",
            background: "var(--sidebar-card)",
            border: "none",
            borderRadius: 10,
            padding: "10px 0",
            color: "var(--text-muted)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter,sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.2s"
          }}
            onClick={() => {
            logout();
            router.push("/login");
            if (onClose) onClose();
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-sidebar-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--sidebar-card)"}
          >
            <span>🚪</span> Sign Out
          </button>
        ) : (
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/login")}>Sign In</button>
        )}
      </div>
    </aside>
  );
}
