import { NextRequest, NextResponse } from "next/server";

const OCR_SYSTEM_PROMPT = `You are an expert Indian government agricultural document analyzer for farmers.
When given an image, PDF, or text description of a government letter, land record, passbook, scheme notice, loan sanction, or agricultural document:

1. Identify document type, title, issue date, and issuing authority.
2. Provide a clear plain-language summary in English, Tamil (தமிழ்), and Telugu (తెలుగు) (2-3 sentences max).
3. Provide 3-4 specific action items for the farmer in English, Tamil (தமிழ்), and Telugu (తెలుగు).

IMPORTANT: Return ONLY valid JSON matching this exact structure:
{
  "documentType": "Short Document Type",
  "extractedTitle": "Extracted Title",
  "extractedDate": "Issue Date or N/A",
  "issuerAuthority": "Issuing Authority or Government Dept",
  "summaryEN": "English summary...",
  "summaryTA": "தமிழ் சுருக்கம்...",
  "summaryTE": "తెలుగు సారాంశం...",
  "actionItemsEN": [
    "Action item 1 in English",
    "Action item 2 in English",
    "Action item 3 in English"
  ],
  "actionItemsTA": [
    "1ஆம் தமிழ் நடவடிக்கை குறிப்பு",
    "2ஆம் தமிழ் நடவடிக்கை குறிப்பு",
    "3ஆம் தமிழ் நடவடிக்கை குறிப்பு"
  ],
  "actionItemsTE": [
    "1వ తెలుగు కార్యాచరణ అంశం",
    "2వ తెలుగు కార్యాచరణ అంశం",
    "3వ తెలుగు కార్యాచరణ అంశం"
  ]
}`;

const DEMO_DOCUMENT_PROMPTS: Record<string, string> = {
  "pm-kisan": "Analyze PM-KISAN e-KYC verification notice: e-KYC deadline 31 August 2026 for 20th installment Rs 2000. Ministry of Agriculture.",
  "kcc_loan": "Analyze Kisan Credit Card loan sanction letter: KCC crop loan Rs 1.5 lakh at 4% interest (7% minus 3% subvention). Repay within 12 months. State Cooperative Bank.",
  "pmfby": "Analyze PMFBY crop insurance enrollment Kharif 2026: 2% premium for Kharif crops. Covers drought, flood, pest. Agriculture Insurance Company.",
  "msp": "Analyze MSP procurement circular Kharif 2026: Paddy MSP Rs 2300/qtl, Cotton Rs 7121/qtl. Register on e-NAM before Oct 1. FCI.",
  "soil": "Analyze Soil Health Card: N Medium, P Low, K Adequate. pH 6.8. Apply 120kg Urea + 60kg DAP + 30kg MOP per hectare. Department of Agriculture.",
  "irrigation": "Analyze PMKSY Drip Irrigation subsidy notice: 55% subsidy for small farmers. Max Rs 1.4 lakh/ha for drip. Apply before 31 August.",
};

async function callGemini(apiKey: string, prompt: string, imageBase64?: string, mimeType?: string) {
  const parts: any[] = [];
  
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: imageBase64
      }
    });
  }
  
  parts.push({ text: prompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        systemInstruction: { parts: [{ text: OCR_SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Guarantee all multilingual action item arrays exist
  if (!parsed.actionItemsEN || !Array.isArray(parsed.actionItemsEN) || parsed.actionItemsEN.length === 0) {
    parsed.actionItemsEN = parsed.actionItems || [
      "Review document for eligibility criteria and official deadlines.",
      "Verify all land and personal details with local Tahsildar/KVK office.",
      "Keep original passbook/document safe for government transactions."
    ];
  }

  if (!parsed.actionItemsTA || !Array.isArray(parsed.actionItemsTA) || parsed.actionItemsTA.length === 0) {
    parsed.actionItemsTA = [
      "தகுதி வரம்புகள் மற்றும் அதிகாரப்பூர்வ கடைசி தேதிகளுக்கு ஆவணத்தை கவனமாக சரிபார்க்கவும்.",
      "உள்ளூர் வட்டாட்சியர்/வேளாண் அலுவலகத்தில் நில மற்றும் தனிப்பட்ட விவரங்களை சரிபார்க்கவும்.",
      "அரசு பரிவர்த்தனைகளுக்கு அசல் ஆவணத்தைப் பத்திரமாக வைத்திருக்கவும்."
    ];
  }

  if (!parsed.actionItemsTE || !Array.isArray(parsed.actionItemsTE) || parsed.actionItemsTE.length === 0) {
    parsed.actionItemsTE = [
      "అర్హత ప్రమాణాలు మరియు అధికారిక గడువుల కోసం పత్రాన్ని జాగ్రత్తగా పరిశీలించండి.",
      "స్థానిక తహశీల్దార్/వ్యవసాయ కార్యాలయంలో భూమి మరియు వ్యక్తిగత వివరాలను ధృవీకరించుకోండి.",
      "ప్రభుత్వ లావాదేవీల కోసం అసలు పాస్‌బుక్/పత్రాన్ని భద్రంగా ఉంచుకోండి."
    ];
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (contentType.includes("application/json")) {
      const { demoKey, fileName } = await req.json();
      
      if (!apiKey) {
        return NextResponse.json({ error: "No API key configured", mode: "no-api-key" }, { status: 503 });
      }

      const key = Object.keys(DEMO_DOCUMENT_PROMPTS).find(k => 
        (demoKey || "").toLowerCase().includes(k) || 
        (fileName || "").toLowerCase().includes(k)
      ) || "pm-kisan";

      const prompt = DEMO_DOCUMENT_PROMPTS[key];
      const result = await callGemini(apiKey, `${prompt}\n\nAnalyze and return structured JSON.`);
      return NextResponse.json({ result, mode: "api-text" });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const fileMime = file.type || "image/jpeg";
      const isImage = fileMime.startsWith("image/");
      const isPdf = fileMime === "application/pdf";

      if (!isImage && !isPdf) {
        return NextResponse.json({ error: "Unsupported file type. Upload PNG, JPG, or PDF." }, { status: 400 });
      }

      if (!apiKey) {
        return NextResponse.json({ 
          error: "GEMINI_API_KEY not set in environment.",
          mode: "no-api-key" 
        }, { status: 503 });
      }

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      const prompt = isImage
        ? `Analyze this government document photo (filename: ${file.name}). Extract details, summary, and action items in English, Tamil (தமிழ்), and Telugu (తెలుగు). Ensure actionItemsEN, actionItemsTA, and actionItemsTE are all included.`
        : `Analyze this PDF document (filename: ${file.name}). Extract details, summary, and action items in English, Tamil (தமிழ்), and Telugu (తెలుగు). Ensure actionItemsEN, actionItemsTA, and actionItemsTE are all included.`;

      const result = await callGemini(apiKey, prompt, base64, isPdf ? "application/pdf" : fileMime);

      return NextResponse.json({ result, mode: "api-vision" });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });

  } catch (error: any) {
    console.error("OCR API error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to analyze document",
      mode: "error"
    }, { status: 500 });
  }
}
