export type Language = "en" | "ta" | "te";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Language detection ─────────────────────────────────
export function detectLanguage(text: string): Language {
  // Tamil Unicode range: U+0B80–U+0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  // Telugu Unicode range: U+0C00–U+0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  return "en";
}

// ── Response databases ─────────────────────────────────
const responses: Record<Language, Record<string, string>> = {
  en: {
    mango_fly: "🥭 **Mango Fruit Fly & Worm Management:**\n• **Symptoms:** Maggots feeding inside small/ripe mangoes causing rot and premature drop.\n• **Organic Control:** Install methyl eugenol pheromone traps (10/acre). Collect and destroy fallen fruits daily. Spray Neem Oil 3%.\n• **Chemical Control:** Spray Malathion @ 2ml/L or apply bait spray with jaggery + Malathion.",
    nellore_mandi: "🚛 **Nellore Mandi Price Drop Advisory:**\n• **Risk:** High moisture levels (due to coastal rains/cyclones) cause up to 15-20% price depreciation at Nellore Mandi.\n• **Mitigation:** Dry grains below 12% moisture. Store in certified warehouses under PM-Warehouse scheme, or use e-NAM portal to compare and trade directly with Guntur Mandi (+10% price premium) or Chennai Koyambedu.",
    hello: "Hello! I'm AgriBot 🌱 Your AI agriculture assistant. Ask me about crop prices, weather impacts, best practices, market predictions, or government schemes!",
    hi: "Hi there! 👋 I'm AgriBot, here to help with all your crop and market queries. What would you like to know today?",
    namaste: "Namaste! 🙏 I'm AgriBot, your farming assistant. Ask me about any crop, price, or market advice!",
    price: "Crop prices depend on:\n1️⃣ MSP (Govt minimum price)\n2️⃣ Weather & rainfall\n3️⃣ Demand & Supply\n4️⃣ Transport costs\n5️⃣ Festive season\n\nCheck our Analytics page for detailed price trends!",
    msp: "📋 Current MSP (2026-27):\n• Wheat: ₹2,585/quintal\n• Rice: ₹2,441/quintal\n• Gram: ₹5,875/quintal\n• Mustard: ₹6,200/quintal\n• Cotton: ₹8,267/quintal\n• Soybean: ₹5,708/quintal\n\nIf market price falls below MSP, FCI buys at MSP price.",
    sell: "📊 When to sell? Follow this:\n1. Compare current price vs 30-day average\n2. If forecast shows drop → sell now\n3. If price is above MSP and rising → wait\n4. Before festive season → prices usually rise\n5. After heavy rain → sell quickly to avoid damage\n\nCheck the Forecast page for your specific crop!",
    weather: "🌦️ Weather impacts on crop prices:\n• Heavy rain during harvest → reduces quality → price spikes\n• Drought → lower yield → prices rise\n• Good monsoon → good harvest → prices may fall\n\nCheck the Weather section in the Dashboard for live updates!",
    rice: "🌾 Rice (Paddy) Guide:\n• Sow: June-July (Kharif)\n• Harvest: October-November\n• MSP: ₹2,441/quintal\n• Water needed: 1200-2000mm\n• Major diseases: Blast, BPH\n• Key states: WB, Punjab, AP, TN",
    wheat: "🌿 Wheat Guide:\n• Sow: October-November (Rabi)\n• Harvest: March-April\n• MSP: ₹2,585/quintal\n• Water: 450-650mm (5-6 irrigations)\n• Watch: Yellow Rust, Powdery Mildew\n• Key states: Punjab, Haryana, UP",
    mustard: "🌼 Mustard Guide:\n• Sow: October (Rabi)\n• Harvest: February-March\n• MSP: ₹6,200/quintal\n• Market premium: 10-20% above MSP usually\n• Main pest: Aphids (use Imidacloprid)\n• Key states: Rajasthan, UP, Haryana",
    tomato: "🍅 Tomato Facts:\n• Most volatile vegetable prices!\n• Range: ₹200 to ₹8,000/quintal in same year\n• Best grow time: October-March\n• Peak prices: April-June (summer)\n• No MSP — fully market-driven\n• Key states: AP, Karnataka, Maharashtra",
    onion: "🧅 Onion Market:\n• Very seasonal price behavior\n• Peak: ₹3,000-6,000/quintal in lean season\n• Low: ₹400-800/quintal post-harvest\n• No MSP — market-driven\n• Major states: Maharashtra, Karnataka, MP",
    scheme: "🏛️ Key Govt Schemes for Farmers:\n1. PM-KISAN: ₹6,000/year direct benefit\n2. PMFBY: Crop insurance scheme\n3. e-NAM: Online mandi trading\n4. KCC: Kisan Credit Card (low interest)\n5. PMKSY: Irrigation support\n6. FPO: Farmer Producer Organizations",
    organic: "🌿 Organic Farming Benefits:\n• 20-40% premium prices in cities\n• Growing demand domestically & for export\n• Takes 3 years for certification\n• Best organic crops: Turmeric, Ginger, Pulses\n• Certifications: India Organic, NPOP, PGS-India",
    forecast: "📈 How our AI forecast works:\n1. 60-day historical price analysis\n2. Time-series trend modeling\n3. Weather pattern integration\n4. Seasonal demand cycles\n5. Transport & input cost trends\n\nPredictions updated daily with fresh market data!",
    help: "I can help you with:\n🌾 Crop-specific advice\n💰 Price predictions & MSP info\n🌦️ Weather impacts on farming\n📊 Market timing advice\n🏛️ Government schemes\n🌿 Organic farming tips\n\nJust type your question in English, Tamil, or Telugu!",
  },
  ta: {
    mango_fly: "🥭 **மாம்பழ ஈ மற்றும் புழு மேலாண்மை:**\n• **அறிகுறிகள்:** மாம்பழங்களுக்குள் புழுக்கள் பாய்ந்து அழுகுதல் மற்றும் காய்கள் உதிர்தல்.\n• **இயற்கை முறை:** மெத்தில் யூஜினால் பொறிகள் (10/ஏக்கர்) வைக்கவும். உதிர்ந்த பழங்களை சேகரித்து அழிக்கவும். வேப்ப எண்ணெய் 3% தெளிக்கவும்.\n• **இரசாயன முறை:** Malathion @ 2ml/L அல்லது வெல்ல கரைசல் + Malathion தெளிக்கவும்.",
    nellore_mandi: "🚛 **நெல்லூர் மண்டி விலை வீழ்ச்சி ஆலோசனை:**\n• **இடர்:** கடலோர மழை/புயல் காரணமாக நெல்லூர் மண்டியில் 15-20% வரை விலை வீழ்ச்சி ஏற்படலாம்.\n• **தடுப்பு முறை:** தானியங்களை 12% ஈரப்பதத்திற்கு கீழ் உலர்த்தவும். e-NAM போர்ட்டலைப் பயன்படுத்தி குண்டூர் மண்டி அல்லது சென்னை கோயம்பேடு விலையுடன் ஒப்பிட்டு விற்கவும்.",
    namaste: "நமஸ்தே! 🙏 நான் AgriBot, உங்கள் விவசாய உதவியாளர்.",
    wheat: "🌿 கோதுமை வழிகாட்டி:\n• விதைக்கும் நேரம்: அக்டோபர்-நவம்பர் (ராபி)\n• அறுவடை: மார்ச்-ஏப்ரல்\n• MSP: ₹2,585/குவிண்டல்\n• நீர் தேவை: 450-650mm\n• முக்கிய மாநிலங்கள்: பஞ்சாப், ஹரியானா, உபி",
    tomato: "🍅 தக்காளி:\n• அதிக விலை ஏற்ற இறக்கங்கள்!\n• பருவம்: அக்டோபர்-மார்ச்\n• அதிக விலை: ஏப்ரல்-ஜூன்\n• MSP இல்லை — சந்தை விலை\n• முக்கிய மாநிலங்கள்: ஆந்திரா, கர்நாடகா, மகாராஷ்டிரா",
    onion: "🧅 வெங்காயம்:\n• பருவகால விலை ஏற்ற இறக்கங்கள்\n• அதிக விலை: ₹3,000-6,000/குவிண்டல்\n• குறைந்த விலை: ₹400-800/குவிண்டல்\n• MSP இல்லை — சந்தை விலை\n• முக்கிய மாநிலங்கள்: மகாராஷ்டிரா, கர்நாடகா, எம்பி",
    organic: "🌿 இயற்கை விவசாயத்தின் நன்மைகள்:\n• நகரங்களில் 20-40% கூடுதல் விலை\n• உள்நாடு மற்றும் ஏற்றுமதி தேவை அதிகம்\n• சான்றிதழ் பெற 3 ஆண்டுகள் ஆகும்\n• சிறந்த பயிர்கள்: மஞ்சள், இஞ்சி, பருப்பு வகைகள்",
    forecast: "📈 எங்களது AI கணிப்பு:\n1. 60 நாள் வரலாற்று விலை பகுப்பாய்வு\n2. போக்கு மாதிரிகள்\n3. வானிலை தாக்கம்\n4. பருவகால தேவை\n5. போக்குவரத்து செலவுகள்\n\nதினசரி சந்தை தரவுகளுடன் புதுப்பிக்கப்படுகிறது!",
    hello: "வணக்கம்! நான் AgriBot 🌱 உங்கள் AI விவசாய உதவியாளர். பயிர் விலைகள், வானிலை தாக்கங்கள், சிறந்த நடைமுறைகள் அல்லது சந்தை கணிப்புகள் பற்றி கேளுங்கள்!",
    hi: "வணக்கம்! 👋 நான் AgriBot. உங்கள் அனைத்து பயிர் மற்றும் சந்தை கேள்விகளுக்கும் உதவ இங்கே இருக்கிறேன். இன்று என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?",
    price: "பயிர் விலைகள் இதனால் தீர்மானிக்கப்படுகின்றன:\n1️⃣ MSP (அரசு குறைந்தபட்ச விலை)\n2️⃣ வானிலை & மழை\n3️⃣ தேவை & வழங்கல்\n4️⃣ போக்குவரத்து செலவு\n5️⃣ பண்டிகை காலம்\n\nவிரிவான விலை போக்குகளுக்கு Analytics பக்கத்தை பார்க்கவும்!",
    msp: "📋 தற்போதைய MSP (2026-27):\n• கோதுமை: ₹2,585/குவிண்டல்\n• அரிசி: ₹2,441/குவிண்டல்\n• கடலை: ₹5,875/குவிண்டல்\n• கடுகு: ₹6,200/குவிண்டல்\n• பருத்தி: ₹8,267/குவிண்டல்\n\nசந்தை விலை MSP-ஐ விட குறைந்தால், FCI MSP விலையில் வாங்கும்.",
    sell: "📊 எப்போது விற்பது?\n1. தற்போதைய விலையை 30 நாள் சராசரியுடன் ஒப்பிடவும்\n2. கணிப்பு வீழ்ச்சி காட்டினால் → இப்போது விற்கவும்\n3. விலை MSP-க்கு மேல் இருந்தால் → காத்திருக்கவும்\n4. பண்டிகை காலத்திற்கு முன் → விலைகள் பொதுவாக உயரும்\n\nஉங்கள் பயிருக்கான கணிப்பு பக்கத்தை பார்க்கவும்!",
    weather: "🌦️ வானிலை மற்றும் பயிர் விலை தாக்கம்:\n• அறுவடையின் போது கனமழை → தரம் குறைகிறது → விலை உயர்கிறது\n• வறட்சி → குறைந்த விளைச்சல் → விலைகள் உயரும்\n• நல்ல மழை → நல்ல அறுவடை → விலைகள் குறையலாம்\n\nலைவ் தகவல்களுக்கு Dashboard-ல் வானிலை பகுதியை பார்க்கவும்!",
    rice: "🌾 நெல் வழிகாட்டி:\n• விதைக்கும் நேரம்: ஜூன்-ஜூலை (கரீஃப்)\n• அறுவடை: அக்டோபர்-நவம்பர்\n• MSP: ₹2,441/குவிண்டல்\n• தேவையான நீர்: 1200-2000mm\n• முக்கிய நோய்கள்: பிளாஸ்ட், BPH\n• முக்கிய மாநிலங்கள்: மேற்கு வங்கம், பஞ்சாப், ஆந்திரா, தமிழ்நாடு",
    mustard: "🌼 கடுகு வழிகாட்டி:\n• விதைக்கும் நேரம்: அக்டோபர் (ராபி)\n• அறுவடை: பிப்ரவரி-மார்ச்\n• MSP: ₹6,200/குவிண்டல்\n• சந்தை விலை பொதுவாக MSP-ஐ விட 10-20% அதிகம்\n• முக்கிய பூச்சி: பேன்கள் (Imidacloprid பயன்படுத்தவும்)",
    scheme: "🏛️ விவசாயிகளுக்கான அரசு திட்டங்கள்:\n1. PM-KISAN: ₹6,000/ஆண்டு நேரடி நலன்\n2. PMFBY: பயிர் காப்பீட்டு திட்டம்\n3. e-NAM: ஆன்லைன் மண்டி வர்த்தகம்\n4. KCC: கிசான் கடன் அட்டை\n5. PMKSY: நீர்ப்பாசன ஆதரவு",
    help: "நான் இவற்றில் உதவ முடியும்:\n🌾 பயிர் குறிப்பிட்ட ஆலோசனை\n💰 விலை கணிப்புகள் & MSP தகவல்\n🌦️ விவசாயத்தில் வானிலை தாக்கம்\n📊 சந்தை நேர ஆலோசனை\n🏛️ அரசு திட்டங்கள்\n\nதமிழிலேயே கேளுங்கள்! 😊",
  },
  te: {
    mango_fly: "🥭 **మామిడి పండు ఈగ & పురుగు నివారణ:**\n• **లక్షణాలు:** మామిడి పండ్ల లోపల పురుగులు తిని కుళ్ళిపోవడం, పండ్లు ముందే రాలడం.\n• **సేంద్రీయ నివారణ:** మిథైల్ యూజినాల్ లింగాకర్షణ బుట్టలు (10/ఎకరం) పెట్టండి. రాలిన పండ్లను ప్రతిరోజూ నాశనం చేయండి. వేప నూనె 3% పిచికారీ చేయండి.\n• **రసాయన నివారణ:** మాలాథియాన్ @ 2మి.లీ/లీ లేదా బెల్లం ద్రావణం + మాలాథియాన్ కలిపి పిచికారీ చేయండి.",
    nellore_mandi: "🚛 **నెల్లూరు మండి ధరల తగ్గుదల సలహా:**\n• **ప్రమాదం:** తీరప్రాంత వర్షాలు/తుఫానుల వల్ల నెల్లూరు మండిలో ధరలు 15-20% వరకు తగ్గే అవకాశం ఉంది.\n• **నివారణ:** ధాన్యాన్ని 12% కంటే తక్కువ తేమ ఉండేలా ఆరబెట్టండి. e-NAM పోర్టల్ ద్వారా గుంటూరు మండి లేదా చెన్నై మార్కెట్ ధరలతో పోల్చి లాభదాయకమైన మార్కెట్లో అమ్మండి.",
    namaste: "నమస్తే! 🙏 నేను AgriBot, మీ వ్యవసాయ సహాయకుడు.",
    wheat: "🌿 గోధుమ మార్గదర్శి:\n• విత్తే సమయం: అక్టోబర్-నవంబర్ (రబీ)\n• కోత: మార్చి-ఏప్రిల్\n• MSP: ₹2,585/క్వింటాల్\n• నీటి అవసరం: 450-650mm\n• ముఖ్య రాష్ట్రాలు: పంజాబ్, హర్యానా, UP",
    tomato: "🍅 టమాటా:\n• అత్యధిక ధర హెచ్చుతగ్గులు!\n• పండించే సమయం: అక్టోబర్-మార్చి\n• గరిష్ట ధర: ఏప్రిల్-జూన్\n• MSP లేదు — మార్కెట్ ఆధారితం\n• ముఖ్య రాష్ట్రాలు: ఏపీ, కర్ణాటక, మహారాష్ట్ర",
    onion: "🧅 ఉల్లిపాయ:\n• కాలానుగుణ ధర హెచ్చుతగ్గులు\n• గరిష్ట ధర: ₹3,000-6,000/క్వింటాల్\n• కనిష్ట ధర: ₹400-800/క్వింటాల్\n• MSP లేదు — మార్కెట్ ఆధారితం\n• ముఖ్య రాష్ట్రాలు: మహారాష్ట్ర, కర్ణాటక, MP",
    organic: "🌿 సేంద్రియ వ్యవసాయ ప్రయోజనాలు:\n• నగరాల్లో 20-40% అదనపు ధరలు\n• దేశీయ & ఎగుమతి డిమాండ్ పెరుగుదల\n• ధృవీకరణకు 3 సంవత్సరాలు పడుతుంది\n• ఉత్తమ పంటలు: పసుపు, అల్లం, పప్పులు",
    forecast: "📈 మా AI అంచనా:\n1. 60 రోజుల చారిత్రక ధరల విశ్లేషణ\n2. ట్రెండ్ మోడలింగ్\n3. వాతావరణ ప్రభావం\n4. కాలానుగుణ డిమాండ్\n5. రవాణా ఖర్చులు\n\nరోజువారీ మార్కెట్ డేటాతో అప్‌డేట్ చేయబడుతుంది!",
    hello: "నమస్కారం! నేను AgriBot 🌱 మీ AI వ్యవసాయ సహాయకుడు. పంట ధరలు, వాతావరణ ప్రభావాలు, మార్కెట్ అంచనాలు గురించి అడగండి!",
    hi: "నమస్కారం! 👋 నేను AgriBot. మీ అన్ని పంట మరియు మార్కెట్ ప్రశ్నలకు సహాయపడటానికి ఇక్కడ ఉన్నాను. ఈరోజు ఏమి తెలుసుకోవాలి?",
    price: "పంట ధరలు వీటిపై ఆధారపడతాయి:\n1️⃣ MSP (ప్రభుత్వ కనీస ధర)\n2️⃣ వాతావరణం & వర్షపాతం\n3️⃣ డిమాండ్ & సరఫరా\n4️⃣ రవాణా ఖర్చులు\n5️⃣ పండుగ కాలం\n\nవివరణాత్మక ధర ధోరణులకు Analytics పేజీని చూడండి!",
    msp: "📋 ప్రస్తుత MSP (2026-27):\n• గోధుమలు: ₹2,585/క్వింటాల్\n• వరి: ₹2,441/క్వింటాల్\n• శనగలు: ₹5,875/క్వింటాల్\n• ఆవాలు: ₹6,200/క్వింటాల్\n• పత్తి: ₹8,267/క్వింటాల్\n\nమార్కెట్ ధర MSP కంటే తక్కువైతే, FCI MSP ధరకు కొనుగోలు చేస్తుంది.",
    sell: "📊 ఎప్పుడు అమ్మాలి?\n1. ప్రస్తుత ధరను 30 రోజుల సగటుతో పోల్చండి\n2. అంచనా తగ్గుదల చూపిస్తే → ఇప్పుడే అమ్మండి\n3. ధర MSP కంటే ఎక్కువగా ఉంటే → వేచి ఉండండి\n4. పండుగకు ముందు → ధరలు సాధారణంగా పెరుగుతాయి\n\nమీ పంట అంచనా పేజీని చూడండి!",
    weather: "🌦️ వాతావరణం మరియు పంట ధర ప్రభావం:\n• పంట కోత సమయంలో భారీ వర్షం → నాణ్యత తగ్గుతుంది → ధర పెరుగుతుంది\n• వరుస కరువు → తక్కువ దిగుబడి → ధరలు పెరుగుతాయి\n• మంచి వర్షం → మంచి పంట → ధరలు తగ్గవచ్చు",
    rice: "🌾 వరి మార్గదర్శి:\n• విత్తే సమయం: జూన్-జూలై (ఖరీఫ్)\n• కోత: అక్టోబర్-నవంబర్\n• MSP: ₹2,441/క్వింటాల్\n• అవసరమైన నీరు: 1200-2000mm\n• ముఖ్య రాష్ట్రాలు: పశ్చిమ బెంగాల్, పంజాబ్, ఆంధ్రప్రదేశ్, తమిళనాడు",
    mustard: "🌼 ఆవాలు మార్గదర్శి:\n• విత్తే సమయం: అక్టోబర్ (రబీ)\n• కోత: ఫిబ్రవరి-మార్చి\n• MSP: ₹6,200/క్వింటాల్\n• మార్కెట్ ధర సాధారణంగా MSP కంటే 10-20% ఎక్కువ",
    scheme: "🏛️ రైతులకు ప్రభుత్వ పథకాలు:\n1. PM-KISAN: ₹6,000/సంవత్సరం నేరుగా\n2. PMFBY: పంట బీమా పథకం\n3. e-NAM: ఆన్‌లైన్ మండి వర్తకం\n4. KCC: కిసాన్ క్రెడిట్ కార్డ్\n5. PMKSY: నీటిపారుదల మద్దతు",
    help: "నేను ఇవి సహాయపడగలను:\n🌾 పంట నిర్దిష్ట సలహా\n💰 ధర అంచనాలు & MSP సమాచారం\n🌦️ వ్యవసాయంలో వాతావరణ ప్రభావం\n📊 మార్కెట్ సమయ సలహా\n🏛️ ప్రభుత్వ పథకాలు\n\nతెలుగులో అడగండి! 😊",
  },
};

