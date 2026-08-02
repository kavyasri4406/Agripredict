import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse, type Language } from "@/lib/chatbot";

const SYSTEM_PROMPT = `You are AgriBot 🌱, an expert AI agriculture assistant helping Indian farmers.
You must speak in the language the user addresses you in: English, Tamil (தமிழ்), or Telugu (తెలుగు).
Provide expert advice about crop choices, schedules, organic/chemical pest and disease management, weather risk mitigation, market prices, MSP, and government schemes.
Make your responses highly structured, premium, and easy to read. Use bullet points and bold formatting where appropriate.
Keep answers concise, actionable, and focused on practical farming solutions. If a user asks about a crop, provide clear recommendations tailored to their context.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history, language } = await req.json() as {
      message: string;
      history: { role: string; content: string }[];
      language: Language;
    };

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback to local simulated chatbot if no API key is present
    if (!apiKey) {
      console.log("GEMINI_API_KEY not set. Using local database fallback.");
      const fallbackResponse = getChatbotResponse(message, language);
      return NextResponse.json({ response: fallbackResponse, mode: "fallback" });
    }

    // Map roles to Gemini roles: user -> user, assistant -> model
    const contents = [
      ...history.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API returned error status ${response.status}:`, errText);
      const fallbackResponse = getChatbotResponse(message, language);
      return NextResponse.json({ response: fallbackResponse, mode: "fallback" });
    }

    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botResponse) {
      console.warn("Gemini returned empty or invalid response structure:", data);
      const fallbackResponse = getChatbotResponse(message, language);
      return NextResponse.json({ response: fallbackResponse, mode: "fallback" });
    }

    return NextResponse.json({ response: botResponse, mode: "api" });

  } catch (error) {
    console.error("Error in API chat route handler:", error);
    try {
      const body = await req.json().catch(() => ({}));
      const fallbackResponse = getChatbotResponse(body.message || "hello", body.language || "en");
      return NextResponse.json({ response: fallbackResponse, mode: "fallback" });
    } catch {
      return NextResponse.json({ response: "I'm sorry, I'm experiencing some issues right now. Please try again later.", mode: "error" });
    }
  }
}
