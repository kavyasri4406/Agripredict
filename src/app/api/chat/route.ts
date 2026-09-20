import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse, type Language } from "@/lib/chatbot";

const SYSTEM_PROMPT = `You are AgriBot 🌱, an expert AI agriculture assistant helping Indian farmers.
You must speak in the language the user addresses you in: English, Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), or Hindi (हिंदी).
If the farmer types in transliterated scripts like Tanglish, Teluglish, Kanglish, or Hinglish (e.g. "paddy rate eshtu ide?", "vana kalam lo e panta vesukovali?"), understand their query naturally and reply in their preferred language!
Provide expert advice about crop choices, schedules, organic/chemical pest and disease management, weather risk mitigation, market prices, MSP, and government schemes.
Make your responses highly structured, premium, and easy to read. Use bullet points and bold formatting where appropriate.
Keep answers concise, actionable, and focused on practical farming solutions.`;

// Groq AI High-Performance Models
const GROQ_CHAT_MODELS = [
  "qwen/qwen3.8-27b",
  "allam-2-7b",
  "openai/gpt-oss-20b"
];

async function callGroqAI(
  userMessage: string,
  userLang: Language,
  history: { role: string; content: string }[]
): Promise<string | null> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return null;

  const messages: { role: string; content: string }[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nThe user's selected language is: ${userLang.toUpperCase()}. Please respond in ${userLang.toUpperCase()} unless they specifically ask in another language.`
    }
  ];

  if (history.length > 0) {
    const recent = history.slice(-6);
    recent.forEach((item) => {
      messages.push({
        role: item.role === "assistant" ? "assistant" : "user",
        content: item.content
      });
    });
  }

  messages.push({
    role: "user",
    content: userMessage
  });

  for (const model of GROQ_CHAT_MODELS) {
    for (let retry = 0; retry < 2; retry++) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgriPredict/1.0"
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            max_tokens: 1024
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim().length > 10) {
            return content.trim();
          }
        }
      } catch (err) {
        console.warn(`Groq call failed for model ${model}:`, err);
      }
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let userMessage = "hello";
  let userLang: Language = "en";

  try {
    const body = await req.json() as {
      message: string;
      history: { role: string; content: string }[];
      language: Language;
    };

    userMessage = body.message || "hello";
    userLang = body.language || "en";
    const history = body.history || [];

    // Primary AI: Groq Cloud AI Engine
    const groqResponse = await callGroqAI(userMessage, userLang, history);
    if (groqResponse) {
      return NextResponse.json({ response: groqResponse, mode: "⚡ Groq AI (qwen/qwen3.8-27b)" });
    }

    // Secondary Fallback: Local offline AgriBot intelligence engine
    const fallbackResponse = getChatbotResponse(userMessage, userLang);
    return NextResponse.json({ response: fallbackResponse, mode: "AgriBot AI Engine" });

  } catch (error) {
    const fallbackResponse = getChatbotResponse(userMessage, userLang);
    return NextResponse.json({ response: fallbackResponse, mode: "AgriBot AI Engine" });
  }
}
