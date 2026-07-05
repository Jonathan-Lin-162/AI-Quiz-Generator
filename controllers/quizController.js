const geminiService = require("../services/geminiService");
const shuffleArray = require("../utils/shuffleArray");
const Quiz = require("../models/quiz");

exports.quizGenerate = async (req, res) => {
  try {
    const prompt = req.body.message;
    if (!prompt) {
      return res.status(400).json({ error: "Message required" });
    }
    let quizData = await geminiService.generateQuiz(prompt);
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
};

exports.savingQuiz = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, time, questions, music } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized user session context." });
    }

    const newQuizRecord = {
      title: title,
      time: time,
      questions: questions,
      music: music,
      createdAt: new Date(),
    };

    // Write the raw array objects directly to MongoDB Atlas
    await Quiz.updateOne(
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
};

exports.myQuizzes = async (req, res) => {
  const userId = req.session.userId;
  const results = await Quiz.findOne({ userId });

  res.render("myQuizzes", {
    css: ["header", "footer", "myQuizzes"],
    js: ["myQuizzes", "theme"],
    results: JSON.stringify(results),
    authenticated: req.session.authenticated,
    page: "myQuizzes",
  });
};

exports.fetchingMongoDBdata = async (req, res) => {
  try {
    const userId = req.session.userId;
    const quizIndex = parseInt(req.params.quizIndex, 10);
    const userDocument = await Quiz.findOne({
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
};

exports.editingQuiz = async (req, res) => {
  try {
    const userId = req.session.userId;
    const time = req.body.time;
    const newTitle = req.body.title;
    const quizIndex = parseInt(req.body.quizIndex, 10);
    const music = req.body.music;

    if (isNaN(quizIndex) || !newTitle || newTitle.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid quiz index or missing title.",
      });
    }

    const updateTitlePath = `quizzes.${quizIndex}.title`;
    const updateTimePath = `quizzes.${quizIndex}.time`;
    const updateMusicPath = `quizzes.${quizIndex}.music`;

    const result = await Quiz.updateOne(
      { userId },
      {
        $set: {
          [updateTitlePath]: newTitle.trim(),
          [updateTimePath]: time,
          [updateMusicPath]: music,
        },
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
};

exports.deletingQuiz = async (req, res) => {
  try {
    const userId = req.session.userId;
    const quizIndex = parseInt(req.body.quizIndex, 10);

    if (isNaN(quizIndex)) {
      return res.status(400).json({
        success: false,
        error: "Invalid quiz index configuration provided.",
      });
    }

    const unsetPath = `quizzes.${quizIndex}`;
    const result = await Quiz.updateOne(
      { userId },
      { $unset: { [unsetPath]: 1 } },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Quiz record document not found." });
    }

    await Quiz.updateOne({ userId }, { $pull: { quizzes: null } });

    return res.json({ success: true, message: "Quiz deleted successfully!" });
  } catch (error) {
    console.error("Backend quiz deletion failure:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server processing error." });
  }
};
