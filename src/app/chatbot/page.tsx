"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { getChatbotResponse, createMessage, QUICK_PROMPTS, LANG_LABELS, detectLanguage } from "@/lib/chatbot";
import { useApp } from "@/lib/AppContext";
import type { ChatMessage, Language } from "@/lib/chatbot";

const WELCOME: Partial<Record<Language, string>> = {
  en: "👋 Hello! I'm AgriBot 🌱\n\nI'm your AI agriculture assistant. Ask me about crop choices, market prices, weather impacts, or government schemes in English, Tamil, Telugu, Kannada, Malayalam, or Hindi!",
  ta: "👋 வணக்கம்! நான் AgriBot 🌱\n\nஉங்கள் அனைத்து பயிர் மற்றும் சந்தை கேள்விகளுக்கும் உதவ இங்கே இருக்கிறேன். தமிழிலேயே கேளுங்கள்!",
  te: "👋 నమస్కారం! నేను AgriBot 🌱\n\nమీ అన్ని పంట మరియు మార్కెట్ ప్రశ్నలకు సహాయపడటానికి ఇక్కడ ఉన్నాను. తెలుగులో అడగండి!",
  kn: "👋 ನಮಸ್ಕಾರ! ನಾನು AgriBot 🌱\n\nನಿಮ್ಮ ಎಲ್ಲಾ ಬೆಳೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ಕನ್ನಡದಲ್ಲೇ ಕೇಳಿ!",
  ml: "👋 നമസ്കാരം! ഞാൻ AgriBot 🌱\n\nനിങ്ങളുടെ എല്ലാ കാർഷിക സംശയങ്ങൾക്കും സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. മലയാളത്തിൽ ചോദിക്കൂ!",
  hi: "👋 नमस्कार! मैं AgriBot हूँ 🌱\n\nआपकी सभी फसल और बाजार संबंधी प्रश्नों में मदद के लिए यहाँ हूँ। हिंदी में पूछें!"
};

interface SavedChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

