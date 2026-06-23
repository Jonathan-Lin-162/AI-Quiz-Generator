require("./utils.js");
const express = require("express");
const session = require("express-session");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenAI } = require("@google/genai");
const MongoStore = require("connect-mongo").default;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_user_database = process.env.MONGODB_USER_DATABASE;
const mongodb_user_collection = process.env.MONGODB_USER_COLLECTION;
const mongodb_saved_quizzes_collection =
  process.env.MONGODB_SAVED_QUIZZES_COLLECTION;
const mongodb_session_database = process.env.MONGODB_SESSION_DATABASE;
const mongodb_session_collection = process.env.MONGODB_SESSION_COLLECTION;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const expireTime = 1 * 60 * 60 * 1000;
const saltRound = 12;
const { database } = include("databaseConnection");
const userCollection = database
  .db(mongodb_user_database)
  .collection(mongodb_user_collection);

const savedQuizzesCollection = database
  .db(mongodb_user_database)
  .collection(mongodb_saved_quizzes_collection);

const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_session_database}`,
  collectionName: mongodb_session_collection,
  crypto: {
    secret: mongodb_session_secret,
  },
});

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
    cookie: {
      maxAge: expireTime,
    },
  }),
);

let user = null;
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
});

const signupSchema = Joi.object({
  username: Joi.string().alphanum().max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
});

function displayMessage(res, redirect, message, authenticated) {
  return res.render("message", {
    css: ["header"],
    js: [],
    message: message,
    redirect: redirect,
    authenticated: authenticated,
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("main", {
      css: ["main", "header", "footer"],
      js: ["theme"],
      authenticated: req.session.authenticated,
    });
  } else {
    res.render("index", {
      css: ["index", "header", "footer"],
      js: ["theme"],
      authenticated: req.session.authenticated,
    });
  }
});

app.get("/home", (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/");
  }
  res.render("home", {
    css: ["home", "header", "footer"],
    js: ["theme"],
    authenticated: req.session.authenticated,
    page: "home",
  });
});

app.get("/login", (req, res) => {
  res.render("loginSignup", {
    css: ["loginSignup", "header", "footer"],
    js: ["loginSignup", "theme"],
    authenticated: req.session.authenticated,
  });
});

app.post("/loginSubmit", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return displayMessage(
      res,
      "login",
      "Email is required.",
      req.session.authenticated,
    );
  }

  if (!password) {
    return displayMessage(
      res,
      "signUp",
      "Password is required.",
      req.session.authenticated,
    );
  }

  const result = loginSchema.validate({ email, password });
  if (result.error) {
    return displayMessage(
      res,
      "signUp",
      "Invalid input.",
      req.session.authenticated,
    );
  }

  const existingUser = await userCollection.findOne({ email });

  if (!existingUser) {
    return displayMessage(
      res,
      "login",
      "Email does not exist.",
      req.session.authenticated,
    );
  }

  if (await bcrypt.compare(password, existingUser.password)) {
    req.session.authenticated = true;
    req.session.userId = existingUser._id.toString();
    req.session.username = existingUser.username;
    req.session.email = existingUser.email;
    req.session.cookie.maxAge = expireTime;

    return res.redirect("/home");
  } else {
    return displayMessage(res, "login", "Password is wrong.");
  }
});

app.get("/signup", (req, res) => {
  res.render("loginSignup", {
    css: ["loginSignup", "header"],
    js: ["loginSignup"],
    authenticated: req.session.authenticated,
  });
});

app.post("/signupSubmit", async (req, res) => {
  try {
    const username = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!username) {
      return displayMessage(
        res,
        "signUp",
        "User name is required.",
        req.session.authenticated,
      );
    }
    if (!email) {
      return displayMessage(
        res,
        "signUp",
        "Email is required.",
        req.session.authenticated,
      );
    }
    if (!password) {
      return displayMessage(
        res,
        "signUp",
        "Password is required.",
        req.session.authenticated,
      );
    }

    const result = signupSchema.validate({
      username,
      email,
      password,
    });
    if (result.error) {
      return displayMessage(
        res,
        "signUp",
        "Invalid input format.",
        req.session.authenticated,
      );
    }

    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return displayMessage(
        res,
        "signUp",
        "Email already exists.",
        req.session.authenticated,
      );
    }

    const hashedPassword = await bcrypt.hash(password, saltRound);

    // Capture insert return metadata to harvest the generated _id
    const insertResult = await userCollection.insertOne({
      username: username,
      email: email,
      password: hashedPassword,
    });

    // Stored successfully as a plain text string wrapper
    req.session.userId = insertResult.insertedId.toString();
    req.session.username = username;
    req.session.email = email;
    req.session.authenticated = true;
    req.session.cookie.maxAge = expireTime;

    return res.redirect("/home");
  } catch (error) {
    // This block catches any database issues and stops the route from freezing
    console.error("Signup internal processing error:", error);
    return res.status(500).send("Internal server error during registration.");
  }
});

app.get("/create", (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/");
  }
  res.render("create", {
    css: ["header", "footer", "create"],
    js: ["create", "theme"],
    authenticated: req.session.authenticated,
    page: "create",
  });
});

app.get("/renderQuiz", (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/");
  }
  res.render("renderQuiz", {
    css: ["header", "footer", "renderQuiz"],
    js: ["renderQuiz", "theme"],
    authenticated: req.session.authenticated,
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

    let quizData = JSON.parse(rawText);
    quizData.questions = shuffleArray(quizData.questions);

    quizData.questions.forEach((q, idx) => {
      q.id = idx + 1;
    });

    // Return the clean stringified JSON directly to the client
    res.json({ quiz: JSON.stringify(quizData) });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Quiz generation failed",
      details: error.message,
    });
  }
});

app.post("/savingQuiz", async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, time, questions } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized user session context." });
    }

    const newQuizRecord = {
      title: title,
      time: time,
      questions: questions,
      createdAt: new Date(),
    };

    // Write the raw array objects directly to MongoDB Atlas
    await savedQuizzesCollection.updateOne(
      { userId: userId },
      {
        $push: { quizzes: newQuizRecord },
      },
      { upsert: true },
    );

    res.json({ success: true, message: "Quiz saved to database cleanly!" });
  } catch (error) {
    // ⚡ CRITICAL DEBUG LOG: This will print the exact database error to your terminal panel!
    console.error("MONGODB SAVE CRASH DIRECTIVE:", error);

    res
      .status(500)
      .json({ error: "Failed to store record", details: error.message });
  }
});

app.get("/myQuizzes", async (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/");
  }

  const userId = req.session.userId;
  const results = await savedQuizzesCollection.findOne({ userId });

  res.render("myQuizzes", {
    css: ["header", "footer", "myQuizzes"],
    js: ["myQuizzes", "theme"],
    results: JSON.stringify(results),
    authenticated: req.session.authenticated,
    page: "myQuizzes",
  });
});

app.get("/fetchingMongoDBdata/:quizIndex", async (req, res) => {
  try {
    if (!req.session.authenticated) {
      return res.redirect("/");
    }

    const userId = req.session.userId;
    const quizIndex = parseInt(req.params.quizIndex, 10);
    const userDocument = await savedQuizzesCollection.findOne({
      userId,
    });

    if (!userDocument || !userDocument.quizzes) {
      return res
        .status(404)
        .json({ error: "Quiz collection document not found." });
    }
    const specificQuiz = userDocument.quizzes[quizIndex];

    if (!specificQuiz) {
      return res
        .status(404)
        .json({ error: "No quiz found at the specified index position." });
    }
    return res.json(specificQuiz);
  } catch (error) {
    console.error("Backend nested array retrieval crash:", error);
    return res.status(500).json({ error: "Internal server processing error." });
  }
});

app.post("/editingQuiz", async (req, res) => {
  try {
    if (!req.session.authenticated) {
      return res.redirect("/");
    }

    const userId = req.session.userId;
    const time = req.body.time;
    const newTitle = req.body.title;
    const quizIndex = parseInt(req.body.quizIndex, 10);

    if (isNaN(quizIndex) || !newTitle || newTitle.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid quiz index or missing title.",
      });
    }

    const updateTitlePath = `quizzes.${quizIndex}.title`;
    const updateTimePath = `quizzes.${quizIndex}.time`;

    const result = await savedQuizzesCollection.updateOne(
      { userId },
      {
        $set: { [updateTitlePath]: newTitle.trim(), [updateTimePath]: time },
      },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Quiz record document not found." });
    }

    return res.json({
      success: true,
      message: "Quiz title updated successfully!",
    });
  } catch (error) {
    console.error("Backend name transformation failed:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server processing error." });
  }
});

app.post("/deletingQuiz", async (req, res) => {
  try {
    if (!req.session.authenticated) {
      return res.redirect("/");
    }

    const userId = req.session.userId;
    const quizIndex = parseInt(req.body.quizIndex, 10);

    if (isNaN(quizIndex)) {
      return res.status(400).json({
        success: false,
        error: "Invalid quiz index configuration provided.",
      });
    }

    const unsetPath = `quizzes.${quizIndex}`;
    const result = await savedQuizzesCollection.updateOne(
      { userId },
      { $unset: { [unsetPath]: 1 } },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Quiz record document not found." });
    }

    await savedQuizzesCollection.updateOne(
      { userId },
      { $pull: { quizzes: null } },
    );

    return res.json({ success: true, message: "Quiz deleted successfully!" });
  } catch (error) {
    console.error("Backend quiz deletion failure:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server processing error." });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

app.listen(port, (req, res) => {
  console.log("The app is running on port " + port);
});
