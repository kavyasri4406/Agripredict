"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useApp, Language } from "@/lib/AppContext";
import { ALL_GOVERNMENT_SCHEMES, SchemeItem } from "@/lib/governmentSchemesData";
import { getCategoryLabel, getStateLabel, getLocalizedScheme } from "@/lib/schemeTranslations";

// Translations for AgriSaarthi portal
const PORTAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    brandTitle: "AgriSaarthi",
    portalSubtitle: "Government Schemes & Farmer Benefits",
    dashboard: "Dashboard",
    refresh: "Refresh",
    searchPlaceholder: "Search government schemes...",
    allCategories: "All Categories",
    allStates: "All States",
    verifiedBannerTitle: "Showing Verified Government Schemes",
    verifiedBannerSub: "All-India government schemes and verified state-specific schemes are shown.",
    schemesCount: "Schemes Available",
    viewDetails: "View Details",
    addToCompare: "Add to Compare",
    inCompare: "In Compare",
    officialSource: "Official Portal",
    keyBenefit: "Key Benefit",
    documentsReq: "Documents",
    save: "Save",
    saved: "Saved",
    eligibilityTitle: "Eligibility Criteria",
    documentsChecklist: "Documents Checklist",
    howToApply: "How to Apply",
    close: "Close",
    
    // Quick action cards
    cardSchemesTitle: "Government Schemes",
    cardSchemesDesc: "Find government schemes, subsidies and financial support available for farmers.",
    cardAlertsTitle: "Scheme Alerts",
    cardAlertsDesc: "Get notifications about new schemes, updates and important deadlines.",
    cardSavedTitle: "Saved Schemes",
    cardSavedDesc: "Bookmark important government schemes for quick access later.",
    cardCompareTitle: "Compare Schemes",
    cardCompareDesc: "Compare benefits, categories and coverage of different schemes.",
    cardCentersTitle: "Nearby Help Centers",
    cardCentersDesc: "Use your location to find nearby government agriculture services.",
    cardAskTitle: "Ask About This",
    cardAskDesc: "Take a photo of a scheme or government notice",
    cardEligibilityTitle: "Check Eligibility",
    cardEligibilityDesc: "Find schemes you may qualify for",
    cardApplicationsTitle: "My Applications",
    cardApplicationsDesc: "Track your scheme applications",
    cardCalculatorsTitle: "Subsidy Calculators",
    cardCalculatorsDesc: "Calculate PMFBY insurance subsidy and KCC low-interest savings.",

    // Calculators
    tabCalculators: "Subsidy Calculators",
    pmfbyHeader: "PMFBY Insurance Premium & Subsidy Calculator",
    pmfbySelectCrop: "Select Crop Category",
    pmfbyArea: "Cultivated Area (in Hectares)",
    pmfbySumInsured: "Sum Insured (₹ per Hectare)",
    pmfbyResultTotalIns: "Total Sum Insured:",
    pmfbyResultFarmerPrem: "Farmer Premium Share (payable):",
    pmfbyResultGovSub: "Government Subsidy Share (free):",
    pmfbyResultTotalPrem: "Total Actuarial Premium:",
    showing: "Showing",
    of: "of",
    detectedState: "My Detected State",
    resetFilters: "Reset All Filters",
    requiredLabel: "Required",
    searchPrefix: "Search",
    activeView: "Active View",
    backToSchemes: "Back to All Schemes",
    savedCountLabel: "Saved",
    ocrScanBadge: "OCR Scan",
    schemesSelectedCompare: "Schemes Selected for Comparison",
    viewCompareTable: "View Comparison Table",
    clearComparison: "Clear Comparison",
    compareMinTwo: "Select at least 2 schemes to compare",
    returnToList: "Return to Scheme List",
    clearAllSaved: "Clear All Saved",
    noSavedTitle: "No Saved Schemes Yet",
    exploreAllSchemes: "Explore All Government Schemes",
    remove: "Remove",
    visitOfficialPortal: "Visit Official Government Portal",
    noSchemesFound: "No Government Schemes Found",
    noSchemesDesc: "Try adjusting your search terms or resetting the category and state filters.",
    nationalSchemes: "(National Schemes)",
    featureAttribute: "Feature / Attribute",
    categoryCol: "Category",
    coverageCol: "State / Coverage",
    documentsCol: "Documents Needed",
    actionCol: "Action",
    kccHeader: "KCC Loan Interest & Repayment Savings Calculator",
    kccAmount: "Loan Amount (₹)",
    kccPeriod: "Repayment Period (Months)",
    kccInterestStandard: "Standard Interest (7%):",
    kccInterestPrompt: "Prompt Repayment Interest (4%):",
    kccTotalSavings: "Total Interest Savings:",
    kccRepaymentTotal: "Total Repayment (with prompt rebate):"
  },
  ta: {
    brandTitle: "அக்ரி சாரதி",
    portalSubtitle: "அரசு திட்டங்கள் & விவசாயி நலன்கள்",
    dashboard: "முகப்பு பலகை",
    refresh: "புதுப்பி",
    searchPlaceholder: "அரசு திட்டங்களைத் தேடுக...",
    allCategories: "அனைத்து பிரிவுகள்",
    allStates: "அனைத்து மாநிலங்கள்",
    verifiedBannerTitle: "சரிபார்க்கப்பட்ட அரசு திட்டங்கள் காட்டப்படுகின்றன",
    verifiedBannerSub: "அனைத்திந்திய மத்திய திட்டங்கள் மற்றும் மாநில திட்டங்கள் சரிபார்க்கப்பட்டு பட்டியலிடப்பட்டுள்ளன.",
    schemesCount: "திட்டங்கள் உள்ளன",
    viewDetails: "முழு விவரங்கள்",
    addToCompare: "ஒப்பிடுக",
    inCompare: "ஒப்பீட்டில் உள்ளது",
    officialSource: "அதிகாரப்பூர்வ தளம்",
    keyBenefit: "முக்கிய பலன்கள்",
    documentsReq: "ஆவணங்கள்",
    save: "சேமி",
    saved: "சேமிக்கப்பட்டது",
    eligibilityTitle: "தகுதி வரம்புகள்",
    documentsChecklist: "தேவையான ஆவணங்கள் பட்டியல்",
    howToApply: "விண்ணப்பிப்பது எப்படி",
    close: "மூடுக",
    
    cardSchemesTitle: "அரசு திட்டங்கள்",
    cardSchemesDesc: "விவசாயிகளுக்கான மானியங்கள், கடன்கள் மற்றும் நிதியுதவி திட்டங்களை கண்டறியவும்.",
    cardAlertsTitle: "திட்ட அறிவிப்புகள்",
    cardAlertsDesc: "புதிய திட்டங்கள் மற்றும் முக்கிய காலக்கெடு பற்றிய உடனடி அறிவிப்புகளைப் பெறுங்கள்.",
    cardSavedTitle: "சேமித்த திட்டங்கள்",
    cardSavedDesc: "முக்கியமான அரசு திட்டங்களை புக்மார்க் செய்து எளிதாக அணுகவும்.",
    cardCompareTitle: "திட்டங்களை ஒப்பிடுக",
    cardCompareDesc: "வெவ்வேறு திட்டங்களின் பலன்கள், வகைகள் மற்றும் சலுகைகளை ஒப்பிட்டுப் பாருங்கள்.",
    cardCentersTitle: "அருகிலுள்ள உதவி மையங்கள்",
    cardCentersDesc: "உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள வேளாண்மை உதவி மையங்களைக் கண்டறியவும்.",
    cardAskTitle: "புகைப்படம் எடுத்து கேட்க",
    cardAskDesc: "அரசு ஆவணம் அல்லது அறிவிப்பை புகைப்படம் எடுத்து கேளுங்கள்",
    cardEligibilityTitle: "தகுதியைச் சரிபார்க்கவும்",
    cardEligibilityDesc: "நீங்கள் தகுதியுடைய அரசு திட்டங்களைக் கண்டறியவும்",
    cardApplicationsTitle: "எனது விண்ணப்பங்கள்",
    cardApplicationsDesc: "உங்கள் திட்ட விண்ணப்பங்களின் நிலையை கண்காணிக்கவும்",
    cardCalculatorsTitle: "மானிய கால்குலேட்டர்கள்",
    cardCalculatorsDesc: "PMFBY காப்பீட்டு மானியம் மற்றும் KCC கடன் வட்டி தள்ளுபடியை கணக்கிடுங்கள்.",

    tabCalculators: "மானியம் கால்குலேட்டர்",
    pmfbyHeader: "PMFBY பயிர் காப்பீட்டு மானியம் & பிரீமியம் கால்குலேட்டர்",
    pmfbySelectCrop: "பயிர் வகையைத் தேர்ந்தெடுக்கவும்",
    pmfbyArea: "சாகுபடி பரப்பு (ஹெக்டேரில்)",
    pmfbySumInsured: "காப்பீட்டுத் தொகை (ஹெக்டேருக்கு ₹)",
    pmfbyResultTotalIns: "மொத்த காப்பீட்டுத் தொகை:",
    pmfbyResultFarmerPrem: "விவசாயி பிரீமியம் பங்கு:",
    pmfbyResultGovSub: "அரசு மானியப் பங்கு:",
    pmfbyResultTotalPrem: "மொத்த பிரீமியம்:",
    showing: "காட்டப்படுகின்றன",
    of: "இல்",
    detectedState: "கண்டறியப்பட்ட மாநிலம்",
    resetFilters: "வடிப்பான்களை மீட்டமை",
    requiredLabel: "தேவை",
    searchPrefix: "தேடல்",
    activeView: "செயலில் உள்ள பிரிவு",
    backToSchemes: "அனைத்து திட்டங்களுக்கும் திரும்புக",
    savedCountLabel: "சேமிக்கப்பட்டவை",
    ocrScanBadge: "OCR ஸ்கேன்",
    schemesSelectedCompare: "திட்டங்கள் ஒப்பீட்டிற்கு தேர்ந்தெடுக்கப்பட்டுள்ளன",
    viewCompareTable: "ஒப்பீட்டு அட்டவணையைப் பார்க்கவும்",
    clearComparison: "ஒப்பீட்டை அழிக்கவும்",
    compareMinTwo: "ஒப்பிட குறைந்தபட்சம் 2 திட்டங்களைத் தேர்ந்தெடுக்கவும்",
    returnToList: "திட்டப் பட்டியலுக்குத் திரும்புக",
    clearAllSaved: "சேமித்த அனைத்தையும் நீக்குக",
    noSavedTitle: "இதுவரை திட்டங்கள் எதுவும் சேமிக்கப்படவில்லை",
    exploreAllSchemes: "அனைத்து அரசு திட்டங்களையும் ஆராயுங்கள்",
    remove: "நீக்கு",
    visitOfficialPortal: "அதிகாரப்பூர்வ அரசு தளத்திற்குச் செல்லவும்",
    noSchemesFound: "அரசு திட்டங்கள் எதுவும் காணப்படவில்லை",
    noSchemesDesc: "உங்கள் தேடல் சொற்களை மாற்றவும் அல்லது வடிப்பான்களை மீட்டமைக்கவும்.",
    nationalSchemes: "(தேசிய திட்டங்கள்)",
    featureAttribute: "அம்சம் / விவரம்",
    categoryCol: "பிரிவு",
    coverageCol: "மாநிலம் / எல்லை",
    documentsCol: "தேவையான ஆவணங்கள்",
    actionCol: "செயல்",
    kccHeader: "KCC கடன் வட்டி & சேமிப்பு கால்குலேட்டர்",
    kccAmount: "கடன் தொகை (₹)",
    kccPeriod: "கடன் காலம் (மாதங்களில்)",
    kccInterestStandard: "சாதாரண வட்டி (7%):",
    kccInterestPrompt: "நேரத்திற்கு செலுத்தும் வட்டி (4%):",
    kccTotalSavings: "மொத்த வட்டி சேமிப்பு:",
    kccRepaymentTotal: "மொத்த திருப்பி செலுத்தும் தொகை:"
  },
  te: {
    brandTitle: "అగ్రి సారథి",
    portalSubtitle: "ప్రభుత్వ పథకాలు & రైతు ప్రయోజనాలు",
    dashboard: "డాష్‌బోర్డ్",
    refresh: "రిఫ్రెష్",
    searchPlaceholder: "ప్రభుత్వ పథకాలను వెతకండి...",
    allCategories: "అన్ని వర్గాలు",
    allStates: "అన్ని రాష్ట్రాలు",
    verifiedBannerTitle: "ధృవీకరించబడిన ప్రభుత్వ పథకాలు చూపబడుతున్నాయి",
    verifiedBannerSub: "అఖిల భారత మరియు రాష్ట్ర స్థాయి ప్రభుత్వ పథకాలు పొందుపరచబడ్డాయి.",
    schemesCount: "పథకాలు అందుబాటులో ఉన్నాయి",
    viewDetails: "వివరాలు చూడండి",
    addToCompare: "పోల్చండి",
    inCompare: "పోలికలో ఉంది",
    officialSource: "అధికారిక పోర్టల్",
    keyBenefit: "ముఖ్య ప్రయోజనం",
    documentsReq: "పత్రాలు",
    save: "సేవ్ చేయి",
    saved: "సేవ్ అయింది",
    eligibilityTitle: "అర్హత ప్రమాణాలు",
    documentsChecklist: "కావలసిన పత్రాల జాబితా",
    howToApply: "ఎలా దరఖాస్తు చేయాలి",
    close: "మూసివేయి",

    cardSchemesTitle: "ప్రభుత్వ పథకాలు",
    cardSchemesDesc: "రైతులకు అందుబాటులో ఉన్న రాయితీలు, ఆర్థిక సహాయ పథకాలను కనుగొనండి.",
    cardAlertsTitle: "పథకాల హెచ్చరికలు",
    cardAlertsDesc: "కొత్త పథకాలు, నవీకరణలు మరియు చివరి తేదీల గురించి నోటిఫికేషన్‌లు పొందండి.",
    cardSavedTitle: "సేవ్ చేసిన పథకాలు",
    cardSavedDesc: "త్వరిత ప్రాప్యత కోసం ముఖ్యమైన ప్రభుత్వ పథకాలను బుక్‌మార్క్ చేయండి.",
    cardCompareTitle: "పథకాల పోలిక",
    cardCompareDesc: "వివిధ పథకాల ప్రయోజనాలు, వర్గాలు మరియు కవరేజీని సరిపోల్చండి.",
    cardCentersTitle: "సమీప రైతు భరోసా కేంద్రాలు",
    cardCentersDesc: "మీ సమీప ప్రభుత్వ వ్యవసాయ కేంద్రాలు మరియు కార్యాలయాలను కనుగొనండి.",
    cardAskTitle: "ఫోటో తీసి అడగండి",
    cardAskDesc: "పథకం లేదా ప్రభుత్వ నోటీసు ఫోటో తీసి సమాచారం తెలుసుకోండి",
    cardEligibilityTitle: "అర్హత తనిఖీ",
    cardEligibilityDesc: "మీరు ఏయే పథకాలకు అర్హులో తనిఖీ చేసుకోండి",
    cardApplicationsTitle: "నా దరఖాస్తులు",
    cardApplicationsDesc: "మీ పథకం దరఖాస్తుల స్థితిని ట్రాక్ చేయండి",
    cardCalculatorsTitle: "సబ్సిడీ కాలిక్యులేటర్లు",
    cardCalculatorsDesc: "PMFBY బీమా రాయితీ మరియు KCC రుణ వడ్డీ పొదుపును లెక్కించండి.",

    tabCalculators: "సబ్సిడీ కాలిక్యులేటర్లు",
    pmfbyHeader: "PMFBY పంట బీమా ప్రీమియం & సబ్సిడీ కాలిక్యులేటర్",
    pmfbySelectCrop: "పంట రకాన్ని ఎంచుకోండి",
    pmfbyArea: "సాగు వైశాల్యం (హెక్టార్లలో)",
    pmfbySumInsured: "బీమా మొత్తం (హెక్టారుకు ₹)",
    pmfbyResultTotalIns: "మొత్తం బీమా చేయబడిన విలువ:",
    pmfbyResultFarmerPrem: "రైతు ప్రీమియం వాటా:",
    pmfbyResultGovSub: "ప్రభుత్వ సబ్సిడీ వాటా:",
    pmfbyResultTotalPrem: "మొత్తం ప్రీమియం విలువ:",
    showing: "చూపబడుతున్నాయి",
    of: "లో",
    detectedState: "గుర్తించిన రాష్ట్రం",
    resetFilters: "అన్ని ఫిల్టర్లను రీసెట్ చేయండి",
    requiredLabel: "అవసరం",
    searchPrefix: "శోధన",
    activeView: "ప్రస్తుత విభాగం",
    backToSchemes: "అన్ని పథకాలకు తిరిగి వెళ్లండి",
    savedCountLabel: "సేవ్ చేయబడినవి",
    ocrScanBadge: "OCR స్కాన్",
    schemesSelectedCompare: "పథకాలు పోలిక కోసం ఎంపిక చేయబడ్డాయి",
    viewCompareTable: "పోలిక పట్టికను చూడండి",
    clearComparison: "పోలికను క్లియర్ చేయండి",
    compareMinTwo: "పోల్చడానికి కనీసం 2 పథకాలను ఎంచుకోండి",
    returnToList: "పథకాల జాబితాకు తిరిగి వెళ్లండి",
    clearAllSaved: "సేవ్ చేసినవన్నీ తొలగించు",
    noSavedTitle: "ఇంకా ఏ పథకాలు సేవ్ చేయలేదు",
    exploreAllSchemes: "అన్ని ప్రభుత్వ పథకాలను అన్వేషించండి",
    remove: "తొలగించు",
    visitOfficialPortal: "అధికారిక ప్రభుత్వ పోర్టల్‌ను సందర్శించండి",
    noSchemesFound: "ఎటువంటి ప్రభుత్వ పథకాలు కనుగొనబడలేదు",
    noSchemesDesc: "మీ శోధన పదాలను మార్చండి లేదా వర్గం మరియు రాష్ట్ర ఫిల్టర్లను రీసెట్ చేయండి.",
    nationalSchemes: "(జాతీయ పథకాలు)",
    featureAttribute: "లక్షణం / వివరాలు",
    categoryCol: "వర్గం",
    coverageCol: "రాష్ట్రం / పరిధి",
    documentsCol: "కావలసిన పత్రాలు",
    actionCol: "చర్య",
    kccHeader: "KCC రుణ వడ్డీ & ఆదా కాలిక్యులేటర్",
    kccAmount: "రుణ మొత్తం (₹)",
    kccPeriod: "కాలపరిమితి (నెలలు)",
    kccInterestStandard: "సాధారణ వడ్డీ (7%):",
    kccInterestPrompt: "సకాల చెల్లింపు వడ్డీ (4%):",
    kccTotalSavings: "వడ్డీ పొదుపు:",
    kccRepaymentTotal: "తిరిగి చెల్లించాల్సిన మొత్తం:"
  },
  hi: {
    brandTitle: "कृषि सारथी",
    portalSubtitle: "सरकारी योजनाएं और किसान लाभ",
    dashboard: "डैशबोर्ड",
    refresh: "रिफ्रेश",
    searchPlaceholder: "सरकारी योजनाएं खोजें...",
    allCategories: "सभी श्रेणियां",
    allStates: "सभी राज्य",
    verifiedBannerTitle: "सत्यापित सरकारी योजनाएं प्रदर्शित",
    verifiedBannerSub: "अखिल भारतीय और राज्य स्तरीय आधिकारिक योजनाएं उपलब्ध हैं।",
    schemesCount: "योजनाएं उपलब्ध",
    viewDetails: "विवरण देखें",
    addToCompare: "तुलना करें",
    inCompare: "तुलना में शामिल",
    officialSource: "आधिकारिक पोर्टल",
    keyBenefit: "प्रमुख लाभ",
    documentsReq: "दस्तावेज",
    save: "सेव करें",
    saved: "सेव किया",
    eligibilityTitle: "पात्रता मापदंड",
    documentsChecklist: "आवश्यक दस्तावेजों की चेकलिस्ट",
    howToApply: "आवेदन कैसे करें",
    close: "बंद करें",

    cardSchemesTitle: "सरकारी योजनाएं",
    cardSchemesDesc: "किसानों के लिए सब्सिडी, वित्तीय सहायता और कल्याणकारी योजनाएं खोजें।",
    cardAlertsTitle: "योजना अलर्ट",
    cardAlertsDesc: "नई योजनाओं और महत्वपूर्ण समय-सीमा के बारे में सूचनाएं प्राप्त करें।",
    cardSavedTitle: "सहेजी गई योजनाएं",
    cardSavedDesc: "त्वरित पहुंच के लिए महत्वपूर्ण सरकारी योजनाओं को बुकमार्क करें।",
    cardCompareTitle: "योजनाओं की तुलना",
    cardCompareDesc: "विभिन्न योजनाओं के लाभ, श्रेणी और कवरेज की तुलना करें।",
    cardCentersTitle: "निकटतम सहायता केंद्र",
    cardCentersDesc: "अपने क्षेत्र के निकटतम कृषि विज्ञान केंद्र और कार्यालय खोजें।",
    cardAskTitle: "फोटो खींचकर पूछें",
    cardAskDesc: "सरकारी नोटिस या योजना का फोटो खींचकर सहायता लें",
    cardEligibilityTitle: "पात्रता की जांच करें",
    cardEligibilityDesc: "पता करें कि आप किन योजनाओं के लिए पात्र हैं",
    cardApplicationsTitle: "मेरे आवेदन",
    cardApplicationsDesc: "अपने योजना आवेदनों की स्थिति ट्रैक करें",
    cardCalculatorsTitle: "सब्सिडी कैलकुलेटर",
    cardCalculatorsDesc: "PMFBY बीमा सब्सिडी और KCC ऋण ब्याज छूट की गणना करें।",

    tabCalculators: "सब्सिडी कैलकुलेटर",
    pmfbyHeader: "PMFBY फसल बीमा प्रीमियम और सब्सिडी कैलकुलेटर",
    pmfbySelectCrop: "फसल श्रेणी चुनें",
    pmfbyArea: "खेती का क्षेत्रफल (हेक्टेयर में)",
    pmfbySumInsured: "बीमित राशि (₹ प्रति हेक्टेयर)",
    pmfbyResultTotalIns: "कुल बीमित राशि:",
    pmfbyResultFarmerPrem: "किसान प्रीमियम हिस्सा:",
    pmfbyResultGovSub: "सरकारी सब्सिडी हिस्सा:",
    pmfbyResultTotalPrem: "कुल प्रीमियम राशि:",
    showing: "प्रदर्शित",
    of: "में से",
    detectedState: "पहचाना गया राज्य",
    resetFilters: "सभी फ़िल्टर रीसेट करें",
    requiredLabel: "आवश्यक",
    searchPrefix: "खोज",
    activeView: "सक्रिय दृश्य",
    backToSchemes: "सभी योजनाओं पर वापस जाएं",
    savedCountLabel: "सहेजे गए",
    ocrScanBadge: "OCR स्कैन",
    schemesSelectedCompare: "योजनाएं तुलना के लिए चुनी गईं",
    viewCompareTable: "तुलना तालिका देखें",
    clearComparison: "तुलना हटाएं",
    compareMinTwo: "तुलना के लिए कम से कम 2 योजनाएं चुनें",
    returnToList: "योजना सूची पर लौटें",
    clearAllSaved: "सभी सहेजे गए हटाएं",
    noSavedTitle: "अभी तक कोई योजना सहेजी नहीं गई",
    exploreAllSchemes: "सभी सरकारी योजनाओं को देखें",
    remove: "हटाएं",
    visitOfficialPortal: "आधिकारिक सरकारी पोर्टल पर जाएं",
    noSchemesFound: "कोई सरकारी योजना नहीं मिली",
    noSchemesDesc: "कृपया अपनी खोज बदलें या श्रेणी और राज्य फ़िल्टर रीसेट करें।",
    nationalSchemes: "(राष्ट्रीय योजनाएं)",
    featureAttribute: "सुविधा / विवरण",
    categoryCol: "श्रेणी",
    coverageCol: "राज्य / कवरेज",
    documentsCol: "आवश्यक दस्तावेज",
    actionCol: "कार्रवाई",
    kccHeader: "KCC ऋण ब्याज और बचत कैलकुलेटर",
    kccAmount: "ऋण राशि (₹)",
    kccPeriod: "चुकौती अवधि (महीने)",
    kccInterestStandard: "मानक ब्याज (7%):",
    kccInterestPrompt: "समय पर भुगतान ब्याज (4%):",
    kccTotalSavings: "कुल ब्याज बचत:",
    kccRepaymentTotal: "कुल चुकौती राशि:"
  },
  ml: {
    brandTitle: "അഗ്രിസാരഥി",
    portalSubtitle: "സർക്കാർ പദ്ധതികളും കർഷക ആനുകൂല്യങ്ങളും",
    dashboard: "ഡാഷ്‌ബോർഡ്",
    refresh: "റിഫ്രഷ്",
    searchPlaceholder: "സർക്കാർ പദ്ധതികൾ തിരയുക...",
    allCategories: "എല്ലാ വിഭാഗങ്ങളും",
    allStates: "എല്ലാ സംസ്ഥാനങ്ങളും",
    verifiedBannerTitle: "സ്ഥിരീകരിച്ച സർക്കാർ പദ്ധതികൾ കാണിക്കുന്നു",
    verifiedBannerSub: "അഖിലേന്ത്യാ തലത്തിലും സംസ്ഥാന തലത്തിലുമുള്ള അംഗീകൃത പദ്ധതികൾ ലഭ്യമാണ്.",
    schemesCount: "പദ്ധതികൾ ലഭ്യമാണ്",
    viewDetails: "വിശദാംശങ്ങൾ കാണുക",
    addToCompare: "താരതമ്യം ചെയ്യുക",
    inCompare: "താരതമ്യത്തിൽ ചേർത്തു",
    officialSource: "ഔദ്യോഗിക പോർട്ടൽ",
    keyBenefit: "പ്രധാന ആനുകൂല്യം",
    documentsReq: "രേഖകൾ",
    save: "സേവ് ചെയ്യുക",
    saved: "സേവ് ചെയ്തു",
    eligibilityTitle: "അർഹതാ മാനദണ്ഡങ്ങൾ",
    documentsChecklist: "ആവശ്യമായ രേഖകളുടെ പട്ടിക",
    howToApply: "എങ്ങനെ അപേക്ഷിക്കാം",
    close: "അടയ്ക്കുക",

    cardSchemesTitle: "സർക്കാർ പദ്ധതികൾ",
    cardSchemesDesc: "കർഷകർക്കുള്ള സബ്സിഡികളും സാമ്പത്തിക സഹായങ്ങളും കണ്ടെത്തുക.",
    cardAlertsTitle: "പദ്ധതി അറിയിപ്പുകൾ",
    cardAlertsDesc: "പുതിയ പദ്ധതികളെക്കുറിച്ചും പ്രധാന സമയപരിധികളെക്കുറിച്ചും അറിയിപ്പുകൾ നേടുക.",
    cardSavedTitle: "സേവ് ചെയ്ത പദ്ധതികൾ",
    cardSavedDesc: "എളുപ്പത്തിൽ ആക്സസ് ചെയ്യുന്നതിനായി പ്രധാന പദ്ധതികൾ ബുക്ക്മാർക്ക് ചെയ്യുക.",
    cardCompareTitle: "പദ്ധതികൾ താരതമ്യം ചെയ്യുക",
    cardCompareDesc: "വിവിധ പദ്ധതികളുടെ ആനുകൂല്യങ്ങളും വ്യവസ്ഥകളും താരതമ്യം ചെയ്യുക.",
    cardCentersTitle: "സഹായ കേന്ദ്രങ്ങൾ",
    cardCentersDesc: "നിങ്ങളുടെ അടുത്തുള്ള കൃഷി ഭവനുകളും സേവന കേന്ദ്രങ്ങളും കണ്ടെത്തുക.",
    cardAskTitle: "ഫോട്ടോ എടുത്ത് ചോദിക്കുക",
    cardAskDesc: "സർക്കാർ അറിയിപ്പിന്റെയോ രേഖയുടെയോ ഫോട്ടോ എടുത്ത് വിവരങ്ങൾ അറിയുക",
    cardEligibilityTitle: "അർഹത പരിശോധിക്കുക",
    cardEligibilityDesc: "നിങ്ങൾക്ക് അർഹതയുള്ള പദ്ധതികൾ പരിശോധിക്കുക",
    cardApplicationsTitle: "എന്റെ അപേക്ഷകൾ",
    cardApplicationsDesc: "നിങ്ങളുടെ പദ്ധതി അപേക്ഷകളുടെ നില നിരീക്ഷിക്കുക",
    cardCalculatorsTitle: "സബ്സിഡി കാൽക്കുലേറ്ററുകൾ",
    cardCalculatorsDesc: "PMFBY ഇൻഷുറൻസ് സബ്സിഡിയും KCC പലിശ ലാഭവും കണക്കാക്കുക.",

    tabCalculators: "സബ്സിഡി കാൽക്കുലേറ്ററുകൾ",
    pmfbyHeader: "PMFBY വിള ഇൻഷുറൻസ് പ്രീമിയം & സബ്സിഡി കാൽക്കുലേറ്റർ",
    pmfbySelectCrop: "വിള വിഭാഗം തിരഞ്ഞെടുക്കുക",
    pmfbyArea: "കൃഷിസ്ഥലത്തിന്റെ വിസ്തീർണ്ണം (ഹെക്ടറിൽ)",
    pmfbySumInsured: "ഇൻഷുറൻസ് തുക (ഹെക്ടറിന് ₹)",
    pmfbyResultTotalIns: "ആകെ ഇൻഷുറൻസ് തുക:",
    pmfbyResultFarmerPrem: "കർഷകൻ അടയ്ക്കേണ്ട പ്രീമിയം:",
    pmfbyResultGovSub: "സർക്കാർ സബ്സിഡി വിഹിതം:",
    pmfbyResultTotalPrem: "ആകെ പ്രീമിയം തുക:",
    showing: "കാണിക്കുന്നു",
    of: "ൽ",
    detectedState: "കണ്ടെത്തിയ സംസ്ഥാനം",
    resetFilters: "ഫിൽട്ടറുകൾ പുനഃക്രമീകരിക്കുക",
    requiredLabel: "ആവശ്യമാണ്",
    searchPrefix: "തിരയൽ",
    activeView: "സജീവ കാഴ്‌ച",
    backToSchemes: "എല്ലാ പദ്ധതികളിലേക്കും മടങ്ങുക",
    savedCountLabel: "സേവ് ചെയ്തവ",
    ocrScanBadge: "OCR സ്കാൻ",
    schemesSelectedCompare: "പദ്ധതികൾ താരതമ്യത്തിനായി തിരഞ്ഞെടുത്തു",
    viewCompareTable: "താരതമ്യ പട്ടിക കാണുക",
    clearComparison: "താരതമ്യം നീക്കം ചെയ്യുക",
    compareMinTwo: "താരതമ്യം ചെയ്യാൻ കുറഞ്ഞത് 2 പദ്ധതികൾ തിരഞ്ഞെടുക്കുക",
    returnToList: "പദ്ധതി പട്ടികയിലേക്ക് മടങ്ങുക",
    clearAllSaved: "സേവ് ചെയ്തവ എല്ലാം നീക്കുക",
    noSavedTitle: "ഇതുവരെ പദ്ധതികളൊന്നും സേവ് ചെയ്തിട്ടില്ല",
    exploreAllSchemes: "എല്ലാ സർക്കാർ പദ്ധതികളും പര്യവേക്ഷണം ചെയ്യുക",
    remove: "നീക്കം ചെയ്യുക",
    visitOfficialPortal: "ഔദ്യോഗിക സർക്കാർ പോർട്ടൽ സന്ദർശിക്കുക",
    noSchemesFound: "സർക്കാർ പദ്ധതികളൊന്നും കണ്ടെത്തിയില്ല",
    noSchemesDesc: "നിങ്ങളുടെ തിരയൽ മാറ്റുകയോ ഫിൽട്ടറുകൾ പുനഃക്രമീകരിക്കുകയോ ചെയ്യുക.",
    nationalSchemes: "(ദേശീയ പദ്ധതികൾ)",
    featureAttribute: "സവിശേഷത / വിവരണം",
    categoryCol: "വിഭാഗം",
    coverageCol: "സംസ്ഥാനം / പരിധി",
    documentsCol: "ആവശ്യമായ രേഖകൾ",
    actionCol: "നടപടി",
    kccHeader: "KCC വായ്പ പലിശ & ലാഭ കാൽക്കുലേറ്റർ",
    kccAmount: "വായ്പ തുക (₹)",
    kccPeriod: "തിരിച്ചടവ് കാലാവധി (മാസങ്ങളിൽ)",
    kccInterestStandard: "സാധാരണ പലിശ (7%):",
    kccInterestPrompt: "കൃത്യസമയത്തെ തിരിച്ചടവ് പലിശ (4%):",
    kccTotalSavings: "ആകെ പലിശ ലാഭം:",
    kccRepaymentTotal: "ആകെ തിരിച്ചടയ്ക്കേണ്ട തുക:"
  }
};