import { CROPS, type Crop } from "./cropData";

const pestKeywords = [
  "pest", "disease", "insect", "precaution", "control", "spray", "prevent", "bugs", "fungus",
  "తెగుళ్లు", "తెగులు", "వ్యాధి", "పురుగు", "పురుగులు", "నివారణ", "జాగ్రత్తలు", "మందులు",
  "பூச்சி", "நோய்", "கட்டுப்பாடு", "தடுப்பு"
];

const pestDatabase: Record<string, Record<Language, string>> = {
  rice: {
    en: "🌾 **Rice Pest & Disease Management:**\n• **Major Pests:** Brown Plant Hopper (BPH), Stem Borer.\n• **Major Diseases:** Rice Blast, Sheath Blight.\n• **Precautionary Measures:** Use disease-resistant varieties, maintain proper spacing, avoid excess nitrogen fertilizers. For Blast, spray Tricyclazole @ 0.6g/L.",
    ta: "🌾 **நெல் பூச்சி மற்றும் நோய் மேலாண்மை:**\n• **முக்கிய பூச்சிகள்:** குருத்துப்பூச்சி, புகையான்.\n• **முக்கிய நோய்கள்:** குலை நோய், இலைக்கருகல் நோய்.\n• **முன்னெச்சரிக்கை நடவடிக்கைகள்:** நோய் எதிர்ப்பு ரகங்களை பயன்படுத்தவும், நைதரசன் உரங்களை அளவாக இடவும். குலை நோய்க்கு Tricyclazole தெளிக்கவும்.",
    te: "🌾 **వరి తెగుళ్లు & పురుగుల నివారణ చర్యలు:**\n• **ముఖ్యమైన తెగుళ్లు:** అగ్గితెగులు (Blast), కాండం తొలిచే పురుగు (Stem Borer), సుడిదోమ (BPH).\n• **ముందుస్తు జాగ్రత్తలు:** నిరోధక రకాలను ఎంచుకోండి, నత్రజని ఎరువులను మోతాదుకు మించి వాడకండి. అగ్గితెగులు నివారణకు ట్రైసైక్లాజోల్ (Tricyclazole) లీటరు నీటికి 0.6 గ్రా చొప్పున పిచికారీ చేయండి."
  },
  cotton: {
    en: "☁️ **Cotton Pest & Disease Management:**\n• **Major Pests:** Pink Bollworm, Sucking Pests (Aphids, Thrips).\n• **Precautionary Measures:** Plant Bt cotton, install pheromone traps for bollworms, avoid continuous cropping. Spray Imidacloprid for sucking pests.",
    ta: "☁️ **பருத்தி பூச்சி மற்றும் நோய் மேலாண்மை:**\n• **முக்கிய பூச்சிகள்:** இளஞ்சிவப்பு காய் புழு, அசுவினி.\n• **முன்னெச்சரிக்கை நடவடிக்கைகள்:** பிடி பருத்தி பயிரிடவும், இனக்கவர்ச்சி பொறிகளை வைக்கவும். சாறு உறிஞ்சும் பூச்சிகளுக்கு Imidacloprid தெளிக்கவும்.",
    te: "☁️ **పత్తి తెగుళ్లు & పురుగుల నివారణ చర్యలు:**\n• **ముఖ్యమైన తెగుళ్లు:** గులాబీ రంగు కాయ తొలిచే పురుగు (Pink Bollworm), రసం పీల్చే పురుగులు (పేనుబంక, తామర పురుగులు).\n• **ముందుస్తు జాగ్రత్తలు:** బి.టి (Bt) పత్తి రకాలను సాగు చేయండి, లింగాకర్షణ బుట్టలను (Pheromone traps) ఏర్పాటు చేయండి. రసం పీల్చే పురుగుల నివారణకు ఇమిడాక్లోప్రిడ్ (Imidacloprid) పిచికారీ చేయండి."
  },
  wheat: {
    en: "🌿 **Wheat Pest & Disease Management:**\n• **Major Diseases:** Yellow Rust, Powdery Mildew.\n• **Precautionary Measures:** Sow early in the Rabi season, use rust-resistant seeds. For Yellow Rust, spray Propiconazole @ 1ml/L.",
    ta: "🌿 **கோதுமை நோய் மேலாண்மை:**\n• **முக்கிய நோய்கள்:** மஞ்சள் துரு நோய், சாம்பல் நோய்.\n• **முன்னெச்சரிக்கை நடவடிக்கைகள்:** ரகங்களை முன்கூட்டியே விதைக்கவும், துரு நோய் எதிர்ப்பு விதைகளைப் பயன்படுத்தவும்.",
    te: "🌿 **గోధుమ తెగుళ్ల నివారణ చర్యలు:**\n• **ముఖ్యమైన తెగుళ్లు:** పసుపు కుంకుమ తెగులు (Yellow Rust), బూడిద తెగులు (Powdery Mildew).\n• **ముందుస్తు జాగ్రత్తలు:** రబీ సీజన్ ప్రారంభంలోనే విత్తండి, తెగులు నిరోధక విత్తనాలను వాడండి. పసుపు కుంకుమ తెగులు నివారణకు ప్రొపికోనజోల్ (Propiconazole) పిచికారీ చేయండి."
  },
  mustard: {
    en: "🌼 **Mustard Pest Management:**\n• **Major Pest:** Aphids (Mustard Aphid).\n• **Precautionary Measures:** Sow before mid-October to avoid peak aphid season. Spray Dimethoate @ 2ml/L if infestation is severe.",
    ta: "🌼 **கடுகு பூச்சி மேலாண்மை:**\n• **முக்கிய பூச்சி:** கடுகு அசுவினி.\n• **முன்னெச்சரிக்கை நடவடிக்கைகள்:** அக்டோபர் நடுப்பகுதிக்கு முன் விதைக்கவும். பூச்சி தாக்குதல் தீவிரமாக இருந்தால் Dimethoate தெளிக்கவும்.",
    te: "🌼 **ఆవాల తెగుళ్ల నివారణ చర్యలు:**\n• **ముఖ్యమైన తెగుళ్లు:** పేనుబంక (Aphids).\n• **ముందుస్తు జాగ్రత్తలు:** పేనుబంక ఉధృతిని తప్పించుకోవడానికి అక్టోబర్ మధ్యలోపే విత్తండి. అవసరమైతే డైమిథోయేట్ (Dimethoate) పిచికారీ చేయండి."
  },
  tomato: {
    en: "🍅 **Tomato Pest & Disease Management:**\n• **Major Pests:** Fruit Borer, Leaf Miner.\n• **Major Diseases:** Early Blight, Leaf Curl Virus.\n• **Precautionary Measures:** Use yellow sticky traps, avoid overhead watering. Spray copper oxychloride for Blight.",
    ta: "🍅 **தக்காளி பூச்சி மற்றும் நோய் மேலாண்மை:**\n• **முக்கிய பூச்சிகள்:** காய் துளைப்பான், இலை சுரங்கப்பாதை பூச்சி.\n• **முக்கிய நோய்கள்:** ஆரம்பகால இலைக்கருகல், இலை சுருட்டல் வைரஸ்.\n• **முன்னெச்சரிக்கை நடவடிக்கைகள்:** மஞ்சள் ஒட்டும் பொறிகளைப் பயன்படுத்தவும்.",
    te: "🍅 **టమాటా తెగుళ్లు & పురుగుల నివారణ చర్యలు:**\n• **ముఖ్యమైన తెగుళ్లు:** కాయ తొలిచే పురుగు (Fruit Borer), ఆకు ముడుత తెగులు (Leaf Curl Virus), ముందస్తు మాడు తెగులు (Early Blight).\n• **ముందుస్తు జాగ్రత్తలు:** పసుపు జిగురు అట్టలను (Yellow sticky traps) వాడండి. మాడు తెగులు నివారణకు కాపర్ ఆక్సిక్లోరైడ్ పిచికారీ చేయండి."
  },
  onion: {
    en: "🧅 **Onion Pest & Disease Management:**\n• **Major Pests:** Thrips.\n• **Major Diseases:** Purple Blotch, Damping Off.\n• **Precautionary Measures:** Maintain good drainage, rotate crops. Spray Mancozeb @ 2.5g/L for Purple Blotch.",
    ta: "🧅 **வெங்காயம் பூச்சி மற்றும் நோய் மேலாண்மை:**\n• **முக்கிய பூச்சிகள்:** இலை பேன்.\n• **முக்கிய நோய்கள்:** ஊதா நிற அழுகல் நோய்.\n• **முன்னெச்சரிக்கை நடவடிக்கைகள்:** வடிகால் வசதியை மேம்படுத்தவும், பயிர் சுழற்சி செய்யவும்.",
    te: "🧅 **ఉల్లిపాయ తెగుళ్లు & పురుగుల నివారణ చర్యలు:**\n• **ముఖ్యమైన తెగుళ్లు:** తామర పురుగులు (Thrips), ఊదా రంగు మచ్చ తెగులు (Purple Blotch).\n• **ముందుస్తు జాగ్రత్తలు:** నీరు నిలవకుండా చూసుకోండి, పంట మార్పిడి చేయండి. మచ్చ తెగులు నివారణకు మాంకోజెబ్ (Mancozeb) పిచికారీ చేయండి."
  }
};

