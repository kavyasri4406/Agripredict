"use client";
import { useState, useRef, useEffect } from "react";
import { getChatbotResponse, createMessage, QUICK_PROMPTS, LANG_LABELS, detectLanguage } from "@/lib/chatbot";
import { useApp } from "@/lib/AppContext";
import type { ChatMessage, Language } from "@/lib/chatbot";
import DocumentOcr from "@/components/DocumentOcr";

const WELCOME: Partial<Record<Language, string>> = {
  en: "👋 Hello! I'm AgriBot 🌱\n\nI'm your AI agriculture assistant. Ask me about crop choices, market prices, weather impacts, or government schemes in English, Tamil, Telugu, Kannada, Malayalam, or Hindi!",
  ta: "👋 வணக்கம்! நான் AgriBot 🌱\n\nஉங்கள் அனைத்து பயிர் மற்றும் சந்தை கேள்விகளுக்கும் உதவ இங்கே இருக்கிறேன். தமிழிலேயே கேளுங்கள்!",
  te: "👋 నమస్కారం! నేను AgriBot 🌱\n\nమీ అన్ని పంట మరియు మార్కెట్ ప్రశ్నలకు సహాయపడటానికి ఇక్కడ ఉన్నాను. తెలుగులో అడగండి!",
  kn: "👋 నమస్కార! నేను AgriBot 🌱\n\nನಿಮ್ಮ ಎಲ್ಲಾ ಬೆಳೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ಕನ್ನಡದಲ್ಲೇ ಕೇಳಿ!",
  ml: "👋 നമസ്കാരം! ഞാൻ AgriBot 🌱\n\nനിങ്ങളുടെ എല്ലാ കാർഷിക സംശയങ്ങൾക്കും സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. മലയാളത്തിൽ ചോദിക്കൂ!",
  hi: "👋 नमस्कार! मैं AgriBot हूँ 🌱\n\nआपकी सभी फसल और बाजार संबंधी प्रश्नों में मदद के लिए यहाँ हूँ। हिंदी में पूछें!"
};

interface SavedChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

type PageMode = "chat" | "documents";

