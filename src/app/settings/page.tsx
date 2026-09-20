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
  },
  kn: {
    title: "ಖಾತೆ ಸಂಯೋಜನೆಗಳು",
    sub: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್, ಸ್ಥಳ, ಬೆಳೆ ಆದ್ಯತೆಗಳು ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಆಯ್ಕೆಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ",
    profileSec: "ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ",
    nameLabel: "ನಿಮ್ಮ ಹೆಸರು",
    roleLabel: "ನಿಮ್ಮ ಪಾತ್ರ",
    avatarLabel: "ಪ್ರೊಫೈಲ್ ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
    locSec: "ಕೃಷಿ ಸ್ಥಳ",
    stateLabel: "ರಾಜ್ಯ",
    districtLabel: "ಜಿಲ್ಲೆ",
    portfolioSec: "ನನ್ನ ಬೆಳೆಗಳ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
    portfolioSub: "ನೀವು ಬೆಳೆಯುವ ಅಥವಾ ಟ್ರ್ಯಾಕ್ ಮಾಡುವ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    prefSec: "ಅಪ್ಲಿಕೇಶನ್ ಆದ್ಯತೆಗಳು",
    themeLabel: "ಡಾರ್ಕ್ ಮೋಡ್ ಥೀಮ್",
    langLabel: "ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ",
    saveBtn: "ಸಂಯೋಜನೆಗಳನ್ನು ಉಳಿಸಿ",
    successMsg: "ಸಂಯೋಜನೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ! 🟢",
    notLoggedIn: "ಸಂಯೋಜನೆಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ",
    signInBtn: "ಸೈನ್ ಇನ್‌ಗೆ ಹೋಗಿ",
  },
  ml: {
    title: "അക്കൗണ്ട് ക്രമീകരണങ്ങൾ",
    sub: "നിങ്ങളുടെ പ്രൊഫൈൽ, ലൊക്കേഷൻ, വിള മുൻഗണനകൾ എന്നിവ സജ്ജീകരിക്കുക",
    profileSec: "പ്രൊഫൈൽ വിവരങ്ങൾ",
    nameLabel: "നിങ്ങളുടെ പേര്",
    roleLabel: "നിങ്ങളുടെ ചുമതല",
    avatarLabel: "പ്രൊഫൈൽ ചിത്രം തിരഞ്ഞെടുക്കുക",
    locSec: "കാർഷിക സ്ഥലം",
    stateLabel: "സംസ്ഥാനം",
    districtLabel: "ജില്ല",
    portfolioSec: "എന്റെ വിളകൾ",
    portfolioSub: "നിങ്ങൾ കൃഷി ചെയ്യുന്ന വിളകൾ തിരഞ്ഞെടുക്കുക",
    prefSec: "ആപ്പ് മുൻഗണനകൾ",
    themeLabel: "ഡാർക്ക് മോഡ്",
    langLabel: "ആപ്പ് ഭാഷ",
    saveBtn: "ക്രമീകരണങ്ങൾ സംരക്ഷിക്കുക",
    successMsg: "ക്രമീകരണങ്ങൾ വിജയം! 🟢",
    notLoggedIn: "ലോഗിൻ ചെയ്യുക",
    signInBtn: "ലോഗിൻ",
  },
  hi: {
    title: "खाता सेटिंग्स",
    sub: "अपनी प्रोफ़ाइल, स्थान, फसल प्राथमिकताओं और ऐप विकल्पों को कॉन्फ़िगर करें",
    profileSec: "प्रोफ़ाइल जानकारी",
    nameLabel: "आपका नाम",
    roleLabel: "आपकी भूमिका",
    avatarLabel: "प्रोफ़ाइल अवतार चुनें",
    locSec: "कृषि स्थान",
    stateLabel: "राज्य",
    districtLabel: "ज़िला",
    portfolioSec: "मेरी फसलें पोर्टफोलियो",
    portfolioSub: "अपनी फसलें चुनें जिन्हें आप ट्रैक करते हैं",
    prefSec: "ऐप प्राथमिकताएं",
    themeLabel: "डार्क मोड थीम",
    langLabel: "सिस्टम भाषा",
    saveBtn: "सेटिंग्स सहेजें",
    successMsg: "सेटिंग्स सफलतापूर्वक अपडेट की गईं! 🟢",
    notLoggedIn: "सेटिंग्स के लिए साइन इन करें",
    signInBtn: "साइन इन करें",
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
      if (current.farmProfile) {
        setLandSize(current.farmProfile.landSize || 3);
        setSoilType(current.farmProfile.soilType || "Red Loamy");
        setIrrigationType(current.farmProfile.irrigationType || "Drip Irrigation");
      }
    }
    setSelectedState(location.state);
    setSelectedDistrict(location.district);
  }, [location.state, location.district]);

  // Handle state change with instant AppContext & localStorage sync
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = STATE_DISTRICTS[stateName] || [];
    const newDist = districts.length > 0 ? districts[0].name : "";
    setSelectedDistrict(newDist);

    if (newDist) {
      const match = districts.find(d => d.name === newDist);
      const newLoc = {
        state: stateName,
        district: newDist,
        lat: match ? match.lat : 9.9252,
        lon: match ? match.lon : 78.1198
      };
      setLocation(newLoc);
      try {
        localStorage.setItem("agri_state", stateName);
        localStorage.setItem("agri_district", newDist);
        localStorage.setItem("user_location", JSON.stringify(newLoc));
      } catch (e) {}
    }
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const districts = STATE_DISTRICTS[selectedState] || [];
    const match = districts.find(d => d.name === distName);
    const newLoc = {
      state: selectedState,
      district: distName,
      lat: match ? match.lat : 9.9252,
      lon: match ? match.lon : 78.1198
    };
    setLocation(newLoc);
    try {
      localStorage.setItem("agri_state", selectedState);
      localStorage.setItem("agri_district", distName);
      localStorage.setItem("user_location", JSON.stringify(newLoc));
    } catch (e) {}
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

    // 4. Update App Context location coordinates and localStorage
    const districts = STATE_DISTRICTS[selectedState] || [];
    const match = districts.find(d => d.name === selectedDistrict);
    const targetLat = match ? match.lat : 9.9252;
    const targetLon = match ? match.lon : 78.1198;

    const newLoc = {
      state: selectedState,
      district: selectedDistrict,
      lat: targetLat,
      lon: targetLon
    };

    setLocation(newLoc);
    try {
      localStorage.setItem("agri_state", selectedState);
      localStorage.setItem("agri_district", selectedDistrict);
      localStorage.setItem("user_location", JSON.stringify(newLoc));
    } catch (e) {}

    // 5. Show alert
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reload page to propagate changes to sidebar completely
      window.location.reload();
    }, 1500);
  };

  const L = LABELS[language as keyof typeof LABELS] || LABELS.en;

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
                <select className="input" style={{ width: "100%" }} value={selectedDistrict} onChange={e => handleDistrictChange(e.target.value)}>
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
                <div style={{ fontWeight: 700, marginTop: 2 }}>{{ en: "English", ta: "Tamil", te: "Telugu", kn: "Kannada", ml: "Malayalam", hi: "Hindi" }[language]}</div>
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
                <option value="en">English</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="hi">Hindi (हिंदी)</option>
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