function getCategoryNameTA(cat: string): string {
  const mapping: Record<string, string> = {
    "Cereals": "தானியங்கள்", "Vegetables": "காய்கறிகள்", "Fruits": "பழங்கள்", "Oilseeds": "எண்ணெய் வித்துக்கள்", "Pulses": "பருப்பு வகைகள்", "Spices": "மசாலா", "Cash Crops": "பணப்பயிர்கள்"
  };
  return mapping[cat] || cat;
}

function getCategoryNameTE(cat: string): string {
  const mapping: Record<string, string> = {
    "Cereals": "ధాన్యాలు", "Vegetables": "కూరగాయలు", "Fruits": "పండ్లు", "Oilseeds": "నూనె గింజలు", "Pulses": "పప్పులు", "Spices": "సుగంధ ద్రవ్యాలు", "Cash Crops": "వాణిజ్య పంటలు"
  };
  return mapping[cat] || cat;
}

function translateStateTA(state: string): string {
  const mapping: Record<string, string> = {
    "West Bengal": "மேற்கு வங்கம்", "Punjab": "பஞ்சாப்", "Andhra Pradesh": "ஆந்திர பிரதேசம்", "Tamil Nadu": "தமிழ்நாடு",
    "Haryana": "ஹரியானா", "Uttar Pradesh": "உத்தரபிரதேசம்", "MP": "மத்திய பிரதேசம்", "Madhya Pradesh": "மத்திய பிரதேசம்",
    "Karnataka": "கர்நாடகா", "Maharashtra": "மகாராஷ்டிரா", "Bihar": "பீகார்", "Telangana": "தெலுங்கானா",
    "Rajasthan": "ராஜஸ்தான்", "Gujarat": "குஜராத்"
  };
  return mapping[state] || state;
}