const CATEGORIES = [
  "All Categories",
  "Financial Assistance",
  "Insurance",
  "Irrigation",
  "Crop & Seeds",
  "Equipment",
  "Horticulture",
  "Credit & Loans",
  "Solar & Energy"
];

const STATES = [
  "All States",
  "All India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

type ActiveView = "schemes" | "alerts" | "saved" | "compare" | "centers" | "eligibility" | "applications" | "calculators";

interface ApplicationRecord {
  id: string;
  schemeTitle: string;
  refNumber: string;
  date: string;
  status: "Under Review" | "Approved & Disbursed" | "Document Verification Pending";
  benefitExpected: string;
}

const DEFAULT_APPLICATIONS: ApplicationRecord[] = [
  {
    id: "app-1",
    schemeTitle: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    refNumber: "PMK-2026-891244",
    date: "14 Feb 2026",
    status: "Approved & Disbursed",
    benefitExpected: "₹2,000 Next Installment"
  },
  {
    id: "app-2",
    schemeTitle: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    refNumber: "PMFBY-TN-99210",
    date: "02 Mar 2026",
    status: "Under Review",
    benefitExpected: "Paddy Kharif Crop Insurance Policy"
  },
  {
    id: "app-3",
    schemeTitle: "Sub-Mission on Agricultural Mechanization (SMAM)",
    refNumber: "SMAM-EQ-4410",
    date: "10 Mar 2026",
    status: "Document Verification Pending",
    benefitExpected: "50% Power Tiller Subsidy"
  }
];

export default function GovernmentSchemesPage() {
  const { language, setLanguage, location } = useApp();
  const L = PORTAL_TRANSLATIONS[language] || PORTAL_TRANSLATIONS.en;

  // State Management
  const [activeView, setActiveView] = useState<ActiveView>("schemes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedState, setSelectedState] = useState("All States");
  const [activeDetailScheme, setActiveDetailScheme] = useState<SchemeItem | null>(null);
  
  // Saved Schemes (Bookmarking)
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  
  // Compare Schemes (up to 4)
  const [compareSchemeIds, setCompareSchemeIds] = useState<string[]>([]);
  
  // Toast / feedback message
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Applications
  const [applications, setApplications] = useState<ApplicationRecord[]>(DEFAULT_APPLICATIONS);
  const [newAppScheme, setNewAppScheme] = useState("");
  const [newAppRef, setNewAppRef] = useState("");

  // Eligibility questionnaire state
  const [landSize, setLandSize] = useState("small");
  const [farmerType, setFarmerType] = useState("owner");
  const [isTaxPayer, setIsTaxPayer] = useState("no");
  const [cropType, setCropType] = useState("food");
  const [irrigationFacility, setIrrigationFacility] = useState("borewell");
  const [aadhaarLinked, setAadhaarLinked] = useState("yes");
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // Calculators State
  const [cropCat, setCropCat] = useState("kharif_food");
  const [area, setArea] = useState<number>(1.5);
  const [sumInsured, setSumInsured] = useState<number>(45000);
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanPeriod, setLoanPeriod] = useState<number>(12);
  const [pmfbyResults, setPmfbyResults] = useState<any>(null);
  const [kccResults, setKccResults] = useState<any>(null);

  // Load saved schemes & applications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("agri_saved_schemes");
      if (saved) {
        setSavedSchemeIds(JSON.parse(saved));
      }
      const savedApps = localStorage.getItem("agri_user_applications");
      if (savedApps) {
        setApplications(JSON.parse(savedApps));
      }
    } catch (e) {
      console.warn("Could not parse saved storage", e);
    }
  }, []);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Toggle Bookmark
  const toggleSaveScheme = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedSchemeIds.includes(id)) {
      updated = savedSchemeIds.filter(item => item !== id);
      showToast("Removed from Saved Schemes");
    } else {
      updated = [...savedSchemeIds, id];
      showToast("⭐ Scheme Bookmarked!");
    }
    setSavedSchemeIds(updated);
    try {
      localStorage.setItem("agri_saved_schemes", JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  // Toggle Compare
  const toggleCompareScheme = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compareSchemeIds.includes(id)) {
      setCompareSchemeIds(compareSchemeIds.filter(item => item !== id));
      showToast("Removed from Comparison");
    } else {
      if (compareSchemeIds.length >= 4) {
        showToast("You can compare up to 4 schemes at a time.");
        return;
      }
      setCompareSchemeIds([...compareSchemeIds, id]);
      showToast("Added to Comparison (📊 Compare Schemes)");
    }
  };

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return ALL_GOVERNMENT_SCHEMES.filter(scheme => {
      // Search text match
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery = !query || 
        scheme.title.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        scheme.benefit.toLowerCase().includes(query) ||
        scheme.state.toLowerCase().includes(query) ||
        scheme.category.toLowerCase().includes(query);

      // Category match
      const matchesCategory = selectedCategory === "All Categories" || scheme.category === selectedCategory;

      // State match
      const matchesState = selectedState === "All States" || scheme.state === selectedState || (selectedState !== "All India" && scheme.state === "All India");

      return matchesQuery && matchesCategory && matchesState;
    });
  }, [searchQuery, selectedCategory, selectedState]);

  // Saved schemes list
  const savedSchemesList = useMemo(() => {
    return ALL_GOVERNMENT_SCHEMES.filter(s => savedSchemeIds.includes(s.id));
  }, [savedSchemeIds]);

  // Compare schemes list
  const compareSchemesList = useMemo(() => {
    return ALL_GOVERNMENT_SCHEMES.filter(s => compareSchemeIds.includes(s.id));
  }, [compareSchemeIds]);

  // Eligibility evaluation
  const eligibleSchemes = useMemo(() => {
    if (!eligibilityChecked) return [];
    return ALL_GOVERNMENT_SCHEMES.filter(scheme => {
      // General match criteria
      if (isTaxPayer === "yes" && (scheme.id === "pm-kisan" || scheme.id === "pm-kmy")) {
        return false;
      }
      if (farmerType === "tenant" && scheme.id === "pm-kisan") {
        return false; // PM-KISAN requires land ownership records
      }
      if (cropType === "horticulture" && scheme.category === "Horticulture") {
        return true;
      }
      if (scheme.category === "Insurance" || scheme.category === "Equipment") {
        return true;
      }
      if (scheme.category === "Irrigation" && irrigationFacility === "borewell") {
        return true;
      }
      return scheme.state === "All India" || (location?.state && scheme.state.toLowerCase() === location.state.toLowerCase());
    }).slice(0, 8);
  }, [eligibilityChecked, isTaxPayer, farmerType, cropType, irrigationFacility, location?.state]);

  // Add new application
  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppScheme.trim() || !newAppRef.trim()) return;
    const newRecord: ApplicationRecord = {
      id: `user-app-${Date.now()}`,
      schemeTitle: newAppScheme.trim(),
      refNumber: newAppRef.trim(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Under Review",
      benefitExpected: "Application Logged by Farmer"
    };
    const updated = [newRecord, ...applications];
    setApplications(updated);
    try {
      localStorage.setItem("agri_user_applications", JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setNewAppScheme("");
    setNewAppRef("");
    showToast("Application Reference Added!");
  };

  // Reset/Refresh
  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedState("All States");
    showToast("Filters reset. Schemes refreshed.");
  };

  // Calculators logic
  useEffect(() => {
    let farmerRate = 0.02;
    if (cropCat === "rabi_food") farmerRate = 0.015;
    else if (cropCat === "commercial") farmerRate = 0.05;

    const totalSum = area * sumInsured;
    const totalActuarialPremium = totalSum * 0.12;
    const farmerPremium = totalSum * farmerRate;
    const govSubsidy = Math.max(0, totalActuarialPremium - farmerPremium);

    setPmfbyResults({ totalSum, farmerPremium, govSubsidy, totalActuarialPremium });
  }, [cropCat, area, sumInsured]);

  useEffect(() => {
    const standardRate = 0.07;
    const promptRate = 0.04;
    const years = loanPeriod / 12;

    const standardInterest = loanAmount * standardRate * years;
    const promptInterest = loanAmount * promptRate * years;
    const savings = standardInterest - promptInterest;
    const totalRepay = loanAmount + promptInterest;

    setKccResults({ standardInterest, promptInterest, savings, totalRepay });
  }, [loanAmount, loanPeriod]);

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "12px 24px 60px 24px", boxSizing: "border-box" }}>
      
      {/* ── Toast Notification ────────────────────────────── */}
      {feedbackToast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "var(--primary-dark)",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          zIndex: 9999,
          fontSize: 13.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "fadeIn 0.2s ease"
        }}>
          <span>✨</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ── Top Header Bar ───────────────────────────────── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 20px",
        background: "var(--bg-card)",
        borderRadius: 18,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        marginBottom: 22
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            color: "#fff",
            boxShadow: "0 4px 12px rgba(92,122,62,0.3)"
          }}>
            🌾
          </div>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Playfair Display, serif",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--text)"
            }}>
              <span>{L.brandTitle}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              {L.portalSubtitle}
            </div>
          </div>
        </div>

        {/* Header Right Actions: Language Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            className="input"
            style={{
              padding: "7px 12px",
              fontSize: 13,
              borderRadius: 10,
              fontWeight: 600,
              width: "auto",
              cursor: "pointer"
            }}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="ml">മലയാളം</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      {/* ── Top Action Quick-Cards Hub (9 Arranged Frames) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 20
      }}>
        {/* 1. Government Schemes */}
        <div
          onClick={() => setActiveView("schemes")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "schemes" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "schemes" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "schemes" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🏛️</span>
            <span style={{
              fontSize: 10,
              background: activeView === "schemes" ? "var(--primary)" : "var(--accent)",
              color: activeView === "schemes" ? "#fff" : "var(--primary-dark)",
              padding: "2px 7px",
              borderRadius: 99,
              fontWeight: 700
            }}>
              {ALL_GOVERNMENT_SCHEMES.length} {L.schemesCount}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardSchemesTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardSchemesDesc}
          </div>
        </div>

        {/* 2. Check Eligibility */}
        <div
          onClick={() => setActiveView("eligibility")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "eligibility" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "eligibility" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "eligibility" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🎯</span>
            <span style={{ fontSize: 10, background: "rgba(16,185,129,0.15)", color: "#047857", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              Checker
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardEligibilityTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardEligibilityDesc}
          </div>
        </div>

        {/* 3. Subsidy Calculators */}
        <div
          onClick={() => setActiveView("calculators")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "calculators" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "calculators" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "calculators" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🧮</span>
            <span style={{ fontSize: 10, background: "rgba(59,130,246,0.15)", color: "#1D4ED8", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              PMFBY & KCC
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardCalculatorsTitle || L.tabCalculators}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardCalculatorsDesc || "Calculate crop insurance subsidies & loan repayment savings."}
          </div>
        </div>

        {/* 4. Saved Schemes */}
        <div
          onClick={() => setActiveView("saved")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "saved" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "saved" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "saved" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>⭐</span>
            <span style={{
              fontSize: 10,
              background: savedSchemeIds.length > 0 ? "var(--secondary-light)" : "var(--bg)",
              color: savedSchemeIds.length > 0 ? "#fff" : "var(--text-muted)",
              padding: "2px 7px",
              borderRadius: 99,
              fontWeight: 700
            }}>
              {savedSchemeIds.length} {L.savedCountLabel || "Saved"}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardSavedTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardSavedDesc}
          </div>
        </div>

        {/* 5. Compare Schemes */}
        <div
          onClick={() => setActiveView("compare")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "compare" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "compare" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "compare" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📊</span>
            <span style={{
              fontSize: 10,
              background: compareSchemeIds.length > 0 ? "var(--primary)" : "var(--bg)",
              color: compareSchemeIds.length > 0 ? "#fff" : "var(--text-muted)",
              padding: "2px 7px",
              borderRadius: 99,
              fontWeight: 700
            }}>
              {compareSchemeIds.length}/4
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardCompareTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardCompareDesc}
          </div>
        </div>

        {/* 6. Scheme Alerts */}
        <div
          onClick={() => setActiveView("alerts")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "alerts" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "alerts" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "alerts" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🔔</span>
            <span style={{ fontSize: 10, background: "#EF4444", color: "#fff", padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>
              LIVE
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardAlertsTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardAlertsDesc}
          </div>
        </div>

        {/* 7. Nearby Help Centers */}
        <div
          onClick={() => setActiveView("centers")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "centers" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "centers" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "centers" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📍</span>
            <span style={{ fontSize: 10, background: "rgba(139,92,246,0.15)", color: "#6D28D9", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              KVK & Govt
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardCentersTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardCentersDesc}
          </div>
        </div>

        {/* 8. My Applications */}
        <div
          onClick={() => setActiveView("applications")}
          className="card"
          style={{
            cursor: "pointer",
            padding: "14px 16px",
            borderRadius: 16,
            border: activeView === "applications" ? "2px solid var(--primary)" : "1px solid var(--border)",
            background: activeView === "applications" ? "var(--accent)" : "var(--bg-card)",
            boxShadow: activeView === "applications" ? "0 4px 16px rgba(92,122,62,0.18)" : "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <span style={{ fontSize: 10, background: "rgba(16,185,129,0.15)", color: "#047857", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              {applications.length} Tracked
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardApplicationsTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardApplicationsDesc}
          </div>
        </div>

        {/* 9. Ask About This (Links to OCR Document Scanner) */}
        <Link
          href="/documents"
          className="card"
          style={{
            textDecoration: "none",
            display: "block",
            padding: "14px 16px",
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📷</span>
            <span style={{ fontSize: 10, background: "rgba(245,158,11,0.15)", color: "#B45309", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
              {L.ocrScanBadge || "OCR Scan"}
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 3 }}>
            {L.cardAskTitle}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.35 }}>
            {L.cardAskDesc}
          </div>
        </Link>
      </div>

      {/* ── Active View Indicator Bar ──────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        padding: "10px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          <span style={{ color: "var(--text-muted)" }}>{L.activeView || "Active View"}:</span>
          <span style={{
            padding: "3px 12px",
            background: "var(--accent)",
            color: "var(--primary-dark)",
            borderRadius: 99,
            border: "1px solid var(--border-dark)",
            fontSize: 12.5,
            fontWeight: 800
          }}>
            {activeView === "schemes" && `🏛️ ${L.cardSchemesTitle} (${filteredSchemes.length} ${L.of || "of"} ${ALL_GOVERNMENT_SCHEMES.length})`}
            {activeView === "eligibility" && `🎯 ${L.cardEligibilityTitle}`}
            {activeView === "calculators" && `🧮 ${L.cardCalculatorsTitle}`}
            {activeView === "saved" && `⭐ ${L.cardSavedTitle} (${savedSchemeIds.length})`}
            {activeView === "compare" && `📊 ${L.cardCompareTitle} (${compareSchemeIds.length})`}
            {activeView === "alerts" && `🔔 ${L.cardAlertsTitle}`}
            {activeView === "centers" && `📍 ${L.cardCentersTitle}`}
            {activeView === "applications" && `📋 ${L.cardApplicationsTitle} (${applications.length})`}
          </span>
        </div>

        {activeView !== "schemes" && (
          <button
            onClick={() => setActiveView("schemes")}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 10, fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>←</span>
            <span>{L.backToSchemes || "Back to All Schemes"}</span>
          </button>
        )}
      </div>

      {/* Floating Compare Drawer */}
      {compareSchemeIds.length > 0 && activeView !== "compare" && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--primary-dark)",
          color: "#fff",
          padding: "10px 22px",
          borderRadius: 99,
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 14,
          animation: "fadeIn 0.2s ease"
        }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            📊 {compareSchemeIds.length} {L.schemesSelectedCompare || "Schemes Selected for Comparison"}
          </span>
          <button
            onClick={() => setActiveView("compare")}
            className="btn btn-sm"
            style={{
              background: "#fff",
              color: "var(--primary-dark)",
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 12,
              padding: "5px 14px"
            }}
          >
            {L.viewCompareTable || "View Comparison Table"} →
          </button>
          <button
            onClick={() => setCompareSchemeIds([])}
            title="Clear comparison"
            style={{ background: "none", border: "none", color: "#fff", opacity: 0.8, cursor: "pointer", fontSize: 14 }}
          >
            ✕
          </button>
        </div>
      )}
{/* ── 1. MAIN SCHEMES VIEW ─────────────────────────── */}
      {activeView === "schemes" && (
        <div>
          {/* Search and Filter Controls Frame */}
          <div className="card" style={{
            padding: "18px 20px",
            borderRadius: 18,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            marginBottom: 20
          }}>
            {/* Row 1: Search bar, Category Dropdown, State Dropdown */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
              alignItems: "center",
              marginBottom: 14
            }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: 11, fontSize: 16, color: "var(--text-muted)" }}>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={L.searchPlaceholder}
                  className="input"
                  style={{ paddingLeft: 40, borderRadius: 12, fontSize: 13.5, width: "100%" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 11,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      color: "var(--text-muted)"
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* All Categories Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="input"
                  style={{ borderRadius: 12, fontSize: 13.5, fontWeight: 600, width: "100%" }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c === "All Categories" ? `🏷️ ${getCategoryLabel(c, language)}` : getCategoryLabel(c, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* All States Filter */}
              <div>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="input"
                  style={{ borderRadius: 12, fontSize: 13.5, fontWeight: 600, width: "100%" }}
                >
                  {STATES.map(s => (
                    <option key={s} value={s}>
                      {s === "All States"
                        ? `📍 ${getStateLabel(s, language)}`
                        : s === "All India"
                        ? `🇮🇳 ${getStateLabel(s, language)} ${L.nationalSchemes || ""}`
                        : `🏛️ ${getStateLabel(s, language)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Category Quick Chips */}
            <div style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              marginBottom: 12,
              scrollbarWidth: "none"
            }}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      whiteSpace: "nowrap",
                      padding: "5px 12px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                      background: isSelected ? "var(--primary)" : "var(--bg)",
                      color: isSelected ? "#fff" : "var(--text)",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {getCategoryLabel(cat, language)}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Active Filter Summary & Result Count */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              borderTop: "1px dashed var(--border)",
              paddingTop: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {location?.state && selectedState !== location.state && (
                  <button
                    onClick={() => setSelectedState(location.state)}
                    style={{
                      fontSize: 11.5,
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: "var(--accent)",
                      color: "var(--primary-dark)",
                      border: "1px solid var(--border-dark)",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <span>📍</span>
                    <span>{L.detectedState || "My Detected State"}: <strong>{getStateLabel(location.state, language)}</strong></span>
                  </button>
                )}

                {selectedCategory !== "All Categories" && (
                  <span style={{
                    fontSize: 11.5,
                    background: "var(--bg)",
                    color: "var(--text)",
                    padding: "3px 9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{L.categoryCol || "Category"}: <strong>{getCategoryLabel(selectedCategory, language)}</strong></span>
                    <button onClick={() => setSelectedCategory("All Categories")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0 }}>✕</button>
                  </span>
                )}

                {selectedState !== "All States" && (
                  <span style={{
                    fontSize: 11.5,
                    background: "var(--bg)",
                    color: "var(--text)",
                    padding: "3px 9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{L.coverageCol || "State"}: <strong>{getStateLabel(selectedState, language)}</strong></span>
                    <button onClick={() => setSelectedState("All States")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0 }}>✕</button>
                  </span>
                )}

                {searchQuery && (
                  <span style={{
                    fontSize: 11.5,
                    background: "var(--bg)",
                    color: "var(--text)",
                    padding: "3px 9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{L.searchPrefix || "Search"}: <strong>"{searchQuery}"</strong></span>
                    <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, padding: 0 }}>✕</button>
                  </span>
                )}

                {(selectedCategory !== "All Categories" || selectedState !== "All States" || searchQuery) && (
                  <button
                    onClick={handleRefresh}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "2px 6px"
                    }}
                  >
                    {L.resetFilters || "Reset All Filters"}
                  </button>
                )}
              </div>

              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--primary-dark)",
                background: "var(--accent)",
                padding: "4px 12px",
                borderRadius: 99,
                border: "1px solid var(--border-dark)"
              }}>
                {L.showing || "Showing"} {filteredSchemes.length} {L.of || "of"} {ALL_GOVERNMENT_SCHEMES.length} {L.schemesCount}
              </div>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{L.noSchemesFound || "No Government Schemes Found"}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                {L.noSchemesDesc || "Try adjusting your search terms or resetting the category and state filters."}
              </p>
              <button onClick={handleRefresh} className="btn btn-primary btn-sm">
                {L.resetFilters || "Reset All Filters"}
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 16
            }}>
              {filteredSchemes.map(rawScheme => {
                const scheme = getLocalizedScheme(rawScheme, language);
                const isSaved = savedSchemeIds.includes(scheme.id);
                const isComparing = compareSchemeIds.includes(scheme.id);

                return (
                  <div
                    key={scheme.id}
                    className="card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: 20,
                      borderRadius: 16,
                      border: isSaved ? "1.5px solid var(--secondary)" : "1px solid var(--border)",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                      position: "relative"
                    }}
                  >
                    <div>
                      {/* Card Top Pill Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 26, flexShrink: 0 }}>{scheme.icon}</span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 99,
                            background: "var(--accent)",
                            color: "var(--primary-dark)",
                            border: "1px solid var(--border)",
                            whiteSpace: "nowrap"
                          }}>
                            {getCategoryLabel(scheme.category, language)}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 99,
                            background: "var(--bg)",
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap"
                          }}>
                            📍 {getStateLabel(scheme.coverage, language)}
                          </span>
                        </div>

                        {/* Save / Bookmark Button */}
                        <button
                          onClick={(e) => toggleSaveScheme(scheme.id, e)}
                          title={isSaved ? "Saved in bookmarks" : "Bookmark this scheme"}
                          style={{
                            background: isSaved ? "var(--secondary-light)" : "var(--bg)",
                            color: isSaved ? "#fff" : "var(--text-muted)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "all 0.15s ease"
                          }}
                        >
                          {isSaved ? `⭐ ${L.saved}` : `☆ ${L.save}`}
                        </button>
                      </div>

                      {/* Scheme Title */}
                      <h3 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text)",
                        lineHeight: 1.35,
                        marginBottom: 8
                      }}>
                        {scheme.title}
                      </h3>

                      {/* Scheme Description */}
                      <p style={{
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                        marginBottom: 14
                      }}>
                        {scheme.description}
                      </p>

                      {/* Key Benefit Highlight Box */}
                      <div style={{
                        background: "var(--bg)",
                        borderLeft: "3.5px solid var(--primary)",
                        padding: "8px 12px",
                        borderRadius: "0 8px 8px 0",
                        marginBottom: 14
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 2 }}>
                          💰 {L.keyBenefit}
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>
                          {scheme.benefit}
                        </div>
                      </div>

                      {/* Required Documents Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <span style={{
                          fontSize: 11.5,
                          background: "var(--accent)",
                          color: "var(--primary-dark)",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontWeight: 600
                        }}>
                          📄 {scheme.documentsCount} {L.documentsReq} {L.requiredLabel || ""}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 14,
                      flexWrap: "wrap"
                    }}>
                      <button
                        onClick={() => setActiveDetailScheme(scheme)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: "1 1 120px", justifyContent: "center", whiteSpace: "nowrap" }}
                      >
                        👁️ {L.viewDetails}
                      </button>

                      <button
                        onClick={(e) => toggleCompareScheme(scheme.id, e)}
                        className={`btn btn-sm ${isComparing ? "btn-amber" : "btn-secondary"}`}
                        style={{ flex: "0 0 auto", justifyContent: "center", fontSize: 12, whiteSpace: "nowrap" }}
                      >
                        {isComparing ? `✓ ${L.inCompare}` : `+ ${L.addToCompare}`}
                      </button>

                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: "6px 10px", flexShrink: 0 }}
                        title="Open Official Government Portal"
                      >
                        🔗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 2. SAVED SCHEMES VIEW ────────────────────────── */}
      {activeView === "saved" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>⭐ {L.cardSavedTitle}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                You have {savedSchemesList.length} bookmarked government scheme{savedSchemesList.length === 1 ? "" : "s"} for quick reference.
              </p>
            </div>
            {savedSchemesList.length > 0 && (
              <button
                onClick={() => {
                  setSavedSchemeIds([]);
                  localStorage.removeItem("agri_saved_schemes");
                  showToast("Cleared all bookmarked schemes.");
                }}
                className="btn btn-danger btn-sm"
              >
                {L.clearAllSaved || "Clear All Saved"}
              </button>
            )}
          </div>

          {savedSchemesList.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>⭐</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{L.noSavedTitle || "No Saved Schemes Yet"}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 20px auto" }}>
                {L.verifiedBannerSub}
              </p>
              <button onClick={() => setActiveView("schemes")} className="btn btn-primary btn-sm">
                {L.exploreAllSchemes || "Explore All Government Schemes"}
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 16
            }}>
              {savedSchemesList.map(rawScheme => {
                const scheme = getLocalizedScheme(rawScheme, language);
                return (
                  <div key={scheme.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 20 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 26 }}>{scheme.icon}</span>
                        <button
                          onClick={() => toggleSaveScheme(scheme.id)}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                        >
                          ✕ {L.remove || "Remove"}
                        </button>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{scheme.title}</h3>
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 12 }}>{scheme.description}</p>
                      <div style={{ background: "var(--bg)", padding: 10, borderRadius: 8, borderLeft: "3.5px solid var(--primary)", marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-dark)" }}>{L.keyBenefit}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{scheme.benefit}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => setActiveDetailScheme(scheme)} className="btn btn-primary btn-sm" style={{ flex: "1 1 120px", justifyContent: "center", whiteSpace: "nowrap" }}>
                        👁️ {L.viewDetails}
                      </button>
                      <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                        🔗 {L.officialSource}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. COMPARE SCHEMES VIEW ──────────────────────── */}
      {activeView === "compare" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>📊 {L.cardCompareTitle}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Compare subsidy percentages, required documents, eligibility, and official portals side-by-side.
              </p>
            </div>
            {compareSchemesList.length > 0 && (
              <button
                onClick={() => {
                  setCompareSchemeIds([]);
                  showToast("Cleared comparison list.");
                }}
                className="btn btn-secondary btn-sm"
              >
                {L.clearComparison || "Clear Comparison"}
              </button>
            )}
          </div>

          {compareSchemesList.length < 2 ? (
            <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>📊</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{L.compareMinTwo || "Select at least 2 schemes to compare"}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 20px auto" }}>
                {L.cardCompareDesc}
              </p>
              <button onClick={() => setActiveView("schemes")} className="btn btn-primary btn-sm">
                {L.returnToList || "Return to Scheme List"}
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--bg-card)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)"
              }}>
                <thead>
                  <tr style={{ background: "var(--accent)", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: "16px 14px", textAlign: "left", fontSize: 13, fontWeight: 800, width: 180 }}>
                      {L.featureAttribute || "Feature / Attribute"}
                    </th>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <th key={s.id} style={{ padding: "16px 14px", textAlign: "left", fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                            <div>
                              <span style={{ fontSize: 20 }}>{s.icon}</span> {s.title}
                            </div>
                            <button
                              onClick={() => toggleCompareScheme(s.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#EF4444" }}
                              title="Remove from comparison"
                            >
                              ✕
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.categoryCol || "Category"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>
                          {getCategoryLabel(s.category, language)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Coverage */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.coverageCol || "State / Coverage"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 13 }}>
                          📍 {getStateLabel(s.coverage, language)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Key Financial Benefit */}
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--primary-dark)" }}>{L.keyBenefit}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--primary-dark)" }}>
                          {s.benefit}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Required Documents Count */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.documentsCol || "Documents Needed"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 12.5 }}>
                          <span style={{ fontWeight: 700 }}>{s.documentsCount} {L.documentsReq} {L.requiredLabel || ""}</span>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                            {s.documentsList.slice(0, 3).join(", ")}...
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Eligibility Highlights */}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.eligibilityTitle}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "12px 14px", fontSize: 12, lineHeight: 1.4 }}>
                          <ul style={{ paddingLeft: 16 }}>
                            {s.eligibility.slice(0, 2).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Official Link */}
                  <tr>
                    <td style={{ padding: "14px", fontWeight: 700, fontSize: 12.5, color: "var(--text-muted)" }}>{L.actionCol || "Action"}</td>
                    {compareSchemesList.map(rawScheme => {
                      const s = getLocalizedScheme(rawScheme, language);
                      return (
                        <td key={s.id} style={{ padding: "14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setActiveDetailScheme(s)} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
                              {L.viewDetails}
                            </button>
                            <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>
                              {L.officialSource} ↗
                            </a>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 4. SCHEME ALERTS & UPDATES VIEW ──────────────── */}
      {activeView === "alerts" && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>🔔 {L.cardAlertsTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Official government notices, DBT installment release dates, and subsidy enrollment deadlines.
            </p>
          </div>

          {/* Web Push Notification Box */}
          <div style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--bg-card) 100%)",
            border: "1.5px solid var(--primary-light)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>📲</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--primary-dark)" }}>
                  Get Real-Time Scheme Alerts on Phone Lockscreen
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  Receive notifications even when the browser is closed. Never miss an installment release or subsidy cutoff.
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  if ("Notification" in window) {
                    const perm = await Notification.requestPermission();
                    if (perm === "granted") {
                      showToast("🔔 Push Notifications Activated!");
                    } else {
                      showToast("Please allow notifications in your browser settings.");
                    }
                  } else {
                    showToast("Web push is ready on this device.");
                  }
                } catch (e) {
                  showToast("Notification settings updated.");
                }
              }}
              className="btn btn-primary"
            >
              🔔 Enable Lockscreen Alerts
            </button>
          </div>

          {/* Real-Time Scheme Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                icon: "💰",
                tag: "DBT Direct Transfer",
                color: "#15803D",
                title: "PM-KISAN: 17th Installment Direct Benefit Transfer Initiated",
                date: "March 2026",
                desc: "All registered beneficiaries with verified e-KYC and active Aadhaar-linked bank accounts will receive ₹2,000 directly. Verify your beneficiary status at pmkisan.gov.in."
              },
              {
                icon: "🛡️",
                tag: "Crop Insurance Deadline",
                color: "#2563EB",
                title: "PMFBY Kharif Season Enrollment Window Open",
                date: "Upcoming Cutoff",
                desc: "Farmers growing notified food grains and commercial crops can submit crop declarations and pay subsidized premiums (1.5% - 2%) via their nearest CSC or bank branch."
              },
              {
                icon: "🚜",
                tag: "Farm Mechanization Subsidy",
                color: "#D97706",
                title: "Sub-Mission on Agricultural Mechanization (SMAM) Portal Active",
                date: "Active Quota",
                desc: "Up to 50% capital subsidy available on power tillers, rotavators, and multi-crop threshers for small and marginal farmers on agrimachinery.nic.in."
              },
              {
                icon: "💧",
                tag: "Micro Irrigation Assistance",
                color: "#0891B2",
                title: "PMKSY Per Drop More Crop (Drip & Sprinkler Subsidy Allocation)",
                date: "New Financial Cycle",
                desc: "State horticulture departments have released fresh subsidy quotas offering up to 90% subsidy for SC/ST and marginal farmers installing modern drip systems."
              },
              {
                icon: "🌱",
                tag: "Free Soil Testing",
                color: "#059669",
                title: "Soil Health Card Mobile Van Testing Camps",
                date: "This Week",
                desc: "Free 12-parameter soil testing and micro-nutrient advisory camps are operating across block agriculture offices."
              }
            ].map((alert, i) => (
              <div key={i} className="card" style={{ padding: 18, borderRadius: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{alert.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: alert.color,
                      background: "var(--accent)",
                      padding: "2px 8px",
                      borderRadius: 99
                    }}>
                      {alert.tag}
                    </span>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>{alert.date}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {alert.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. NEARBY HELP CENTERS VIEW ──────────────────── */}
      {activeView === "centers" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>📍 {L.cardCentersTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Locate government agriculture extension offices, Rythu Bharosa Kendras, KVKs, and digital assistance centers near your district.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16
          }}>
            {[
              {
                title: "Rythu Bharosa Kendra (RBK) / Digital CSC Seva",
                category: "Local Village Service Center",
                icon: "🏛️",
                address: "Panchayat Office Complex, Main Road",
                phone: "1800-425-4440",
                services: "PM-KISAN e-KYC, PMFBY Crop Enrollment, Subsidized Seeds & Fertilizer Indenting",
                timings: "9:00 AM - 5:30 PM (Mon - Sat)"
              },
              {
                title: "Krishi Vigyan Kendra (KVK)",
                category: "ICAR Agricultural Research & Advisory",
                icon: "🔬",
                address: "District Agricultural Extension Farm & Training Center",
                phone: "044-24589912",
                services: "Free Soil Testing, Pest Management Advisory, High-Yielding Variety demonstration",
                timings: "9:30 AM - 5:00 PM (Mon - Fri)"
              },
              {
                title: "District Joint Director of Agriculture (JDA Office)",
                category: "District Administrative Headquarters",
                icon: "🌾",
                address: "Collectorate Building Complex, Department of Agriculture",
                phone: "044-25671100",
                services: "Farm Machinery Subsidy Sanctions (SMAM), Solar Pump approvals, Kisan Credit Card endorsements",
                timings: "10:00 AM - 5:45 PM (Mon - Sat)"
              },
              {
                title: "Kisan Call Center (Central Toll-Free Help Desk)",
                category: "24/7 Telephone Advisory",
                icon: "📞",
                address: "Ministry of Agriculture & Farmers Welfare, Govt of India",
                phone: "1800-180-1551",
                services: "Dial toll-free in your native language (Tamil, Telugu, Hindi, etc.) for instant agronomist advice",
                timings: "6:00 AM - 10:00 PM (7 Days a Week)"
              }
            ].map((center, idx) => (
              <div key={idx} className="card" style={{ padding: 20, borderRadius: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{center.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-dark)" }}>{center.title}</h3>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>{center.category}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Address:</div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{center.address}</div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Services Provided:</div>
                    <div style={{ fontSize: 12.5, color: "var(--text)" }}>{center.services}</div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Working Hours:</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{center.timings}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <a
                    href={`tel:${center.phone.replace(/[^0-9]/g, "")}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    📞 Call {center.phone}
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(center.title + " " + (location?.district || "Agriculture Center"))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    🗺️ Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. CHECK ELIGIBILITY INTERACTIVE TOOL ────────── */}
      {activeView === "eligibility" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>🎯 {L.cardEligibilityTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Answer 6 basic questions to instantly find government schemes and subsidies matching your profile.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Form Card */}
            <div className="card" style={{ padding: 22, borderRadius: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                📋 Farmer Profile Questionnaire
              </div>

              {/* Q1 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  1. Total Cultivable Land Size:
                </label>
                <select value={landSize} onChange={e => setLandSize(e.target.value)} className="input">
                  <option value="marginal">Marginal Farmer (Under 1 Hectare / 2.5 Acres)</option>
                  <option value="small">Small Farmer (1 to 2 Hectares / 2.5 to 5 Acres)</option>
                  <option value="medium">Medium Farmer (2 to 5 Hectares)</option>
                  <option value="large">Large Farmer (Above 5 Hectares)</option>
                </select>
              </div>

              {/* Q2 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  2. Land Ownership / Cultivation Status:
                </label>
                <select value={farmerType} onChange={e => setFarmerType(e.target.value)} className="input">
                  <option value="owner">Landowner (Have Patta / Title Deed)</option>
                  <option value="tenant">Tenant Farmer / Lessee (Lease Deed available)</option>
                  <option value="sharecropper">Sharecropper / Informal Cultivator</option>
                  <option value="shg">Member of SHG / FPO (Farmer Producer Org)</option>
                </select>
              </div>

              {/* Q3 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  3. Household Income Tax Status:
                </label>
                <select value={isTaxPayer} onChange={e => setIsTaxPayer(e.target.value)} className="input">
                  <option value="no">No, we do not pay income tax</option>
                  <option value="yes">Yes, a family member pays income tax</option>
                </select>
              </div>

              {/* Q4 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  4. Primary Cultivation Crop:
                </label>
                <select value={cropType} onChange={e => setCropType(e.target.value)} className="input">
                  <option value="food">Food Grains & Pulses (Paddy, Wheat, Millets, etc.)</option>
                  <option value="horticulture">Horticulture (Fruits, Vegetables, Flowers, Spices)</option>
                  <option value="commercial">Commercial Crops (Sugarcane, Cotton, Oilseeds)</option>
                </select>
              </div>

              {/* Q5 */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  5. Irrigation Source:
                </label>
                <select value={irrigationFacility} onChange={e => setIrrigationFacility(e.target.value)} className="input">
                  <option value="borewell">Borewell / Open Well / Canal Available</option>
                  <option value="rainfed">Rainfed (Dryland / Dependent on Monsoons)</option>
                </select>
              </div>

              {/* Q6 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  6. Aadhaar Linked to Bank Account:
                </label>
                <select value={aadhaarLinked} onChange={e => setAadhaarLinked(e.target.value)} className="input">
                  <option value="yes">Yes, Aadhaar is linked to Bank Account (DBT active)</option>
                  <option value="no">Not yet linked / Need e-KYC assistance</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setEligibilityChecked(true);
                  showToast("Eligibility calculated!");
                }}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                🔍 Verify My Eligibility Now
              </button>
            </div>

            {/* Results Card */}
            <div className="card" style={{ padding: 22, borderRadius: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  🎯 Matching Schemes & Grants
                </div>

                {!eligibilityChecked ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 10px" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🌾</div>
                    <p style={{ fontSize: 13.5 }}>
                      Complete the questionnaire and click <strong>Verify My Eligibility Now</strong> to view the schemes you qualify for.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      background: "var(--accent)",
                      padding: "10px 14px",
                      borderRadius: 10,
                      marginBottom: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--primary-dark)"
                    }}>
                      ✅ You qualify for {eligibleSchemes.length} Recommended Schemes!
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {eligibleSchemes.map(s => (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--bg)",
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid var(--border)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{s.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.title}</div>
                              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{s.category} • {s.coverage}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveDetailScheme(s)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11.5, padding: "4px 10px" }}
                          >
                            Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 16 }}>
                *Official verification is subject to document scrutiny by your local block agriculture or revenue officer.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MY APPLICATIONS TRACKER VIEW ──────────────── */}
      {activeView === "applications" && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>📋 {L.cardApplicationsTitle}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Keep track of your submitted subsidy, loan, and insurance applications in one secure place.
            </p>
          </div>

          {/* Add New Application Box */}
          <form
            onSubmit={handleAddApplication}
            className="card"
            style={{ padding: 18, borderRadius: 16, marginBottom: 22 }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--primary-dark)" }}>
              + Add an Application to Track
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Scheme Name (e.g. PM-KISAN, SMAM)"
                value={newAppScheme}
                onChange={e => setNewAppScheme(e.target.value)}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Acknowledgement / Ref No (e.g. PMK-98124)"
                value={newAppRef}
                onChange={e => setNewAppRef(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Application Tracking
            </button>
          </form>

          {/* Application Records List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications.map((app) => (
              <div
                key={app.id}
                className="card"
                style={{
                  padding: 18,
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                    {app.schemeTitle}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>Ref: <strong>{app.refNumber}</strong></span>
                    <span>Applied: {app.date}</span>
                    <span>Note: {app.benefitExpected}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: app.status === "Approved & Disbursed" ? "#DCFCE7" : app.status === "Under Review" ? "#DBEAFE" : "#FEF3C7",
                    color: app.status === "Approved & Disbursed" ? "#15803D" : app.status === "Under Review" ? "#1E40AF" : "#B45309"
                  }}>
                    {app.status === "Approved & Disbursed" ? "✓ Approved & Disbursed" : app.status === "Under Review" ? "⏳ Under Review" : "📄 Verification Pending"}
                  </span>

                  <button
                    onClick={() => {
                      const filtered = applications.filter(a => a.id !== app.id);
                      setApplications(filtered);
                      localStorage.setItem("agri_user_applications", JSON.stringify(filtered));
                      showToast("Removed application entry.");
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14 }}
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. CALCULATORS VIEW ──────────────────────────── */}
      {activeView === "calculators" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          {/* PMFBY Calculator */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22, borderRadius: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                🛡️ {L.pmfbyHeader}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.pmfbySelectCrop}
                </label>
                <select value={cropCat} onChange={e => setCropCat(e.target.value)} className="input">
                  <option value="kharif_food">Kharif Crops (Food & Oilseeds) - 2% Premium</option>
                  <option value="rabi_food">Rabi Crops (Food & Oilseeds) - 1.5% Premium</option>
                  <option value="commercial">Commercial / Horticulture - 5% Premium</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.pmfbyArea}
                </label>
                <input type="number" step="0.1" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)} className="input" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.pmfbySumInsured}
                </label>
                <input type="number" step="5000" value={sumInsured} onChange={e => setSumInsured(parseFloat(e.target.value) || 0)} className="input" />
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
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22, borderRadius: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                💳 {L.kccHeader}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.kccAmount}
                </label>
                <input type="number" step="10000" value={loanAmount} onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)} className="input" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  {L.kccPeriod}
                </label>
                <input type="number" value={loanPeriod} onChange={e => setLoanPeriod(parseInt(e.target.value) || 0)} className="input" />
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

      {/* ── 9. SCHEME DETAIL MODAL ───────────────────────── */}
      {activeDetailScheme && (() => {
        const detailScheme = getLocalizedScheme(activeDetailScheme, language);
        return (
          <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16
        }}>
          <div
            className="card"
            style={{
              maxWidth: 680,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 20,
              boxShadow: "0 25px 40px -10px rgba(0,0,0,0.3)"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 32 }}>{detailScheme.icon}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--primary-dark)", lineHeight: 1.3 }}>
                    {detailScheme.title}
                  </h3>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, background: "var(--accent)", color: "var(--primary-dark)", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                      {getCategoryLabel(detailScheme.category, language)}
                    </span>
                    <span style={{ fontSize: 11, background: "var(--bg)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                      📍 {getStateLabel(detailScheme.coverage, language)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveDetailScheme(null)}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Description */}
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
              {detailScheme.description}
            </p>

            {/* Key Benefit Highlight */}
            <div style={{
              background: "var(--bg)",
              borderLeft: "4px solid var(--primary)",
              padding: "12px 14px",
              borderRadius: "0 10px 10px 0",
              marginBottom: 18
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 4 }}>
                💰 {L.keyBenefit}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                {detailScheme.benefit}
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 8 }}>
                🎯 {L.eligibilityTitle}
              </div>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {detailScheme.eligibility.map((crit, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.45 }}>
                    {crit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents Checklist with interactive checkboxes */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 8 }}>
                📋 {L.documentsChecklist} ({detailScheme.documentsCount} Required)
              </div>
              <div style={{
                background: "var(--bg)",
                padding: 12,
                borderRadius: 12,
                border: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 8
              }}>
                {detailScheme.documentsList.map((doc, idx) => (
                  <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text)", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How to Apply Guide */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--primary-dark)", marginBottom: 6 }}>
                📝 {L.howToApply}
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, background: "var(--accent)", padding: 12, borderRadius: 10 }}>
                {detailScheme.howToApply}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={detailScheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                🔗 {L.visitOfficialPortal || "Visit Official Government Portal"} ↗
              </a>
              <button
                onClick={() => toggleSaveScheme(activeDetailScheme.id)}
                className="btn btn-secondary"
              >
                {savedSchemeIds.includes(activeDetailScheme.id) ? "⭐ Saved" : "☆ Save"}
              </button>
              <button
                onClick={() => setActiveDetailScheme(null)}
                className="btn btn-secondary"
              >
                {L.close}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}
