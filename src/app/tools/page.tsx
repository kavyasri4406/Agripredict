"use client";
import { useState, useEffect } from "react";
import { useApp, Language } from "@/lib/AppContext";
import { CROPS, formatPrice } from "@/lib/cropData";
import { getCurrentUser } from "@/lib/auth";
import CropCalendar from "@/components/CropCalendar";
import DocumentOcr from "@/components/DocumentOcr";
import KccCalculator from "@/components/KccCalculator";
import PmKisanTracker from "@/components/PmKisanTracker";
import CostProfitEstimator from "@/components/CostProfitEstimator";


const VEHICLES = [
  { id: "tata_ace", name: "Tata Ace (Chota Hathi)", efficiency: 16, laborCost: 500 },
  { id: "bolero", name: "Mahindra Bolero Pickup", efficiency: 12, laborCost: 700 },
  { id: "tractor", name: "Tractor Trolley", efficiency: 8, laborCost: 400 }
];

const MANDIS = [
  { id: "nellore", name: "Nellore Mandi", nameTA: "நெல்லூர் மண்டி", nameTE: "నెల్లూరు మండి", distance: 15, priceOffset: 0.95 },
  { id: "guntur", name: "Guntur Mandi", nameTA: "குண்டூர் மண்டி", nameTE: "గుంటూరు మండి", distance: 110, priceOffset: 1.05 },
  { id: "chennai", name: "Chennai Koyambedu", nameTA: "சென்னை கோயம்பேடு", nameTE: "చెన్నై కోయంబేడు", distance: 180, priceOffset: 1.15 }
];

// Translation dictionary
const LABELS: Record<string, any> = {
  en: {
    title: "Interactive Agri-Tools Suite",
    sub: "Data-driven calculators, crop schedules, diagnostic scanners, and risk alerts",
    tabArbitrage: "Mandi Arbitrage",
    tabCalendar: "Crop Calendar",
    tabPest: "Pest Diagnosis",
    tabWarning: "Weather Risk Advisor",
    tabHeatmap: "Market Heatmap",
    
    // Arbitrage
    arbTitle: "Mandi Price Arbitrage Finder",
    arbSub: "Find which regional market yields the highest net profit after transport costs",
    arbCrop: "Select Crop",
    arbQty: "Crop Quantity (in Quintals)",
    arbVehicle: "Vehicle Type",
    arbFuelPrice: "Fuel Price (₹/Liter)",
    arbResultTitle: "Regional Market Net Profit Comparison",
    arbNetProfit: "Net Profit",
    arbGrossValue: "Gross Market Value",
    arbCost: "Transport Cost",
    arbBestChoice: "Best Market Option",
    
    // Calendar
    calTitle: "Interactive Crop Schedule Planner",
    calSub: "Schedule irrigation, fertilizer, and harvesting tasks based on your sowing date",
    calSowDate: "Select Sowing Date",
    calTask: "Agricultural Task",
    calTimeline: "Target Timeline",
    calStatus: "Status",
    calCompleted: "Completed",
    calPending: "Pending",
    
    // Pest
    pestTitle: "Pest & Disease Diagnosis Simulator",
    pestSub: "Select a crop and symptoms to simulate camera scan and receive treatments",
    pestSelectCrop: "Select Crop",
    pestSymptom: "Select Symptom",
    pestScan: "Scan & Diagnose Leaf",
    pestScanning: "Scanning Leaf Tissue...",
    pestResult: "Diagnosis Result",
    pestOrganic: "Organic Treatment",
    pestChemical: "Chemical Treatment",
    pestSelectPart: "Select Plant Part",
    exportCalendar: "Export Schedule (.ics)",
    advisoryTitle: "Active Advisory & Smart Reminders",
    noAdvisory: "All clear. No critical upcoming tasks in the next 7 days.",
    upcomingTask: "Farming Alert",
    partAll: "All Parts",
    partLeaf: "Leaves",
    partFruit: "Fruit / Flower",
    partStem: "Stem / Bark",
    partRoot: "Root / Bulb",
    
    // Warning
    warnTitle: "Weather-Driven Market Risk Warning",
    warnSub: "Assess price depreciation risks based on weather alerts during harvesting",
    warnHarvestDate: "Target Harvest Month",
    warnWeatherAlert: "Active Weather Warning",
    warnRiskLevel: "Market Risk Level",
    warnPriceImpact: "Expected Price Impact",
    warnAdvice: "Recommended Mitigation Action",
    
    // Heatmap
    heatTitle: "Regional Mandi Supply & Demand Heatmap",
    heatSub: "Identify markets with low supply (high price potential) or surplus (price drops)",
    heatSupply: "Supply Volume",
    heatPricePotential: "Price Potential",
    heatShortage: "Shortage (High Price)",
    heatSurplus: "Surplus (Low Price)",
    heatStable: "Stable"
  },
  ta: {
    title: "விவசாயக் கருவிகள் தொகுப்பு",
    sub: "தரவு சார்ந்த கால்குலேட்டர்கள், பயிர் அட்டவணைகள், பூச்சி கண்டறியும் ஸ்கேனர்கள் மற்றும் இடர் எச்சரிக்கைகள்",
    tabArbitrage: "சந்தை விலை ஒப்பீடு",
    tabCalendar: "பயிர் காலண்டர்",
    tabPest: "பூச்சி கண்டறிதல்",
    tabWarning: "வானிலை இடர் ஆலோசகர்",
    tabHeatmap: "சந்தை வரைபடம்",
    
    arbTitle: "மண்டி விலை ஒப்பீடு & போக்குவரத்து லாபக் கணக்கீடு",
    arbSub: "போக்குவரத்து செலவுகளுக்குப் பிறகு எந்த சந்தையில் அதிக நிகர லாபம் கிடைக்கும் என்பதைக் கண்டறியவும்",
    arbCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
    arbQty: "பயிர் அளவு (குவிண்டாலில்)",
    arbVehicle: "வாகன வகை",
    arbFuelPrice: "எரிபொருள் விலை (₹/லிட்டர்)",
    arbResultTitle: "மண்டிகளின் நிகர லாப ஒப்பீடு",
    arbNetProfit: "நிகர லாபம்",
    arbGrossValue: "மொத்த சந்தை மதிப்பு",
    arbCost: "போக்குவரத்து செலவு",
    arbBestChoice: "சிறந்த சந்தை வாய்ப்பு",
    
    calTitle: "பயிர் அட்டவணை திட்டமிடுபவர்",
    calSub: "விதைப்பு தேதியின் அடிப்படையில் நீர் பாசனம், உரம் மற்றும் அறுவடை பணிகளைத் திட்டமிடுங்கள்",
    calSowDate: "விதைப்பு தேதியைத் தேர்ந்தெடுக்கவும்",
    calTask: "விவசாய பணி",
    calTimeline: "இலக்கு காலம்",
    calStatus: "நிலை",
    calCompleted: "முடிந்தது",
    calPending: "நிலுவையில் உள்ளது",
    
    pestTitle: "பூச்சி மற்றும் நோய் கண்டறியும் சிமுலேட்டர்",
    pestSub: "பயிர் மற்றும் அறிகுறிகளைத் தேர்ந்தெடுத்து இலை திசுக்களை ஸ்கேன் செய்து சிகிச்சை முறைகளைப் பெறுங்கள்",
    pestSelectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
    pestSymptom: "அறிகுறிகலைத் தேர்ந்தெடுக்கவும்",
    pestScan: "இலையை ஸ்கேன் செய்க",
    pestScanning: "இலை திசுக்களை ஸ்கேன் செய்கிறது...",
    pestResult: "கண்டறியப்பட்ட நோய்",
    pestOrganic: "இயற்கை வழி மருத்துவம்",
    pestChemical: "இரசாயன சிகிச்சை",
    pestSelectPart: "பயிர் பகுதியைத் தேர்ந்தெடுக்கவும்",
    exportCalendar: "அட்டவணையை ஏற்றுமதி செய் (.ics)",
    advisoryTitle: "செயலில் உள்ள ஆலோசனைகள் மற்றும் நினைவூட்டல்கள்",
    noAdvisory: "இனிவரும் 7 நாட்களில் முக்கிய பணிகள் ஏதுமில்லை.",
    upcomingTask: "விவசாய எச்சரிக்கை",
    partAll: "அனைத்து பகுதிகள்",
    partLeaf: "இலைகள்",
    partFruit: "பழம் / பூ",
    partStem: "தண்டு",
    partRoot: "வேர் / கிழங்கு",
    
    warnTitle: "வானிலை சார்ந்த சந்தை இடர் எச்சரிக்கை",
    warnSub: "அறுவடையின் போது ஏற்படும் வானிலை மாற்றங்களால் விலை வீழ்ச்சி அபாயங்களை மதிப்பிடுங்கள்",
    warnHarvestDate: "அறுவடை மாதம்",
    warnWeatherAlert: "வானிலை எச்சரிக்கை",
    warnRiskLevel: "சந்தை இடர் நிலை",
    warnPriceImpact: "எதிர்பார்க்கப்படும் விலை தாக்கம்",
    warnAdvice: "பரிந்துரைக்கப்படும் நடவடிக்கை",
    
    heatTitle: "மண்டி வரத்து மற்றும் தேவை வரைபடம்",
    heatSub: "குறைந்த வரத்து கொண்ட சந்தைகள் (அதிக விலை) அல்லது உபரி வரத்து கொண்ட சந்தைகளைக் (குறைந்த விலை) கண்டறியவும்",
    heatSupply: "வரத்து அளவு",
    heatPricePotential: "விலை வாய்ப்பு",
    heatShortage: "குறைந்த வரத்து (அதிக விலை)",
    heatSurplus: "அதிக வரத்து (குறைந்த விலை)",
    heatStable: "நிலையானது"
  },
  te: {
    title: "ఇంటరాక్టివ్ వ్యవసాయ సాధనాల సూట్",
    sub: "డేటా ఆధారిత కాలిక్యులేటర్లు, పంట షెడ్యూల్లు, రోగ నిర్ధారణ స్కానర్లు మరియు ప్రమాద హెచ్చరికలు",
    tabArbitrage: "మండి ఆర్బిట్రేజ్",
    tabCalendar: "పంట క్యాలెండర్",
    tabPest: "తెగుళ్ల నిర్ధారణ",
    tabWarning: "వాతావరణ ప్రమాద సలహాదారు",
    tabHeatmap: "మార్కెట్ హీట్‌మ్యాప్",
    
    // Arbitrage
    arbTitle: "మండి ధరల పోలిక & రవాణా లాభాల కాలిక్యులేటర్",
    arbSub: "రవాణా ఖర్చులను మినహాయించిన తర్వాత ఏ మార్కెట్లో అత్యధిక నికర లాభం లభిస్తుందో కనుగొనండి",
    arbCrop: "పంటను ఎంచుకోండి",
    arbQty: "పంట పరిమాణం (క్వింటాళ్లలో)",
    arbVehicle: "వాహనం రకం",
    arbFuelPrice: "ఇంధన ధర (₹/లీటర్)",
    arbResultTitle: "ప్రాంతీయ మార్కెట్ నికర లాభాల పోలిక",
    arbNetProfit: "నికర లాభం",
    arbGrossValue: "మొత్తం మార్కెట్ విలువ",
    arbCost: "రవాణా ఖర్చు",
    arbBestChoice: "ఉత్తమ మార్కెట్ ఎంపిక",
    
    // Calendar
    calTitle: "ఇంటరాక్టివ్ పంట షెడ్యూల్ ప్లానర్",
    calSub: "మీరు విత్తిన తేదీ ఆధారంగా నీటిపారుదల, ఎరువులు మరియు పంట కోత పనులను షెడ్యూల్ చేయండి",
    calSowDate: "విత్తిన తేదీని ఎంచుకోండి",
    calTask: "వ్యవసాయ పని",
    calTimeline: "లక్ష్య సమయం",
    calStatus: "స్థితి",
    calCompleted: "పూర్తయింది",
    calPending: "పెండింగ్",
    
    // Pest
    pestTitle: "తెగుళ్లు & పురుగుల నిర్ధారణ సిమ్యులేటర్",
    pestSub: "పంట మరియు ఆకుల లక్షణాలను ఎంచుకుని కెమెరా స్కానింగ్‌ను రన్ చేసి నివారణ చర్యలను పొందండి",
    pestSelectCrop: "పంటను ఎంచుకోండి",
    pestSymptom: "లక్షణాన్ని ఎంచుకోండి",
    pestScan: "ఆకును స్క్యాన్ చేయి",
    pestScanning: "ఆకు కణజాలాన్ని స్కాన్ చేస్తోంది...",
    pestResult: "రోగ నిర్ధారణ ఫలితం",
    pestOrganic: "సేంద్రియ నివారణ",
    pestChemical: "రసాయన నివారణ",
    pestSelectPart: "మొక్క భాగాన్ని ఎంచుకోండి",
    exportCalendar: "క్యాలెండర్ షెడ్యూల్ డౌన్లోడ్ (.ics)",
    advisoryTitle: "ప్రస్తుత వ్యవసాయ సలహాలు & స్మార్ట్ హెచ్చరికలు",
    noAdvisory: "రాబోయే 7 రోజుల్లో ఎలాంటి క్లిష్టమైన పనులు లేవు.",
    upcomingTask: "వ్యవసాయ అలర్ట్",
    partAll: "అన్ని భాగాలు",
    partLeaf: "ఆకులు",
    partFruit: "పండు / పువ్వు",
    partStem: "కాండం",
    partRoot: "వేరు / దుంప",
    
    // Warning
    warnTitle: "వాతావరణ ఆధారిత మార్కెట్ ప్రమాద హెచ్చరిక",
    warnSub: "కోత సమయాల్లో ప్రతికూల వాతావరణం వల్ల ధరలు తగ్గే ప్రమాదాన్ని అంచనా వేయండి",
    warnHarvestDate: "కోత కోసే నెల",
    warnWeatherAlert: "వాతావరణ హెచ్చరిక",
    warnRiskLevel: "మార్కెట్ ప్రమాద స్థాయి",
    warnPriceImpact: "ధరలపై పడే ప్రభావం",
    warnAdvice: "సూచించబడిన నివారణ చర్య",
    
    // Heatmap
    heatTitle: "ప్రాంతీయ మండిల సరఫరా & డిమాండ్ హీట్‌మ్యాప్",
    heatSub: "తక్కువ సరఫరా ఉన్న మార్కెట్లు (ఎక్కువ ధర వచ్చే అవకాశం) లేదా ఎక్కువ సరఫరా ఉన్న మార్కెట్లను గుర్తించండి",
    heatSupply: "సరఫరా పరిమాణం",
    heatPricePotential: "ధర సంభావ్యత",
    heatShortage: "కొరత (ఎక్కువ ధర)",
    heatSurplus: "మిగులు (తక్కువ ధర)",
    heatStable: "స్థిరంగా ఉంది"
  }
};