function translateStateTE(state: string): string {
  const mapping: Record<string, string> = {
    "West Bengal": "పశ్చిమ బెంగాల్", "Punjab": "పంజాబ్", "Andhra Pradesh": "ఆంధ్రప్రదేశ్", "Tamil Nadu": "తమిళనాడు",
    "Haryana": "హర్యానా", "Uttar Pradesh": "ఉత్తరప్రదేశ్", "MP": "మధ్యప్రదేశ్", "Madhya Pradesh": "మధ్యప్రదేశ్",
    "Karnataka": "కర్ణాటక", "Maharashtra": "మహారాష్ట్ర", "Bihar": "బీహార్", "Telangana": "తెలంగాణ",
    "Rajasthan": "రాజస్థాన్", "Gujarat": "గుజరాత్"
  };
  return mapping[state] || state;
}

function findAllCropsInQuery(query: string): Crop[] {
  const lower = query.toLowerCase();
  const matched: Crop[] = [];
  for (const crop of CROPS) {
    const names = [
      crop.name.toLowerCase(),
      crop.nameTA.toLowerCase(),
      crop.nameTE.toLowerCase(),
      crop.id.toLowerCase()
    ];
    if (names.some(name => lower.includes(name))) {
      matched.push(crop);
    }
  }
  return matched;
}

