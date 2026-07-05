const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const quizController = require("../controllers/quizController");

router.post("/quizGenerate", quizController.quizGenerate);

router.post("/savingQuiz", requireAuth, quizController.savingQuiz);

router.get("/myQuizzes", requireAuth, quizController.myQuizzes);

router.get(
  "/fetchingMongoDBdata/:quizIndex",
  requireAuth,
  quizController.fetchingMongoDBdata,
);

router.post("/editingQuiz", requireAuth, quizController.editingQuiz);

router.post("/deletingQuiz", requireAuth, quizController.deletingQuiz);

module.exports = router;