const getSymptomsForCrop = (cropId: string): { label: string; labelTA: string; labelTE: string; part: "leaf" | "fruit" | "stem" | "root"; diseases: any }[] => {
  const DB: Record<string, { label: string; labelTA: string; labelTE: string; part: "leaf" | "fruit" | "stem" | "root"; diseases: any }[]> = {
    rice: [
      { label: "Brown spindle-shaped lesions on leaves", labelTA: "இலையில் பழுப்பு நிற கண்வடிவ புள்ளிகள்", labelTE: "ఆకులపై గోధుమ రంగు కంటి ఆకారపు మచ్చలు", part: "leaf", diseases: { en: { name: "Rice Blast (Fungus)", organic: "Spray Neem Oil (30ml/L) or Pseudomonas fluorescens", chemical: "Spray Tricyclazole @ 0.6g/L" }, ta: { name: "நெல் குலை நோய்", organic: "வேப்ப எண்ணெய் (30ml/L) தெளிக்கவும்", chemical: "Tricyclazole @ 0.6g/L தெளிக்கவும்" }, te: { name: "వరి అగ్గితెగులు", organic: "వేప నూనె (30ml/L) పిచికారీ చేయండి", chemical: "ట్రైసైక్లాజోల్ @ 0.6గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "White egg masses on stems, dead hearts in tillers", labelTA: "தண்டுகளில் வெள்ளை முட்டைக்குவியல், பிளவுகள் காய்ந்து இறத்தல்", labelTE: "కాండంపై తెల్లటి గుడ్ల సమూహాలు, పిలకలు ఎండిపోవడం", part: "stem", diseases: { en: { name: "Rice Stem Borer", organic: "Release Trichogramma egg parasitoids (1 lakh/acre), remove stubbles", chemical: "Spray Chlorantraniliprole @ 0.4ml/L" }, ta: { name: "நெல் தண்டு துளைப்பான்", organic: "டிரைக்கோகிராமா முட்டை ஒட்டுண்ணிகளை விடுங்கள் (1 லட்சம்/ஏக்கர்)", chemical: "Chlorantraniliprole @ 0.4ml/L தெளிக்கவும்" }, te: { name: "వరి కాండపు తొలిచే పురుగు", organic: "ట్రైకోగ్రామా గుడ్ల పరాన్నజీవులను విడుదల చేయండి", chemical: "క్లోరాంట్రానిలిప్రోల్ @ 0.4మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Yellowish stripes along leaf margins, leaves dry from tip", labelTA: "இலை விளிம்புகளில் மஞ்சள் கோடுகள், நுனியிலிருந்து உலர்தல்", labelTE: "ఆకుల అంచులపై పసుపు చారలు, చివర నుండి ఎండిపోవడం", part: "leaf", diseases: { en: { name: "Bacterial Leaf Blight (BLB)", organic: "Apply cow dung extract, avoid excess nitrogen", chemical: "Spray Streptocycline @ 0.1g + COC @ 2.5g/L" }, ta: { name: "பாக்டீரியா இலை கருகல்", organic: "மாட்டுச் சாணக் கரைசல் தெளிக்கவும்", chemical: "Streptocycline + COC தெளிக்கவும்" }, te: { name: "బ్యాక్టీరియా ఆకు ఎండు తెగులు", organic: "ఆవు పేడ సారం పిచికారీ చేయండి", chemical: "స్ట్రెప్టోసైక్లిన్ + COC పిచికారీ చేయండి" } } }
    ],
    wheat: [
      { label: "Orange-brown powdery pustules on leaf surface", labelTA: "இலையின் மேல் ஆரஞ்சு-பழுப்பு நிற கொப்புளங்கள்", labelTE: "ఆకులపై నారింజ-గోధుమ పొడి మచ్చలు", part: "leaf", diseases: { en: { name: "Wheat Rust (Fungus)", organic: "Spray Trichoderma viride or diluted cow urine", chemical: "Spray Propiconazole @ 1ml/L" }, ta: { name: "கோதுமை இலைத் துரு நோய்", organic: "ட்ரைக்கோடெர்மா விரிடி தெளிக்கவும்", chemical: "Propiconazole @ 1ml/L தெளிக்கவும்" }, te: { name: "గోధుమ కుంకుమ తెగులు", organic: "ట్రైకోడెర్మా విరిడే వాడండి", chemical: "ప్రొపికోనజోల్ @ 1మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Grains eaten from inside, white maggots inside earheads", labelTA: "கதிர்களுக்குள் வெள்ளை புழுக்கள், தானியங்கள் உள்ளிருந்து தின்னப்படுதல்", labelTE: "కంకులలో తెల్ల పురుగులు, గింజలు లోపలి నుండి తినడం", part: "fruit", diseases: { en: { name: "Wheat Earhead Caterpillar", organic: "Install light traps, hand-pick and destroy larvae", chemical: "Spray Quinalphos @ 2ml/L during earhead stage" }, ta: { name: "கோதுமை கதிர்ப் புழு", organic: "விளக்குப் பொறிகள் வைக்கவும், புழுக்களை கையால் அகற்றவும்", chemical: "Quinalphos @ 2ml/L கதிர்ப் பருவத்தில் தெளிக்கவும்" }, te: { name: "గోధుమ కంకి పురుగు", organic: "లైట్ ట్రాప్‌లు పెట్టండి, లార్వాలను చేతితో తొలగించండి", chemical: "క్వినాల్ఫాస్ @ 2మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Black/dark brown smut covering the grains", labelTA: "தானியங்களை கருப்பு நிற பூஞ்சை மூடுதல்", labelTE: "గింజలను నల్లటి బూజు కప్పడం", part: "fruit", diseases: { en: { name: "Wheat Smut / Karnal Bunt", organic: "Use disease-free certified seeds, treat with Trichoderma", chemical: "Seed treatment with Carboxin @ 2g/kg seed" }, ta: { name: "கோதுமை கரும்பூஞ்சை நோய்", organic: "நோயற்ற சான்று விதைகளை பயன்படுத்துங்கள்", chemical: "விதை நேர்த்தி: Carboxin @ 2g/kg" }, te: { name: "గోధుమ నల్ల బూజు తెగులు", organic: "తెగులు లేని ధృవీకృత విత్తనాలు వాడండి", chemical: "విత్తన శుద్ధి: కార్బాక్సిన్ @ 2గ్రా/కిలో" } } }
    ],
    cotton: [
      { label: "Large holes on bolls with pink caterpillars inside", labelTA: "காய்களில் துளைகள், உள்ளே இளஞ்சிவப்பு புழுக்கள்", labelTE: "కాయలలో రంధ్రాలు, లోపల గులాబీ పురుగులు", part: "fruit", diseases: { en: { name: "Pink Bollworm", organic: "Install pheromone traps (5/acre), spray NSKE 5%", chemical: "Spray Profenofos @ 2ml/L" }, ta: { name: "இளஞ்சிவப்பு காய் புழு", organic: "இனக்கவர்ச்சி பொறிகள் (5/ஏக்கர்), NSKE 5% தெளிக்கவும்", chemical: "Profenofos @ 2ml/L தெளிக்கவும்" }, te: { name: "గులాబీ కాయ తొలిచే పురుగు", organic: "లింగాకర్షణ బుట్టలు (5/ఎకరం), NSKE 5% వాడండి", chemical: "ప్రొఫెనోఫాస్ @ 2మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Tiny white insects under leaves, sticky honeydew on leaves", labelTA: "இலைகளின் அடிப்புறத்தில் சிறிய வெள்ளை பூச்சிகள், இலைகளில் ஒட்டும் தேன் சுரப்பு", labelTE: "ఆకుల కింద చిన్న తెల్ల పురుగులు, జిగట తేనె పదార్థం", part: "leaf", diseases: { en: { name: "Cotton Whitefly / Mealy Bug", organic: "Spray fish oil soap @ 10ml/L or release ladybird beetles", chemical: "Spray Spiromesifen @ 1ml/L" }, ta: { name: "பருத்தி வெள்ளை ஈ / மாவுப்பூச்சி", organic: "மீன் எண்ணெய் சோப்பு @ 10ml/L தெளிக்கவும்", chemical: "Spiromesifen @ 1ml/L தெளிக்கவும்" }, te: { name: "పత్తి తెల్ల దోమ / పిండి పురుగు", organic: "చేప నూనె సబ్బు @ 10మి.లీ/లీ వాడండి", chemical: "స్పైరోమెసిఫెన్ @ 1మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Leaves curl upward, crinkle and thicken abnormally", labelTA: "இலைகள் மேல்நோக்கி சுருண்டு தடிப்பாதல்", labelTE: "ఆకులు పైకి ముడుచుకుపోయి అసహజంగా మందంగా మారడం", part: "leaf", diseases: { en: { name: "Cotton Leaf Curl Virus (CLCuV)", organic: "Remove infected plants, control whitefly vectors with neem", chemical: "Spray Thiamethoxam @ 0.5g/L to kill whitefly vectors" }, ta: { name: "பருத்தி இலைச்சுருள் வைரஸ்", organic: "பாதிக்கப்பட்ட செடிகளை அகற்றி, வேப்பங்கொட்டை கரைசல் தெளிக்கவும்", chemical: "Thiamethoxam @ 0.5g/L தெளிக்கவும்" }, te: { name: "పత్తి ఆకు ముడుత వైరస్", organic: "వైరస్ సోకిన మొక్కలను తొలగించి, వేప కషాయం పిచికారీ చేయండి", chemical: "థయామెథాక్సామ్ @ 0.5గ్రా/లీ తెల్ల దోమను నివారించండి" } } }
    ],
    tomato: [
      { label: "Dark concentric ring-spots on older leaves", labelTA: "முதிர்ந்த இலைகளில் வட்ட வடிவ கருகல் புள்ளிகள்", labelTE: "పాత ఆకులపై నల్లటి వలయాకార మచ్చలు", part: "leaf", diseases: { en: { name: "Early Blight (Alternaria)", organic: "Apply mulch, spray copper hydroxide", chemical: "Spray Mancozeb @ 2g/L" }, ta: { name: "தக்காளி ஆரம்ப கருகல் நோய்", organic: "தழைப்போர்வை அமைத்து காப்பர் ஹைட்ராக்சைடு தெளிக்கவும்", chemical: "Mancozeb @ 2g/L தெளிக்கவும்" }, te: { name: "టమాటా ఆకు మచ్చ తెగులు", organic: "మల్చింగ్ వేసి కాపర్ హైడ్రాక్సైడ్ పిచికారీ చేయండి", chemical: "మాంకోజెబ్ @ 2గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "Green caterpillars boring into fruits, holes with frass", labelTA: "பச்சை புழுக்கள் பழத்தை துளைத்தல், துளைகளில் எச்சங்கள்", labelTE: "పచ్చ పురుగులు పండ్లలో రంధ్రాలు చేయడం, మలం కనిపించడం", part: "fruit", diseases: { en: { name: "Tomato Fruit Borer (Helicoverpa)", organic: "Install pheromone traps, spray Bacillus thuringiensis (Bt) or NPV", chemical: "Spray Emamectin Benzoate @ 0.4g/L" }, ta: { name: "தக்காளி காய்ப்புழு (ஹெலிகோவர்பா)", organic: "இனக்கவர்ச்சி பொறிகள், Bt அல்லது NPV தெளிக்கவும்", chemical: "Emamectin Benzoate @ 0.4g/L தெளிக்கவும்" }, te: { name: "టమాటా కాయ తొలిచే పురుగు (హెలికోవర్పా)", organic: "లింగాకర్షణ బుట్టలు, Bt లేదా NPV పిచికారీ చేయండి", chemical: "ఎమామెక్టిన్ బెంజోయేట్ @ 0.4గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "Leaves curled upward, yellowed, plant stunted", labelTA: "இலைகள் மேல் நோக்கி சுருண்டு மஞ்சளாதல், செடி வளர்ச்சி குன்றுதல்", labelTE: "ఆకులు పైకి ముడుచుకుపోయి పసుపు రంగులోకి మారడం", part: "leaf", diseases: { en: { name: "Tomato Leaf Curl Virus (ToLCV)", organic: "Remove infected plants, spray neem oil to control whitefly", chemical: "Spray Thiamethoxam @ 0.5g/L to control whitefly vectors" }, ta: { name: "தக்காளி இலைச்சுருள் வைரஸ்", organic: "பாதிக்கப்பட்ட செடிகளை அகற்றி, வேப்ப எண்ணெய் தெளிக்கவும்", chemical: "Thiamethoxam @ 0.5g/L தெளிக்கவும்" }, te: { name: "టమాటా ఆకు ముడుత వైరస్", organic: "వైరస్ సోకిన మొక్కలను తొలగించి, వేప నూనె వాడండి", chemical: "థయామెథాక్సామ్ @ 0.5గ్రా/లీ తెల్ల దోమను నివారించండి" } } }
    ],
    onion: [
      { label: "Purple lesions with white fuzzy growth on leaves", labelTA: "இலைகளில் ஊதா கறைகள், வெள்ளை பூஞ்சை", labelTE: "ఆకులపై ఊదా మచ్చలు, తెల్ల బూజు", part: "leaf", diseases: { en: { name: "Onion Purple Blotch", organic: "Crop rotation, spray Pseudomonas @ 5g/L", chemical: "Spray Mancozeb @ 2.5g/L" }, ta: { name: "வெங்காயம் ஊதா கருகல் நோய்", organic: "பயிர் சுழற்சி, சூடோமோனாஸ் தெளிக்கவும்", chemical: "Mancozeb @ 2.5g/L தெளிக்கவும்" }, te: { name: "ఉల్లి ఊదా మచ్చ తెగులు", organic: "పంట మార్పిడి, సూడోమోనాస్ పిచికారీ చేయండి", chemical: "మాంకోజెబ్ @ 2.5గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "Small white maggots feeding inside onion bulbs", labelTA: "வெங்காய கிழங்குகளுக்குள் வெள்ளை புழுக்கள்", labelTE: "ఉల్లి దుంపలో తెల్ల పురుగులు తినడం", part: "root", diseases: { en: { name: "Onion Maggot (Root Fly)", organic: "Apply neem cake @ 250kg/acre to soil before planting", chemical: "Soil drench with Chlorpyriphos @ 2ml/L" }, ta: { name: "வெங்காய வேர் புழு (ஈ)", organic: "நடவுக்கு முன் வேப்பம் பிண்ணாக்கு @ 250kg/ஏக்கர் இடவும்", chemical: "குளோர்பைரிபாஸ் @ 2ml/L மண்ணில் ஊற்றவும்" }, te: { name: "ఉల్లి వేరు పురుగు (ఈగ)", organic: "నాటడానికి ముందు వేప పిండి @ 250కిలో/ఎకరం వేయండి", chemical: "క్లోర్‌పైరిఫాస్ @ 2మి.లీ/లీ నేలలో పోయండి" } } },
      { label: "Tiny dark thrips on leaves, silvery white patches", labelTA: "இலைகளில் சிறிய இருண்ட தத்துப்பூச்சிகள், வெள்ளி நிற திட்டுகள்", labelTE: "ఆకులపై చిన్న నల్లటి తామర పురుగులు, వెండి రంగు మచ్చలు", part: "leaf", diseases: { en: { name: "Onion Thrips", organic: "Spray neem oil @ 5ml/L, use blue sticky traps", chemical: "Spray Fipronil @ 1.5ml/L or Spinosad @ 0.3ml/L" }, ta: { name: "வெங்காய தத்துப்பூச்சி (த்ரிப்ஸ்)", organic: "வேப்ப எண்ணெய் @ 5ml/L தெளிக்கவும், நீல ஒட்டும் பொறிகள்", chemical: "Fipronil @ 1.5ml/L தெளிக்கவும்" }, te: { name: "ఉల్లి తామర పురుగు (థ్రిప్స్)", organic: "వేప నూనె @ 5మి.లీ/లీ, నీలం జిగురు బుట్టలు", chemical: "ఫిప్రోనిల్ @ 1.5మి.లీ/లీ పిచికారీ చేయండి" } } }
    ],
    mango: [
      { label: "Worms/maggots found inside small or ripe mangoes", labelTA: "சிறிய அல்லது பழுத்த மாம்பழங்களுக்குள் புழுக்கள்", labelTE: "చిన్న లేదా పండిన మామిడి పండ్లలో పురుగులు", part: "fruit", diseases: { en: { name: "Mango Fruit Fly (Bactrocera)", organic: "Install methyl eugenol traps (10/acre), collect and destroy fallen fruits daily", chemical: "Spray Malathion @ 2ml/L or bait spray with jaggery + Malathion" }, ta: { name: "மாம்பழ ஈ (பாக்ட்ரோசெரா)", organic: "மெத்தில் யூஜினால் பொறிகள் (10/ஏக்கர்), உதிர்ந்த பழங்களை அழிக்கவும்", chemical: "Malathion @ 2ml/L அல்லது வெல்ல கரைசல் + Malathion தெளிக்கவும்" }, te: { name: "మామిడి పండు ఈగ (బాక్ట్రోసెరా)", organic: "మిథైల్ యూజినాల్ బుట్టలు (10/ఎకరం), రాలిన పండ్లను ప్రతిరోజూ నాశనం చేయండి", chemical: "మాలాథియాన్ @ 2మి.లీ/లీ లేదా బెల్లం ద్రావణం + మాలాథియాన్ పిచికారీ చేయండి" } } },
      { label: "Flowers drying up, tiny brown hoppers jumping on inflorescence", labelTA: "பூக்கள் காய்ந்து உதிர்தல், பூங்கொத்தில் சிறிய பழுப்பு நிற தத்துப்பூச்சிகள்", labelTE: "పూత ఎండిపోవడం, పూగుత్తిపై చిన్న గోధుమ రంగు తత్తడి పురుగులు", part: "fruit", diseases: { en: { name: "Mango Hopper (Idioscopus)", organic: "Spray neem oil (3%) during panicle emergence, avoid dense canopy", chemical: "Spray Imidacloprid @ 0.3ml/L at flower bud stage" }, ta: { name: "மாம்பூ தத்துப்பூச்சி (ஐடியோஸ்கோபஸ்)", organic: "பூங்கொத்து தோன்றும்போது வேப்ப எண்ணெய் (3%) தெளிக்கவும்", chemical: "பூ மொட்டு பருவத்தில் Imidacloprid @ 0.3ml/L" }, te: { name: "మామిడి తాటాకు పురుగు (హాపర్)", organic: "పూగుత్తి వచ్చినప్పుడు వేప నూనె (3%) పిచికారీ చేయండి", chemical: "పూ మొగ్గ దశలో ఇమిడాక్లోప్రిడ్ @ 0.3మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Black spots on fruits, fruits rotting before ripening", labelTA: "பழங்களில் கருப்பு புள்ளிகள், பழுக்கும் முன் அழுகல்", labelTE: "பండ్లపై నల్ల మచ్చలు, పక్వానికి ముందే కుళ్ళిపోవడం", part: "fruit", diseases: { en: { name: "Mango Anthracnose (Colletotrichum)", organic: "Spray Bordeaux mixture (1%), prune dense branches for air circulation", chemical: "Spray Carbendazim @ 1g/L or Copper Oxychloride @ 3g/L" }, ta: { name: "மாம்பழ ஆந்த்ராக்னஸ் நோய்", organic: "போர்டோ கரைசல் (1%) தெளிக்கவும், காற்றோட்டத்திற்கு கிளைகளை கவாத்து செய்யுங்கள்", chemical: "Carbendazim @ 1g/L அல்லது COC @ 3g/L தெளிக்கவும்" }, te: { name: "మామిడి ఆంత్రాక్నోస్ (కుళ్ళు తెగులు)", organic: "బోర్డో మిశ్రమం (1%) పిచికారీ చేయండి, కొమ్మలను కత్తిరించండి", chemical: "కార్బెండజిమ్ @ 1గ్రా/లీ లేదా COC @ 3గ్రా/లీ పిచికారీ చేయండి" } } }
    ],
    banana: [
      { label: "Yellowing of lower leaves, plant topples over easily", labelTA: "கீழ் இலைகள் மஞ்சளாதல், செடி எளிதில் சாய்தல்", labelTE: "కింది ఆకులు పసుపు రంగులోకి మారడం, మొక్క సులభంగా పడిపోవడం", part: "leaf", diseases: { en: { name: "Banana Panama Wilt (Fusarium)", organic: "Use disease-free suckers, apply Trichoderma to soil @ 2.5kg/acre", chemical: "Soil drench with Carbendazim @ 2g/L around pseudostem base" }, ta: { name: "வாழை பனாமா வாடல் நோய்", organic: "நோயற்ற கன்றுகளை பயன்படுத்தி, ட்ரைக்கோடெர்மா மண்ணில் இடவும்", chemical: "போலித் தண்டு அடிப்பகுதியில் Carbendazim @ 2g/L ஊற்றவும்" }, te: { name: "అరటి పనామా వాడు తెగులు", organic: "తెగులు లేని కాండాలను వాడండి, ట్రైకోడెర్మా @ 2.5కిలో/ఎకరం వేయండి", chemical: "కాండం మొదట కార్బెండజిమ్ @ 2గ్రా/లీ పోయండి" } } },
      { label: "Banana bunches have tiny black beetles, fruit skin scarred", labelTA: "வாழைத்தார்களில் சிறிய கருப்பு வண்டுகள், பழத்தோல் கீறல்கள்", labelTE: "అరటి గెలలపై చిన్న నల్ల పురుగులు, పండు తోలుపై గీతలు", part: "fruit", diseases: { en: { name: "Banana Scarring Beetle / Fruit Fly", organic: "Cover bunches with polythene sleeves, remove dried flower parts", chemical: "Spray Chlorpyriphos @ 2ml/L on bunches after last hand opening" }, ta: { name: "வாழைப்பழ கீறல் வண்டு / பழ ஈ", organic: "தாரை பாலிதீன் உறையால் மூடவும், காய்ந்த பூ பகுதிகளை அகற்றவும்", chemical: "கடைசி சீப்பு வெளிவந்தவுடன் Chlorpyriphos @ 2ml/L தெளிக்கவும்" }, te: { name: "అరటి పండు గీతల పురుగు / పండు ఈగ", organic: "గెలలను పాలిథీన్ కవర్లతో కప్పండి, ఎండిన పూ భాగాలను తొలగించండి", chemical: "చివరి చేయి తెరచిన తర్వాత క్లోర్‌పైరిఫాస్ @ 2మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Reddish-brown tunnels inside pseudostem, plant wilting", labelTA: "போலித் தண்டுக்குள் செம்பழுப்பு சுரங்கங்கள், செடி வாடுதல்", labelTE: "కాండం లోపల ఎర్రటి-గోధుమ సొరంగాలు, మొక్క వాడిపోవడం", part: "stem", diseases: { en: { name: "Banana Pseudostem Borer (Weevil)", organic: "Apply neem cake around plant base, use longitudinal split traps with fresh pseudostem", chemical: "Inject Monocrotophos 2ml in 4ml water into pseudostem holes" }, ta: { name: "வாழை தண்டுத் துளைப்பான் (ஈசல்)", organic: "வேப்பம் பிண்ணாக்கு அடிப்பகுதியில் இடவும், பொறிகள் வைக்கவும்", chemical: "Monocrotophos 2ml ஊசி மூலம் செலுத்தவும்" }, te: { name: "అరటి కాండపు తొలిచే పురుగు (వీవిల్)", organic: "మొదట వేప పిండి వేయండి, తాజా కాండం ముక్కలతో బుట్టలు పెట్టండి", chemical: "కాండపు రంధ్రంలో మోనోక్రోటోఫాస్ 2మి.లీ ఇంజెక్ట్ చేయండి" } } }
    ],
    potato: [
      { label: "Water-soaked dark spots on leaves, white mold underneath", labelTA: "இலைகளில் நீர்த்த கரும்புள்ளிகள், கீழே வெள்ளை பூஞ்சை", labelTE: "ఆకులపై నీటితో తడిసిన నల్ల మచ్చలు, కింద తెల్ల బూజు", part: "leaf", diseases: { en: { name: "Potato Late Blight (Phytophthora)", organic: "Spray Bordeaux mixture (1%), remove infected plants", chemical: "Spray Metalaxyl+Mancozeb @ 2g/L" }, ta: { name: "உருளை தாமத கருகல் நோய்", organic: "போர்டோ கரைசல் (1%) தெளிக்கவும்", chemical: "Metalaxyl+Mancozeb @ 2g/L தெளிக்கவும்" }, te: { name: "బంగాళదుంప అంగారు తెగులు", organic: "బోర్డో మిశ్రమం (1%) పిచికారీ చేయండి", chemical: "మెటాలాక్సిల్+మాంకోజెబ్ @ 2గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "Tubers have holes with white grubs inside", labelTA: "கிழங்குகளில் துளைகள், உள்ளே வெள்ளை புழுக்கள்", labelTE: "ఉల్లి దుంపలో తెల్ల పురుగులు తినడం", part: "root", diseases: { en: { name: "Potato Tuber Moth / White Grub", organic: "Earth up soil around plants, apply neem cake to soil", chemical: "Soil application of Phorate granules @ 10kg/acre" }, ta: { name: "உருளை கிழங்கு அந்துப்பூச்சி / வெள்ளை புழு", organic: "உருளை கிழங்கு அந்துப்பூச்சி / வெள்ளை புழு", chemical: "Phorate தானியங்கள் @ 10kg/ஏக்கர் மண்ணில் இடவும்" }, te: { name: "బంగాళదుంప దుంప పురుగు / తెల్ల గ్రబ్", organic: "మొక్కల చుట్టూ మట్టి ఎగదోయండి, వేప పిండి వేయండి", chemical: "ఫోరేట్ కణాలు @ 10కిలో/ఎకరం నేలలో వేయండి" } } },
      { label: "Black/brown rough scabs on tuber skin", labelTA: "கிழங்கு தோலில் கருப்பு/பழுப்பு சொரசொரப்பான புள்ளிகள்", labelTE: "దుంప తోలుపై నల్ల/గోధుమ గరుకు మచ్చలు", part: "root", diseases: { en: { name: "Potato Common Scab / Black Scurf", organic: "Maintain soil pH below 5.5, use disease-free seed tubers", chemical: "Seed treatment with Boric acid @ 0.2% solution" }, ta: { name: "உருளை சொறி / கரும்புள்ளி நோய்", organic: "மண் pH 5.5 க்கு கீழ் வைக்கவும், நோயற்ற விதைக்கிழங்கு பயன்படுத்தவும்", chemical: "விதை நேர்த்தி: போரிக் அமிலம் 0.2% கரைசல்" }, te: { name: "బంగాళదుంప దద్దు / నల్ల మచ్చ తెగులు", organic: "నేల pH 5.5 కంటే தక్కువగా ఉంచండి, తెగులు లేని విత్తన దుంపలు వాడండి", chemical: "విత్తన శుద్ధి: బోరిక్ ఆసిడ్ 0.2% ద్రావణం" } } }
    ],
    corn: [
      { label: "Holes in whorl leaves, caterpillar frass visible", labelTA: "சுருள் இலைகளில் துளைகள், புழு எச்சங்கள்", labelTE: "మడత ఆకులలో రంధ్రాలు, పురుగు మలం కనిపించడం", part: "leaf", diseases: { en: { name: "Fall Armyworm (Spodoptera)", organic: "Spray Bt or NPV, install pheromone traps (5/acre)", chemical: "Spray Emamectin Benzoate @ 0.4g/L into whorl" }, ta: { name: "படை புழு (ஸ்போடோப்டெரா)", organic: "Bt அல்லது NPV தெளிக்கவும், இனக்கவர்ச்சி பொறிகள்", chemical: "Emamectin Benzoate @ 0.4g/L சுருள் இலையில் தெளிக்கவும்" }, te: { name: "సేనా పురుగు (స్పోడోప్టెరా)", organic: "Bt లేదా NPV పిచికారీ చేయండి, లింగాకర్షణ బుట్టలు", chemical: "ఎమామెక్టిన్ బెంజోయేట్ @ 0.4గ్రా/లీ మడత ఆకులో పోయండి" } } },
      { label: "Stem broken at base, pinkish borer caterpillar inside", labelTA: "அடிப்பகுதியில் தண்டு முறிவு, உள்ளே இளஞ்சிவப்பு புழு", labelTE: "అడుగు భాగంలో కాండం విరిగిపోవడం, లోపల గులాబీ పురుగు", part: "stem", diseases: { en: { name: "Maize Stem Borer (Chilo)", organic: "Release Trichogramma cards (6/acre), remove affected plants", chemical: "Apply Carbofuran granules in leaf whorl @ 8-10 kg/acre" }, ta: { name: "மக்காச்சோளம் தண்டு துளைப்பான்", organic: "டிரைக்கோகிராமா அட்டைகள் (6/ஏக்கர்) விடுங்கள்", chemical: "Carbofuran தானியங்கள் இலை சுருளில் இடவும்" }, te: { name: "మొక్కజొన్న కాండపు తొలిచే పురుగు", organic: "ట్రైకోగ్రామా కార్డులు (6/ఎకరం) విడుదల చేయండి", chemical: "కార్బోఫ్యూరాన్ కణాలను ఆకు మడతలో వేయండి" } } }
    ],
    soybean: [
      { label: "Windows/skeleton pattern on leaves from caterpillar feeding", labelTA: "புழுக்கள் இலைகளை தின்பதால் ஜன்னல் போன்ற வடிவம்", labelTE: "పురుగులు ఆకులను తినడం వల్ల కిటికీ లాంటి నమూనా", part: "leaf", diseases: { en: { name: "Soybean Semilooper / Leaf Miner", organic: "Spray NPV or Bt, handpick large caterpillars", chemical: "Spray Quinalphos @ 2ml/L or Chlorantraniliprole" }, ta: { name: "சோயாபீன் செமிலூப்பர் / இலை துளைப்பான்", organic: "NPV அல்லது Bt தெளிக்கவும்", chemical: "Quinalphos @ 2ml/L தெளிக்கவும்" }, te: { name: "సోయాబీన్ సెమీలూపర్ / ఆకు తొలిచే పురుగు", organic: "NPV లేదా Bt పిచికారీ చేయండి", chemical: "క్వినాల్ఫాస్ @ 2మి.లీ/లీ పిచికారీ చేయండి" } } },
      { label: "Pods turning brown with white fungal growth, seeds shriveled", labelTA: "காய்கள் பழுப்பாகி வெள்ளை பூஞ்சை, விதைகள் சுருங்குதல்", labelTE: "కాయలు గోధుమ రంగుతో తెల్ల బూజు, గింజలు ముడుచుకుపోవడం", part: "fruit", diseases: { en: { name: "Soybean Pod Blight / Anthracnose", organic: "Seed treatment with Trichoderma, maintain proper spacing", chemical: "Spray Thiophanate methyl @ 1g/L at pod-fill stage" }, ta: { name: "சோயாபீன் காய் கருகல் / ஆந்த்ராக்னஸ்", organic: "விதையை ட்ரைக்கோடெர்மா கொண்டு நேர்த்தி செய்யவும்", chemical: "காய் பிடிக்கும் பருவத்தில் Thiophanate methyl @ 1g/L" }, te: { name: "సోయాబీన్ కాయ ఎండు / ఆంత్రాక్నోస్", organic: "విత్తనాలను ట్రైకోడెర్మాతో శుద్ధి చేయండి", chemical: "కాయ పట్టే దశలో థయోఫానేట్ మిథైల్ @ 1గ్రా/లీ" } } },
      { label: "Yellowish tiny insects sucking sap from pods", labelTA: "காயகளிலிருந்து சாறு உறிஞ்சும் சிறிய மஞ்சள் பூச்சிகள்", labelTE: "కాయల నుండి రసం పీల్చే చిన్న పసుపు పురుగులు", part: "fruit", diseases: { en: { name: "Soybean Pod Sucking Bug (Riptortus)", organic: "Install light traps, spray neem oil 3%", chemical: "Spray Thiamethoxam @ 0.5g/L" }, ta: { name: "சோயாபீன் காய் உறிஞ்சும் மூட்டை பூச்சி", organic: "விளக்குப் பொறிகள், வேப்ப எண்ணெய் 3%", chemical: "Thiamethoxam @ 0.5g/L தெளிக்கவும்" }, te: { name: "సోయాబీన్ కాయ పీల్చే పురుగు", organic: "లైట్ ట్రాప్‌లు, వేప నూనె 3%", chemical: "థయామెథాక్సామ్ @ 0.5గ్రా/లీ పిచికారీ చేయండి" } } }
    ],
    gram: [
      { label: "Green caterpillars eating pods and flowers", labelTA: "பச்சை புழுக்கள் காய்கள் மற்றும் பூக்களை தின்னுதல்", labelTE: "పచ్చ పురుగులు కాయలు మరియు పూలను తినడం", part: "fruit", diseases: { en: { name: "Gram Pod Borer (Helicoverpa)", organic: "Install pheromone traps (5/acre), spray HaNPV or Bt", chemical: "Spray Emamectin Benzoate @ 0.4g/L at 50% flowering" }, ta: { name: "கடலை காய்ப்புழு (ஹெலிகோவர்பா)", organic: "இனக்கவர்ச்சி பொறிகள், HaNPV அல்லது Bt தெளிக்கவும்", chemical: "50% பூக்கும்போது Emamectin Benzoate @ 0.4g/L" }, te: { name: "శనగ కాయ తొలిచే పురుగు (హెలికోవర్పా)", organic: "లింగాకర్షణ బుట్టలు, HaNPV లేదా Bt పిచికారీ", chemical: "50% పూత దశలో ఎమామెక్టిన్ బెంజోయేట్ @ 0.4గ్రా/లీ" } } },
      { label: "Plants wilting suddenly, roots rotting and black", labelTA: "செடிகள் திடீரென வாடுதல், வேர்கள் கருத்து அழுகுதல்", labelTE: "మొక్కలు అకస్మాత్తుగా వాడిపోవడం, వేర్లు కుళ్ళి నల్లగా మారడం", part: "root", diseases: { en: { name: "Gram Wilt (Fusarium oxysporum)", organic: "Seed treatment with Trichoderma @ 4g/kg, deep summer ploughing", chemical: "Seed treatment with Carbendazim @ 2g/kg + Thiram @ 2g/kg" }, ta: { name: "கடலை வாடல் நோய் (ஃபியூசேரியம்)", organic: "விதையை ட்ரைக்கோடெர்மா @ 4g/kg கொண்டு நேர்த்தி", chemical: "விதை நேர்த்தி: Carbendazim + Thiram @ 2g/kg" }, te: { name: "శనగ వాడు తెగులు (ఫ్యూసేరియం)", organic: "విత్తన శుద్ధి: ట్రైకోడెర్మా @ 4గ్రా/కిలో", chemical: "విత్తన శుద్ధి: కార్బెండజిమ్ + థైరమ్ @ 2గ్రా/కిలో" } } },
      { label: "Tiny pinholes in stored gram seeds, small beetles", labelTA: "சேமிக்கப்பட்ட கடலையில் சிறிய துளைகள், சிறிய வண்டுகள்", labelTE: "నిల్వ చేసిన శనగలో చిన్న రంధ్రాలు, చిన్న పురుగులు", part: "fruit", diseases: { en: { name: "Pulse Beetle (Callosobruchus / Storage Pest)", organic: "Mix dried neem leaves in storage, sun-dry grains before storage", chemical: "Fumigation with Aluminium Phosphide tablets (by licensed operator)" }, ta: { name: "பருப்பு வண்டு (சேமிப்பு பூச்சி)", organic: "சேமிப்பில் வேப்பிலை கலக்கவும், சேமிப்புக்கு முன் வெயிலில் காயவும்", chemical: "அலுமினியம் பாஸ்பைடு மாத்திரை (உரிமம் பெற்றவர் மூலம்)" }, te: { name: "పప్పు పురుగు (నిల్వ పురుగు)", organic: "నిల్వలో ఎండిన వేప ఆకులు కలపండి, ఎండబెట్టి నిల్వ చేయండి", chemical: "అల్యూమినియం ఫాస్ఫైడ్ టాబ్లెట్లతో ఫ్యూమిగేషన్" } } }
    ],
    turmeric: [
      { label: "Leaf edges rolling inward, yellowing and drying", labelTA: "இலை விளிம்புகள் உள்நோக்கி சுருளுதல், மஞ்சளாகி உலர்தல்", labelTE: "ఆకు అంచులు లోపలికి ముడుచుకుపోవడం, పసుపు రంగుకు మారి ఎండిపోవడం", part: "leaf", diseases: { en: { name: "Turmeric Leaf Blotch / Leaf Spot", organic: "Spray Bordeaux mixture 1% or Trichoderma", chemical: "Spray Mancozeb @ 2.5g/L at 15-day intervals" }, ta: { name: "மஞ்சள் இலைப்புள்ளி நோய்", organic: "போர்டோ கரைசல் 1% தெளிக்கவும்", chemical: "Mancozeb @ 2.5g/L 15 நாள் இடைவெளியில்" }, te: { name: "పసుపు ఆకు మచ్చ తెగులు", organic: "బోర్డో మిశ్రమం 1% పిచికారీ చేయండి", chemical: "మాంకోజెబ్ @ 2.5గ్రా/లీ 15 రోజుల వ్యవధిలో" } } },
      { label: "Rhizomes rotting with foul smell, plant collapsing", labelTA: "கிழங்குகள் துர்நாற்றத்துடன் அழுகுதல், செடி சரிவு", labelTE: "దుంపలు దుర్వాసనతో కుళ్ళిపోవడం, మొక్క కూలిపోవడం", part: "root", diseases: { en: { name: "Turmeric Rhizome Rot (Pythium/Bacterial)", organic: "Dip rhizomes in Trichoderma solution before planting, improve drainage", chemical: "Drench soil with Metalaxyl @ 2g/L + Streptocycline @ 0.1g/L" }, ta: { name: "மஞ்சள் கிழங்கு அழுகல் நோய்", organic: "நடவுக்கு முன் கிழங்குகளை ட்ரைக்கோடெர்மா கரைசலில் நனைக்கவும்", chemical: "Metalaxyl @ 2g/L + Streptocycline மண்ணில் ஊற்றவும்" }, te: { name: "పసుపు దుంప కుళ్ళు తెగులు", organic: "నాటడానికి ముందు దుంపలను ట్రైకోడెర్మా ద్రావణంలో నానబెట్టండి", chemical: "మెటాలాక్సిల్ @ 2గ్రా/లీ + స్ట్రెప్టోసైక్లిన్ నేలలో పోయండి" } } },
      { label: "Stem borer tunnels inside pseudostem, plant wilting", labelTA: "போலித் தண்டுக்குள் புழு சுரங்கங்கள், செடி வாடுதல்", labelTE: "కాండంలో పురుగు సొరంగాలు, మొక్క వాడిపోవడం", part: "stem", diseases: { en: { name: "Turmeric Shoot Borer (Conogethes)", organic: "Install pheromone traps, spray neem oil @ 5ml/L", chemical: "Spray Chlorantraniliprole @ 0.3ml/L or Carbofuran granules in whorl" }, ta: { name: "மஞ்சள் தண்டு துளைப்பான்", organic: "இனக்கவர்ச்சி பொறிகள், வேப்ப எண்ணெய் @ 5ml/L", chemical: "Chlorantraniliprole @ 0.3ml/L தெளிக்கவும்" }, te: { name: "పసుపు కాండపు తొలిచే పురుగు", organic: "లింగాకర్షణ బుట్టలు, వేప నూనె @ 5మి.లీ/లీ", chemical: "క్లోరాంట్రానిలిప్రోల్ @ 0.3మి.లీ/లీ పిచికారీ చేయండి" } } }
    ]
  };

  if (DB[cropId]) return DB[cropId];

  // Dynamic fallback by category
  const crop = CROPS.find(c => c.id === cropId) || CROPS[0];
  
  if (crop.category === "Fruits") {
    return [
      { label: "Worms/maggots found inside ripe or small fruits", labelTA: "பழுத்த அல்லது சிறிய பழங்களுக்குள் புழுக்கள்", labelTE: "పండిన లేదా చిన్న పండ్లలో పురుగులు/పురుగు గుడ్లు", part: "fruit", diseases: { en: { name: `${crop.name} Fruit Fly / Fruit Borer`, organic: "Install methyl eugenol/pheromone traps, collect fallen fruits daily", chemical: "Bait spray: Malathion @ 2ml/L + jaggery solution" }, ta: { name: `${crop.nameTA} பழ ஈ / காய்ப்புழு`, organic: "பழ ஈ பொறிகள் வைக்கவும், உதிர்ந்த பழங்களை அகற்றவும்", chemical: "Malathion @ 2ml/L + வெல்ல கரைசல் தெளிக்கவும்" }, te: { name: `${crop.nameTE} పండు ఈగ / కాయ తొలిచే పురుగు`, organic: "పండు ఈగ బుట్టలు అమర్చండి, రాలిన పండ్లను తొలగించండి", chemical: "మాలాథియాన్ @ 2మి.లీ/లీ + బెల్లం ద్రావణం పిచికారీ చేయండి" } } },
      { label: "Black/brown sunken spots on fruits, fruits rotting", labelTA: "பழங்களில் கரும்புள்ளிகள், பழங்கள் அழுகுதல்", labelTE: "పండ్లపై నల్ల/గోధుమ గుంత మచ్చలు, కుళ్ళిపోవడం", part: "fruit", diseases: { en: { name: `${crop.name} Anthracnose / Fruit Rot`, organic: "Spray Bordeaux mixture 1%, prune dense branches", chemical: "Spray Carbendazim @ 1g/L or Copper Oxychloride @ 3g/L" }, ta: { name: `${crop.nameTA} ஆந்த்ராக்னஸ் / பழ அழுகல்`, organic: "போர்டோ கரைசல் 1%, கிளைகளை கவாத்து செய்யுங்கள்", chemical: "Carbendazim @ 1g/L தெளிக்கவும்" }, te: { name: `${crop.nameTE} ఆంత్రాక్నోస్ / పండు కుళ్ళు`, organic: "బోర్డో మిశ్రమం 1%, కొమ్మలను కత్తిరించండి", chemical: "కార్బెండజిమ్ @ 1గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "Flowers drying, tiny hoppers on flower clusters", labelTA: "பூக்கள் காய்தல், பூங்கொத்தில் சிறிய தத்துப்பூச்சிகள்", labelTE: "పూలు ఎండిపోవడం, పూగుత్తులపై చిన్న తత్తడి పురుగులు", part: "fruit", diseases: { en: { name: `${crop.name} Flower Hopper / Mealybug`, organic: "Spray neem oil 3%, encourage natural predators like ladybirds", chemical: "Spray Imidacloprid @ 0.3ml/L at flower bud stage" }, ta: { name: `${crop.nameTA} பூ தத்துப்பூச்சி / மாவுப்பூச்சி`, organic: "வேப்ப எண்ணெய் 3%, இயற்கை எதிரிகளை ஊக்குவிக்கவும்", chemical: "பூ மொட்டு பருவத்தில் Imidacloprid @ 0.3ml/L" }, te: { name: `${crop.nameTE} పూత హాపర్ / పిండి పురుగు`, organic: "వేప నూనె 3%, సహజ శత్రువులను ప్రోత్సహించండి", chemical: "పూ మొగ్గ దశలో ఇమిడాక్లోప్రిడ్ @ 0.3మి.లీ/లీ" } } }
    ];
  }
  
  if (crop.category === "Vegetables" || crop.category === "Spices") {
    return [
      { label: "Caterpillars boring holes in fruits/pods with excrement", labelTA: "காய்களில் புழுக்கள் துளையிடுதல், எச்சங்கள்", labelTE: "కాయలలో పురుగులు రంధ్రాలు చేయడం, మలం కనిపించడం", part: "fruit", diseases: { en: { name: `${crop.name} Fruit/Shoot Borer`, organic: "Install pheromone traps (5/acre), spray Bt or NPV", chemical: "Spray Emamectin Benzoate @ 0.4g/L" }, ta: { name: `${crop.nameTA} காய்/குருத்து துளைப்பான்`, organic: "இனக்கவர்ச்சி பொறிகள் (5/ஏக்கர்), Bt தெளிக்கவும்", chemical: "Emamectin Benzoate @ 0.4g/L தெளிக்கவும்" }, te: { name: `${crop.nameTE} కాయ/చిగురు తొలిచే పురుగు`, organic: "లింగాకర్షణ బుట్టలు (5/ఎకరం), Bt పిచికారీ", chemical: "ఎమామెక్టిన్ బెంజోయేట్ @ 0.4గ్రా/లీ పిచికారీ చేయండి" } } },
      { label: "Leaves/fruits wilting, plant collapsing from base", labelTA: "இலைகள்/காய்கள் வாடுதல், அடிப்பகுதியிலிருந்து செடி சரிவு", labelTE: "ఆకులు/కాయలు వాడిపోవడం, మొదటి నుండి మొక్క కూలిపోవడం", part: "root", diseases: { en: { name: `${crop.name} Wilt / Root Rot / Damping Off`, organic: "Seed treatment with Trichoderma @ 4g/kg, improve drainage", chemical: "Soil drench with Copper Oxychloride @ 3g/L" }, ta: { name: `${crop.nameTA} வாடல் / வேர் அழுகல்`, organic: "விதையை ட்ரைக்கோடெர்மா @ 4g/kg கொண்டு நேர்த்தி", chemical: "காப்பர் ஆக்ஸிகுளோரைடு @ 3g/L மண்ணில்" }, te: { name: `${crop.nameTE} వాడు / వేరు కుళ్ళు`, organic: "విత్తన శుద్ధి: ట్రైకోడెర్మా @ 4గ్రా/కిలో", chemical: "కాపర్ ఆక్సిక్లోరైడ్ @ 3గ్రా/లీ నేలలో పోయండి" } } },
      { label: "Tiny sucking insects under leaves, leaves turning yellow/curling", labelTA: "இலைகளின் கீழ் சிறிய சாறு உறிஞ்சும் பூச்சிகள், இலைகள் மஞ்சளாதல்/சுруளுதல்", labelTE: "ఆకుల కింద చిన్న రసం పీల్చే పురుగులు, ఆకులు పసుపు/ముడుచుకుపోవడం", part: "leaf", diseases: { en: { name: `${crop.name} Whitefly / Aphids / Thrips`, organic: "Spray neem oil @ 5ml/L, use yellow/blue sticky traps", chemical: "Spray Thiamethoxam @ 0.5g/L or Fipronil @ 1.5ml/L" }, ta: { name: `${crop.nameTA} வெள்ளை ஈ / ஈறு / தத்துப்பூச்சி`, organic: "வேப்ப எண்ணெய் @ 5ml/L, மஞ்சள்/நீல ஒட்டும் பொறிகள்", chemical: "Thiamethoxam @ 0.5g/L தெளிக்கவும்" }, te: { name: `${crop.nameTE} తెల్ల దోమ / పేను / తామర పురుగు`, organic: "వేప నూనె @ 5మి.లీ/లీ, పసుపు/నీలం జిగురు బుట్టలు", chemical: "థయామెథాక్సామ్ @ 0.5గ్రా/లీ పిచికారీ చేయండి" } } }
    ];
  }
  
  // Pulses / Oilseeds / Cereals / Cash Crops default
  return [
    { label: "Caterpillars eating pods/grains, holes with excrement", labelTA: "புழுக்கள் காய்கள்/தானியங்களை தின்னுதல், எச்சங்களுடன் துளைகள்", labelTE: "పురుగులు కాయలు/గింజలను తినడం, మలంతో రంధ్రాలు", part: "fruit", diseases: { en: { name: `${crop.name} Pod Borer / Grain Pest`, organic: "Install pheromone traps, spray Bt or NPV", chemical: "Spray Emamectin Benzoate @ 0.4g/L" }, ta: { name: `${crop.nameTA} காய்ப்புழு / தானிய பூச்சி`, organic: "இனக்கவர்ச்சி பொறிகள், Bt அல்லது NPV தெளிக்கவும்", chemical: "Emamectin Benzoate @ 0.4g/L தெளிக்கவும்" }, te: { name: `${crop.nameTE} కాయ తొలిచే పురుగు / గింజ పురుగు`, organic: "లింగాకర్షణ బుట్టలు, Bt లేదా NPV పిచికారీ", chemical: "ఎమామెక్టిన్ బెంజోయేట్ @ 0.4గ్రా/లీ పిచికారీ చేయండి" } } },
    { label: "Brown/orange rust spots or blight on leaves", labelTA: "இலைகளில் பழுப்பு/ஆரஞ்சு துரு புள்ளிகள் அல்லது கருகல்", labelTE: "ఆకులపై గోధుమ/నారింజ తుప్పు మచ్చలు లేదా ఎండు తెగులు", part: "leaf", diseases: { en: { name: `${crop.name} Leaf Rust / Blight`, organic: "Spray Neem Seed Kernel Extract 5% or Trichoderma", chemical: "Spray Mancozeb @ 2.5g/L or Propiconazole @ 1ml/L" }, ta: { name: `${crop.nameTA} இலை துரு / கருகல் நோய்`, organic: "வேப்பங்கொட்டை கரைசல் 5% தெளிக்கவும்", chemical: "Mancozeb @ 2.5g/L தெளிக்கவும்" }, te: { name: `${crop.nameTE} ఆకు తుప్పు / ఎండు తెగులు`, organic: "వేప పిండి కషాయం 5% పిచికారీ చేయండి", chemical: "మాంకోజెబ్ @ 2.5గ్రా/లీ పిచికారీ చేయండి" } } },
    { label: "Plants wilting in patches, roots rotting", labelTA: "குறிப்பிட்ட இடங்களில் செடிகள் வாடுதல், வேர்கள் அழுகுதல்", labelTE: "భాగాలుగా మొక్కలు వాడిపోవడం, వేర్లు కుళ్ళిపోవడం", part: "root", diseases: { en: { name: `${crop.name} Wilt / Root Rot`, organic: "Seed treatment with Trichoderma @ 4g/kg, improve drainage", chemical: "Soil drench with Copper Oxychloride @ 3g/L" }, ta: { name: `${crop.nameTA} வாடல் / வேர் அழுகல்`, organic: "விதையை ட்ரைக்கோடெர்மா @ 4g/kg நேர்த்தி", chemical: "காப்பர் ஆக்ஸிகுளோரைடு @ 3g/L மண்ணில்" }, te: { name: `${crop.nameTE} వాడు / వేరు కుళ్ళు తెగులు`, organic: "విత్తన శుద్ధి: ట్రైకోడెర్మా @ 4గ్రా/కిలో", chemical: "కాపర్ ఆక్సిక్లోరైడ్ @ 3గ్రా/లీ నేలలో పోయండి" } } }
  ];
};export default function AgriToolsPage() {
  const { language } = useApp();
  const L = LABELS[language as Language] || LABELS.en;
  
  const [activeTab, setActiveTab] = useState<"arbitrage" | "kcc" | "pmkisan" | "cost" | "calendar" | "pest" | "warning" | "heatmap" | "ocr">("arbitrage");

  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [calCrop, setCalCrop] = useState<string>("rice");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setPortfolio(user.portfolio || []);
      if (user.portfolio && user.portfolio.length > 0) {
        setCalCrop(user.portfolio[0]);
      }
    }
  }, []);

  // 1. Arbitrage Finder states
  const [selectedCrop, setSelectedCrop] = useState<string>("rice");
  const [qty, setQty] = useState<number>(30);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("tata_ace");
  const [fuelPrice, setFuelPrice] = useState<number>(98);
  const [arbitrageResults, setArbitrageResults] = useState<any[]>([]);

  // 2. Crop Calendar states
  const [sowDate, setSowDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // 3. Pest Scanner states
  const [scannerCrop, setScannerCrop] = useState<string>("rice");
  const [selectedSymptomIdx, setSelectedSymptomIdx] = useState<number>(0);
  const [selectedPart, setSelectedPart] = useState<string>("all");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Clear scan result when crop or symptom changes
  useEffect(() => {
    setScanResult(null);
  }, [scannerCrop, selectedSymptomIdx, selectedPart]);

  // 4. Weather Risk states
  const [warnCrop, setWarnCrop] = useState<string>("rice");
  const [harvestMonth, setHarvestMonth] = useState<string>("November");
  const [weatherAlert, setWeatherAlert] = useState<string>("heavy_rain");
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  // 5. Heatmap states
  const [heatmapCrop, setHeatmapCrop] = useState<string>("rice");
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  // Calculate Arbitrage
  const handleCalculateArbitrage = () => {
    const cropData = CROPS.find(c => c.id === selectedCrop) || CROPS[0];
    const vehicle = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[0];
    
    const results = MANDIS.map(mandi => {
      const grossPricePerQtl = cropData.basePrice * mandi.priceOffset;
      const grossValue = grossPricePerQtl * qty;
      
      // Calculate travel cost: distance * 2 (round-trip) / efficiency * fuelPrice + labor + toll
      const roundTripDist = mandi.distance * 2;
      const fuelCost = (roundTripDist / vehicle.efficiency) * fuelPrice;
      const tollCost = mandi.distance > 50 ? 250 : 0;
      const totalCost = fuelCost + tollCost + vehicle.laborCost;
      
      const netProfit = grossValue - totalCost;
      
      return {
        ...mandi,
        grossValue,
        totalCost,
        netProfit
      };
    });
    
    setArbitrageResults(results.sort((a, b) => b.netProfit - a.netProfit));
  };

  // Generate Calendar Task list
  const getTasks = (): { id: string; task: string; date: string; offsetDays: number }[] => {
    const start = new Date(sowDate);
    const formatDate = (days: number) => {
      const d = new Date(start);
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString(language === "en" ? "en-IN" : language === "te" ? "te-IN" : "ta-IN", {
        day: "2-digit", month: "short", year: "numeric"
      });
    };

    const crop = CROPS.find(c => c.id === calCrop) || CROPS[0];
    const isTomatoOrVeg = crop.category === "Vegetables" || calCrop === "tomato";
    const isMustardOrOil = crop.category === "Oilseeds" || calCrop === "mustard";

    if (language === "ta") {
      if (isTomatoOrVeg) {
        return [
          { id: "sow", task: "நாற்று நடும் தொட்டியில் விதைப்பு செய்தல்", date: formatDate(0), offsetDays: 0 },
          { id: "transplant", task: "நாற்றுகளை பிரதான வயலுக்கு மாற்றுதல்", date: formatDate(22), offsetDays: 22 },
          { id: "staking", task: "செடிகளுக்கு ஊன்றுகோல் அமைத்தல் (Staking)", date: formatDate(40), offsetDays: 40 },
          { id: "fert1", task: "பூக்கும் பருவத்திற்கு உரம் இடுதல்", date: formatDate(55), offsetDays: 55 },
          { id: "harvest", task: "தக்காளி காய்களை அறுவடை செய்தல்", date: formatDate(75), offsetDays: 75 }
        ];
      }
      if (isMustardOrOil) {
        return [
          { id: "sow", task: "விதைப்பு மற்றும் மணல் கலத்தல்", date: formatDate(0), offsetDays: 0 },
          { id: "thinning", task: "செடிகளை களைதல் மற்றும் முதல் களை எடுத்தல்", date: formatDate(20), offsetDays: 20 },
          { id: "irri1", task: "பூக்கும் பருவத்திற்கு முன் நீர் பாய்ச்சுதல்", date: formatDate(45), offsetDays: 45 },
          { id: "harvest", task: "மஞ்சள் நிற காய்களை அறுவடை செய்தல்", date: formatDate(100), offsetDays: 100 }
        ];
      }
      return [
        { id: "sow", task: "விதைப்பு மற்றும் நிலம் தயாரித்தல்", date: formatDate(0), offsetDays: 0 },
        { id: "irri1", task: "முதல் நீர் பாய்ச்சுதல் & களைக்கொல்லி தெளித்தல்", date: formatDate(15), offsetDays: 15 },
        { id: "fert1", task: "முதல் உரம் இடுதல் (நைதரசன்/பூச்சி விரட்டி)", date: formatDate(35), offsetDays: 35 },
        { id: "irri2", task: "பயிரின் பூக்கும் நிலையில் இரண்டாம் முறை நீர் பாய்ச்சுதல்", date: formatDate(60), offsetDays: 60 },
        { id: "fert2", task: "இரண்டாம் முறை உரம் இடுதல் (பொட்டாஷ்/நுண்ணூட்டச்சத்துக்கள்)", date: formatDate(80), offsetDays: 80 },
        { id: "harvest", task: "பயிர் அறுவடை & தானியம் உலர்த்துதல்", date: formatDate(115), offsetDays: 115 }
      ];
    } else if (language === "te") {
      if (isTomatoOrVeg) {
        return [
          { id: "sow", task: "నారుమడిలో విత్తనాలు చల్లడం", date: formatDate(0), offsetDays: 0 },
          { id: "transplant", task: "మొక్కలను ప్రధాన పొలంలోకి నాటడం (ట్రాన్స్‌ప్లాంట్)", date: formatDate(22), offsetDays: 22 },
          { id: "staking", task: "మొక్కలకు కర్రల సపోర్ట్ కట్టడం (స్టేకింగ్)", date: formatDate(40), offsetDays: 40 },
          { id: "fert1", task: "పూత దశలో ఎరువుల యాజమాన్యం", date: formatDate(55), offsetDays: 55 },
          { id: "harvest", task: "మొదటి విడత కూరగాయల కోత", date: formatDate(75), offsetDays: 75 }
        ];
      }
      if (isMustardOrOil) {
        return [
          { id: "sow", task: "విత్తనాలు విత్తుకోవడం", date: formatDate(0), offsetDays: 0 },
          { id: "thinning", task: "మొక్కల సాంద్రత తగ్గించడం (తిన్నింగ్) & కలుపు తీత", date: formatDate(20), offsetDays: 20 },
          { id: "irri1", task: "పూతకు ముందు నీటి తడి అందించడం", date: formatDate(45), offsetDays: 45 },
          { id: "harvest", task: "ఆవాల గింజల కోత (ఆకులు ఎండిన తర్వాత)", date: formatDate(100), offsetDays: 100 }
        ];
      }
      return [
        { id: "sow", task: "నాటడం మరియు ప్రాథమిక దున్నకం", date: formatDate(0), offsetDays: 0 },
        { id: "irri1", task: "మొదటి తడి నీరు & కలుపు నివారణ మందులు", date: formatDate(15), offsetDays: 15 },
        { id: "fert1", task: "మొదటి విడత ఎరువులు (నత్రజని/యూరియా)", date: formatDate(35), offsetDays: 35 },
        { id: "irri2", task: "పంట పూత దశలో రెండవ తడి నీరు", date: formatDate(60), offsetDays: 60 },
        { id: "fert2", task: "రెండవ విడత ఎరువుల యాజమాన్యం (పొటాష్/సూక్ష్మపోషకాలు)", date: formatDate(80), offsetDays: 80 },
        { id: "harvest", task: "పంట కోత మరియు ఆరబెట్టడం", date: formatDate(115), offsetDays: 115 }
      ];
    } else {
      if (isTomatoOrVeg) {
        return [
          { id: "sow", task: "Sow seeds in nursery tray", date: formatDate(0), offsetDays: 0 },
          { id: "transplant", task: "Transplant seedlings to main field", date: formatDate(22), offsetDays: 22 },
          { id: "staking", task: "Provide plant support staking & tying", date: formatDate(40), offsetDays: 40 },
          { id: "fert1", task: "Apply flowering-stage calcium/potassium fertilizers", date: formatDate(55), offsetDays: 55 },
          { id: "harvest", task: "First vegetable picking & marketing", date: formatDate(75), offsetDays: 75 }
        ];
      }
      if (isMustardOrOil) {
        return [
          { id: "sow", task: "Sowing operations", date: formatDate(0), offsetDays: 0 },
          { id: "thinning", task: "Plant thinning & early hand-weeding", date: formatDate(20), offsetDays: 20 },
          { id: "irri1", task: "Pre-flowering stage irrigation", date: formatDate(45), offsetDays: 45 },
          { id: "harvest", task: "Harvesting crop when pods turn yellow-brown", date: formatDate(100), offsetDays: 100 }
        ];
      }
      return [
        { id: "sow", task: "Sowing & Land Preparation", date: formatDate(0), offsetDays: 0 },
        { id: "irri1", task: "First Irrigation & Pre-emergence Herbicide application", date: formatDate(15), offsetDays: 15 },
        { id: "fert1", task: "First Fertilizer Application (Nitrogen/Urea split)", date: formatDate(35), offsetDays: 35 },
        { id: "irri2", task: "Critical Flowering Stage Irrigation", date: formatDate(60), offsetDays: 60 },
        { id: "fert2", task: "Second Fertilizer Top-dressing (Potash & Micro-nutrients)", date: formatDate(80), offsetDays: 80 },
        { id: "harvest", task: "Harvesting & Grain Drying operations", date: formatDate(115), offsetDays: 115 }
      ];
    }
  };

  const handleExportICS = () => {
    const start = new Date(sowDate);
    const crop = CROPS.find(c => c.id === calCrop) || CROPS[0];
    const cropName = language === "ta" ? crop.nameTA : language === "te" ? crop.nameTE : crop.name;
    const tasks = getTasks();
    
    let ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AgriPredict//Crop Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    const formatICSDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}${m}${d}`;
    };

    const nowStr = formatICSDate(new Date()) + "T000000Z";

    tasks.forEach(task => {
      const taskDate = new Date(start);
      taskDate.setDate(taskDate.getDate() + (task.offsetDays || 0));
      const dtStart = formatICSDate(taskDate);
      
      const taskEndDate = new Date(taskDate);
      taskEndDate.setDate(taskEndDate.getDate() + 1);
      const dtEnd = formatICSDate(taskEndDate);

      ics.push("BEGIN:VEVENT");
      ics.push(`UID:task_${task.id}_${dtStart}@agripredict.com`);
      ics.push(`DTSTAMP:${nowStr}`);
      ics.push(`DTSTART;VALUE=DATE:${dtStart}`);
      ics.push(`DTEND;VALUE=DATE:${dtEnd}`);
      ics.push(`SUMMARY:${cropName} - ${task.task}`);
      ics.push("DESCRIPTION:Scheduled farming activity from AgriPredict planner");
      ics.push("STATUS:CONFIRMED");
      ics.push("END:VEVENT");
    });

    ics.push("END:VCALENDAR");

    const blob = new Blob([ics.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `crop_schedule_${calCrop}.ics`;
    link.click();
  };

  const getAdvisories = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(sowDate);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const daysElapsed = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const tasks = getTasks();
    const advisories: { type: "info" | "warning" | "success"; text: string; task: string }[] = [];

    tasks.forEach(t => {
      const offset = t.offsetDays || 0;
      const done = !!completedTasks[t.id];
      
      if (daysElapsed >= offset - 3 && daysElapsed <= offset + 3) {
        if (done) {
          advisories.push({
            type: "success",
            task: t.task,
            text: language === "ta" 
              ? "முடிக்கப்பட்டது! சரியான நேரத்தில் இப்பணியை முடித்துள்ளீர்கள்." 
              : language === "te" 
                ? "పూర్తయింది! మీరు ఈ పనిని సరైన సమయంలో పూర్తి చేసారు."
                : "Task completed successfully on schedule!"
          });
        } else {
          advisories.push({
            type: "warning",
            task: t.task,
            text: language === "ta" 
              ? `வரவிருக்கும் முக்கிய பணி! இன்னும் ${offset - daysElapsed} நாட்களில் இப்பணியை செய்ய வேண்டும்.`
              : language === "te" 
                ? `త్వరలో చేయాల్సిన పని! దీనిని పూర్తి చేయడానికి ఇంకా ${offset - daysElapsed} రోజులు మాత్రమే ఉంది.`
                : `Upcoming critical activity! Scheduled in ${offset - daysElapsed} days.`
          });
        }
      } else if (daysElapsed > offset + 3 && !done) {
        advisories.push({
          type: "warning",
          task: t.task,
          text: language === "ta" 
            ? "நிலுவையில் உள்ள முக்கிய பணி! உடனடியாக உரம்/நீர் మేలాண்மை செய்யவும்."
            : language === "te" 
              ? "గడువు ముగిసిన పని! వెంటనే యూరియా/నీటి తడి అందించండి."
              : "Overdue activity! Immediate action recommended to prevent yield loss."
        });
      }
    });

    return advisories;
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Run simulated scanner
  const handlePestScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      const symptomList = getSymptomsForCrop(scannerCrop).filter(s => selectedPart === "all" || s.part === selectedPart);
      if (symptomList[selectedSymptomIdx]) {
        setScanResult(symptomList[selectedSymptomIdx].diseases);
      }
    }, 2000);
  };

  // Calculate weather risk
  const evaluateWeatherRisk = () => {
    let risk = "Low";
    let impact = "0%";
    let advice = "No action needed. Favorable conditions.";
    
    if (weatherAlert === "heavy_rain") {
      risk = "High";
      impact = "-15% to -25% Price drop (grain moisture penalty)";
      if (language === "ta") {
        advice = "உடனடியாக அறுவடை செய்து தானியங்களை தார்பாலின் கொண்டு மூடவும். முன்கூட்டியே விற்கவும்.";
      } else if (language === "te") {
        advice = "తక్షణమే పంట కోత ముగించి, తార్పాలిన్ కవర్ల కింద సురక్షితంగా ఉంచండి. వెంటనే అమ్మడం మంచిది.";
      } else {
        advice = "Harvest immediately if mature. Cover harvested grains with tarpaulins to prevent mold and sell quickly.";
      }
    } else if (weatherAlert === "heatwave") {
      risk = "Medium";
      impact = "-10% Yield loss (shrivelled grains)";
      if (language === "ta") {
        advice = "காலை/மாலை வேளையில் லேசாக நீர் பாய்ச்சவும். மண்ணின் ஈரப்பதத்தை காக்க தழைப்போர்வை இடவும்.";
      } else if (language === "te") {
        advice = "ఉదయపు లేదా సాయంత్రపు వేళల్లో తేలికపాటి తడి నీరు అందించండి. తేమ ఆవిరి కాకుండా మల్చింగ్ వాడండి.";
      } else {
        advice = "Provide light frequent irrigations during early morning. Apply soil mulching to conserve moisture.";
      }
    } else if (weatherAlert === "cyclone") {
      risk = "Critical";
      impact = "-40% Complete crop lodging & quality degradation";
      if (language === "ta") {
        advice = "சாகுபடி வயலில் தேங்கும் நீரை வடிக்க கால்வாய்களை அமைக்கவும். அறுவடையை தற்காலிகமாக ஒத்திவைக்கவும்.";
      } else if (language === "te") {
        advice = "పొలంలోని అదనపు నీరు బయటకు పోయేలా కాలువలను క్లియర్ చేయండి. కోతలను తుఫాన్ ముగిసేవరకు ఆపండి.";
      } else {
        advice = "Clear drainage channels to prevent waterlogging. Postpone harvest operations until storm passes.";
      }
    }

    setRiskAssessment({ risk, impact, advice });
  };

  // Generate heatmap colors
  const generateHeatmapData = () => {
    // Randomize slightly based on crop selection
    const seeds = {
      rice: [0.35, 0.8, 0.5],
      wheat: [0.7, 0.4, 0.6],
      tomato: [0.9, 0.2, 0.7],
      onion: [0.4, 0.85, 0.45]
    };
    
    const ratios = (seeds as any)[heatmapCrop] || [0.5, 0.5, 0.5];
    const data = MANDIS.map((m, idx) => {
      const supplyVal = ratios[idx];
      let status = "Stable";
      let color = "#EAB308"; // Amber
      
      if (supplyVal < 0.45) {
        status = L.heatShortage;
        color = "#15803D"; // Green (Good for selling)
      } else if (supplyVal > 0.65) {
        status = L.heatSurplus;
        color = "#B91C1C"; // Red (Bad for selling)
      } else {
        status = L.heatStable;
      }
      
      return {
        ...m,
        supply: supplyVal > 0.65 ? "High (Surplus)" : supplyVal < 0.45 ? "Low (Shortage)" : "Moderate (Normal)",
        status,
        color
      };
    });
    setHeatmapData(data);
  };

  useEffect(() => {
    handleCalculateArbitrage();
  }, [selectedCrop, qty, selectedVehicle, fuelPrice]);

  useEffect(() => {
    evaluateWeatherRisk();
  }, [warnCrop, harvestMonth, weatherAlert]);

  useEffect(() => {
    generateHeatmapData();
  }, [heatmapCrop]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "10px 0" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, var(--primary), var(--primary-light))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛠️</div>
          <div>
            <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{L.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{L.sub}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1.5px solid var(--border)", marginBottom: 20, gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {[
          { id: "arbitrage", label: L.tabArbitrage, icon: "🚛" },
          { id: "calendar", label: L.tabCalendar, icon: "📅" },
          { id: "pest", label: L.tabPest, icon: "🔍" },
          { id: "warning", label: L.tabWarning, icon: "🌦️" },
          { id: "heatmap", label: L.tabHeatmap, icon: "🗺️" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "10px 16px",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: "none",
              color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === tab.id ? "3px solid var(--primary)" : "3px solid transparent",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ARBITRAGE FINDER */}
      {activeTab === "arbitrage" && (
        <div className="split-layout-2col" style={{ gap: 18 }}>
          {/* Controls */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 8, color: "var(--primary-dark)" }}>🚛 Input Parameters</div>
            
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.arbCrop}</label>
              <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className="input" style={{ width: "100%" }}>
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.arbQty}</label>
              <input type="number" value={qty} onChange={e => setQty(parseFloat(e.target.value) || 0)} className="input" style={{ width: "100%" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.arbVehicle}</label>
              <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="input" style={{ width: "100%" }}>
                {VEHICLES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.arbFuelPrice}</label>
              <input type="number" value={fuelPrice} onChange={e => setFuelPrice(parseFloat(e.target.value) || 0)} className="input" style={{ width: "100%" }} />
            </div>
          </div>

          {/* Results Comparison List */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 8, color: "var(--primary-dark)" }}>📊 {L.arbResultTitle}</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {arbitrageResults.map((m, idx) => {
                const isBest = idx === 0;
                return (
                  <div key={m.id} style={{
                    border: isBest ? "2px solid #15803D" : "1.5px solid var(--border)",
                    borderRadius: 14,
                    padding: 14,
                    background: isBest ? "rgba(22,163,74,0.04)" : "var(--bg-card)",
                    position: "relative"
                  }}>
                    {isBest && (
                      <div style={{
                        position: "absolute", top: -10, right: 14,
                        background: "#15803D", color: "#fff",
                        fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                        padding: "3px 8px", borderRadius: 99
                      }}>
                        🏆 {L.arbBestChoice}
                      </div>
                    )}
                    <div style={{ fontSize: 15, fontWeight: 700, color: isBest ? "#15803D" : "var(--text)", marginBottom: 6 }}>
                      {language === "ta" ? m.nameTA : language === "te" ? m.nameTE : m.name} ({m.distance} km)
                    </div>
                    
                    <div className="grid-cols-4-responsive" style={{ gap: 10, marginTop: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)" }}>{L.arbGrossValue}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{formatPrice(m.grossValue)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)" }}>{L.arbCost}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#B91C1C" }}>{formatPrice(m.totalCost)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)" }}>{L.arbNetProfit}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: isBest ? "#15803D" : "var(--primary-dark)" }}>{formatPrice(m.netProfit)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROP CALENDAR */}
      {activeTab === "kcc" && (
        <KccCalculator />
      )}

      {activeTab === "pmkisan" && (
        <PmKisanTracker />
      )}

      {activeTab === "cost" && (
        <CostProfitEstimator />
      )}

      {activeTab === "ocr" && (
        <DocumentOcr />
      )}

      {activeTab === "calendar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <CropCalendar />
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)" }}>📅 {L.calTitle}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{L.calSub}</div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{L.arbCrop}:</label>
                <select value={calCrop} onChange={e => setCalCrop(e.target.value)} className="input" style={{ padding: "4px 8px", fontSize: 13 }}>
                  {portfolio.length > 0 ? (
                    <>
                      <optgroup label="Tracked Crops">
                        {portfolio.map(id => {
                          const c = CROPS.find(crop => crop.id === id);
                          if (!c) return null;
                          return <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>;
                        })}
                      </optgroup>
                      <optgroup label="All Crops">
                        {CROPS.map(c => (
                          <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    CROPS.map(c => (
                      <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{L.calSowDate}:</label>
                <input type="date" value={sowDate} onChange={e => setSowDate(e.target.value)} className="input" style={{ padding: "4px 8px", fontSize: 13 }} />
              </div>
              <button onClick={handleExportICS} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
                📅 {L.exportCalendar}
              </button>
            </div>
          </div>

          {/* Smart Reminders Advisory Section */}
          {getAdvisories().length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "6px 0 16px 0" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", display: "flex", alignItems: "center", gap: 6 }}>🔔 {L.advisoryTitle}</div>
              {getAdvisories().map((adv, idx) => (
                <div key={idx} style={{ 
                  background: adv.type === "success" ? "hsl(142, 70%, 97%)" : "hsl(35, 90%, 96%)", 
                  borderLeft: `4px solid ${adv.type === "success" ? "hsl(142, 76%, 36%)" : "hsl(35, 92%, 50%)"}`,
                  padding: "10px 14px", 
                  borderRadius: "0 6px 6px 0", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 3 
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: adv.type === "success" ? "hsl(142, 76%, 25%)" : "hsl(35, 92%, 30%)" }}>⚠️ {L.upcomingTask}: {adv.task}</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>{adv.text}</span>
                </div>
              ))}
            </div>
          ) : null}

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                <th style={{ padding: "10px 0", fontSize: 12.5, color: "var(--text-muted)" }}>{L.calStatus}</th>
                <th style={{ padding: "10px 0", fontSize: 12.5, color: "var(--text-muted)" }}>{L.calTask}</th>
                <th style={{ padding: "10px 0", fontSize: 12.5, color: "var(--text-muted)" }}>{L.calTimeline}</th>
              </tr>
            </thead>
            <tbody>
              {getTasks().map(task => {
                const done = !!completedTasks[task.id];
                return (
                  <tr key={task.id} style={{ borderBottom: "1px solid var(--border)", opacity: done ? 0.6 : 1, transition: "opacity 0.2s" }}>
                    <td style={{ padding: "12px 0" }}>
                      <input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)" }} />
                    </td>
                    <td style={{ padding: "12px 0", fontSize: 13.5, fontWeight: done ? 500 : 700, textDecoration: done ? "line-through" : "none" }}>
                      {task.task}
                    </td>
                    <td style={{ padding: "12px 0", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                      📅 {task.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* TAB 3: PEST SENSING SIMULATOR */}
      {activeTab === "pest" && (
        <div className="grid-cols-2-responsive" style={{ gap: 18 }}>
          {/* Diagnostic Controls */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 8, color: "var(--primary-dark)" }}>🔍 Leaf scanner simulation</div>
            
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.pestSelectCrop}</label>
              <select value={scannerCrop} onChange={e => { setScannerCrop(e.target.value); setSelectedSymptomIdx(0); }} className="input" style={{ width: "100%" }}>
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.pestSelectPart}</label>
              <select value={selectedPart} onChange={e => { setSelectedPart(e.target.value); setSelectedSymptomIdx(0); }} className="input" style={{ width: "100%" }}>
                <option value="all">{L.partAll}</option>
                <option value="leaf">{L.partLeaf}</option>
                <option value="fruit">{L.partFruit}</option>
                <option value="stem">{L.partStem}</option>
                <option value="root">{L.partRoot}</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.pestSymptom}</label>
              <select value={selectedSymptomIdx} onChange={e => setSelectedSymptomIdx(parseInt(e.target.value))} className="input" style={{ width: "100%" }}>
                {getSymptomsForCrop(scannerCrop).filter(s => selectedPart === "all" || s.part === selectedPart).map((sympt, idx) => (
                  <option key={idx} value={idx}>{language === "ta" ? sympt.labelTA : language === "te" ? sympt.labelTE : sympt.label}</option>
                ))}
              </select>
            </div>

            <button onClick={handlePestScan} disabled={isScanning} className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>
              {isScanning ? L.pestScanning : L.pestScan}
            </button>
          </div>

          {/* Diagnostic Results */}
          <div className="card" style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent) 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 14 }}>🎯 {L.pestResult}</div>
              
              {isScanning ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 44, height: 44, border: "3.5px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{L.pestScanning}</div>
                </div>
              ) : !scanResult ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, padding: "40px 0" }}>
                  Please select your crop and symptom, then run the scanner to generate biological disease diagnosis and pesticide treatment.
                </div>
              ) : (
                (() => {
                  const result = scanResult[language as Language] || scanResult.en;
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 10, borderLeft: "4px solid #B91C1C" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>Disease Detected</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#B91C1C" }}>{result.name}</div>
                      </div>

                      <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase", marginBottom: 4 }}>🌱 {L.pestOrganic}</div>
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{result.organic}</div>
                      </div>

                      <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-dark)", textTransform: "uppercase", marginBottom: 4 }}>🧪 {L.pestChemical}</div>
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{result.chemical}</div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
            
            <style jsx global>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* TAB 4: WEATHER ADVISORY */}
      {activeTab === "warning" && (
        <div className="split-layout-2col" style={{ gap: 18 }}>
          {/* Inputs */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 8, color: "var(--primary-dark)" }}>🌦️ Warning Config</div>
            
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.arbCrop}</label>
              <select value={warnCrop} onChange={e => setWarnCrop(e.target.value)} className="input" style={{ width: "100%" }}>
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.warnHarvestDate}</label>
              <select value={harvestMonth} onChange={e => setHarvestMonth(e.target.value)} className="input" style={{ width: "100%" }}>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.warnWeatherAlert}</label>
              <select value={weatherAlert} onChange={e => setWeatherAlert(e.target.value)} className="input" style={{ width: "100%" }}>
                <option value="none">Normal Weather (Favorable)</option>
                <option value="heavy_rain">Heavy Rainfall Alert (Yellow warning)</option>
                <option value="heatwave">Heatwave Alert (Dry Spell warning)</option>
                <option value="cyclone">Cyclone / Flood Alert (Red warning)</option>
              </select>
            </div>
          </div>

          {/* Risks display */}
          <div className="card" style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent) 100%)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 8, color: "var(--primary-dark)" }}>⚠️ risk Assessment</div>
            
            {riskAssessment && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "12px 16px", borderRadius: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{L.warnRiskLevel}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                    background: riskAssessment.risk === "Low" ? "#DCFCE7" : riskAssessment.risk === "Medium" ? "#FEF9C3" : "#FEE2E2",
                    color: riskAssessment.risk === "Low" ? "#15803D" : riskAssessment.risk === "Medium" ? "#92400E" : "#B91C1C"
                  }}>
                    {riskAssessment.risk}
                  </span>
                </div>

                <div style={{ background: "var(--bg)", padding: "12px 16px", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{L.warnPriceImpact}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: riskAssessment.risk === "Low" ? "#15803D" : "#B91C1C" }}>{riskAssessment.impact}</div>
                </div>

                <div style={{ background: "var(--bg)", padding: "12px 16px", borderRadius: 12, borderLeft: "4px solid var(--primary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", marginBottom: 4 }}>💡 {L.warnAdvice}</div>
                  <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.5, fontWeight: 600 }}>{riskAssessment.advice}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: HEATMAP */}
      {activeTab === "heatmap" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)" }}>🗺️ {L.heatTitle}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{L.heatSub}</div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{L.arbCrop}:</label>
              <select value={heatmapCrop} onChange={e => setHeatmapCrop(e.target.value)} className="input" style={{ padding: "4px 8px", fontSize: 13 }}>
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>{language === "ta" ? c.nameTA : language === "te" ? c.nameTE : c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="split-layout-2col" style={{ gap: 20 }}>
            {/* Visual SVG Network Map */}
            <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 18, height: 280, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ maxWidth: 400 }}>
                {/* Connections (Links) */}
                <line x1="80" y1="120" x2="220" y2="60" stroke="var(--border)" strokeWidth="2.5" strokeDasharray="4" />
                <line x1="80" y1="120" x2="320" y2="160" stroke="var(--border)" strokeWidth="2.5" strokeDasharray="4" />
                <line x1="220" y1="60" x2="320" y2="160" stroke="var(--border)" strokeWidth="2.5" strokeDasharray="4" />
                
                {/* Nellore Mandi Node */}
                <circle cx="80" cy="120" r="16" fill={heatmapData.find(h => h.id === "nellore")?.color || "#EAB308"} stroke="#fff" strokeWidth="2" />
                <text x="80" y="150" textAnchor="middle" fill="var(--text)" fontSize="10.5" fontWeight="700">Nellore</text>
                
                {/* Guntur Mandi Node */}
                <circle cx="220" cy="60" r="16" fill={heatmapData.find(h => h.id === "guntur")?.color || "#EAB308"} stroke="#fff" strokeWidth="2" />
                <text x="220" y="90" textAnchor="middle" fill="var(--text)" fontSize="10.5" fontWeight="700">Guntur</text>
                
                {/* Chennai Mandi Node */}
                <circle cx="320" cy="160" r="16" fill={heatmapData.find(h => h.id === "chennai")?.color || "#EAB308"} stroke="#fff" strokeWidth="2" />
                <text x="320" y="190" textAnchor="middle" fill="var(--text)" fontSize="10.5" fontWeight="700">Chennai</text>
              </svg>
              
              <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12, background: "var(--bg-card)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#15803D", borderRadius: "50%" }}></span> {L.heatShortage}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#EAB308", borderRadius: "50%" }}></span> Normal</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#B91C1C", borderRadius: "50%" }}></span> {L.heatSurplus}</div>
              </div>
            </div>

            {/* Explanatory Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {heatmapData.map(m => (
                <div key={m.id} style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  background: "var(--bg-card)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      {language === "ta" ? m.nameTA : language === "te" ? m.nameTE : m.name}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "2px 6px", borderRadius: 99,
                      background: m.color + "20", color: m.color
                    }}>
                      {m.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {L.heatSupply}: <span style={{ fontWeight: 600, color: "var(--text)" }}>{m.supply}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
