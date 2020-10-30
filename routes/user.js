module.exports = function (app, passport) {
	const express = require("express");
	const router = express.Router();

	// logout user
	router.get("/logout", function (req, res) {
		req.logout();
		res.redirect("/");
	});

	// profile page of the user
	router.get("/profile", checkAuth, function (req, res) {
		// Get the user's reviews
		let sqlquery =
			"SELECT reviews.id, \
                        reviews.course_id, \
                        courses.title \
                        FROM reviews \
                        JOIN courses \
                        ON reviews.course_id=courses.id \
                        JOIN users \
                        ON reviews.user_id=users.id \
                        WHERE reviews.user_id \
                        LIKE ?";
		let id = [req.user.id];

		db.query(sqlquery, id, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("profile.html", {
				heading: "Profile",
				title: "Compass - profile",
				reviews: typeof result == "undefined" ? [] : result,
				user: req.user,
				infoMessage: req.flash("info"),
				errorMessage: req.flash("error"),
				warningMessage: req.flash("warning"),
			});
		});
	});

	// Intiate slack authentication process
	router.get("/auth/slack", passport.authorize("slack.login"));

	// OAuth callback url used by Slack
	router.get(
		"/auth/slack/callback",
		passport.authenticate("slack.login", {
			failureRedirect: "/",
			failureFlash: "Slack login failed",
		}),
		function (req, res) {
			// Set cookie age to 7 days
			req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
			res.redirect("/user/profile");
		}
	);

	// middleware for blocking access to desired routes
	function checkAuth(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.flash("warning", "You have to sign in before you can access this page");
			res.redirect("/");
		}
	}
	return router;
};