function findCropInQuery(query: string): Crop | null {
  const matched = findAllCropsInQuery(query);
  return matched.length > 0 ? matched[0] : null;
}

function getDynamicCropResponse(crop: Crop, lang: Language): string {
  if (lang === "en") {
    return `🌾 **${crop.name}** (${crop.category} Crop):\n` +
      `• **Description:** ${crop.description}\n` +
      `• **Season:** ${crop.season}\n` +
      `• **Base Market Price:** ₹${crop.basePrice} per ${crop.unit} (approx ₹${(crop.basePrice / 100).toFixed(2)}/kg)\n` +
      `• **MSP (Minimum Support Price):** ${crop.msp > 0 ? `₹${crop.msp} per ${crop.unit}` : "Not applicable (Market-driven)"}\n` +
      `• **Major Producing States:** ${crop.states.join(", ")}\n\n` +
      `You can check the **Forecast** tab to see future price predictions for ${crop.name}!`;
  } else if (lang === "ta") {
    return `🌾 **${crop.nameTA}** (${getCategoryNameTA(crop.category)} பயிர்):\n` +
      `• **விளக்கம்:** ${crop.descTA}\n` +
      `• **பருவம்:** ${crop.season === "Kharif" ? "கரீஃப்" : crop.season === "Rabi" ? "ராபி" : "ஆண்டு முழுவதும்"}\n` +
      `• **அடிப்படை சந்தை விலை:** ₹${crop.basePrice} ஒரு குவிண்டாலுக்கு (தோராயமாக ₹${(crop.basePrice / 100).toFixed(2)}/கிலோ)\n` +
      `• **குறைந்தபட்ச ஆதரவு விலை (MSP):** ${crop.msp > 0 ? `₹${crop.msp} ஒரு குவிண்டாலுக்கு` : "பொருந்தாது (சந்தை விலை)"}\n` +
      `• **முக்கிய உற்பத்தி மாநிலங்கள்:** ${crop.states.map(translateStateTA).join(", ")}\n\n` +
      `உங்கள் பயிரின் எதிர்கால விலை கணிப்புகளை பார்க்க **Forecast** பக்கத்திற்கு செல்லவும்!`;
  } else {
    return `🌾 **${crop.nameTE}** (${getCategoryNameTE(crop.category)} పంట):\n` +
      `• **వివరణ:** ${crop.descTE}\n` +
      `• **సీజన్:** ${crop.season === "Kharif" ? "ఖరీఫ్" : crop.season === "Rabi" ? "రబీ" : "ఏడాది పొడవునా"}\n` +
      `• **ప్రాథమిక మార్కెట్ ధర:** క్వింటాల్‌కు ₹${crop.basePrice} (సుమారుగా ₹${(crop.basePrice / 100).toFixed(2)}/కిలో)\n` +
      `• **కనీస మద్దతు ధర (MSP):** ${crop.msp > 0 ? `క్వింటాల్‌కు ₹${crop.msp}` : "వర్తించదు (మార్కెట్ ఆధారితం)"}\n` +
      `• **ముఖ్యంగా పండించే రాష్ట్రాలు:** ${crop.states.map(translateStateTE).join(", ")}\n\n` +
      `మీ పంట యొక్క భవిష్యత్తు ధరల అంచనాలను చూడటానికి **Forecast** పేజీని సందర్శించండి!`;
  }
}

