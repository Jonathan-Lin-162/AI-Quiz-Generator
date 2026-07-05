const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateQuiz(prompt) {
  const reply = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",

    contents: prompt,
  });

  let rawText = reply.text.trim();

  if (rawText.startsWith("```json")) {
    rawText = rawText.substring(7, rawText.length - 3).trim();
  } else if (rawText.startsWith("```")) {
    rawText = rawText.substring(3, rawText.length - 3).trim();
  }

  return JSON.parse(rawText);
}

module.exports = {
  generateQuiz,
};
