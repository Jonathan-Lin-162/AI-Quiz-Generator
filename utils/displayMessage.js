function displayMessage(res, redirect, message, authenticated) {
  return res.render("message", {
    css: ["index", "header", "footer", "message"],
    js: ["theme"],
    message,
    redirect,
    authenticated,
  });
}

module.exports = displayMessage;
