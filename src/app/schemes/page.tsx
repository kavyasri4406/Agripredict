"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { CROPS } from "@/lib/cropData";

// Translation dictionary
const LABELS: Record<string, any> = {
  en: {
    title: "Government Schemes Portal",
    sub: "Explore official agricultural schemes, calculate premium subsidies, and verify eligibility",
    tabInfo: "Featured Schemes",
    tabChecker: "Eligibility Checker",
    tabCalculator: "Subsidy & Loan Calculators",
    applyNow: "Learn How to Apply",
    close: "Close",
    calculate: "Calculate",
    verify: "Verify Eligibility",
    result: "Result",
    eligible: "Eligible",
    notEligible: "Not Eligible",
    requirements: "Prerequisites & Documents Needed",
    kisanTitle: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    kisanDesc: "Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
    kisanBenefits: "₹6,000 per year directly to bank account, helps purchase seeds and fertilizers.",
    pmfbyTitle: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    pmfbyDesc: "Crop insurance scheme protecting against crop losses due to natural disasters, pests, and diseases.",
    pmfbyBenefits: "Extremely low premium rates (1.5%-2% for food crops, 5% for commercial), quick claim settlement.",
    kccTitle: "KCC (Kisan Credit Card)",
    kccDesc: "Provides farmers with timely credit for cultivation expenses, post-harvest needs, and domestic consumption.",
    kccBenefits: "Low interest rate (4% with prompt repayment), flexible limits, and free crop insurance.",
    pmksyTitle: "PMKSY (Krishi Sinchayee Yojana - Micro Irrigation)",
    pmksyDesc: "Financial assistance (subsidies up to 80-90%) for installing drip and sprinkler irrigation systems.",
    pmksyBenefits: "Improves water use efficiency, boosts yield, and reduces weed growth.",
    checkerQ1: "What is your total cultivable land size?",
    checkerQ1_O1: "Small & Marginal (Under 2 Hectares / 5 Acres)",
    checkerQ1_O2: "Medium (2 to 5 Hectares)",
    checkerQ1_O3: "Large (Above 5 Hectares)",
    checkerQ2: "Are you or anyone in your household an income tax payer?",
    checkerQ2_O1: "No, we do not pay income tax",
    checkerQ2_O2: "Yes, someone pays income tax",
    checkerQ3: "Do you own the land or have a registered cultivation lease?",
    checkerQ3_O1: "Yes, I have registered land ownership / lease documents",
    checkerQ3_O2: "No, I cultivate informally without registered documents",
    pmfbyHeader: "PMFBY Insurance Premium & Subsidy Calculator",
    pmfbySelectCrop: "Select Crop Category",
    pmfbyArea: "Cultivated Area (in Hectares)",
    pmfbySumInsured: "Sum Insured (₹ per Hectare)",
    pmfbyPremiumRate: "Farmer Share Premium Rate",
    pmfbyResultTotalIns: "Total Sum Insured:",
    pmfbyResultFarmerPrem: "Farmer Premium Share (payable):",
    pmfbyResultGovSub: "Government Subsidy Share (free):",
    pmfbyResultTotalPrem: "Total Actuarial Premium:",
    kccHeader: "KCC Loan Interest & Repayment Savings Calculator",
    kccAmount: "Loan Amount (₹)",
    kccPeriod: "Repayment Period (Months)",
    kccInterestStandard: "Standard Interest (7%):",
    kccInterestPrompt: "Prompt Repayment Interest (4%):",
    kccTotalSavings: "Total Interest Savings:",
    kccRepaymentTotal: "Total Repayment (with prompt rebate):"
  },
  ta: {
    title: "அரசு திட்டங்கள் போர்டல்",
    sub: "அதிகாரப்பூர்வ விவசாய திட்டங்களை ஆராயுங்கள், பிரீமியம் மானியங்களைக் கணக்கிடுங்கள் மற்றும் தகுதியைச் சரிபார்க்கவும்",
    tabInfo: "திட்டங்களின் விவரங்கள்",
    tabChecker: "தகுதி சரிபார்ப்பு",
    tabCalculator: "மானிய & கடன் கால்குலேட்டர்கள்",
    applyNow: "விண்ணப்பிப்பது எப்படி",
    close: "மூடுக",
    calculate: "கணக்கிடு",
    verify: "தகுதியைச் சரிபார்",
    result: "முடிவு",
    eligible: "தகுதியுடையவர்",
    notEligible: "தகுதியில்லாதவர்",
    requirements: "தேவைப்படும் ஆவணங்கள் & முன்நிபந்தனைகள்",
    kisanTitle: "PM-KISAN (பிரதம மந்திரி கிசான் சம்மான் நிதி)",
    kisanDesc: "நிலமுள்ள அனைத்து விவசாய குடும்பங்களுக்கும் ஆண்டுக்கு ₹6,000 நேரடி வருமான ஆதரவு மூன்று சம தவணைகளில் வழங்கப்படுகிறது.",
    kisanBenefits: "ஆண்டுக்கு ₹6,000 நேரடியாக வங்கி கணக்கில் செலுத்தப்படும். விதை மற்றும் உரம் வாங்க உதவுகிறது.",
    pmfbyTitle: "PMFBY (பிரதம மந்திரி பயிர் காப்பீட்டு திட்டம்)",
    pmfbyDesc: "இயற்கை சீற்றங்கள், பூச்சிகள் மற்றும் நோய்களால் ஏற்படும் பயிர் இழப்புகளுக்கு எதிரான காப்பீட்டு திட்டம்.",
    pmfbyBenefits: "மிகக் குறைந்த பிரீமியம் விகிதங்கள் (1.5%-2%), விரைவான காப்பீட்டுத் தொகை வழங்கல்.",
    kccTitle: "KCC (கிசான் கிரெடிட் கார்டு கடன் அட்டை)",
    kccDesc: "விவசாயிகளுக்கு பயிர் சாகுபடி செலவுகள், அறுவடைக்கு பிந்தைய தேவைகள் மற்றும் வீட்டு நுகர்வு ஆகியவற்றிற்கு சரியான நேரத்தில் கடன் வழங்குகிறது.",
    kccBenefits: "குறைந்த வட்டி விகிதம் (நேரத்திற்கு செலுத்தினால் 4%), நெகிழ்வான வரம்புகள் மற்றும் இலவச பயிர் காப்பீடு.",
    pmksyTitle: "PMKSY (நுண்ணீர்ப் பாசன மானியத் திட்டம்)",
    pmksyDesc: "சொட்டுநீர் மற்றும் தெளிப்பு நீர் பாசன அமைப்புகளை நிறுவ நிதி உதவி (80-90% வரை மானியம்).",
    pmksyBenefits: "நீர் பயன்பாட்டுத் திறனை மேம்படுத்துகிறது, விளைச்சலை அதிகரிக்கிறது மற்றும் களை வளர்ச்சியை குறைக்கிறது.",
    checkerQ1: "உங்களிடம் உள்ள மொத்த சாகுபடி நிலத்தின் அளவு எவ்வளவு?",
    checkerQ1_O1: "குறு மற்றும் சிறு விவசாயி (2 ஹெக்டேர் / 5 ஏக்கருக்கு கீழ்)",
    checkerQ1_O2: "நடுத்தர விவசாயி (2 முதல் 5 ஹெக்டேர்)",
    checkerQ1_O3: "பெரிய விவசாயி (5 ஹெக்டேருக்கு மேல்)",
    checkerQ2: "உங்கள் குடும்பத்தில் யாராவது வருமான வரி செலுத்துகிறார்களா?",
    checkerQ2_O1: "இல்லை, நாங்கள் வருமான வரி செலுத்துவதில்லை",
    checkerQ2_O2: "ஆம், யாராவது வருமான வரி செலுத்துகிறார்கள்",
    checkerQ3: "நிலத்தின் உரிமை பத்திரம் அல்லது பதிவு செய்யப்பட்ட குத்தகை ஒப்பந்தம் உங்களிடம் உள்ளதா?",
    checkerQ3_O1: "ஆம், என்னிடம் நில உரிமை பத்திரம் / பதிவு ஆவணங்கள் உள்ளன",
    checkerQ3_O2: "இல்லை, என்னிடம் பதிவு செய்யப்பட்ட ஆவணங்கள் இல்லை",
    pmfbyHeader: "PMFBY பயிர் காப்பீட்டு மானியம் & பிரீமியம் கால்குலேட்டர்",
    pmfbySelectCrop: "பயிர் வகையைத் தேர்ந்தெடுக்கவும்",
    pmfbyArea: "சாகுபடி பரப்பு (ஹெக்டேரில்)",
    pmfbySumInsured: "காப்பீட்டுத் தொகை (ஹெக்டேருக்கு ₹)",
    pmfbyPremiumRate: "விவசாயியின் பிரீமியம் பங்கு விகிதம்",
    pmfbyResultTotalIns: "மொத்த காப்பீட்டுத் தொகை:",
    pmfbyResultFarmerPrem: "விவசாயி செலுத்த வேண்டிய பிரீமியம் பங்கு:",
    pmfbyResultGovSub: "அரசு வழங்கும் மானியப் பங்கு (இலவசம்):",
    pmfbyResultTotalPrem: "மொத்த பிரீமியம் தொகை:",
    kccHeader: "KCC கடன் வட்டி மற்றும் சேமிப்பு கால்குலேட்டர்",
    kccAmount: "கடன் தொகை (₹)",
    kccPeriod: "கடன் காலம் (மாதங்களில்)",
    kccInterestStandard: "சாதாரண வட்டி (7%):",
    kccInterestPrompt: "நேரத்திற்கு திருப்பிச் செலுத்தும் வட்டி (4%):",
    kccTotalSavings: "மொத்த வட்டி சேமிப்பு:",
    kccRepaymentTotal: "மொத்த திருப்பிச் செலுத்தும் தொகை (தள்ளுபடியுடன்):"
  },
  te: {
    title: "ప్రభుత్వ పథకాల పోర్టల్",
    sub: "అధికారిక వ్యవసాయ పథకాలు అన్వేషించండి, ప్రీమియం సబ్సిడీలను లెక్కించండి మరియు మీ అర్హతను తనిఖీ చేయండి",
    tabInfo: "పథకాల వివరాలు",
    tabChecker: "అర్హత తనిఖీ",
    tabCalculator: "సబ్సిడీ & రుణ కాలిక్యులేటర్లు",
    applyNow: "ఎలా దరఖాస్తు చేయాలి",
    close: "మూసివేయి",
    calculate: "లెక్కించు",
    verify: "అర్హతను తనిఖీ చేయి",
    result: "ఫలితం",
    eligible: "అర్హులు",
    notEligible: "అనర్హులు",
    requirements: "అవసరమైన పత్రాలు & అర్హతలు",
    kisanTitle: "PM-KISAN (ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి)",
    kisanDesc: "భూమి ఉన్న రైతు కుటుంబాలన్నింటికీ మూడు సమాన విడతలలో ఏడాదికి ₹6,000 నేరుగా ఆర్థిక సహాయం.",
    kisanBenefits: "ఏడాదికి ₹6,000 నేరుగా బ్యాంక్ ఖాతాలో జమ అవుతాయి. విత్తనాలు, ఎరువుల కొనుగోలుకు సహాయపడుతుంది.",
    pmfbyTitle: "PMFBY (ప్రధాన మంత్రి ఫసల్ బీమా యోజన)",
    pmfbyDesc: "ప్రకృతి వైపరీత్యాలు, తెగుళ్లు మరియు వ్యాధుల వల్ల పంట నష్టపోయినప్పుడు రైతులకు రక్షణ కల్పించే బీమా పథకం.",
    pmfbyBenefits: "అత్యల్ప ప్రీమియం రేట్లు (ఆహార పంటలకు 1.5%-2%), త్వరితగతిన క్లెయిమ్‌ల పరిష్కారం.",
    kccTitle: "KCC (కిసాన్ క్రెడిట్ కార్డ్ రుణ పథకం)",
    kccDesc: "వ్యవసాయ సాగు ఖర్చులు, పంట కోత అనంతర అవసరాలు మరియు గృహ అవసరాల కోసం రైతులకు సకాలంలో రుణాలు అందిస్తుంది.",
    kccBenefits: "తక్కువ వడ్డీ రేటు (సకాలంలో చెల్లిస్తే 4%), సౌకర్యవంతమైన పరిమితులు మరియు ఉచిత పంట బీమా.",
    pmksyTitle: "PMKSY (కృషి సించాయీ యోజన - మైక్రో ఇరిగేషన్)",
    pmksyDesc: "డ్రిప్ మరియు స్ప్రింక్లర్ నీటిపారుదల వ్యవస్థలను ఏర్పాటు చేసుకోవడానికి ఆర్థిక సహాయం (80-90% వరకు సబ్సిడీ).",
    pmksyBenefits: "నీటి వినియోగ సామర్థ్యాన్ని మెరుగుపరుస్తుంది, దిగుబడిని పెంచుతుంది మరియు కలుపు నివారిస్తుంది.",
    checkerQ1: "మీకు ఉన్న మొత్తం సాగు భూమి ఎంత?",
    checkerQ1_O1: "చిన్న & సన్నకారు రైతులు (2 హెక్టార్లు / 5 ఎకరాల లోపు)",
    checkerQ1_O2: "మధ్యస్థ రైతులు (2 నుండి 5 హెక్టార్లు)",
    checkerQ1_O3: "పెద్ద రైతులు (5 హెక్టార్ల కంటే ఎక్కువ)",
    checkerQ2: "మీ ఇంట్లో ఎవరైనా ఆదాయపు పన్ను (Income Tax) చెల్లిస్తున్నారా?",
    checkerQ2_O1: "లేదు, మేము ఆదాయపు పన్ను చెల్లించడం లేదు",
    checkerQ2_O2: "అవును, మా కుటుంబంలో పన్ను చెల్లిస్తున్నారు",
    checkerQ3: "మీకు భూమి యాజమాన్య పత్రాలు (పట్టాదారు పాస్ బుక్) లేదా రిజిస్టర్డ్ కౌలు పత్రాలు ఉన్నాయా?",
    checkerQ3_O1: "అవును, నా వద్ద పట్టా పత్రాలు / రిజిస్టర్డ్ పత్రాలు ఉన్నాయి",
    checkerQ3_O2: "లేదు, నా వద్ద రిజిస్టర్డ్ పత్రాలు లేవు",
    pmfbyHeader: "PMFBY పంట బీమా సబ్సిడీ & ప్రీమియం కాలిక్యులేటర్",
    pmfbySelectCrop: "పంట రకాన్ని ఎంచుకోండి",
    pmfbyArea: "సాగు వైశాల్యం (హెక్టార్లలో)",
    pmfbySumInsured: "బీమా మొత్తం (హెక్టారుకు ₹)",
    pmfbyPremiumRate: "రైతు ప్రీమియం వాటా రేటు",
    pmfbyResultTotalIns: "మొత్తం బీమా చేయబడిన విలువ:",
    pmfbyResultFarmerPrem: "రైతు చెల్లించాల్సిన ప్రీమియం వాటా:",
    pmfbyResultGovSub: "ప్రభుత్వం అందించే సబ్సిడీ (ఉచితం):",
    pmfbyResultTotalPrem: "మొత్తం ప్రీమియం విలువ:",
    kccHeader: "KCC రుణ వడ్డీ మరియు ఆదా కాలిక్యులేటర్",
    kccAmount: "రుణ మొత్తం (₹)",
    kccPeriod: "తిరిగి చెల్లించే కాలం (నెలల్లో)",
    kccInterestStandard: "సాధారణ వడ్డీ (7%):",
    kccInterestPrompt: "సకాలంలో చెల్లింపు వడ్డీ (4%):",
    kccTotalSavings: "మొత్తం వడ్డీ పొదుపు:",
    kccRepaymentTotal: "మొత్తం తిరిగి చెల్లించాల్సిన విలువ (తగ్గింపుతో):"
  }
};