// ── Smart response lookup ──────────────────────────────
function findResponse(query: string, lang: Language): string {
  const lower = query.toLowerCase();
  const db = responses[lang];

  // 1. Pest/Disease Advisory Interceptor
  const isPestQuery = pestKeywords.some(k => lower.includes(k));
  if (isPestQuery) {
    const matchedCrops = findAllCropsInQuery(query);
    if (matchedCrops.length > 0) {
      return matchedCrops.map(crop => {
        const custom = pestDatabase[crop.id];
        if (custom && custom[lang]) {
          return custom[lang];
        }
        if (lang === "en") {
          return `🌾 **${crop.name} Pest Management:**\n• Use certified disease-free seeds, maintain proper irrigation, and rotate crops. Consult your local extension office for specific pesticide recommendations.`;
        } else if (lang === "ta") {
          return `🌾 **${crop.nameTA} பூச்சி மேலாண்மை:**\n• சான்றளிக்கப்பட்ட விதைத் தேர்வுகள், முறையான நீர் மேலாண்மை மற்றும் பயிர் சுழற்சி முறை ஆகியவற்றை மேற்கொள்ளுங்கள்.`;
        } else {
          return `🌾 **${crop.nameTE} తెగుళ్ల నివారణ:**\n• తెగులు రహిత విత్తనాలను ఎంచుకోండి, తగినంత నీటి యాజమాన్యం మరియు పంట మార్పిడి పద్ధతిని అనుసరించండి.`;
        }
      }).join("\n\n---\n\n");
    } else {
      if (lang === "en") {
        return "🛡️ **General Pest & Disease Prevention Tips:**\n1. **Crop Rotation:** Don't grow the same crop family in the same field consecutively.\n2. **Clean Seeds:** Use certified, disease-resistant seed varieties.\n3. **Soil Health:** Apply organic compost and neem cake to suppress soil-born pathogens.\n4. **Sticky Traps:** Use yellow/blue sticky traps to monitor sucking pests.\n5. **Biological Control:** Encourage beneficial insects like ladybugs.";
      } else if (lang === "ta") {
        return "🛡️ **பொதுவான பூச்சி மற்றும் நோய் தடுப்பு குறிப்புகள்:**\n1. **பயிர் சுழற்சி:** ஒரே குடும்பப் பயிர்களை தொடர்ந்து பயிரிட வேண்டாம்.\n2. **சுத்தமான விதைகள்:** சான்றளிக்கப்பட்ட நோய் எதிர்ப்பு விதைகளைப் பயன்படுத்தவும்.\n3. **மண் வளம்:** வேப்பம் புண்ணாக்கு மற்றும் கரிம உரங்களைப் பயன்படுத்தவும்.\n4. **ஒட்டும் பொறிகள்:** சாறு உறிஞ்சும் பூச்சிகளைக் கண்காணிக்க மஞ்சள் பொறிகளைப் பயன்படுத்தவும்.";
      } else {
        return "🛡️ **సాధారణ తెగుళ్లు & పురుగుల నివారణ చిట్కాలు:**\n1. **పంట మార్పిడి:** ఒకే పొలంలో వరుసగా ఒకే రకమైన పంటలను పండించకండి.\n2. **నాణ్యమైన విత్తనాలు:** ధృవీకరించబడిన, తెగులు నిరోధక విత్తనాలను మాత్రమే వాడండి.\n3. **నేల ఆరోగ్యం:** వేప పిండి మరియు సేంద్రియ ఎరువులను వాడటం ద్వారా నేలలోని వ్యాధికారక క్రిములను అరికట్టవచ్చు.\n4. **జిగురు అట్టలు:** రసం పీల్చే పురుగుల నివారణకు పసుపు/నీలి రంగు జిగురు అట్టలను వాడండి.\n5. **జీవ నియంత్రణ:** మిత్ర పురుగులను (లేడీబగ్స్ వంటివి) సంరక్షించండి.";
      }
    }
  }

  // 2. Dynamic crop matching (General Facts)
  const matchedCrop = findCropInQuery(query);
  if (matchedCrop) {
    return getDynamicCropResponse(matchedCrop, lang);
  }

  // 3. Direct keyword matching for other topics
  const keywords: [string[], string][] = [
    [["mango", "fruit fly", "worm", "புழு", "ஈ", "పండు ఈగ", "మామిడి"], "mango_fly"],
    [["nellore", "mandi", "price drop", "நெல்லூர்", "నెల్లూరు", "ధర తగ్గుదల"], "nellore_mandi"],
    [["hello", "hi", "hai", "hey", "start", "begin", "namaste", "வணக்கம்", "నమస్కారం"], "hello"],
    [["price", "விலை", "ధర", "cost", "rate", "market"], "price"],
    [["msp", "minimum support", "குறைந்தபட்ச", "కనీస"], "msp"],
    [["sell", "selling", "விற்க", "అమ్మ"], "sell"],
    [["weather", "rain", "monsoon", "వాతావరణ", "వర్షం", "வானிலை", "மழை"], "weather"],
    [["scheme", "government", "yojana", "திட்டம்", "పథకం", "subsidy"], "scheme"],
    [["organic", "natural", "ప్రకృతి", "సేంద్రీయ"], "organic"],
    [["forecast", "predict", "future", "అంచనా"], "forecast"],
    [["help", "what can", " உதவி", "సహాయం", "how to"], "help"],
  ];

  for (const [keys, responseKey] of keywords) {
    if (keys.some(k => lower.includes(k))) {
      const resp = db[responseKey];
      if (resp) return resp;
      const enResp = responses.en[responseKey];
      if (enResp) return enResp;
    }
  }

  const fallbacks: Record<Language, string> = {
    en: "That's a great question! 🌾 I'd recommend:\n• Checking the Analytics page for price trends\n• Visiting the Forecast page for your specific crop\n• Viewing the Dashboard for live market prices\n\nTry asking about specific crops like rice, wheat, tomato, or ask about MSP prices!",
    ta: "நல்ல கேள்வி! 🌾 நான் பரிந்துரைக்கிறேன்:\n• விலை போக்குகளுக்கு Analytics பக்கத்தை பார்க்கவும்\n• உங்கள் பயிரின் கணிப்பு பக்கத்தை பார்க்கவும்\n• நேரடி சந்தை விலைகளுக்கு Dashboard-ஐ பார்க்கவும்\n\nதமிழிலேயே கேளுங்கள்! 😊",
    te: "మంచి ప్రశ్న! 🌾 నేను సూచిస్తాను:\n• ధర ధోరణులకు Analytics పేజీని చూడండి\n• మీ పంట అంచనా పేజీని చూడండి\n• లైవ్ మార్కెట్ ధరలకు Dashboard చూడండి\n\nతెలుగులో అడగండి! 😊",
  };
  return fallbacks[lang];
}

