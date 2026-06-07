const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const user = null;
console.log(process.env.GEMINI_API_KEY);
app.get("/", (req, res) => {
  res.render("index", {
    css: ["index", "header"],
    js: [],
    user: user,
  });
});

app.get("/home", (req, res) => {
  res.render("home", { css: ["home", "header"], js: [], user: user });
});

app.get("/login", (req, res) => {
  res.render("login", {
    css: ["login", "header"],
    js: [],
    user: user,
  });
});

app.get("/create", (req, res) => {
  res.render("create", {
    css: ["header", "create"],
    js: ["create"],
    user: user,
  });
});

app.get("/renderQuiz", (req, res) => {
  res.render("renderQuiz", {
    css: ["header", "renderQuiz"],
    js: ["renderQuiz"],
    user: user,
  });
});

app.post("/quizGenerate", async (req, res) => {
  try {
    const prompt = req.body.message;
    if (!prompt) {
      return res.status(400).json({ error: "Message required" });
    }
    const reply = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });
    let rawText = reply.text.trim();

    // Clean up markdown block syntax if Gemini accidentally wraps it
    if (rawText.startsWith("```json")) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.substring(3, rawText.length - 3).trim();
    }

    // Return the clean stringified JSON directly to the client
    res.json({ quiz: rawText });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Quiz generation failed",
      details: error.message,
    });
  }
});

app.listen(port, (req, res) => {
  console.log("The app is running on port " + port);
});
