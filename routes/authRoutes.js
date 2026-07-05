const router = require("express").Router();
const authController = require("../controllers/authController");

router.get("/login", authController.showLogin);

router.post("/loginSubmit", authController.login);

router.get("/signup", authController.showSignup);

router.post("/signupSubmit", authController.signup);

router.get("/logout", authController.logout);

module.exports = router;
