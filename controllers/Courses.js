"use strict";
const Router = require("./Router");

class Courses extends Router {
	constructor(app, passport, db) {
		super(app, passport, db);
	}

	setRoutes(db) {
		this.router.get("/", (req, res) => {
			db.Course.findAll().then((result) => {
				console.log(req.user);
				res.render("index.html", {
					title: "Compass – Courses",
					heading: "Courses",
					courseReviewData: result,
					user: req.user,
					errorMessage: req.flash("error"),
					warningMessage: req.flash("warning"),
				});
			});
		});
	}
}

module.exports = Courses;
