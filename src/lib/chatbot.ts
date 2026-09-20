export type Language = "en" | "ta" | "te" | "kn" | "ml" | "hi";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Language detection ─────────────────────────────────
export function detectLanguage(text: string): Language {
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

import { CROPS, type Crop } from "./cropData";

export function getChatbotResponse(message: string, forceLang?: Language): string {
  const lang = forceLang || detectLanguage(message);
  const q = message.toLowerCase().trim();

  // 1. Greetings & Introductions
  if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("namaste") || q.includes("வணக்கம்") || q.includes("நமஸ்தே") || q.includes("నమస్కారం") || q.includes("నమస్తే") || q.includes("ನಮಸ್ಕಾರ") || q.includes("നമസ്കാരം") || q.includes("नमस्ते")) {
    if (lang === "ta") return "👋 **வணக்கம்! நான் AgriBot 🌱**\n\nஉங்கள் விவசாய உதவியாளர். பயிர் சாகுபடி, சந்தை விலைகள், பூச்சி மேலாண்மை, அல்லது அரசு திட்டங்கள் குறித்து என்னிடம் கேளுங்கள்!";
    if (lang === "te") return "👋 **నమస్కారం! నేను AgriBot 🌱**\n\nమీ ఉచిత AI వ్యవసాయ సహాయకుడిని. పంటల సాగు, మార్కెట్ ధరలు, తెగుళ్ల నివారణ లేదా ప్రభుత్వ పథకాల గురించి అడగండి!";
    if (lang === "kn") return "👋 **ನಮಸ್ಕಾರ! ನಾನು AgriBot 🌱**\n\nನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಗಾರ. ಬೆಳೆ ಸಾಕುವುದು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಕೀಟ ನಿಯಂತ್ರಣ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ!";
    if (lang === "ml") return "👋 **നമസ്കാരം! ഞാൻ AgriBot 🌱**\n\nനിങ്ങളുടെ കാർഷിക സഹായി. വിള വളർത്തൽ, വിപണി വിലകൾ, കീട നിയന്ത്രണം എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ!";
    if (lang === "hi") return "👋 **नमस्कार! मैं AgriBot हूँ 🌱**\n\nआपका कृषि विशेषज्ञ। फसल बोने, बाजार भाव, कीट नियंत्रण और सरकारी योजनाओं के बारे में मुझसे पूछें!";
    return "👋 **Hello! I'm AgriBot 🌱**\n\nYour expert AI agriculture assistant. Ask me about crop choices, market price trends, pest control, fertilizer management, or government schemes in English or native Indian languages!";
  }

  // 2. Paddy / Rice Specific (Pests, Hopper, Blast, Yield)
  if (q.includes("paddy") || q.includes("rice") || q.includes("நெல்") || q.includes("வரி") || q.includes("భరి") || q.includes("ಅಕ್ಕಿ") || q.includes("നെല്ല്") || q.includes("धान") || q.includes("चावल")) {
    if (q.includes("pest") || q.includes("hopper") || q.includes("bph") || q.includes("borer") || q.includes("blast") || q.includes("disease") || q.includes("control") || q.includes("spray") || q.includes("பூச்சி") || q.includes("தெగులు") || q.includes("புழு")) {
      if (lang === "ta") return "🌾 **நெல் பூச்சி & நோய் மேலாண்மை (Brown Plant Hopper / Blast):**\n• **புகையான் (BPH) & குருத்துப்பூச்சி:** இலைகளின் அடியில் சாறு உறிஞ்சி பயிரை கருகச் செய்யும்.\n• **இயற்கை முறை:** வேப்ப எண்ணெய் 3% (30ml/L) தெளிக்கவும். அதிக நைட்ரஜன் உரங்களைத் தவிர்க்கவும்.\n• **இரசாயன முறை:** BPH பூச்சிக்கு Imidacloprid 17.8 SL @ 0.5ml/L அல்லது Dinotefuran 20% SG @ 0.4g/L தெளிக்கவும். குலை நோய்க்கு Tricyclazole 75% WP @ 0.6g/L தெளிக்கவும்.";
      if (lang === "te") return "🌾 **వరి తెగుళ్లు & పురుగుల నివారణ (సుడిదోమ / అగ్గితెగులు):**\n• **సుడిదోమ (BPH):** పిలకల మొదలులో రసాన్ని పీల్చి పైరును సుడి పడి ఎండిపోయేలా చేస్తుంది.\n• **సేంద్రీయ నివారణ:** వేప నూనె 3% (30మి.లీ/లీ) పిచికారీ చేయండి. నత్రజని ఎరువులను పరిమితంగా వాడండి.\n• **రసాయన నివారణ:** సుడిదోమకు ఇమిడాక్లోప్రిడ్ 0.5మి.లీ/లీ లేదా దినోటెఫురాన్ 0.4గ్రా/లీ పిచికారీ చేయండి. అగ్గితెగులుకు ట్రైసైక్లాజోల్ 0.6గ్రా/లీ వాడండి.";
      return "🌾 **Paddy / Rice Pest & Disease Advisory (BPH & Blast Control):**\n• **Brown Plant Hopper (BPH) & Stem Borer:** BPH feeds at the base of rice tillers causing 'hopper burn' wilting patches.\n• **Organic Prevention:** Alternate wetting and drying (AWD) irrigation; avoid dense planting; spray Neem Oil 3% (30ml/L).\n• **Chemical Control:** Spray Dinotefuran 20% SG @ 0.4g/L or Imidacloprid 17.8 SL @ 0.5ml/L targeting tiller bases. For Rice Blast disease, spray Tricyclazole 75% WP @ 0.6g/L.";
    }
  }

  // 3. Cotton Specific (Pink Bollworm, Aphids, Thrips)
  if (q.includes("cotton") || q.includes("பருத்தி") || q.includes("పత్తి") || q.includes("ಹತ್ತಿ") || q.includes("കപ്പാസ്") || q.includes("कपास")) {
    if (lang === "ta") return "☁️ **பருத்தி பூச்சி மேலாண்மை (இளஞ்சிவப்பு காய் புழு):**\n• **காய் புழு தடுப்பு:** ஏக்கருக்கு 10 லிங்காக்கர்ச்சி பொறிகளை வைக்கவும்.\n• **சாறு உறிஞ்சும் பூச்சிகள்:** வேப்ப எண்ணெய் 3% அல்லது Imidacloprid தெளிக்கவும்.";
    if (lang === "te") return "☁️ **పత్తి తెగుళ్ల నివారణ (గులాబీ రంగు కాయ తొలిచే పురుగు):**\n• **లింగాకర్షణ బుట్టలు:** ఎకరానికి 10 లింగాకర్షణ బుట్టలను (Pheromone traps) ఏర్పాటు చేయండి.\n• **రసం పీల్చే పురుగులు:** వేప నూనె 3% లేదా ఇమిడాక్లోప్రిడ్ పిచికారీ చేయండి.";
    return "☁️ **Cotton Pest & Disease Management (Pink Bollworm & Sucking Pests):**\n• **Pink Bollworm:** Install 10 pheromone traps per acre. Destroy infested rosetted flowers and dropped bolls daily.\n• **Sucking Pests (Aphids, Thrips, Jassids):** Spray Neem Oil 3% (30ml/L) or Flonicamid 50% WG @ 0.3g/L or Imidacloprid 17.8 SL @ 0.5ml/L.";
  }

  // 4. Tomato & Vegetable Advisory
  if (q.includes("tomato") || q.includes("vegetable") || q.includes("தக்காளி") || q.includes("காய்கறி") || q.includes("టమాటా") || q.includes("కూరగాయలు")) {
    if (lang === "ta") return "🍅 **தக்காளி நோய் மேலாண்மை (இலைக்கருகல் & வைரஸ்):**\n• **மஞ்சள் ஒட்டும் பொறிகள்:** ஏக்கருக்கு 15 பொறிகள் வைக்கவும்.\n• **நோய் தடுப்பு:** இலைக்கருகல் நோய்க்கு Copper Oxychloride @ 2.5g/L தெளிக்கவும்.";
    if (lang === "te") return "🍅 **టమాటా తెగుళ్ల నివారణ (మాడు తెగులు & వైరస్):**\n• **పసుపు జిగురు అట్టలు:** ఎకరానికి 15 అట్టలను ఏర్పాటు చేయండి.\n• **మాడు తెగులు నివారణ:** కాపర్ ఆక్సిక్లోరైడ్ 2.5గ్రా/లీ పిచికారీ చేయండి.";
    return "🍅 **Tomato & Vegetable Pest Management:**\n• **Fruit Borer & Leaf Miner:** Hang yellow/blue sticky traps (15/acre). Spray Bacillus thuringiensis (Bt) @ 2g/L.\n• **Blight & Leaf Curl:** Spray Copper Oxychloride 50% WP @ 2.5g/L or Mancozeb @ 2g/L for blight. Control whiteflies with Neem Oil to prevent leaf curl virus.";
  }

  // 5. General Pest & Disease Advisory
  if (q.includes("pest") || q.includes("disease") || q.includes("worm") || q.includes("spray") || q.includes("bugs") || q.includes("fungus") || q.includes("control") || q.includes("பூச்சி") || q.includes("நோய்") || q.includes("தெகுలు") || q.includes("పురుగు") || q.includes("कीट")) {
    if (lang === "ta") return "🛡️ **பொதுவான பூச்சி மேலாண்மை வழிகாட்டி:**\n1. **இயற்கை முறை:** மஞ்சள் ஒட்டும் பொறிகள் (15/ஏக்கர்) மற்றும் வேப்ப எண்ணெய் 3% தெளிக்கவும்.\n2. **பயிர் சுழற்சி:** ஒரே பயிரை தொடர்ந்து பயிரிடாமல் பயிர் சுழற்சி செய்யவும்.\n3. **உர மேலாண்மை:** அதிகப்படியான நைட்ரஜன் உரங்களைத் தவிர்க்கவும்.";
    if (lang === "te") return "🛡️ **సాధారణ తెగుళ్ల నివారణ చిట్కాలు:**\n1. **సేంద్రీయ పద్ధతి:** పసుపు జిగురు అట్టలు (15/ఎకరం) మరియు వేప నూనె 3% వాడండి.\n2. **పంట మార్పిడి:** ఒకే పొలంలో వరుసగా ఒకే రకమైన పంటను వేయకండి.\n3. **ఎరువులు:** మోతాదుకు మించి నత్రజని ఎరువులను వాడకండి.";
    return "🛡️ **General Crop Pest & Disease Prevention Guide:**\n1. **Sticky & Pheromone Traps:** Hang yellow/blue sticky traps (15/acre) to catch aphids, thrips, and whiteflies.\n2. **Neem Oil Organic Spray:** Spray Neem Oil 3% (3000 ppm) @ 30ml/L water in early morning.\n3. **Fungicide Spray:** For leaf spots/blight, spray Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 2.5g/L.\n4. **Crop Rotation:** Rotate cereal crops with pulse crops to break soil pest life cycles.";
  }

  // 6. Prices, MSP & Mandi Queries
  if (q.includes("price") || q.includes("rate") || q.includes("msp") || q.includes("mandi") || q.includes("market") || q.includes("விலை") || q.includes("மண்டி") || q.includes("ధర") || q.includes("మండి") || q.includes("భావ") || q.includes("भाव") || q.includes("मंडी")) {
    if (lang === "ta") return "📊 **சந்தை விலைகள் & MSP தகவல் (2026):**\n• **நெல் (அரிசி):** MSP ₹2,441/குவிண்டால்\n• **கோதுமை:** MSP ₹2,585/குவிண்டால்\n• **கடுகு:** MSP ₹6,200/குவிண்டால்\n• **பருத்தி:** MSP ₹8,267/குவிண்டால்\n\n💡 நேரடி சந்தை விலைகள் மற்றும் 30-நாள் கணிப்புகளுக்கு எங்கள் **Analytics** பக்கத்தை பார்க்கவும்!";
    if (lang === "te") return "📊 **మార్కెట్ ధరలు & MSP వివరాలు (2026):**\n• **వరి (వరి ధాన్యం):** MSP ₹2,441/క్వింటాల్\n• **గోధుమలు:** MSP ₹2,585/క్వింటాల్\n• **ఆవాలు:** MSP ₹6,200/క్వింటాల్\n• **పత్తి:** MSP ₹8,267/క్వింటాల్\n\n💡 ప్రత్యక్ష మార్కెట్ ధరల కోసం **Analytics** పేజీని వీక్షించండి!";
    return "📊 **Current Minimum Support Prices (MSP 2026-27):**\n• **Paddy (Rice):** ₹2,441 per quintal\n• **Wheat:** ₹2,585 per quintal\n• **Mustard:** ₹6,200 per quintal\n• **Cotton:** ₹8,267 per quintal\n• **Gram (Chana):** ₹5,875 per quintal\n\n💡 **Selling Advice:** Compare local Mandi prices on e-NAM before selling. If prices are below MSP, sell to FCI or NAFED procurement centers.";
  }

  // 7. Government Schemes
  if (q.includes("scheme") || q.includes("gov") || q.includes("pm-kisan") || q.includes("pmkisan") || q.includes("kcc") || q.includes("subsidy") || q.includes("திட்டம்") || q.includes("மானியம்") || q.includes("పథకం") || q.includes("సబ్సిడీ") || q.includes("योजना")) {
    if (lang === "ta") return "🏛️ **முக்கிய அரசு விவசாய திட்டங்கள்:**\n1. **PM-KISAN:** ஆண்டுக்கு ₹6,000 நேரடி வங்கி நிதி உதவி.\n2. **PMFBY:** பயிர் காப்பீட்டு திட்டம் (இயற்கை சீற்றங்கள் இழப்பீடு).\n3. **KCC (கிசான் கடன் அட்டை):** 4% குறைந்த வட்டியில் விவசாயக் கடன்.\n4. **PMKSY:** சொட்டு நீர் பாசனத்திற்கு 75%-100% மானியம்.";
    if (lang === "te") return "🏛️ **ముఖ్యమైన ప్రభుత్వ వ్యవసాయ పథకాలు:**\n1. **PM-KISAN:** సంవత్సరానికి ₹6,000 నేరుగా బ్యాంక్ ఖాతాలో జమ.\n2. **PMFBY:** పంట బీమా పథకం (ప్రకృతి వైపరీత్యాల పరిహారం).\n3. **KCC (కిసాన్ క్రెడిట్ కార్డ్):** 4% అతి తక్కువ వడ్డీకే వ్యవసాయ రుణాలు.\n4. **PMKSY:** బిందు సేద్య పరికరాలపై 75%-100% సబ్సిడీ.";
    return "🏛️ **Top Government Schemes for Indian Farmers:**\n1. **PM-KISAN:** Direct income benefit of ₹6,000/year in 3 equal installments.\n2. **PMFBY (Crop Insurance):** Premium is only 1.5% to 2% with full crop failure coverage.\n3. **Kisan Credit Card (KCC):** Short-term credit up to ₹3 Lakh at effectively 4% interest rate.\n4. **PMKSY (Drip Irrigation):** 75% to 100% subsidy for micro-irrigation installation.";
  }

  // 8. Specific Crop Search in Database
  const matchedCrop = CROPS.find(c =>
    q.includes(c.name.toLowerCase()) ||
    q.includes(c.nameTA.toLowerCase()) ||
    q.includes(c.nameTE.toLowerCase()) ||
    q.includes(c.id.toLowerCase())
  );

  if (matchedCrop) {
    if (lang === "ta") {
      return `🌾 **${matchedCrop.nameTA}** (${matchedCrop.category}):\n• **விளக்கம்:** ${matchedCrop.descTA}\n• **பருவம்:** ${matchedCrop.season}\n• **சந்தை விலை:** ₹${matchedCrop.basePrice}/குவிண்டால்\n• **MSP:** ${matchedCrop.msp > 0 ? `₹${matchedCrop.msp}/குவிண்டால்` : "சந்தை விலை"}\n• **உற்பத்தி மாநிலங்கள்:** ${matchedCrop.states.join(", ")}`;
    }
    if (lang === "te") {
      return `🌾 **${matchedCrop.nameTE}** (${matchedCrop.category}):\n• **వివరణ:** ${matchedCrop.descTE}\n• **సీజన్:** ${matchedCrop.season}\n• **మార్కెట్ ధర:** ₹${matchedCrop.basePrice}/క్వింటాల్\n• **MSP:** ${matchedCrop.msp > 0 ? `ఆర్కెట్ ఆధారితం` : "వర్తించదు"}\n• **ముఖ్య రాష్ట్రాలు:** ${matchedCrop.states.join(", ")}`;
    }
    return `🌾 **${matchedCrop.name}** (${matchedCrop.category} Crop):\n• **Overview:** ${matchedCrop.description}\n• **Cultivation Season:** ${matchedCrop.season}\n• **Current Market Price:** ₹${matchedCrop.basePrice} per ${matchedCrop.unit} (approx ₹${(matchedCrop.basePrice / 100).toFixed(2)}/kg)\n• **Govt Support (MSP):** ${matchedCrop.msp > 0 ? `₹${matchedCrop.msp} per ${matchedCrop.unit}` : "Market-driven (No MSP)"}\n• **Major Growing States:** ${matchedCrop.states.join(", ")}`;
  }

  // 9. Universal Helpful Fallback Response
  if (lang === "ta") {
    return `🌱 **அக்ரிபாட் விவசாய ஆலோசனை:**\nஉங்கள் கேள்வி குறித்து உதவி செய்ய இங்கே இருக்கிறேன்!\n\n• **பயிர் மேலாண்மை:** நெல், கோதுமை, பருத்தி, தக்காளி, வெங்காயம் மற்றும் கடுகு சாகுபடி பற்றிய வழிகாட்டுதல்கள்.\n• **சந்தை விலைகள்:** நேரடி மண்டி விலைகள் மற்றும் 30-நாள் முன்னறிவிப்புகளுக்கு **Analytics** பக்கத்தை பார்க்கவும்.\n• **அரசு திட்டங்கள்:** PM-KISAN, KCC கடன் மற்றும் பயிர் காப்பீட்டு விவரங்களை **Govt Schemes** பக்கத்தில் காணலாம்.`;
  }
  if (lang === "te") {
    return `🌱 **అగ్రిబాట్ వ్యవసాయ సలహా:**\nమీ ప్రశ్నకు సహాయపడటానికి ఇక్కడ ఉన్నాను!\n\n• **పంట యాజమాన్యం:** వరి, గోధుమలు, పత్తి, టమాటా మరియు ఆవాల సాగు సమాచారం.\n• **మార్కెట్ ధరలు:** ప్రత్యక్ష మండి ధరలు మరియు అంచనాల కోసం **Analytics** పేజీని చూడండి.\n• **ప్రభుత్వ పథకాలు:** PM-KISAN, KCC రుణాలు మరియు పంట బీమా వివరాలను **Govt Schemes** పేజీలో చూడండి.`;
  }
  if (lang === "kn") {
    return `🌱 **AgriBot ಕೃಷಿ ಸಲಹೆ:**\nಬೆಳೆಗಳ ಸಾಗಾಣಿಕೆ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಕೀಟ ನಿಯಂತ್ರಣ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿಗಾಗಿ AgriBot ನೊಂದಿಗೆ ಉಚಿತವಾಗಿ ಚಾಟ್ ಮಾಡಿ.`;
  }
  if (lang === "ml") {
    return `🌱 **AgriBot കാർഷിക ഉപദേശം:**\nതത്സമയ വില വിവരങ്ങൾക്കും മികച്ച കൃഷിരീതികൾക്കും AgriBot നോട് ചോദിക്കൂ.`;
  }
  if (lang === "hi") {
    return `🌱 **AgriBot कृषि सलाह:**\nफसलों की खेती, बाजार भाव, कीट नियंत्रण और सरकारी योजनाओं के लिए AgriBot से पूछें।`;
  }

  return `🌱 **AgriBot Farming Advisory:**\nI am here to assist you with your farming query!\n\n• **Crop Selection & Cultivation:** Paddy, Wheat, Cotton, Tomato, Mustard, Onion, and Pulses.\n• **Live Prices & Forecasts:** Check our **Analytics** tab for 30-day price trend predictions across Indian Mandis.\n• **Pest & Disease Control:** Organic Neem spray techniques and recommended fungicide/insecticide sprays.\n• **Government Schemes:** PM-KISAN ₹6,000 credit, Kisan Credit Card (KCC), and PMFBY crop insurance.`;
}

