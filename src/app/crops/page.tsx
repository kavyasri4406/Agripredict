"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CROPS, CATEGORIES, generatePriceHistory, generateForecast, getRecommendation, formatPrice, getLivePrice, getCropName, getCropDesc, getVarietyName, getVarietyDesc } from "@/lib/cropData";
import { fetchWeather } from "@/lib/weather";
import { useApp } from "@/lib/AppContext";
import { APP_TRANSLATIONS } from "@/lib/appTranslations";
import MandiComparison from "@/components/MandiComparison";
import type { WeatherData } from "@/lib/weather";

const LABELS = {
  en: { title: "Crops Market", greeting: "Good", morning: "Morning", afternoon: "Afternoon", evening: "Evening", livePrice: "Live Market Prices", weather: "Weather Details", aiRec: "AI Recommendation", action: "BUY", hold: "HOLD", sell: "SELL", viewForecast: "View Forecast", confidence: "Confidence", loading: "Loading..." },
  ta: { title: "பயிர் சந்தை", greeting: "வணக்கம்", morning: "காலை", afternoon: "மதியம்", evening: "மாலை", livePrice: "நேரடி சந்தை விலைகள்", weather: "வானிலை விவரங்கள்", aiRec: "AI பரிந்துரை", action: "வாங்க", hold: "தொடர்க", sell: "விற்க", viewForecast: "கணிப்பு பார்க்க", confidence: "நம்பகத்தன்மை", loading: "ஏற்றுகிறது..." },
  te: { title: "పంటల మార్కెట్", greeting: "నమస్కారం", morning: "ఉదయం", afternoon: "మధ్యాహ్నం", evening: "సాయంత్రం", livePrice: "లైవ్ మార్కెట్ ధరలు", weather: "వాతావరణ వివరాలు", aiRec: "AI సిఫారసు", action: "కొనండి", hold: "ఉంచండి", sell: "అమ్మండి", viewForecast: "అంచనా చూడండి", confidence: "నమ్మకం", loading: "లోడ్ అవుతోంది..." },
  kn: { title: "ಬೆಳೆ ಮಾರುಕಟ್ಟೆ", greeting: "ನಮಸ್ಕಾರ", morning: "ಬೆಳಿಗ್ಗೆ", afternoon: "ಮಧ್ಯಾಹ್ನ", evening: "ಸಂಜೆ", livePrice: "ಲೈವ್ ಬೆಲೆಗಳು", weather: "ಹವಾಮಾನ ವಿವರಗಳು", aiRec: "AI ಸಲಹೆ", action: "ಖರೀದಿಸಿ", hold: "ಇರಿಸಿಕೊಳ್ಳಿ", sell: "ಮಾರಿ", viewForecast: "ಮುನ್ಸೂಚನೆ", confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
  ml: { title: "വിള വിപണി", greeting: "നമസ്കാരം", morning: "പ്രഭാതം", afternoon: "ഉച്ചയ്ക്ക്", evening: "വൈകുന്നേരം", livePrice: "തത്സമയ വിലകൾ", weather: "കാലാവസ്ഥ", aiRec: "AI ഉപദേശം", action: "വാങ്ങുക", hold: "സൂക്ഷിക്കുക", sell: "വിൽക്കുക", viewForecast: "പ്രവചനം", confidence: "വിശ്വാസ്യത", loading: "ലോഡുചെയ്യുന്നു..." },
  hi: { title: "फसल बाज़ार", greeting: "नमस्ते", morning: "सुबह", afternoon: "दोपहर", evening: "शाम", livePrice: "लाइव बाज़ार दरें", weather: "मौसम विवरण", aiRec: "एआई सिफारिश", action: "खरीदें", hold: "होल्ड करें", sell: "बेचें", viewForecast: "पूर्वानुमान देखें", confidence: "विश्वसनीयता", loading: "लोड हो रहा है..." }
};

interface LiveCrop { id: string; name: string; emoji: string; image: string; price: number; prevPrice: number; change: number; flash: "up" | "down" | null; }

export default function CropsPage() {
  const router = useRouter();
  const { location, language } = useApp();
  const L = LABELS[language as keyof typeof LABELS] || LABELS.en;
  const T = APP_TRANSLATIONS[language] || APP_TRANSLATIONS.en;
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [liveCrops, setLiveCrops] = useState<LiveCrop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);
  const [selectedVariety, setSelectedVariety] = useState<any | null>(null);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getRecommendation> | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "mandi" | "varieties">("grid");

  const getCategoryName = (cat: string) => {
    const tl: any = {
      ta: { "Cereals": "தானியங்கள்", "Vegetables": "காய்கறிகள்", "Fruits": "பழங்கள்", "Oilseeds": "எண்ணெய் வித்துக்கள்", "Pulses": "பருப்பு வகைகள்", "Spices": "மசாலா", "Cash Crops": "பணப்பயிர்கள்" },
      te: { "Cereals": "ధాన్యాలు", "Vegetables": "కూరగాయలు", "Fruits": "పండ్లు", "Oilseeds": "నూనె గింజలు", "Pulses": "పప్పులు", "Spices": "సుగంధ ద్రవ్యాలు", "Cash Crops": "వాణిజ్య పంటలు" },
      kn: { "Cereals": "ಧಾನ್ಯಗಳು", "Vegetables": "ತರಕಾರಿಗಳು", "Fruits": "ಹಣ್ಣುಗಳು", "Oilseeds": "ಎಣ್ಣೆಕಾಳುಗಳು", "Pulses": "ಬೇಳೆಕಾಳುಗಳು", "Spices": "ಮಸಾಲೆಗಳು", "Cash Crops": "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು" },
      ml: { "Cereals": "ധാന്യങ്ങൾ", "Vegetables": "പച്ചക്കറികൾ", "Fruits": "പഴങ്ങൾ", "Oilseeds": "എണ്ണക്കുരുക്കൾ", "Pulses": "പയറുവർഗ്ഗങ്ങൾ", "Spices": "സുഗന്ധവ്യഞ്ജനങ്ങൾ", "Cash Crops": "നാണ്യവിളകൾ" },
      hi: { "Cereals": "अनाज", "Vegetables": "सब्जियां", "Fruits": "फल", "Oilseeds": "तिलहन", "Pulses": "दालें", "Spices": "मसाले", "Cash Crops": "नकदी फसलें" }
    };
    return (tl[language] && tl[language][cat]) || cat;
  };


  // Init live prices
  useEffect(() => {
    setLiveCrops(CROPS.map(c => ({ id: c.id, name: c.name, emoji: c.emoji, image: c.image, price: c.basePrice, prevPrice: c.basePrice, change: 0, flash: null })));
  }, []);

  // Live price ticker every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCrops(prev => {
        const nextCrops = prev.map(lc => {
          const crop = CROPS.find(c => c.id === lc.id)!;
          const newPrice = getLivePrice(crop);
          const priceDiff = newPrice - lc.price;
          const changePercent = (priceDiff / lc.price) * 100;
          const flash = (priceDiff > 0 ? "up" : priceDiff < 0 ? "down" : null) as "up" | "down" | null;
          return { ...lc, prevPrice: lc.price, price: newPrice, change: changePercent, flash };
        });

        return nextCrops;
      });
      setTick(t => t + 1);
      setTimeout(() => setLiveCrops(prev => prev.map(lc => ({ ...lc, flash: null }))), 700);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather
  useEffect(() => {
    setWeatherLoading(true);
    fetchWeather(location.lat, location.lon, location.district).then(w => { setWeather(w); setWeatherLoading(false); });
  }, [location]);

  // Build recommendation
  useEffect(() => {
    const hist = generatePriceHistory(selectedCrop);
    const fc = generateForecast(selectedCrop, hist[hist.length - 1].price);
    setRecommendation(getRecommendation(selectedCrop, hist, fc));
  }, [selectedCrop]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? L.morning : hour < 17 ? L.afternoon : L.evening;

  const actionColor = (action: string) => ({ BUY: "#15803D", SELL: "#B91C1C", HOLD: "#92400E" }[action] || "#92400E");
  const actionBg = (action: string) => ({ BUY: "#DCFCE7", SELL: "#FEE2E2", HOLD: "#FEF9C3" }[action] || "#FEF9C3");

  const getReason = (rec: ReturnType<typeof getRecommendation>) => {
    if (language === "ta") return rec.reasonTA;
    if (language === "te") return rec.reasonTE;
    return rec.reason;
  };

  const filteredLiveCrops = liveCrops.filter(lc => {
    const crop = CROPS.find(c => c.id === lc.id)!;
    const matchesCategory = activeCategory === "All" || crop.category === activeCategory;
    const name = (language === "ta" ? crop.nameTA : language === "te" ? crop.nameTE : crop.name).toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
            {L.title} 🌾
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            📍 {location.district}, {location.state} · {L.greeting}, {greeting}!
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 4, background: "var(--accent)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                background: viewMode === "grid" ? "var(--primary)" : "transparent",
                color: viewMode === "grid" ? "#fff" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              🌾 All Crops
            </button>
            <button
              onClick={() => setViewMode("mandi")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                background: viewMode === "mandi" ? "var(--primary)" : "transparent",
                color: viewMode === "mandi" ? "#fff" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              🏢 Mandi Comparison
            </button>
            <button
              id="tab-crop-varieties"
              onClick={() => setViewMode("varieties")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                background: viewMode === "varieties" ? "var(--primary)" : "transparent",
                color: viewMode === "varieties" ? "#fff" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              ✨ {language === "ta" ? "பயிர் ரகங்கள்" : language === "te" ? "పంట రకాలు" : language === "hi" ? "किस्में (Varieties)" : "Crop Varieties"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--accent)", padding: "6px 14px", borderRadius: 99, border: "1px solid var(--border)" }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>LIVE TICKER</span>
          </div>
          <select id="select-crop-crops" className="input responsive-select-dropdown" style={{ paddingRight: 36 }}
            value={selectedCrop.id} onChange={e => {
              const found = CROPS.find(c => c.id === e.target.value) || CROPS[0];
              setSelectedCrop(found);
              setSelectedVariety(null);
            }}>
            {CATEGORIES.filter(cat => cat !== "All").map(category => (
              <optgroup key={category} label={getCategoryName(category)}>
                {CROPS.filter(c => c.category === category).map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {selectedCrop.varieties && selectedCrop.varieties.length > 0 && (
            <select
              id="select-variety-crops"
              className="input responsive-select-dropdown" style={{ paddingRight: 36, borderColor: "var(--primary)" }}
              value={selectedVariety?.id || "all"}
              onChange={e => {
                const val = e.target.value;
                if (val === "all") setSelectedVariety(null);
                else {
                  const v = selectedCrop.varieties?.find(v => v.id === val);
                  setSelectedVariety(v || null);
                }
              }}
            >
              <option value="all">✨ {language === "hi" ? "सभी किस्में (All Varieties)" : "All Varieties"}</option>
              {selectedCrop.varieties.map(v => (
                <option key={v.id} value={v.id}>
                  {getVarietyName(v, language)} (₹{v.pricePerKg}/kg)
                </option>
              ))}
            </select>
          )}

        </div>
      </div>

      <div className="page-content">
                {viewMode === "varieties" ? (
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                ✨ {language === "ta" ? "இந்திய பயிர் ரகங்கள் மற்றும் வகைகள்" : language === "te" ? "భారతీయ పంట రకాలు" : language === "hi" ? "भारतीय फसल की प्रमुख किस्मों का विवरण" : "Indian Crop Varieties & Cultivars"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {language === "ta" ? "ஒவ்வொரு பயிரின் சிறந்த ரகங்கள், சந்தை விலைகள் மற்றும் விளைச்சல் பகுதிகள்" :
                 language === "te" ? "ప్రతి పంట యొక్క ప్రముఖ రకాలు, మార్కెట్ ధరలు మరియు ఉత్పత్తులు" :
                 language === "hi" ? "फल, सब्जी और फसलों की प्रमुख क्षेत्रीय किस्मों की दरें, उत्पत्ति और विशेषताएं" :
                 "Select a crop below to explore famous regional varieties, market rates, and harvest traits."}
              </div>
            </div>

            {/* Crop Selector Bar */}
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 24 }}>
              {CROPS.filter(c => c.varieties && c.varieties.length > 0).map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCrop(c)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 99,
                    border: selectedCrop.id === c.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                    background: selectedCrop.id === c.id ? "var(--primary-glow)" : "var(--bg-card)",
                    color: selectedCrop.id === c.id ? "var(--primary)" : "var(--text)",
                    fontWeight: selectedCrop.id === c.id ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{getCropName(c, language)}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>({c.varieties?.length})</span>
                </button>
              ))}
            </div>

            {/* Selected Crop Varieties Detail */}
            {selectedCrop.varieties && selectedCrop.varieties.length > 0 ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{selectedCrop.emoji}</span>
                  <span>{getCropName(selectedCrop, language)} — {selectedCrop.varieties.length} {language === "hi" ? "किस्में उपलब्ध हैं" : "Varieties Available"}</span>
                </div>

                <div className="grid-cols-3-responsive" style={{ gap: 16 }}>
                  {selectedCrop.varieties.map(v => {
                    const isSelected = selectedVariety?.id === v.id;
                    return (
                    <div key={v.id}
                      onClick={() => {
                        setSelectedVariety(isSelected ? null : v);
                        setViewMode("grid");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{
                        background: isSelected ? "var(--primary-glow)" : "var(--accent)",
                        borderRadius: 14,
                        padding: "18px",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                        boxShadow: isSelected ? "0 4px 14px rgba(16,185,129,0.2)" : "0 4px 12px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>
                            {getVarietyName(v, language)}
                          </div>
                          <div style={{ fontSize: 11, background: "var(--bg-card)", color: "var(--primary)", border: "1px solid var(--border)", fontWeight: 700, padding: "4px 9px", borderRadius: 8 }}>
                            📍 {v.originState}
                          </div>
                        </div>

                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                          {getVarietyDesc(v, language)}
                        </div>
                      </div>

                      <div style={{ paddingTop: 12, borderTop: "1px dashed var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            {v.mandiPricePerKg ? (
                              <>
                                <div style={{ fontSize: 10.5, color: "#10B981", fontWeight: 800, textTransform: "uppercase" }}>
                                  🏢 Mandi Wholesale: ₹{v.mandiPricePerKg}/kg (₹{v.mandiPricePerQuintal?.toLocaleString('en-IN')}/q)
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                                  🏪 Retail Market: ₹{v.pricePerKg}/kg (₹{v.pricePerQuintal.toLocaleString('en-IN')}/q)
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                                  {language === "ta" ? "சந்தை விலை" : language === "te" ? "మార్కెట్ ధర" : language === "hi" ? "बाज़ार भाव" : "Market Rate"}
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                                  ₹{v.pricePerKg}<span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>/kg</span>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}> (₹{v.pricePerQuintal.toLocaleString('en-IN')}/q)</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div style={{ fontSize: 11, background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                            🗓️ {v.season}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                Select a crop above to view its varieties.
              </div>
            )}
          </div>
        ) : viewMode === "mandi" ? (
          <MandiComparison initialCropId={selectedCrop.id} />
        ) : (
          <>
            {/* Top stats */}
        <div className="grid-cols-4-responsive" style={{ gap: 14, marginBottom: 22 }}>
          {[
            { icon: "🌾", label: language === "ta" ? "மொத்த பயிர்கள்" : language === "te" ? "మొత్తం పంటలు" : "Total Crops", value: CROPS.length, sub: T.trackedNationwide },
            { icon: "💰", label: language === "ta" ? "தற்போதைய விலை" : language === "te" ? "ప్రస్తుత ధర" : "Current Price", value: selectedVariety ? (selectedVariety.mandiPricePerKg ? `₹${selectedVariety.mandiPricePerKg} - ₹${selectedVariety.pricePerKg}/kg` : `₹${selectedVariety.pricePerKg}/kg`) : formatPrice(liveCrops.find(l => l.id === selectedCrop.id)?.price || selectedCrop.basePrice), sub: selectedVariety ? (selectedVariety.mandiPricePerKg ? `Wholesale Mandi: ₹${selectedVariety.mandiPricePerKg}/kg | Retail: ₹${selectedVariety.pricePerKg}/kg` : `${getVarietyName(selectedVariety, language)} (₹${selectedVariety.pricePerQuintal.toLocaleString("en-IN")}/quintal)`) : `${getCropName(selectedCrop, language)} / ${selectedCrop.unit}${selectedCrop.unit === "quintal" ? ` (${formatPrice((liveCrops.find(l => l.id === selectedCrop.id)?.price || selectedCrop.basePrice) / 100)}/kg)` : ""}` },
            { icon: "📈", label: language === "ta" ? "MSP விலை" : language === "te" ? "MSP ధర" : "MSP Price", value: selectedCrop.msp > 0 ? formatPrice(selectedCrop.msp) : "—", sub: selectedCrop.msp > 0 ? T.govtMinimum : "No MSP" },
            { icon: "🌦️", label: language === "ta" ? "வானிலை" : language === "te" ? "వాతావరణం" : "Weather", value: weather ? `${weather.temperature}°C` : "—", sub: weather?.condition || location.district },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 4, lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="split-layout-2col" style={{ gap: 18, marginBottom: 22 }}>
          {/* AI Recommendation */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, backgroundImage: `url(${selectedCrop.image})`, backgroundPosition: "center", backgroundSize: "cover", borderRadius: 12, overflow: "hidden", flexShrink: 0, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--accent)" }}>
                <img src={selectedCrop.image} alt={selectedCrop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Playfair Display,serif", fontSize: 17, fontWeight: 700 }}>{L.aiRec}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedCrop.emoji} {selectedVariety ? `${getVarietyName(selectedVariety, language)} (${selectedCrop.name})` : getCropName(selectedCrop, language)} · {selectedCrop.category}
                </div>
              </div>
              {recommendation && (
                <div style={{ background: actionBg(recommendation.action), color: actionColor(recommendation.action), padding: "8px 18px", borderRadius: 99, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                  {recommendation.action}
                </div>
              )}
            </div>

            {recommendation && (
              <>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, marginBottom: 14 }}>{getReason(recommendation)}</p>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                    <span>{L.confidence}</span>
                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>{recommendation.confidence}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${recommendation.confidence}%` }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div className="card-sm" style={{ flex: 1, minWidth: 100, textAlign: "center", background: recommendation.priceChange > 0 ? "#F0FDF4" : "#FFF1F2", border: `1px solid ${recommendation.priceChange > 0 ? "#BBF7D0" : "#FECDD3"}` }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{T.forecast30Day}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: recommendation.priceChange > 0 ? "#15803D" : "#B91C1C" }}>
                      {recommendation.priceChange > 0 ? "↑" : "↓"} {Math.abs(recommendation.priceChange).toFixed(1)}%
                    </div>
                  </div>
                  <div className="card-sm" style={{ flex: 1, minWidth: 100, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{T.cropImpact}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: weather?.cropImpact === "High" ? "#B91C1C" : weather?.cropImpact === "Medium" ? "#92400E" : "#15803D" }}>
                      {weather?.cropImpact || "Low"} Risk
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: "center", marginLeft: "auto" }} onClick={() => router.push(`/crop/${selectedCrop.id}`)}>
                    {L.viewForecast} ↗
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Weather card */}
          <div>
            {weatherLoading ? (
              <div className="card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="animate-pulse" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🌤️</div>
                  <div style={{ fontSize: 13 }}>{L.loading}</div>
                </div>
              </div>
            ) : weather && (
              <div className="weather-card" style={{ height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>📍 {weather.city}</div>
                    <div className="weather-temp">{weather.temperature}°C</div>
                    <div className="weather-condition">{weather.icon} {weather.condition}</div>
                  </div>
                  <div style={{ fontSize: 52 }}>{weather.icon}</div>
                </div>
                <div className="grid-cols-2-responsive" style={{ gap: 10, marginTop: 16, position: "relative", zIndex: 1 }}>
                  {[
                    { label: T.humidity, value: `${weather.humidity}%` },
                    { label: "Wind", value: `${weather.windspeed} km/h` },
                    { label: T.weatherRisk, value: weather.cropImpact },
                    { label: "Soil Moisture", value: `${weather.soilMoistureIndex}%` },
                  ].map(item => (
                    <div key={item.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px" }}>
                      <div style={{ fontSize: 10, opacity: 0.65 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {weather.cropImpactNote && (
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, opacity: 0.9, position: "relative", zIndex: 1 }}>
                    ⚡ {weather.cropImpactNote}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live crop price grid */}
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="section-title">{L.livePrice}</div>
            <div className="section-sub">
              {language === "ta" ? "ஒவ்வொரு 12 வினாடிகளிலும் புதுப்பிக்கப்படுகிறது" : language === "te" ? "ప్రతి 12 సెకన్లకు అప్‌డేట్ అవుతుంది" : "Updates every 12 seconds • All prices in ₹/unit"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <span className="live-dot" /><span>Live Ticker</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card" style={{ marginBottom: 18, padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div className="input-group" style={{ flex: "1 1 240px", maxWidth: "340px" }}>
              <span className="input-group-icon">🔍</span>
              <input 
                id="search-all-crops" 
                className="input" 
                placeholder={language === "ta" ? "பயிர்களைத் தேடு..." : language === "te" ? "పంటలను వెతకండి..." : "Search crops..."} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, flex: "2 1 auto", justifyContent: "flex-end" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  id={`tab-crops-${cat.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 99,
                    fontSize: 13,
                    border: "1.5px solid var(--border)",
                    background: activeCategory === cat ? "var(--primary)" : "var(--bg-card)",
                    color: activeCategory === cat ? "#fff" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}
                >
                  {cat === "All" ? (language === "ta" ? "அனைத்தும்" : language === "te" ? "అన్నీ" : "All Crops") : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {CATEGORIES.filter(cat => cat !== "All" && (activeCategory === "All" || activeCategory === cat)).map(category => {
            const categoryCrops = filteredLiveCrops.filter(lc => CROPS.find(c => c.id === lc.id)?.category === category);
            if (categoryCrops.length === 0) return null;
            
            return (
              <div key={category} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "var(--text)", paddingBottom: 6, borderBottom: "2px solid var(--border)" }}>
                  {getCategoryName(category)}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {categoryCrops.map(lc => {
                    const crop = CROPS.find(c => c.id === lc.id)!;
                    const isUp = lc.change >= 0;
                    return (
                      <div key={lc.id} id={`crop-card-${lc.id}`}
                        className={`crop-card ${lc.flash === "up" ? "flash-green" : lc.flash === "down" ? "flash-red" : ""}`}
                        onClick={() => router.push(`/crop/${lc.id}`)}>
                        <div className="crop-card-img">
                          <img src={lc.image} alt={lc.name}
                            onError={e => { const t = e.target as HTMLImageElement; t.style.display = "none"; if (t.parentElement) { t.parentElement.style.fontSize = "48px"; t.parentElement.textContent = crop.emoji; } }} />
                        </div>
                        <div className="crop-card-body">
                          <div className="crop-card-category">{getCategoryName(crop.category)}</div>
                          <div className="crop-card-name">{language === "ta" ? crop.nameTA : language === "te" ? crop.nameTE : crop.name}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                            <div>
                              <div className="crop-card-price">{formatPrice(lc.price)}</div>
                              <div className="crop-card-unit">per {crop.unit}{crop.unit === "quintal" ? ` (${formatPrice(lc.price / 100)}/kg)` : ""}</div>
                            </div>
                            <div style={{ color: isUp ? "#15803D" : "#B91C1C", fontSize: 12, fontWeight: 700, textAlign: "right" }}>
                              {isUp ? "▲" : "▼"} {Math.abs(lc.change).toFixed(2)}%
                            </div>
                          </div>
                          {crop.msp > 0 && (
                            <div style={{ marginTop: 6, fontSize: 11, color: lc.price >= crop.msp ? "#15803D" : "#B91C1C", fontWeight: 600 }}>
                              MSP: {formatPrice(crop.msp)} {lc.price >= crop.msp ? "✓" : "⚠️ Below MSP"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-day weather forecast */}
        {weather && weather.forecast.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🗓️ 7-Day Weather Forecast — {weather.city}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {weather.forecast.slice(0, 7).map((day, i) => (
                <div key={day.date} style={{ textAlign: "center", padding: "10px 6px", background: i === 0 ? "var(--accent)" : "transparent", borderRadius: 10, border: i === 0 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{i === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
                  <div style={{ fontSize: 22, margin: "4px 0" }}>
                    {day.condition.toLowerCase().includes("rain") ? "🌧️" : day.condition.toLowerCase().includes("cloud") ? "⛅" : day.condition.toLowerCase().includes("thunder") ? "⛈️" : "☀️"}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{day.maxTemp}°</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{day.minTemp}°</div>
                  {day.precipitation > 1 && <div style={{ fontSize: 10, color: "#3B82F6", marginTop: 2 }}>💧{day.precipitation}mm</div>}
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
