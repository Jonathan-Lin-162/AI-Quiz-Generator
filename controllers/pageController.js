exports.index = (req, res) => {
  if (req.session.authenticated) {
    return res.render("main", {
      css: ["main", "header", "footer"],
      js: ["theme"],
      authenticated: true,
    });
  }

  res.render("index", {
    css: ["index", "header", "footer"],
    js: ["theme"],
    authenticated: false,
  });
};

exports.home = (req, res) => {
  res.render("home", {
    css: ["home", "header", "footer"],
    js: ["theme"],
    authenticated: req.session.authenticated,
    page: "home",
  });
};

exports.create = (req, res) => {
  res.render("create", {
    css: ["header", "footer", "create"],
    js: ["create", "theme"],
    authenticated: req.session.authenticated,
    page: "create",
  });
};

exports.renderQuiz = (req, res) => {
  res.render("renderQuiz", {
    css: ["header", "footer", "renderQuiz"],
    js: ["renderQuiz", "theme"],
    authenticated: req.session.authenticated,
  });
};