export function createMessage(role: "user" | "assistant", content: string): ChatMessage {
  return { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, role, content, timestamp: new Date() };
}

export const QUICK_PROMPTS: Record<Language, string[]> = {
  en: ["What crops to sell now?", "MSP prices list", "Pest control for paddy & cotton", "Government schemes for farmers", "Drip irrigation subsidy"],
  ta: ["இப்போது என்ன விற்பது?", "MSP விலை பட்டியல்", "நெல் பூச்சி மேலாண்மை", "விவசாயிகளுக்கான அரசு திட்டங்கள்"],
  te: ["ఇప్పుడు ఏమి అమ్మాలి?", "MSP ధరల జాబితా", "వరి తెగుళ్ల నివారణ", "రైతులకు ప్రభుత్వ పథకాలు"],
  kn: ["ಈಗ ಏನು ಮಾರಾಟ ಮಾಡಬೇಕು?", "MSP ಬೆಲೆ ಪಟ್ಟಿ", "ಕೀಟ ನಿಯಂತ್ರಣ", "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು"],
  ml: ["ഇപ്പോൾ ഏത് വിളകൾ വിൽക്കണം?", "MSP വില വിവരങ്ങൾ", "കീട നിയന്ത്രണം", "സർക്കാർ പദ്ധതികൾ"],
  hi: ["अब कौन सी फसल बेचें?", "एमएसपी मूल्य सूची", "कीट नियंत्रण उपाय", "सरकारी योजनाएं"]
};

export const LANG_LABELS: Record<Language, string> = {
  en: "English",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  hi: "Hindi (हिंदी)"
};
