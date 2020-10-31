// middleware for blocking access to routes
function checkAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.flash("warning", "You have to sign in before you can access this page");
		res.redirect("/");
	}
}

module.exports = checkAuth;