const SCHEME_DETAILS: Record<string, Record<Language, any>> = {
  kisan: {
    en: {
      reqs: [
        "Citizenship: Must be an Indian citizen.",
        "Land ownership: Must hold valid cultivable land records in their name.",
        "Exclusions: Active public officers, institutional landowners, and income tax payers are excluded.",
        "Required Documents: Aadhaar Card, Land ownership papers (Khata/Patta), Bank Account Details, Mobile Number."
      ]
    },
    ta: {
      reqs: [
        "குடிமகன்: இந்திய குடிமகனாக இருக்க வேண்டும்.",
        "நில உரிமை: சொந்த பெயரில் சாகுபடி செய்யக்கூடிய நிலப் பத்திரங்கள் இருக்க வேண்டும்.",
        "விலக்குகள்: அரசு அதிகாரிகள், நிறுவன நில உரிமையாளர்கள் மற்றும் வருமான வரி செலுத்துபவர்கள் விலக்கப்படுகிறார்கள்.",
        "தேவையான ஆவணங்கள்: ஆதார் அட்டை, நில உரிமை ஆவணங்கள் (பட்டா/சிட்டா), வங்கி கணக்கு விவரங்கள், மொபைல் எண்."
      ]
    },
    te: {
      reqs: [
        "పౌరసత్వం: ఖచ్చితంగా భారతీయ పౌరుడై ఉండాలి.",
        "భూమి యాజమాన్యం: సొంత పేరు మీద సాగు భూమి పత్రాలు (పట్టాదారు పాస్ బుక్) ఉండాలి.",
        "మినహాయింపులు: ప్రభుత్వ అధికారులు, సంస్థాగత భూ యజమానులు మరియు ఆదాయపు పన్ను చెల్లింపుదారులు అర్హులు కారు.",
        "అవసరమైన పత్రాలు: ఆధార్ కార్డ్, పట్టాదారు పాస్ బుక్ పత్రాలు, బ్యాంక్ ఖాతా వివరాలు, మొబైల్ నంబర్."
      ]
    }
  },
  pmfby: {
    en: {
      reqs: [
        "Target Group: All farmers including tenant farmers growing notified crops in notified areas.",
        "Coverage: Compulsory for loanee farmers, optional for non-loanee farmers.",
        "Required Documents: Land possession certificate / lease agreement, Sowing certificate from local agriculture officer, Bank passbook copy, Aadhaar card."
      ]
    },
    ta: {
      reqs: [
        "இலக்கு குழு: அறிவிக்கப்பட்ட பகுதிகளில் அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் குத்தகை விவசாயிகள் உட்பட அனைத்து விவசாயிகள்.",
        "காப்பீடு வரம்பு: வங்கி கடன் பெற்ற விவசாயிகளுக்கு கட்டாயமானது, மற்றவர்களுக்கு விருப்பத்திற்குரியது.",
        "தேவையான ஆவணங்கள்: நில உரிமைச் சான்றிதழ் அல்லது குத்தகை ஒப்பந்தம், கிராம நிர்வாக அதிகாரியிடம் இருந்து விதைப்புச் சான்றிதழ், வங்கி பாஸ்புக் நகல், ஆதார் அட்டை."
      ]
    },
    te: {
      reqs: [
        "లక్ష్య సమూహం: కౌలు రైతులతో సహా నిర్దేశిత ప్రాంతాలలో పంట పండించే రైతులందరూ అర్హులు.",
        "పరిమితి: బ్యాంకు రుణం పొందిన రైతులకు తప్పనిసరి, ఇతర రైతులకు ఐచ్ఛికం.",
        "అవసరమైన పత్రాలు: భూమి యాజమాన్య/కౌలు ధృవీకరణ పత్రం, విలేజ్ అసిస్టెంట్ నుండి విత్తే ధృవీకరణ పత్రం (Sowing Certificate), బ్యాంక్ పాస్ బుక్ నకలు, ఆధార్ కార్డ్."
      ]
    }
  },
  kcc: {
    en: {
      reqs: [
        "Target Group: Owner farmers, tenant farmers, sharecroppers, and self-help groups.",
        "Maximum Loan Limit: Up to ₹3 Lakhs at subsidized interest rates.",
        "Required Documents: Application form, Aadhaar/Voter ID, Land records copy, Crop pattern detail, Bank clearance certificate."
      ]
    },
    ta: {
      reqs: [
        "இலக்கு குழு: சொந்த நிலமுள்ள விவசாயிகள், குத்தகை விவசாயிகள், பங்கு விவசாயிகள் மற்றும் சுய உதவி குழுக்கள்.",
        "அதிகபட்ச கடன் வரம்பு: மானிய வட்டி விகிதத்தில் ₹3 லட்சம் வரை.",
        "தேவையான ஆவணங்கள்: விண்ணப்ப படிவம், ஆதார்/வாக்காளர் அட்டை, நில ஆவணங்கள் நகல், பயிர் சாகுபடி விவரம், வங்கி கடனின்மைச் சான்றிதழ்."
      ]
    },
    te: {
      reqs: [
        "లక్ష్య సమూహం: సొంత భూమి ఉన్న రైతులు, కౌలు రైతులు మరియు స్వయం సహాయక సంఘాలు (SHGs).",
        "గరిష్ట రుణ పరిమితి: సబ్సిడీ వడ్డీ రేటుతో ₹3 లక్షల వరకు రుణం పొందే అవకాశం.",
        "అవసరమైన పత్రాలు: దరఖాస్తు ఫారమ్, ఆధార్/ఓటర్ ఐడీ, భూమి పత్రాల నకలు, పంటల వివరాలు, బ్యాంకు నిరభ్యంతర పత్రం (No Due Certificate)."
      ]
    }
  },
  pmksy: {
    en: {
      reqs: [
        "Target Group: Farmers of all categories having access to a water source.",
        "Subsidy Scale: 90% for Small & Marginal farmers, 80% for Other farmers.",
        "Required Documents: Land documents (Khata/Patta), Water source proof, Aadhaar card, Soil and water testing reports (if available), Quotation from registered micro-irrigation dealer."
      ]
    },
    ta: {
      reqs: [
        "இலக்கு குழு: நீர் ஆதாரம் கொண்ட அனைத்து வகையான விவசாயிகள்.",
        "மானிய அளவு: குறு மற்றும் சிறு விவசாயிகளுக்கு 90%, மற்ற விவசாயிகளுக்கு 80%.",
        "தேவையான ஆவணங்கள்: நில உரிமை ஆவணங்கள், நீர் ஆதார சான்று, ஆதார் அட்டை, அங்கீகரிக்கப்பட்ட டீலரிடமிருந்து பெறப்பட்ட சொட்டுநீர் உபகரண விலைப்பட்டியல்."
      ]
    },
    te: {
      reqs: [
        "లక్ష్య సమూహం: నీటి వనరు అందుబాటులో ఉన్న అన్ని రకాల రైతులు అర్హులు.",
        "సబ్సిడీ శాతం: చిన్న & సన్నకారు రైతులకు 90%, ఇతర రైతులకు 80% సబ్సిడీ లభిస్తుంది.",
        "అవసరమైన పత్రాలు: భూమి పత్రాలు, నీటి వనరు ఉన్నట్లు రుజువు, ఆధార్ కార్డ్, మైక్రో ఇరిగేషన్ డీలర్ నుండి కొటేషన్ పత్రం."
      ]
    }
  }
};

