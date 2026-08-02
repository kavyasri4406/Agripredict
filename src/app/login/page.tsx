"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/auth";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/lib/locationData";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    state: "Tamil Nadu",
    district: "Chennai",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Update district when state changes
  const handleStateChange = (stateName: string) => {
    const districts = STATE_DISTRICTS[stateName] || [];
    const firstDistrict = districts[0]?.name || "";
    setForm(f => ({ ...f, state: stateName, district: firstDistrict }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (mode === "login") {
      const res = login(form.email, form.password);
      if (res.success) {
        // Save defaults in localStorage on login if not set
        const currentUser = typeof window !== "undefined" ? localStorage.getItem("agri_current_user") : null;
        if (currentUser) {
          const userObj = JSON.parse(currentUser);
          if (userObj.state && userObj.district) {
            localStorage.setItem("agri_state", userObj.state);
            localStorage.setItem("agri_district", userObj.district);
          }
        }
        router.push("/");
      }
      else setError(res.error || "Login failed");
    } else {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError("Please fill all fields");
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const res = register(form.name, form.email, form.password, form.state, form.district);
      if (res.success) {
        login(form.email, form.password);
        localStorage.setItem("agri_state", form.state);
        localStorage.setItem("agri_district", form.district);
        router.push("/");
      } else {
        setError(res.error || "Registration failed");
      }
    }
    setLoading(false);
  };

  const districts = STATE_DISTRICTS[form.state] || [];

  return (
    <div className="login-page">
      {/* Decorative crop emojis */}
      <div style={{ position: "absolute", fontSize: 80, opacity: 0.06, top: 40, left: 60, userSelect: "none" }}>🌾</div>
      <div style={{ position: "absolute", fontSize: 60, opacity: 0.05, bottom: 80, right: 80, userSelect: "none" }}>🌱</div>
      <div style={{ position: "absolute", fontSize: 50, opacity: 0.04, top: "50%", right: "20%", userSelect: "none" }}>🍅</div>

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 26, fontWeight: 700, color: "var(--text)" }}>AgriPredict</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 4 }}>
            {mode === "login" ? "Welcome back, Farmer 🙏" : "Join 10,000+ smart farmers"}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg)", borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} id={`tab-${m}`}
              onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px 0", background: mode === m ? "var(--bg-card)" : "transparent", color: mode === m ? "var(--primary)" : "var(--text-muted)", border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: "pointer", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Your Name</label>
              <input id="input-name" className="input" type="text" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Email Address</label>
            <input id="input-email" className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Password</label>
            <input id="input-password" className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} required />
          </div>

          {mode === "register" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>📍 State</label>
                <select id="input-state" className="input" value={form.state} onChange={e => handleStateChange(e.target.value)}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>🏙️ District</label>
                <select id="input-district" className="input" value={form.district} onChange={e => set("district", e.target.value)}>
                  {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 14 }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <button id="btn-submit" className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: 6, background: "var(--primary)" }}>
            {loading
              ? <><span className="animate-pulse">⏳</span> Please wait...</>
              : mode === "login" ? "Sign In →" : "Create Account →"
            }
          </button>
        </form>

        {/* Demo hint */}
        {mode === "login" && (
          <div style={{ marginTop: 18, padding: 13, background: "var(--accent)", borderRadius: 10, fontSize: 12.5, color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--primary)" }}>💡 New here?</strong> Click "Register" to create a free account with your state and district.
          </div>
        )}

        {/* Features reminder */}
        {mode === "register" && (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["🌾 Live Prices", "🌦️ Weather", "🤖 AI Chatbot", "📊 Analytics"].map(f => (
              <div key={f} style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>{f}</div>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
          {mode === "login" ? "No account? " : "Already a member? "}
          <button style={{ color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create one free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
