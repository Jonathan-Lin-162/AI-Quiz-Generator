function requireAuth(req, res, next) {
  if (!req.session.authenticated) {
    return res.redirect("/");
  }
  next();
}

module.exports = requireAuth;