export default function ChatbotPage() {
  const { language, setLanguage } = useApp();
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
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const utteranceRef = useRef<any>(null);
  const isManuallyRecordingRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>("");
  const currentSessionFinalRef = useRef<string>("");
  const restartTimeoutRef = useRef<any>(null);

  const copyMessage = (id: string, content: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(content).then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      }).catch(() => fallbackCopy(id, content));
    } else {
      fallbackCopy(id, content);
    }
  };

  const fallbackCopy = (id: string, content: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAutoSpeak = localStorage.getItem("agri_auto_speak") === "true";
      setAutoSpeak(savedAutoSpeak);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (!next) stopSpeaking();
    if (typeof window !== "undefined") {
      localStorage.setItem("agri_auto_speak", String(next));
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/₹/g, "rupees ")
      .replace(/(\r\n|\n|\r)/gm, ". ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speakMessage = (messageId: string, text: string, lang: Language) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported on this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utteranceRef.current = utterance;

    const langLocaleMap: Record<Language, string> = {
      en: "en-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      hi: "hi-IN"
    };

    const targetLocale = langLocaleMap[lang] || "en-IN";
    utterance.lang = targetLocale;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === targetLocale || v.lang.startsWith(targetLocale.split("-")[0]))
      || voices.find(v => v.lang.includes("IN"))
      || voices[0];

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

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
      messages: [...messages]
    };
    const updated = [newSession, ...savedSessions.filter(s => s.title !== title)].slice(0, 10);
    setSavedSessions(updated);
    try {
      localStorage.setItem("agri_saved_chats", JSON.stringify(updated));
      alert("Chat session saved successfully!");
    } catch {}
  };

  const loadSession = (session: SavedChatSession) => {
    setMessages(session.messages);
    setShowSavedModal(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSessions.filter(s => s.id !== id);
    setSavedSessions(updated);
    try {
      localStorage.setItem("agri_saved_chats", JSON.stringify(updated));
    } catch {}
  };

  const stopVoiceInput = useCallback(() => {
    isManuallyRecordingRef.current = false;
    setIsRecording(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      setIsRecording(false);
      isManuallyRecordingRef.current = false;
      return;
    }

    // Safely cleanup prior instance before recreating a fresh one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const langMap: Record<Language, string> = {
        en: "en-IN",
        ta: "ta-IN",
        te: "te-IN",
        kn: "kn-IN",
        ml: "ml-IN",
        hi: "hi-IN"
      };
      recognition.lang = langMap[selectedLang] || "en-IN";

      currentSessionFinalRef.current = "";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            accumulatedTranscriptRef.current += item[0].transcript + " ";
          } else {
            interim += item[0].transcript;
          }
        }
        const full = (accumulatedTranscriptRef.current + interim).trim();
        if (full) {
          if (inputRef.current && inputRef.current.value !== full) {
            inputRef.current.value = full;
          }
          setInput(full);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          stopVoiceInput();
          alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
          return;
        }
      };

      recognition.onend = () => {
        // If the user has NOT manually turned off the mic, keep it alive continuously!
        if (isManuallyRecordingRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isManuallyRecordingRef.current) {
              startRecognition();
            }
          }, 30);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      // Auto-recover if user is still actively recording
      if (isManuallyRecordingRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isManuallyRecordingRef.current) {
            startRecognition();
          }
        }, 150);
      }
    }
  }, [selectedLang, stopVoiceInput]);

  useEffect(() => {
    // If language changes while actively recording, recreate with new language
    if (isManuallyRecordingRef.current) {
      startRecognition();
    }
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, [selectedLang, startRecognition]);

  const toggleVoiceInput = () => {
    if (isRecording || isManuallyRecordingRef.current) {
      // User explicitly stopped the mic
      stopVoiceInput();
    } else {
      // User turned ON the mic
      stopSpeaking();
      isManuallyRecordingRef.current = true;
      accumulatedTranscriptRef.current = input ? input.trim() + " " : "";
      currentSessionFinalRef.current = "";
      setIsRecording(true);
      startRecognition();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const welcomeMsg = WELCOME[language] || WELCOME.en || "";
    setSelectedLang(language);
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [createMessage("assistant", welcomeMsg)];
      }
      return prev;
    });
  }, [language]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isTyping) return;

    stopSpeaking();

    stopVoiceInput();

    const detected = detectLanguage(text);
    if (detected !== selectedLang && ["ta", "te", "kn", "ml", "hi"].includes(detected)) {
      setSelectedLang(detected);
    }

    const userMsg = createMessage("user", text);
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const historyForApi = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyForApi,
          language: selectedLang
        })
      });

      if (!res.ok) throw new Error("API route error");

      const data = await res.json();
      const botResponse = data.response || getChatbotResponse(text, selectedLang);
      const assistantMsg = createMessage("assistant", botResponse);

      setMessages(prev => [...prev, assistantMsg]);
      if (autoSpeak) {
        setTimeout(() => {
          speakMessage(assistantMsg.id, botResponse, selectedLang);
        }, 150);
      }

    } catch (err) {
      const fallback = getChatbotResponse(text, selectedLang);
      const fallbackMsg = createMessage("assistant", fallback);
      setMessages(prev => [...prev, fallbackMsg]);
      if (autoSpeak) {
        setTimeout(() => {
          speakMessage(fallbackMsg.id, fallback, selectedLang);
        }, 150);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const changeLang = (lang: Language) => {
    setSelectedLang(lang);
    setLanguage(lang);
    const welcome = WELCOME[lang] || WELCOME.en || "";
    setMessages([createMessage("assistant", welcome)]);
  };

  const LABELS: Record<Language, { title: string; sub: string; input: string; send: string; clear: string }> = {
    en: { title: "AI Agriculture Assistant", sub: "Ask in English", input: "Type your question...", send: "Send", clear: "Clear" },
    ta: { title: "AI விவசாய உதவியாளர்", sub: "தமிழில் கேளுங்கள்", input: "கேள்வியை டைப் செய்யவும்...", send: "அனுப்பு", clear: "அழி" },
    te: { title: "AI వ్యవసాయ సహాయకుడు", sub: "తెలుగులో అడగండి", input: "మీ ప్రశ్న రాయండి...", send: "పంపు", clear: "క్లియర్" },
    kn: { title: "AI ಕೃಷಿ ಸಹಾಯಕ", sub: "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ", input: "ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...", send: "ಕಳುಹಿಸಿ", clear: "ಅಳಿಸು" },
    ml: { title: "AI കാർഷിക സഹായി", sub: "മലയാളത്തിൽ ചോദിക്കൂ", input: "ചോദ്യം ടൈപ്പ് ചെയ്യുക...", send: "അയക്കുക", clear: "മായ്ക്കുക" },
    hi: { title: "एआई कृषि सहायक", sub: "हिंदी में पूछें", input: "अपना प्रश्न लिखें...", send: "भेजें", clear: "साफ़ करें" }
  };
  const L = LABELS[selectedLang] || LABELS.en;

  const quickPrompts = QUICK_PROMPTS[selectedLang] || QUICK_PROMPTS.en;

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

            {/* Auto-Speak Toggle */}
            <button
              onClick={toggleAutoSpeak}
              title={autoSpeak ? "Auto-Speak Responses: ON (Click to turn OFF)" : "Auto-Speak Responses: OFF (Click to turn ON)"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 99,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                border: autoSpeak ? "1.5px solid #10B981" : "1px solid var(--border)",
                background: autoSpeak ? "rgba(16,185,129,0.18)" : "var(--bg)",
                color: autoSpeak ? "#047857" : "var(--text-muted)",
                transition: "all 0.18s ease"
              }}
            >
              <span>{autoSpeak ? "🔊 Voice: ON" : "🔇 Voice: OFF"}</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowSavedModal(true)}>
              💾{savedSessions.length > 0 ? ` (${savedSessions.length})` : ""}
            </button>
            <button className="btn btn-primary btn-sm" onClick={saveCurrentSession}>Save</button>
            <button id="btn-clear-chat" className="btn btn-secondary btn-sm" onClick={() => {
              stopSpeaking();
              setMessages([createMessage("assistant", WELCOME[selectedLang] || WELCOME.en || "")]);
            }}>{L.clear}</button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="chatbot-quick-prompts" style={{
          flexShrink: 0, padding: "8px 16px", background: "var(--bg)",
          borderBottom: "1px solid var(--border)", display: "flex", gap: 6,
          overflowX: "auto", whiteSpace: "nowrap"
        }}>
          {quickPrompts.map((qp, idx) => (
            <button key={idx} onClick={() => handleSend(qp)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text)", cursor: "pointer", whiteSpace: "nowrap"
            }}>
              {qp}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="chatbot-messages" style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "flex", flexDirection: "column", gap: 12
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: 8, alignItems: "flex-start"
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: speakingMessageId === msg.id ? "#10B981" : "var(--primary-light)", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 14,
                  transition: "all 0.2s ease"
                }}>{speakingMessageId === msg.id ? "🔊" : "🤖"}</div>
              )}
              <div className="chat-bubble" style={{
                maxWidth: "80%", padding: "10px 14px", borderRadius: 14,
                background: msg.role === "user" ? "var(--primary)" : "var(--bg-card)",
                color: msg.role === "user" ? "#fff" : "var(--text)",
                border: speakingMessageId === msg.id ? "2px solid #10B981" : msg.role === "assistant" ? "1px solid var(--border)" : "none",
                fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line",
                boxShadow: speakingMessageId === msg.id ? "0 4px 14px rgba(16,185,129,0.2)" : "none",
                transition: "all 0.2s ease"
              }}>
                {msg.content}
                
                {/* Bubble Footer: Timestamp & Audio Speak/Stop Button */}
                <div style={{
                  fontSize: 10, opacity: 0.85, marginTop: 6,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: msg.role === "assistant" ? "1px dashed var(--border)" : "none",
                  paddingTop: msg.role === "assistant" ? 4 : 0,
                  gap: 8
                }}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  
                  {msg.role === "assistant" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {/* Copy Answer Button */}
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        title="Copy answer to clipboard"
                        style={{
                          background: copiedMessageId === msg.id ? "#10B981" : "var(--bg)",
                          color: copiedMessageId === msg.id ? "#fff" : "var(--text)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          transition: "all 0.15s ease"
                        }}
                      >
                        {copiedMessageId === msg.id ? "✓ Copied" : "📋 Copy"}
                      </button>

                      {/* Read Aloud in Native Voice Button */}
                      <button
                        onClick={() => speakMessage(msg.id, msg.content, selectedLang)}
                        title={speakingMessageId === msg.id ? "Stop Speaking" : "Read Aloud in Native Voice"}
                        style={{
                          background: speakingMessageId === msg.id ? "#EF4444" : "var(--bg)",
                          color: speakingMessageId === msg.id ? "#fff" : "var(--primary-dark)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "2px 7px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          transition: "all 0.15s ease"
                        }}
                      >
                        {speakingMessageId === msg.id ? "⏹️ Stop" : "🔊 Listen"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {msg.role === "user" && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "var(--accent)", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 14
                }}>🧑‍🌾</div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
              <div style={{ padding: "8px 14px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)" }}>
                ••• AgriBot is typing...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Saved Sessions Modal */}
        {showSavedModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 450, padding: 20, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>💾 Saved Chat Sessions</span>
                <button onClick={() => setShowSavedModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text)" }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {savedSessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
                    No saved chats yet. Click "Save" in the chat header to store a session!
                  </div>
                ) : (
                  savedSessions.map(session => (
                    <div key={session.id} onClick={() => loadSession(session)} style={{ padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>💬 {session.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>🕒 {session.date} ({session.messages.length} msgs)</div>
                      </div>
                      <button onClick={e => deleteSession(session.id, e)} style={{ background: "none", border: "none", color: "#E53E3E", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Listening Indicator */}
        {isRecording && (
          <div style={{
            flexShrink: 0,
            background: "#DC2626",
            color: "#fff",
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="live-dot" style={{ background: "#fff", width: 8, height: 8 }} />
                <span>🎙️ Mic Active:</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["en", "te", "ta", "hi", "ml", "kn"] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    title={`Switch voice recognition to ${LANG_LABELS[l]}`}
                    style={{
                      background: selectedLang === l ? "#fff" : "rgba(255,255,255,0.22)",
                      color: selectedLang === l ? "#DC2626" : "#fff",
                      border: "none",
                      borderRadius: 99,
                      padding: "2px 8px",
                      fontSize: 10.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={stopVoiceInput}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: 99,
                  padding: "3px 12px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                ⏹️ Stop Mic
              </button>
              <button
                onClick={() => {
                  stopVoiceInput();
                  if (input.trim()) handleSend();
                }}
                style={{
                  background: "#fff",
                  color: "#DC2626",
                  border: "none",
                  borderRadius: 99,
                  padding: "3px 12px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Send Voice ✓
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-area" style={{
          flexShrink: 0, padding: "12px 16px", background: "var(--bg-card)",
          borderTop: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center"
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={L.input}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 12,
              border: "1px solid var(--border)", background: "var(--bg)",
              color: "var(--text)", fontSize: 14, outline: "none"
            }}
          />
          <button
            onClick={toggleVoiceInput}
            title={isRecording ? "Stop Continuous Mic (Currently ON)" : `Start Continuous Voice Input (${LANG_LABELS[selectedLang]})`}
            style={{
              width: 42, height: 42, borderRadius: 12, border: isRecording ? "2px solid #fff" : "1px solid var(--border)",
              background: isRecording ? "#DC2626" : "var(--bg)", color: isRecording ? "#fff" : "var(--text)",
              cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              animation: isRecording ? "pulse-red 1.5s infinite" : "none",
              transition: "all 0.2s ease"
            }}
          >
            {isRecording ? "⏹️" : "🎙️"}
          </button>
          <button
            onClick={() => handleSend()}
            className="btn btn-primary"
            style={{ borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 700 }}
          >
            {L.send}
          </button>
        </div>
      </div>
    </>
  );
}
