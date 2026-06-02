const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const googleGenAI = require("@google/genai");
const ai = new googleGenAI.GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API,
});
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const user = null;

app.get("/", (req, res) => {
  res.render("main", { css: ["index", "header", "footer"], user: user });
});

app.get("/home", (req, res) => {
  res.render("home", { css: ["home", "header", "footer"], user: user });
});

app.get("/login", (req, res) => {
  res.render("login", { css: ["login"] });
});

app.get("/create", (req, res) => {
  res.render("create", { css: ["header", "footer"], user: user });
});

app.post("/quizGenerate", async (req, res) => {
  try {
    const response = req.body.message;
    if (!response) {
      return res.status(400).json({ error: "Message required" });
    }
    const reply = await ai.models.generateContent({
      model: "Gemini 3.1 Flash Lite",
      contents: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Quiz generated failed", details: error.message });
  }
});

app.listen(port, (req, res) => {
  console.log("The app is running on port " + port);
});