export function getChatbotResponse(message: string, forceLang?: Language): string {
  const lang = forceLang || detectLanguage(message);
  return findResponse(message, lang);
}

export function createMessage(role: "user" | "assistant", content: string): ChatMessage {
  return { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, role, content, timestamp: new Date() };
}

export const QUICK_PROMPTS: Record<Language, string[]> = {
  en: ["What crops to sell now?", "MSP prices list", "Organic control for mango worms", "Nellore Mandi price drop risk", "Government schemes for farmers"],
  ta: ["இப்போது என்ன விற்பது?", "MSP விலை பட்டியல்", "மாம்பழ புழுக்களுக்கு இயற்கை நிவராணம்", "நெல்லூர் மண்டி விலை வீழ்ச்சி அபாயம்", "வானிலை தாக்கம்"],
  te: ["ఇప్పుడు ఏమి అమ్మాలి?", "MSP ధరల జాబితా", "మామిడి పండు ఈగ నివారణ చర్యలు", "నెల్లూరు మండి ధరల తగ్గుదల ప్రమాదం", "వాతావరణ ప్రభావం"],
};

export const LANG_LABELS: Record<Language, string> = {
  en: "English 🇬🇧",
  ta: "தமிழ் 🌸",
  te: "తెలుగు 🌺",
};
