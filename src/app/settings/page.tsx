"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, type Language } from "@/lib/AppContext";
import { getCurrentUser, updateUserLocation, updatePortfolio, updateUserProfile, updateFarmProfile, type User } from "@/lib/auth";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/lib/locationData";
import { CROPS } from "@/lib/cropData";

const AVATARS = ["🌾", "🌱", "🚜", "🌻", "🥕", "🌿", "🍃", "🫘"];
const ROLES = ["Farmer", "Trader", "Agronomist", "Student", "Guest"];

const LABELS = {
  en: {
    title: "Account Settings",
    sub: "Configure your profile, location coordinates, crop preferences, and app options",
    profileSec: "Profile Information",
    nameLabel: "Your Name",
    roleLabel: "Your Role",
    avatarLabel: "Select Profile Avatar",
    locSec: "Farming Location",
    stateLabel: "State",
    districtLabel: "District",
    portfolioSec: "My Crops Portfolio",
    portfolioSub: "Select which crops you harvest or track",
    prefSec: "App Preferences",
    themeLabel: "Dark Mode Theme",
    langLabel: "System Language",
    saveBtn: "Save Settings",
    successMsg: "Settings updated successfully! 🟢",
    notLoggedIn: "Please sign in to access settings",
    signInBtn: "Go to Sign In",
  },
  ta: {
    title: "அமைப்புகள்",
    sub: "விவரக்குறிப்பு, இருப்பிடம், பயிர் விருப்பத்தேர்வுகள் மற்றும் பயன்பாட்டு விருப்பங்களை மாற்றியமைக்கவும்",
    profileSec: "சுயவிவர தகவல்",
    nameLabel: "உங்கள் பெயர்",
    roleLabel: "உங்கள் பணி",
    avatarLabel: "சுயவிவர படத்தை தேர்ந்தெடுக்கவும்",
    locSec: "விவசாய இருப்பிடம்",
    stateLabel: "மாநிலம்",
    districtLabel: "மாவட்டம்",
    portfolioSec: "என் பயிர்கள்",
    portfolioSub: "நீங்கள் கண்காணிக்கும் பயிர்களைத் தேர்ந்தெடுக்கவும்",
    prefSec: "பயன்பாட்டு விருப்பத்தேர்வுகள்",
    themeLabel: "டார்க் மோட் தீம்",
    langLabel: "மொழி",
    saveBtn: "அமைப்புகளைச் சேமிக்கவும்",
    successMsg: "அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன! 🟢",
    notLoggedIn: "அமைப்புகளை அணுக உள்நுழையவும்",
    signInBtn: "உள்நுழையவும்",
  },
  te: {
    title: "సెట్టింగులు",
    sub: "మీ ప్రొఫైల్, లొకేషన్, ప్రొఫైల్ అవతార్ మరియు యాప్ సెట్టింగులను కాన్ఫిగర్ చేయండి",
    profileSec: "ప్రొఫైల్ సమాచారం",
    nameLabel: "మీ పేరు",
    roleLabel: "మీ పాత్ర",
    avatarLabel: "ప్రొఫైల్ అవతార్ ఎంచుకోండి",
    locSec: "వ్యవసాయ స్థలం",
    stateLabel: "రాష్ట్రం",
    districtLabel: "జిల్లా",
    portfolioSec: "నా పంటల పోర్ట్‌ఫోలియో",
    portfolioSub: "మీరు పండించే లేదా ట్రాక్ చేసే పంటలను ఎంచుకోండి",
    prefSec: "యాప్ ప్రాధాన్యతలు",
    themeLabel: "డార్క్ మోడ్ థీమ్",
    langLabel: "యాప్ భాష",
    saveBtn: "సెట్టింగులను సేవ్ చేయండి",
    successMsg: "సెట్టింగులు విజయవంతంగా సేవ్ చేయబడ్డాయి! 🟢",
    notLoggedIn: "సెట్టింగులను మార్చడానికి లాగిన్ అవ్వండి",
    signInBtn: "లాగిన్ అవ్వండి",
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const { isDark, toggleDark, location, setLocation, language, setLanguage } = useApp();
  const [user, setUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("Farmer");
  const [selectedAvatar, setSelectedAvatar] = useState("🌾");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  // Farm Profile states
  const [landSize, setLandSize] = useState<number>(3);
  const [soilType, setSoilType] = useState<string>("Red Loamy");
  const [irrigationType, setIrrigationType] = useState<string>("Drip Irrigation");


  useEffect(() => {
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      setName(current.name);
      setRole(current.role || "Farmer");
      setSelectedAvatar(current.avatar || "🌾");
      setSelectedState(current.state || location.state);
            setSelectedDistrict(current.district || location.district);
      if (current.farmProfile) {
        setLandSize(current.farmProfile.landSize || 3);
        setSoilType(current.farmProfile.soilType || "Red Loamy");
        setIrrigationType(current.farmProfile.irrigationType || "Drip Irrigation");
      }
    } else {
      setSelectedState(location.state);
      setSelectedDistrict(location.district);
    }
  }, [location]);

  // Handle state change
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = STATE_DISTRICTS[stateName] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0].name);
    } else {
      setSelectedDistrict("");
    }
  };



  const handleSave = () => {
    if (user) {
      // 1. Update Profile (Name, Role, Avatar)
          updateUserProfile(user.email, name, role, selectedAvatar);
    updateUserLocation(user.email, selectedState, selectedDistrict);
    updateFarmProfile(user.email, {
      landSize,
      soilType,
      irrigationType,
      primaryCrops: user.portfolio || []
    });

      // 2. Update Location
      updateUserLocation(user.email, selectedState, selectedDistrict);


    }

    // 4. Update App Context location coordinates
    const districts = STATE_DISTRICTS[selectedState] || [];
    const match = districts.find(d => d.name === selectedDistrict);
    if (match) {
      setLocation({
        state: selectedState,
        district: selectedDistrict,
        lat: match.lat,
        lon: match.lon
      });
    }

    // 5. Show alert
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reload page to propagate changes to sidebar completely
      window.location.reload();
    }, 1500);
  };

  const L = LABELS[language] || LABELS.en;

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
        <div className="card" style={{ maxWidth: 400, width: "100%", textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{L.notLoggedIn}</div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/login")}>
            {L.signInBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20, borderRadius: 14 }}>
        <div>
          <div style={{ fontFamily: "Playfair Display,serif", fontSize: 22, fontWeight: 700 }}>{L.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{L.sub}</div>
        </div>
      </div>

      {showSuccess && (
        <div className="fade-in" style={{
          position: "fixed",
          top: 24,
          right: 24,
          background: "var(--primary-dark)",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(92, 122, 62, 0.3)",
          fontWeight: 700,
          fontSize: 14,
          zIndex: 9999,
          border: "1px solid var(--primary-light)"
        }}>
          {L.successMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Left Side: Profile & Location */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile Section */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              👤 {L.profileSec}
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {selectedAvatar}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.nameLabel}</label>
                <input className="input" style={{ width: "100%" }} value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>{L.avatarLabel}</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
                {AVATARS.map(av => (
                  <button key={av}
                    style={{
                      height: 40,
                      fontSize: 20,
                      background: selectedAvatar === av ? "var(--primary)" : "var(--bg-card)",
                      border: `1.5px solid ${selectedAvatar === av ? "var(--primary-dark)" : "var(--border)"}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    onClick={() => setSelectedAvatar(av)}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.roleLabel}</label>
              <select className="input" style={{ width: "100%" }} value={role} onChange={e => setRole(e.target.value)}>
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          
          {/* 👨‍🌾 Farm Profile Section */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              👨‍🌾 Personal Farm Profile
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                📐 Total Farm Land Area (Acres)
              </label>
              <input
                type="number"
                min={0.5}
                max={100}
                step={0.5}
                className="input"
                style={{ width: "100%", fontWeight: 700 }}
                value={landSize}
                onChange={e => setLandSize(parseFloat(e.target.value) || 1)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                🌱 Primary Soil Type
              </label>
              <select
                className="input"
                style={{ width: "100%", fontWeight: 600 }}
                value={soilType}
                onChange={e => setSoilType(e.target.value)}
              >
                <option value="Red Loamy">Red Loamy Soil</option>
                <option value="Black Cotton">Black Cotton Soil</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Clay Loam">Clay Loam Soil</option>
                <option value="Sandy Loam">Sandy Loam Soil</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                💧 Primary Irrigation System
              </label>
              <select
                className="input"
                style={{ width: "100%", fontWeight: 600 }}
                value={irrigationType}
                onChange={e => setIrrigationType(e.target.value)}
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Canal Irrigation">Canal Irrigation</option>
                <option value="Borewell / Pump">Borewell / Submersible Pump</option>
                <option value="Rainfed">Rainfed / Monsoon</option>
                <option value="Sprinkler">Sprinkler Irrigation</option>
              </select>
            </div>
          </div>

          {/* Location Section */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              📍 {L.locSec}
            </div>

            <div className="grid-cols-2-responsive" style={{ gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.stateLabel}</label>
                <select className="input" style={{ width: "100%" }} value={selectedState} onChange={e => handleStateChange(e.target.value)}>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.districtLabel}</label>
                <select className="input" style={{ width: "100%" }} value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
                  {(STATE_DISTRICTS[selectedState] || []).map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Crop Portfolio & App Preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Digital Profile Card / Badge */}
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px",
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
          }}>
            {/* Decorative background elements */}
            <div style={{ position: "absolute", right: -20, bottom: -20, fontSize: 120, opacity: 0.1, pointerEvents: "none" }}>🌾</div>
            
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              marginBottom: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}>
              {selectedAvatar}
            </div>
            
            <div style={{ fontSize: 20, fontWeight: 800, textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>{name || "User"}</div>
            <div style={{ fontSize: 13, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 12, marginTop: 6, fontWeight: 600 }}>
              {role === "Farmer" ? "👨‍🌾 Farmer" : role === "Trader" ? "💼 Trader" : role === "Agronomist" ? "🔬 Agronomist" : role === "Student" ? "🎓 Student" : "👤 Guest"}
            </div>
            
            <div style={{ display: "flex", gap: 16, marginTop: 20, width: "100%", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 14, fontSize: 12, justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ opacity: 0.8, fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Location</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{selectedDistrict}, {selectedState}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ opacity: 0.8, fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Language</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{{ en: "English", ta: "Tamil", te: "Telugu" }[language]}</div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              ⚙️ {L.prefSec}
            </div>

            {/* Dark Mode Theme */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{L.themeLabel}</label>
              <button className={`btn ${isDark ? "btn-primary" : "btn-secondary"}`}
                style={{
                  width: 60,
                  height: 30,
                  borderRadius: 15,
                  padding: "2px 4px",
                  display: "flex",
                  justifyContent: isDark ? "flex-end" : "flex-start",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onClick={toggleDark}
              >
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }} />
              </button>
            </div>

            {/* Language dropdown */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.langLabel}</label>
              <select className="input" style={{ width: "100%" }} value={language} onChange={e => setLanguage(e.target.value as Language)}>
                <option value="en">English 🇬🇧</option>
                <option value="ta">தமிழ் 🌸</option>
                <option value="te">తెలుగు 🌺</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button className="btn btn-primary"
            style={{ width: "100%", padding: 12, fontSize: 14, fontWeight: 700, justifyContent: "center", boxShadow: "var(--shadow)" }}
            onClick={handleSave}
          >
            💾 {L.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
