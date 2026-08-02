"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { STATE_DISTRICTS } from "@/lib/locationData";

export type Language = "en" | "ta" | "te";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "price" | "weather" | "system";
  time: Date;
  read: boolean;
}

export interface LocationInfo {
  state: string;
  district: string;
  lat: number;
  lon: number;
}

interface AppContextType {
  isDark: boolean;
  toggleDark: () => void;
  notifications: Notification[];
  toast: { id: string; title: string; message: string; type: string } | null;
  addNotification: (n: Omit<Notification, "id" | "time" | "read">) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
  location: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_LOCATION: LocationInfo = {
  state: "Tamil Nadu",
  district: "Chennai",
  lat: 13.0827,
  lon: 80.2707,
};

const INITIAL_NOTIFICATIONS: Omit<Notification, "id">[] = [
  { title: "Market Open 🟢", message: "APMC markets are now open. Live prices are updating.", type: "system", time: new Date(), read: false },
  { title: "🍅 Tomato Price Alert", message: "Tomato prices up 18% today.", type: "price", time: new Date(Date.now() - 3600000), read: false },
  { title: "🌧️ Weather Alert", message: "Heavy rain expected in Tamil Nadu. Plan your harvest accordingly.", type: "weather", time: new Date(Date.now() - 7200000), read: true },
  { title: "🌾 MSP Update", message: "Govt announces new MSP. Rice: ₹2441/quintal, Wheat: ₹2585/quintal.", type: "system", time: new Date(Date.now() - 86400000), read: true },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    INITIAL_NOTIFICATIONS.map((n, i) => ({ ...n, id: `init_${i}` }))
  );
  const [location, setLocationState] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [language, setLanguageState] = useState<Language>("en");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dark = localStorage.getItem("agri_dark") === "true";
    if (dark) { setIsDark(true); document.body.classList.add("dark-mode"); }
    const lang = localStorage.getItem("agri_lang") as Language;
    if (lang) setLanguageState(lang);
    
    const storedState = localStorage.getItem("agri_state");
    const storedDistrict = localStorage.getItem("agri_district");
    if (storedState && storedDistrict) {
      const districts = STATE_DISTRICTS[storedState];
      const match = districts?.find(d => d.name === storedDistrict);
      if (match) {
        setLocationState({
          state: storedState,
          district: storedDistrict,
          lat: match.lat,
          lon: match.lon,
        });
      }
    }
    
    const storedNotif = localStorage.getItem("agri_notifications");
    if (storedNotif) {
      try {
        const parsed = JSON.parse(storedNotif);
        const parsedWithDates = parsed.map((n: any) => ({
          ...n,
          time: new Date(n.time)
        }));
        setNotifications(parsedWithDates);
      } catch (err) {
        console.error("Failed to parse stored notifications:", err);
      }
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded && typeof window !== "undefined") {
      localStorage.setItem("agri_notifications", JSON.stringify(notifications));
    }
  }, [notifications, hasLoaded]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("agri_dark", String(next));
  };

  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);
  const lastTriggeredTimeRef = useRef<Record<string, number>>({});

  const addNotification = useCallback((n: Omit<Notification, "id" | "time" | "read">) => {
    const now = Date.now();
    const lastTime = lastTriggeredTimeRef.current[n.type] || 0;
    
    // Cooldown of 3 minutes (180,000ms) per alert type to prevent spams
    if (now - lastTime < 180000) {
      console.log(`Notification of type "${n.type}" throttled to prevent spam.`);
      return;
    }
    
    lastTriggeredTimeRef.current[n.type] = now;
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [{ ...n, id, time: new Date(), read: false }, ...prev].slice(0, 25));
    setToast({ id, title: n.title, message: n.message, type: n.type });
    
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, 4000);
  }, []);

  // 1. Trigger single daily summary notification on mount
  useEffect(() => {
    if (typeof window === "undefined" || !hasLoaded) return;
    
    const timer = setTimeout(() => {
      addNotification({
        title: "📈 Daily Mandi Outlook",
        message: `Markets in ${location.state} are stable today. Overall price index is up 0.4%. Crop arrivals are normal.`,
        type: "system"
      });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [hasLoaded]);

  // 2. Trigger live weather advisory only when user's location changes (based on live cropImpact risk)
  useEffect(() => {
    if (typeof window === "undefined" || !hasLoaded) return;
    
    import("@/lib/weather").then(({ fetchWeather }) => {
      fetchWeather(location.lat, location.lon, location.district).then(w => {
        if (w.cropImpact === "High" || w.cropImpact === "Medium") {
          addNotification({
            title: `🌦️ Weather Alert: ${location.district}`,
            message: `${w.cropImpactNote} (Current: ${w.temperature}°C, ${w.condition})`,
            type: "weather"
          });
        }
      });
    });
  }, [location, hasLoaded, addNotification]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  const setLocation = (loc: LocationInfo) => {
    setLocationState(loc);
    localStorage.setItem("agri_state", loc.state);
    localStorage.setItem("agri_district", loc.district);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("agri_lang", lang);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{ isDark, toggleDark, notifications, toast, addNotification, markAllRead, markAsRead, clearNotifications, unreadCount, location, setLocation, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
