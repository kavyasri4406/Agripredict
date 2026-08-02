console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING");
console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("Keys in process.env:", Object.keys(process.env).filter(k => k.toLowerCase().includes("key") || k.toLowerCase().includes("api")));
