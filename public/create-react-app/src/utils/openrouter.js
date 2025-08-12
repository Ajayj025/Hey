const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/mistral-7b-instruct"; // Or try "openai/gpt-3.5-turbo"

if (!API_KEY) {
  console.error("❌ Missing OpenRouter API Key");
  throw new Error("Missing OpenRouter API Key");
}

async function generateContent(promptText) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:3000", // change in production
        "X-Title": "SmartChat App"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "user", content: promptText }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`❌ API Error: ${response.status} ${response.statusText}\n${errorBody}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    return result || "⚠️ No response from AI.";
  } catch (error) {
    console.error("OpenRouter fetch failed:", error.message);
    return "⚠️ AI is unavailable or failed to respond.";
  }
}

// Utility functions
export async function getOpenRouterReply(message) {
  return await generateContent(`Reply concisely to:\n"${message}"`);
}

export async function enhanceMessage(message) {
  return await generateContent(`Make this message more clear and polite:\n"${message}"`);
}

export async function summarizeMessage(conversation) {
  const formatted = Array.isArray(conversation)
    ? conversation.map(msg => `${msg.fromSelf ? "You" : "Them"}: ${msg.message}`).join("\n")
    : conversation;

  return await generateContent(`Summarize this conversation:\n${formatted}`);
}

export async function translateMessage(message, language = "Telugu") {
  return await generateContent(`Translate this to ${language}:\n"${message}"`);
}

export async function detectToxicity(message) {
  const result = await generateContent(
    `Is this message toxic (hate, harassment, insult)? Only reply 'true' or 'false':\n"${message}"`
  );
  return result.trim().toLowerCase() === "true";
}
