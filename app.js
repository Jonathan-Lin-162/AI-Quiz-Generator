// LOAD UTILITIES
require("./utils.js");

// IMPORT DEPENDENCIES
const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const requireAuth = require("./middleware/auth");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

// ENVIRONMENT VARIABLES
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_database = process.env.MONGODB_SESSION_DATABASE;
const mongodb_session_collection = process.env.MONGODB_SESSION_COLLECTION;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const port = process.env.PORT || 3000;

// Session expiration time (1 hour)
const expireTime = 1 * 60 * 60 * 1000;
// MONGODB SESSION STORE
const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_session_database}`,
  // Collection that stores session documents
  collectionName: mongodb_session_collection,
  // Encrypt session data before storing
  crypto: {
    secret: mongodb_session_secret,
  },
});

// EXPRESS MIDDLEWARE
// Serve static files
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Use EJS as the template engine
app.set("view engine", "ejs");

// SESSION CONFIGURATION
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

// ROUTES
app.use("/", pageRoutes); // General page routes
app.use("/", authRoutes); // Authentication routes (login, signup, logout)
app.use("/", quizRoutes); // Quiz-related routes

// START SERVER
app.listen(port, (req, res) => {
  console.log("The app is running on port " + port);
});
