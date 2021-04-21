"use strict";

const Router = require("./Router");

class Users extends Router {
	constructor(app, passport, db) {
		super(app, passport, db);
	}

	setRoutes(db) {
		// logout user
		this.router.get("/logout", function (req, res) {
			req.logout();
			res.redirect("/");
		});

		// profile page of the user
		this.router.get("/", this.passport.checkAuth, function (req, res) {
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

			db_old.query(sqlquery, id, (err, result) => {
				if (err) {
					return console.error("Data not found: " + err.message);
				}
				res.render("profile.html", {
					heading: "Profile",
					title: "Compass - profile",
					reviews: typeof result == "undefined" ? [] : result,
					user: req.user,
				});
			});
		});

		// Initiate slack authentication process
		this.router.get(
			"/auth/slack",
			this.passport.passport.authenticate("slack")
		);

		// OAuth callback url used by Slack
		this.router.get(
			"/auth/slack/callback",
			this.passport.passport.authenticate("slack", {
				failureRedirect: "/profile",
			}),
			(req, res) => {
				res.redirect("/courses");
			}
		);
	}
}

module.exports = Users;