export default function ChatbotPage() {
  const { language, setLanguage } = useApp();
  const [mode, setMode] = useState<PageMode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([createMessage("assistant", WELCOME[language] || WELCOME.en || "")]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const hasProcessedRef = useRef(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [savedSessions, setSavedSessions] = useState<SavedChatSession[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("agri_saved_chats") || "[]");
        setSavedSessions(saved);
      } catch {}
    }
  }, []);

  const saveCurrentSession = () => {
    if (messages.length <= 1) {
      alert("Please send a message before saving the session!");
      return;
    }
    const userMsg = messages.find(m => m.role === "user");
    const title = userMsg ? userMsg.content.slice(0, 30) + "..." : "Chat Session";
    const newSession: SavedChatSession = {
      id: "session_" + Date.now(),
      title,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      messages: messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
    };
    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("agri_saved_chats", JSON.stringify(updated));
    }
    alert("Chat session saved! 💾");
  };

  const loadSession = (session: SavedChatSession) => {
    setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    setShowSavedModal(false);
  };

  const deleteSession = (id: string) => {
    const updated = savedSessions.filter(s => s.id !== id);
    setSavedSessions(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("agri_saved_chats", JSON.stringify(updated));
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isRecording) {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
      setIsRecording(false);
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.lang = { en: "en-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", hi: "hi-IN" }[selectedLang] || "en-IN";
      hasProcessedRef.current = false;
      rec.onstart = () => { setIsRecording(true); };
      rec.onresult = (event: any) => {
        if (hasProcessedRef.current) return;
        const lastIndex = event.resultIndex;
        const result = event.results[lastIndex];
        if (!result.isFinal) return;
        hasProcessedRef.current = true;
        const resultText = result[0].transcript.trim();
        if (resultText) { setInput(prev => (prev ? prev + " " + resultText : resultText)); }
        try { rec.stop(); } catch {}
      };
      rec.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === "not-allowed") {
          alert("Microphone access denied. Please allow microphone access in browser settings.");
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          alert(`Voice input error: ${event.error}`);
        }
      };
      rec.onend = () => { setIsRecording(false); };
      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const changeLang = (lang: Language) => {
    setSelectedLang(lang);
    setLanguage(lang);
    setMessages([createMessage("assistant", WELCOME[lang] || WELCOME.en || "")]);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = createMessage("user", text.trim());
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    const detectedLang = detectLanguage(text);
    const responseLang = detectedLang !== "en" ? detectedLang : selectedLang;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map(m => ({ role: m.role, content: m.content })),
          language: responseLang
        })
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setMessages(prev => [...prev, createMessage("assistant", data.response)]);
    } catch {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setMessages(prev => [...prev, createMessage("assistant", getChatbotResponse(text, responseLang))]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const prompts = QUICK_PROMPTS[selectedLang] || QUICK_PROMPTS.en;
  const L = {
    title: language === "ta" ? "AI விவசாய உதவியாளர்" : language === "te" ? "AI వ్యవసాయ సహాయకుడు" : "AI Agriculture Assistant",
    sub: language === "ta" ? "ஆங்கிலம், தமிழ், தெலுங்கில் கேளுங்கள்" : language === "te" ? "ఇంగ్లీష్, తమిళం, తెలుగులో అడగండి" : "Ask in English, Tamil, or Telugu",
    placeholder: language === "ta" ? "உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்..." : language === "te" ? "మీ ప్రశ్నను టైప్ చేయండి..." : "Type your question...",
    send: language === "ta" ? "அனுப்பு" : language === "te" ? "పంపండి" : "Send",
    clear: language === "ta" ? "அழிக்க" : language === "te" ? "క్లియర్" : "Clear",
    typing: language === "ta" ? "AgriBot தட்டிக்கொண்டிருக்கிறது..." : language === "te" ? "AgriBot టైప్ చేస్తోంది..." : "AgriBot is typing...",
  };

  const formatMsg = (content: string) => content.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <div key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ minHeight: line ? undefined : 8 }} />;
  });

  return (
    <>
      <style>{`
        .chatbot-wrapper {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
          background: var(--bg);
        }
        @media (max-width: 768px) {
          .chatbot-wrapper { height: calc(100dvh - 52px) !important; }
          .chatbot-header { flex-wrap: wrap; gap: 6px; padding: 8px 12px !important; }
          .chatbot-header > div:last-child { width: 100%; justify-content: flex-end; }
          .chatbot-messages { padding: 10px 8px !important; }
          .chatbot-quick-prompts { padding: 6px 8px !important; }
          .chat-bubble { max-width: 90% !important; font-size: 13px !important; }
          .chat-input-area { padding: 8px 10px !important; }
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>

      <div className="chatbot-wrapper">

        {/* ── MODE TABS ── */}
        <div style={{
          flexShrink: 0, display: "flex",
          background: "var(--bg-card)",
          borderBottom: "2px solid var(--border)",
          padding: "0 16px",
        }}>
          {([
            { id: "chat" as PageMode, label: "🤖 AI Chat" },
            { id: "documents" as PageMode, label: "📄 Document Scanner" },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setMode(tab.id)} style={{
              padding: "11px 18px", fontSize: 13.5, fontWeight: 700,
              border: "none", background: "none", cursor: "pointer",
              color: mode === tab.id ? "var(--primary)" : "var(--text-muted)",
              borderBottom: mode === tab.id ? "3px solid var(--primary)" : "3px solid transparent",
              fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DOCUMENT SCANNER ── */}
        {mode === "documents" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
            <DocumentOcr />
          </div>
        )}

        {/* ── AI CHAT ── */}
        {mode === "chat" && (
          <>
            {/* Chat Header */}
            <div className="chatbot-header" style={{
              flexShrink: 0, background: "var(--bg-card)",
              borderBottom: "1px solid var(--border)", padding: "10px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg,var(--primary),var(--primary-light))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>🤖</div>
                <div>
                  <div style={{ fontFamily: "Playfair Display,serif", fontSize: 14, fontWeight: 700 }}>{L.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                    <span className="live-dot" style={{ width: 6, height: 6 }} />{L.sub}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {(Object.entries(LANG_LABELS) as [Language, string][]).map(([lang, label]) => (
                    <button key={lang} id={`lang-${lang}`} onClick={() => changeLang(lang)} style={{
                      padding: "4px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                      border: `1.5px solid ${selectedLang === lang ? "var(--primary)" : "var(--border)"}`,
                      background: selectedLang === lang ? "var(--primary)" : "var(--bg-card)",
                      color: selectedLang === lang ? "#fff" : "var(--text-muted)",
                    }}>{label}</button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowSavedModal(true)}>
                  💾{savedSessions.length > 0 ? ` (${savedSessions.length})` : ""}
                </button>
                <button className="btn btn-primary btn-sm" onClick={saveCurrentSession}>Save</button>
                <button id="btn-clear-chat" className="btn btn-secondary btn-sm" onClick={() => setMessages([createMessage("assistant", WELCOME[selectedLang] || WELCOME.en || "")])}>{L.clear}</button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="chatbot-quick-prompts" style={{
              padding: "7px 14px", borderBottom: "1px solid var(--border)",
              background: "var(--bg-card)", display: "flex", gap: 6,
              overflowX: "auto", flexShrink: 0,
            }}>
              {prompts.map((p, i) => (
                <button key={i} id={`quick-${i}`} onClick={() => send(p)} style={{
                  padding: "5px 11px", borderRadius: 99, border: "1.5px solid var(--border)",
                  background: "var(--bg)", color: "var(--text)", fontSize: 12,
                  cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "var(--primary)"; (e.target as HTMLElement).style.color = "var(--primary)"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.color = "var(--text)"; }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="chatbot-messages" style={{
              flex: 1, overflowY: "auto", padding: "14px",
              display: "flex", flexDirection: "column", gap: 12,
              background: "var(--bg)", minHeight: 0,
            }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: "flex", gap: 8, alignItems: "flex-end",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                    background: msg.role === "user" ? "var(--primary)" : "var(--accent)",
                    border: "1px solid var(--border)",
                  }}>{msg.role === "user" ? "👤" : "🤖"}</div>
                  <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`} style={{ maxWidth: "75%" }}>
                    {formatMsg(msg.content)}
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 5, textAlign: msg.role === "user" ? "right" : "left" }}>
                      {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
                  <div className="chat-bubble chat-bubble-bot">
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <div className="typing-indicator" style={{ padding: 0 }}>
                        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{L.typing}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area" style={{
              flexShrink: 0, padding: "10px 14px",
              borderTop: "1px solid var(--border)", background: "var(--bg-card)",
            }}>
              <div style={{ display: "flex", gap: 7 }}>
                <input id="chat-input" ref={inputRef} className="input"
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder={L.placeholder}
                  style={{ flex: 1 }} disabled={isTyping}
                />
                <button type="button" onClick={toggleRecording}
                  style={{
                    padding: "0 12px", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 17, cursor: "pointer",
                    borderRadius: 10, border: isRecording ? "1px solid hsl(0,72%,51%)" : "1px solid var(--border)",
                    background: isRecording ? "hsl(0,72%,96%)" : "var(--bg-card)",
                    color: isRecording ? "hsl(0,72%,51%)" : "var(--text)",
                    animation: isRecording ? "pulse-red 1.5s infinite" : "none",
                  }} title="Voice input">
                  {isRecording ? "🛑" : "🎤"}
                </button>
                <button id="btn-send" className="btn btn-primary" onClick={() => send(input)} disabled={isTyping || !input.trim()}>
                  {L.send} ➤
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, textAlign: "center" }}>
                Enter to send · English · தமிழ் · తెలుగు
              </div>
            </div>
          </>
        )}

        {/* Saved Sessions Modal */}
        {showSavedModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1000, padding: 16,
          }}>
            <div className="card" style={{ maxWidth: 500, width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column", gap: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>💾 Saved Chat Sessions</div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowSavedModal(false)}>✕ Close</button>
              </div>
              {savedSessions.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No saved sessions yet. Click "Save" during a chat to store it!
                </div>
              ) : (
                <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {savedSessions.map(session => (
                    <div key={session.id} style={{
                      padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)",
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{session.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          📅 {session.date} · {session.messages.length} msgs
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => loadSession(session)}>Open</button>
                        <button className="btn btn-secondary btn-sm" style={{ color: "#B91C1C" }} onClick={() => deleteSession(session.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
