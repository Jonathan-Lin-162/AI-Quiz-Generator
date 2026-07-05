const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const pageController = require("../controllers/pageController");

router.get("/", pageController.index);

router.get("/home", requireAuth, pageController.home);

router.get("/create", requireAuth, pageController.create);

router.get("/renderQuiz", requireAuth, pageController.renderQuiz);

module.exports = router;
