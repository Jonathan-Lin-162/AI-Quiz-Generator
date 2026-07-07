# StudySpark AI 🎓✨

StudySpark AI is an AI-powered quiz generator designed to help students learn and review study materials more efficiently. Users can paste their notes or topics, customize quiz settings, and instantly generate interactive quizzes using Google's Gemini AI.

The platform focuses on making studying engaging, personalized, and accessible through customizable preferences, background music, dark mode, and multilingual support.

Access deployed app here: https://studysparkai.onrender.com

## Features

### AI Quiz Generation

* Generate quizzes automatically using Gemini AI.
* Create multiple-choice and true/false questions from any study material.
* Receive explanations for each answer to reinforce learning.

### Customizable Quiz Preferences

Users can personalize their learning experience by choosing:

* Number of questions to generate.
* Difficulty level (Easy, Medium, Hard).
* Time limit for each question.
* Background music during quizzes.
* Different question types.

### 💾 Save and Revisit Quizzes

* Save generated quizzes to your account.
* Edit quiz details later.
* Delete quizzes you no longer need.
* Access previously created quizzes anytime.

### Light & Dark Mode

* Toggle between light and dark themes for a comfortable studying experience.

### Multilingual Support

* Integrated with Google Translate to allow users to translate web pages into different languages, making learning more accessible for international users.

### Responsive Design

* Optimized for desktops, tablets, and mobile devices.

---

## Tech Stack

### Frontend

* EJS
* CSS3
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### AI Integration

* Google Gemini API

### Authentication & Sessions

* Express Session
* Connect-Mongo

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Jonathan-Lin-162/AI-Quiz-Generator.git
cd studyspark-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
GEMINI_API_KEY = your_gemini_api_key
MONGODB_HOST=your_mongodb_host
MONGODB_USER=your_user_name
MONGODB_PASSWORD=your_mongodb_password
MONGODB_USER_DATABASE=your_mongodb_user_database
MONGODB_USER_COLLECTION=your_mongodb_user_collection
MONGODB_SAVED_QUIZZES_COLLECTION=your_mongodb_saved_quizzes_collection
MONGODB_SESSION_DATABASE=your_mongodb_session_database
MONGODB_SESSION_COLLECTION=your_mongodb_session_collection
MONGODB_SESSION_SECRET=your_mongodb_session_secret
NODE_SESSION_SECRET=your_node_session_secret
```

### 4. Run the application

```bash
node app.js
```

The application will be available at:

```text
http://localhost:3000
```

## Project Structure

```text
AI-QUIZ-GENERATOR
│
├── app.js
├── package.json
├── package-lock.json
├── README.md
├── .env
├── .gitignore
│
├── config
│   └── databaseConnection.js
│
├── controllers
│   ├── authController.js
│   ├── pageController.js
│   └── quizController.js
│
├── middleware
│   └── auth.js
│
├── models
│   ├── User.js
│   └── Quiz.js
│
├── routes
│   ├── authRoutes.js
│   ├── pageRoutes.js
│   └── quizRoutes.js
│
├── services
│   └── geminiService.js
│
├── validation
│   ├── loginSchema.js
│   └── signupSchema.js
│
├── utils
│   ├── helpers.js
│   ├── displayMessage.js
│   └── shuffleArray.js
│
├── public
│   ├── css
│   │   ├── create.css
│   │   ├── footer.css
│   │   ├── header.css
│   │   ├── home.css
│   │   ├── index.css
│   │   ├── loginSignup.css
│   │   ├── main.css
│   │   ├── message.css
│   │   ├── myQuizzes.css
│   │   └── renderQuiz.css
│   │
│   ├── js
│   │   ├── create.js
│   │   ├── header.js
│   │   ├── loginSignup.js
│   │   ├── myQuizzes.js
│   │   ├── renderQuiz.js
│   │   └── theme.js
│   │
│   ├── img
│   │   └── logo.png
│   │
│   └── bg-music
│       ├── All In - Everet Almond.mp3
│       ├── Comedy Music.mp3
│       ├── Quiz Background Loop.mp3
│       ├── Quiz Countdown.mp3
│       ├── Quiz Evaluation Loop.mp3
│       ├── Quiz Master.mp3
│       ├── Quiz Music.mp3
│       └── Sergio's Magic Dustbin.mp3
│
└── views
    ├── create.ejs
    ├── home.ejs
    ├── index.ejs
    ├── loginSignup.ejs
    ├── main.ejs
    ├── message.ejs
    ├── myQuizzes.ejs
    ├── renderQuiz.ejs
    │
    └── partials
        ├── footer.ejs
        └── header.ejs
```

## How It Works 📚

1. Paste study notes or learning material.
2. Select quiz preferences:

   * Difficulty level
   * Number of questions
   * Time limit
   * Background music
3. Generate quizzes using Gemini AI.
4. Complete the quiz and receive instant feedback with explanations.
5. Save quizzes for future practice.

---

## Future Improvements

* PDF and document uploads.
* Flashcard generation.
* User statistics and learning analytics.
* Quiz sharing with friends.
* Leaderboards and gamification features.
* Spaced repetition support.
* Voice narration for questions.

---

## Screenshots

```markdown
<table>
  <tr>
    <td align="center"><b>Home Page</b></td>
    <td align="center"><b>Quiz Generation</b></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/e3aee3ec-85ae-474f-ac80-6fa67aed3336" width="300" alt="Home page" /></td>
    <td><img src="https://github.com/user-attachments/assets/7b74a768-9300-4454-9893-4edecc496b59" width="300" alt="Quiz generation page" /></td>
  </tr>
  <tr>
    <td align="center"><b>Quiz Interface</b></td>
    <td align="center"><b>Saved Quizzes</b></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/69dbc165-863f-4269-8cbf-1643e0876104" width="300" alt="Quiz interface" /></td>
    <!-- Paste your 4th image URL inside the src attribute below -->
    <td><img src="PASTE_YOUR_FOURTH_IMAGE_URL_HERE" width="300" alt="Saved quizzes" /></td>
  </tr>
</table>

```

---

## License

This project is licensed under the MIT License.

---

Built with ❤️ to help students learn faster and smarter.