type Language = "en" | "ta" | "te";

export default function SchemesPage() {
  const { language } = useApp();
  const L = LABELS[language as Language] || LABELS.en;
  
  const [activeTab, setActiveTab] = useState<"info" | "checker" | "calculator">("info");
  
  // Modal details
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);

  // Eligibility Checker state
  const [landSize, setLandSize] = useState("small");
  const [taxPayer, setTaxPayer] = useState("no");
  const [landDoc, setLandDoc] = useState("yes");
  const [checkResult, setCheckResult] = useState<any>(null);

  // PMFBY Calculator state
  const [cropCat, setCropCat] = useState("kharif_food");
  const [area, setArea] = useState<number>(2.0);
  const [sumInsured, setSumInsured] = useState<number>(65000);
  const [pmfbyResults, setPmfbyResults] = useState<any>(null);

  // KCC Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanPeriod, setLoanPeriod] = useState<number>(12);
  const [kccResults, setKccResults] = useState<any>(null);

  const checkEligibility = () => {
    const kisan = taxPayer === "no" && landSize === "small" && landDoc === "yes";
    const kcc = landDoc === "yes";
    const pmfby = landDoc === "yes";
    const pmksy = landDoc === "yes";
    setCheckResult({ kisan, kcc, pmfby, pmksy });
  };

  const calculateInsurance = () => {
    let farmerRate = 0.02; // Kharif food (2%)
    if (cropCat === "rabi_food") farmerRate = 0.015; // Rabi food (1.5%)
    else if (cropCat === "commercial") farmerRate = 0.05; // Commercial/Horticulture (5%)

    const totalSum = area * sumInsured;
    const totalActuarialPremium = totalSum * 0.12; // 12% total premium
    const farmerPremium = totalSum * farmerRate;
    const govSubsidy = Math.max(0, totalActuarialPremium - farmerPremium);

    setPmfbyResults({
      totalSum,
      farmerPremium,
      govSubsidy,
      totalActuarialPremium
    });
  };

  const calculateKcc = () => {
    const standardRate = 0.07;
    const promptRate = 0.04;
    const years = loanPeriod / 12;

    const standardInterest = loanAmount * standardRate * years;
    const promptInterest = loanAmount * promptRate * years;
    const savings = standardInterest - promptInterest;
    const totalRepay = loanAmount + promptInterest;

    setKccResults({
      standardInterest,
      promptInterest,
      savings,
      totalRepay
    });
  };

  useEffect(() => {
    calculateInsurance();
  }, [cropCat, area, sumInsured]);

  useEffect(() => {
    calculateKcc();
  }, [loanAmount, loanPeriod]);

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "10px 0" }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, var(--primary), var(--primary-light))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏛️</div>
          <div>
            <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, fontWeight: 700 }}>{L.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{L.sub}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1.5px solid var(--border)", marginBottom: 20, gap: 12 }}>
        <button
          onClick={() => setActiveTab("info")}
          style={{
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: "none",
            color: activeTab === "info" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "info" ? "3px solid var(--primary)" : "3px solid transparent",
            fontFamily: "inherit",
            transition: "all 0.2s"
          }}
        >
          {L.tabInfo}
        </button>
        <button
          onClick={() => setActiveTab("checker")}
          style={{
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: "none",
            color: activeTab === "checker" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "checker" ? "3px solid var(--primary)" : "3px solid transparent",
            fontFamily: "inherit",
            transition: "all 0.2s"
          }}
        >
          {L.tabChecker}
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          style={{
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: "none",
            color: activeTab === "calculator" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "calculator" ? "3px solid var(--primary)" : "3px solid transparent",
            fontFamily: "inherit",
            transition: "all 0.2s"
          }}
        >
          {L.tabCalculator}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "info" && (
        <div className="grid-cols-2-responsive" style={{ gap: 18 }}>
          {/* PM-KISAN */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>🌾</span>
                <span style={{ fontSize: 11, background: "var(--accent)", color: "var(--primary-dark)", padding: "4px 8px", borderRadius: 99, fontWeight: 700 }}>Direct Benefit</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--primary-dark)" }}>{L.kisanTitle}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{L.kisanDesc}</p>
              <div style={{ borderLeft: "3.5px solid var(--primary)", paddingLeft: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Key Benefits</div>
                <div style={{ fontSize: 12.5, color: "var(--text)" }}>{L.kisanBenefits}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setSelectedScheme("kisan")}>{L.applyNow}</button>
          </div>

          {/* PMFBY */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>🛡️</span>
                <span style={{ fontSize: 11, background: "var(--accent)", color: "var(--primary-dark)", padding: "4px 8px", borderRadius: 99, fontWeight: 700 }}>Crop Insurance</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--primary-dark)" }}>{L.pmfbyTitle}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{L.pmfbyDesc}</p>
              <div style={{ borderLeft: "3.5px solid var(--primary)", paddingLeft: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Key Benefits</div>
                <div style={{ fontSize: 12.5, color: "var(--text)" }}>{L.pmfbyBenefits}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setSelectedScheme("pmfby")}>{L.applyNow}</button>
          </div>

          {/* KCC */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>💳</span>
                <span style={{ fontSize: 11, background: "var(--accent)", color: "var(--primary-dark)", padding: "4px 8px", borderRadius: 99, fontWeight: 700 }}>Credit & Loans</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--primary-dark)" }}>{L.kccTitle}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{L.kccDesc}</p>
              <div style={{ borderLeft: "3.5px solid var(--primary)", paddingLeft: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Key Benefits</div>
                <div style={{ fontSize: 12.5, color: "var(--text)" }}>{L.kccBenefits}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setSelectedScheme("kcc")}>{L.applyNow}</button>
          </div>

          {/* PMKSY */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>💧</span>
                <span style={{ fontSize: 11, background: "var(--accent)", color: "var(--primary-dark)", padding: "4px 8px", borderRadius: 99, fontWeight: 700 }}>Irrigation Subsidy</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--primary-dark)" }}>{L.pmksyTitle}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{L.pmksyDesc}</p>
              <div style={{ borderLeft: "3.5px solid var(--primary)", paddingLeft: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Key Benefits</div>
                <div style={{ fontSize: 12.5, color: "var(--text)" }}>{L.pmksyBenefits}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setSelectedScheme("pmksy")}>{L.applyNow}</button>
          </div>
        </div>
      )}

      {activeTab === "checker" && (
        <div className="split-layout-2col" style={{ gap: 20 }}>
          {/* Form */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>📋 Questionnaire</div>
            
            {/* Q1 */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{L.checkerQ1}</label>
              <select value={landSize} onChange={e => setLandSize(e.target.value)} className="input" style={{ width: "100%" }}>
                <option value="small">{L.checkerQ1_O1}</option>
                <option value="medium">{L.checkerQ1_O2}</option>
                <option value="large">{L.checkerQ1_O3}</option>
              </select>
            </div>

            {/* Q2 */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{L.checkerQ2}</label>
              <select value={taxPayer} onChange={e => setTaxPayer(e.target.value)} className="input" style={{ width: "100%" }}>
                <option value="no">{L.checkerQ2_O1}</option>
                <option value="yes">{L.checkerQ2_O2}</option>
              </select>
            </div>

            {/* Q3 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{L.checkerQ3}</label>
              <select value={landDoc} onChange={e => setLandDoc(e.target.value)} className="input" style={{ width: "100%" }}>
                <option value="yes">{L.checkerQ3_O1}</option>
                <option value="no">{L.checkerQ3_O2}</option>
              </select>
            </div>

            <button onClick={checkEligibility} className="btn btn-primary" style={{ width: "100%" }}>{L.verify}</button>
          </div>

          {/* Results Side */}
          <div className="card" style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent) 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🎯 {L.result}</div>
              
              {!checkResult ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, padding: "40px 0" }}>
                  Please fill out the questionnaire and click the verify button to evaluate your scheme eligibility status.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* PM-KISAN */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "10px 14px", borderRadius: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>PM-KISAN</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 99,
                      background: checkResult.kisan ? "#DCFCE7" : "#FEE2E2",
                      color: checkResult.kisan ? "#15803D" : "#B91C1C"
                    }}>
                      {checkResult.kisan ? L.eligible : L.notEligible}
                    </span>
                  </div>

                  {/* PMFBY */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "10px 14px", borderRadius: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>PMFBY Insurance</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 99,
                      background: checkResult.pmfby ? "#DCFCE7" : "#FEE2E2",
                      color: checkResult.pmfby ? "#15803D" : "#B91C1C"
                    }}>
                      {checkResult.pmfby ? L.eligible : L.notEligible}
                    </span>
                  </div>

                  {/* KCC */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "10px 14px", borderRadius: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>Kisan Credit Card</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 99,
                      background: checkResult.kcc ? "#DCFCE7" : "#FEE2E2",
                      color: checkResult.kcc ? "#15803D" : "#B91C1C"
                    }}>
                      {checkResult.kcc ? L.eligible : L.notEligible}
                    </span>
                  </div>

                  {/* PMKSY */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "10px 14px", borderRadius: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>PMKSY Drip Subsidy</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 99,
                      background: checkResult.pmksy ? "#DCFCE7" : "#FEE2E2",
                      color: checkResult.pmksy ? "#15803D" : "#B91C1C"
                    }}>
                      {checkResult.pmksy ? L.eligible : L.notEligible}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {checkResult && (
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                *This is an approximate assessment based on primary guidelines. Final sanction is subject to review of physical documents by local administrative authorities.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "calculator" && (
        <div className="grid-cols-2-responsive" style={{ gap: 18 }}>
          {/* PMFBY Calculator */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>🛡️ {L.pmfbyHeader}</div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.pmfbySelectCrop}</label>
                <select value={cropCat} onChange={e => setCropCat(e.target.value)} className="input" style={{ width: "100%" }}>
                  <option value="kharif_food">Kharif Crops (Food & Oilseeds) - 2% Premium</option>
                  <option value="rabi_food">Rabi Crops (Food & Oilseeds) - 1.5% Premium</option>
                  <option value="commercial">Commercial / Horticulture - 5% Premium</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.pmfbyArea}</label>
                <input type="number" step="0.1" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)} className="input" style={{ width: "100%" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.pmfbySumInsured}</label>
                <input type="number" step="5000" value={sumInsured} onChange={e => setSumInsured(parseFloat(e.target.value) || 0)} className="input" style={{ width: "100%" }} />
              </div>
            </div>

            {pmfbyResults && (
              <div style={{ background: "var(--bg)", padding: 14, borderRadius: 12, border: "1px solid var(--border)", marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{L.pmfbyResultTotalIns}</span>
                  <span style={{ fontWeight: 700 }}>{currencyFormatter.format(pmfbyResults.totalSum)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#15803D" }}>
                  <span>{L.pmfbyResultFarmerPrem}</span>
                  <span style={{ fontWeight: 700 }}>{currencyFormatter.format(pmfbyResults.farmerPremium)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "var(--primary-dark)" }}>
                  <span>{L.pmfbyResultGovSub}</span>
                  <span style={{ fontWeight: 700 }}>{currencyFormatter.format(pmfbyResults.govSubsidy)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 6, fontSize: 13, color: "var(--text-muted)" }}>
                  <span>{L.pmfbyResultTotalPrem}</span>
                  <span>{currencyFormatter.format(pmfbyResults.totalActuarialPremium)}</span>
                </div>
              </div>
            )}
          </div>

          {/* KCC Calculator */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>💳 {L.kccHeader}</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.kccAmount}</label>
                <input type="number" step="10000" value={loanAmount} onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)} className="input" style={{ width: "100%" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{L.kccPeriod}</label>
                <input type="number" value={loanPeriod} onChange={e => setLoanPeriod(parseInt(e.target.value) || 0)} className="input" style={{ width: "100%" }} />
              </div>
            </div>

            {kccResults && (
              <div style={{ background: "var(--bg)", padding: 14, borderRadius: 12, border: "1px solid var(--border)", marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{L.kccInterestStandard}</span>
                  <span style={{ color: "#B91C1C", fontWeight: 600 }}>{currencyFormatter.format(kccResults.standardInterest)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{L.kccInterestPrompt}</span>
                  <span style={{ color: "#15803D", fontWeight: 700 }}>{currencyFormatter.format(kccResults.promptInterest)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 6, marginBottom: 6, fontSize: 13, color: "#15803D", fontWeight: 700 }}>
                  <span>{L.kccTotalSavings}</span>
                  <span>{currencyFormatter.format(kccResults.savings)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, fontSize: 13.5, fontWeight: 800, color: "var(--primary-dark)" }}>
                  <span>{L.kccRepaymentTotal}</span>
                  <span>{currencyFormatter.format(kccResults.totalRepay)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: 500, width: "90%", padding: 24, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, color: "var(--primary-dark)" }}>
              {selectedScheme === "kisan" && L.kisanTitle}
              {selectedScheme === "pmfby" && L.pmfbyTitle}
              {selectedScheme === "kcc" && L.kccTitle}
              {selectedScheme === "pmksy" && L.pmksyTitle}
            </h3>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>{L.requirements}</div>
              <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {SCHEME_DETAILS[selectedScheme]?.[language as Language]?.reqs.map((req: string, idx: number) => (
                  <li key={idx} style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.5 }}>{req}</li>
                ))}
              </ul>
            </div>

            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={() => setSelectedScheme(null)}>{L.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
