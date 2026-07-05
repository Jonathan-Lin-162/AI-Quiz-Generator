const { database } = include("databaseConnection");

module.exports = database
  .db(process.env.MONGODB_USER_DATABASE)
  .collection(process.env.MONGODB_SAVED_QUIZZES_COLLECTION);
