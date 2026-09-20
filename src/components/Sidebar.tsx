"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getCurrentUser, logout, updateUserLocation } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";
import { APP_TRANSLATIONS } from "@/lib/appTranslations";
import type { User } from "@/lib/auth";
import NotificationManager from "@/components/NotificationManager";

const NAV = [
  { href: "/", icon: "🏠", label: "Dashboard", labelTA: "முகப்பு", labelTE: "డాష్‌బోర్డ్", labelKN: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", labelML: "ഡാഷ്‌ബോർഡ്", labelHI: "डैशबोर्ड" },
  { href: "/crops", icon: "🌾", label: "Crops", labelTA: "பயிர்கள்", labelTE: "పంటలు", labelKN: "ಬೆಳೆಗಳು", labelML: "വിളകൾ", labelHI: "फसलें" },
  { href: "/my-crops", icon: "⭐", label: "My Crops", labelTA: "என் பயிர்கள்", labelTE: "నా పంటలు", labelKN: "ನನ್ನ ಬೆಳೆಗಳು", labelML: "എന്റെ വിളകൾ", labelHI: "मेरी फसलें" },
  { href: "/analytics", icon: "📊", label: "Analytics", labelTA: "பகுப்பாய்வு", labelTE: "విశ్లేషణలు", labelKN: "ವಿಶ್ಲೇಷಣೆಗಳು", labelML: "വിശകലനങ്ങൾ", labelHI: "विश्लेषण" },
  { href: "/schemes", icon: "🏛️", label: "Govt Schemes", labelTA: "அரசு திட்டங்கள்", labelTE: "ప్రభుత్వ పథకాలు", labelKN: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", labelML: "സർക്കാർ പദ്ധതികൾ", labelHI: "सरकारी योजनाएं" },
  { href: "/tools", icon: "🛠️", label: "Agri-Tools", labelTA: "விவசாய கருவிகள்", labelTE: "వ్యవసాయ సాధనాలు", labelKN: "ಕೃಷಿ ಉಪಕರಣಗಳು", labelML: "കാർഷിക ഉപകരണങ്ങൾ", labelHI: "कृषि उपकरण" },
  { href: "/chatbot", icon: "🤖", label: "AgriBot", labelTA: "அக்ரிபாட்", labelTE: "అగ్రిబాట్", labelKN: "ಅಗ್ರಿಬಾಟ್", labelML: "അഗ്രിബോട്ട്", labelHI: "एग्रीबॉट" },
  { href: "/documents", icon: "📄", label: "Doc Scanner", labelTA: "ஆவண ஸ்கேனர்", labelTE: "డాక్ స్కానర్", labelKN: "ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್", labelML: "രേഖ സ്കാനർ", labelHI: "दस्तावेज़ स्कैनर" },
  { href: "/settings", icon: "⚙️", label: "Settings", labelTA: "அமைப்புகள்", labelTE: "సెట్టింగులు", labelKN: "ಸಂಯೋಜನೆಗಳು", labelML: "ക്രമീകരണങ്ങൾ", labelHI: "सेटिंग्स" },
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
  const { isDark, toggleDark, notifications, markAllRead, markAsRead, clearNotifications, unreadCount, location, setLocation, detectLiveLocation, isLocating, language, setLanguage } = useApp();
  const T = APP_TRANSLATIONS[language] || APP_TRANSLATIONS.en;
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

  const getLabel = (item: any) => {
    if (language === "ta") return item.labelTA;
    if (language === "te") return item.labelTE;
    if (language === "kn") return item.labelKN;
    if (language === "ml") return item.labelML;
    if (language === "hi") return item.labelHI;
    return item.label;
  };

  // Prefetch all app routes on mount for instant 0ms navigation
  useEffect(() => {
    NAV.forEach(item => {
      try {
        router.prefetch(item.href);
      } catch (err) {
        // ignore
      }
    });
  }, [router]);

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
        <div className="sidebar-section-label">{T.navSection}</div>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            id={`nav-${item.href.replace("/", "") || "home"}`}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
            onClick={() => {
              if (onClose) onClose();
            }}
            onMouseEnter={() => {
              try { router.prefetch(item.href); } catch (e) {}
            }}
            style={{ textDecoration: "none" }}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{getLabel(item)}</span>
          </Link>
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
            <span>{T.alertCenter}</span>
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
              <div style={{ padding: "8px 16px", background: "rgba(92,122,62,0.06)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text)" }}>📲 Lockscreen Alerts:</span>
                <NotificationManager />
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

                {/* Live Location Button */}
        <div style={{ marginBottom: 10 }}>
          <button
            id="btn-live-location"
            disabled={isLocating}
            onClick={detectLiveLocation}
            style={{
              width: "100%",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 10,
              padding: "9px 12px",
              color: "var(--primary)",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: isLocating ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s"
            }}
          >
            <span>📍</span>
            <span>{isLocating ? (language === "hi" ? "लोकेशन खोजी जा रही है..." : "Detecting GPS...") : (language === "ta" ? "நேரடி இருப்பிடம் பயன்படுத்து" : language === "te" ? "లైవ్ లొకేషన్ ఉపయోగించండి" : language === "hi" ? "लाइव लोकेशन सेट करें" : "Use Live Location")}</span>
          </button>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: 10 }}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            style={{
              width: "100%",
              background: "var(--sidebar-card)",
              border: "none",
              borderRadius: 10,
              padding: "9px 12px",
              color: "var(--sidebar-text)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            <option value="en">English</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
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
            <span>🚪</span> {T.signOut}
          </button>
        ) : (
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/login")}>{T.signIn}</button>
        )}
      </div>
    </aside>
  );
}
