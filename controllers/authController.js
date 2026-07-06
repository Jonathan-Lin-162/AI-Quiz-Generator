const bcrypt = require("bcrypt");
const User = require("../models/User");
const displayMessage = require("../utils/displayMessage");
const loginSchema = require("../validation/loginSchema");
const signupSchema = require("../validation/signupSchema");
const expireTime = 1 * 60 * 60 * 1000;
const saltRound = 12;

exports.showLogin = (req, res) => {
  res.render("loginSignup", {
    css: ["loginSignup", "header", "footer"],
    js: ["loginSignup", "theme"],
    authenticated: req.session.authenticated,
  });
};

exports.login = async (req, res) => {
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

  const result = loginSchema.validate({
    email,
    password,
  });

  if (result.error) {
    return displayMessage(
      res,
      "signUp",
      "Invalid input.",
      req.session.authenticated,
    );
  }

  const existingUser = await User.findOne({ email });

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
  }

  return displayMessage(res, "login", "Password is wrong.");
};

exports.showSignup = (req, res) => {
  res.render("loginSignup", {
    css: ["loginSignup", "header"],
    js: ["loginSignup"],
    authenticated: req.session.authenticated,
  });
};

exports.signup = async (req, res) => {
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

    const existingUser = await User.findOne({ email });
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
    const insertResult = await User.insertOne({
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
};

exports.logout = (req, res) => {
  req.session.destroy();

  res.redirect("/");
};
