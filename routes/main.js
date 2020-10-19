
const { body, validationResult } = require("express-validator");


module.exports = function (app, passport) {
	// List all courses and their scores
	app.get("/", function (req, res) {
		// Get a list of all courses and calculate the average scores to show
		let sqlquery =
			"SELECT courses.id, courses.title, \
						COUNT(courses.id) AS reviewCount, \
						ROUND(AVG(reviews.difficulty), 2) AS difficulty, \
						ROUND(AVG(reviews.workload), 2) AS workload, \
						ROUND(AVG(reviews.rating), 2) AS rating \
						FROM courses \
						JOIN reviews \
						ON courses.id=reviews.course_id \
						GROUP BY courses.id \
						ORDER BY courses.id ASC";

		// Run the query and return the result
		db.query(sqlquery, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("index.html", {
				title: "Compass – Courses",
				heading: "Courses",
				courseReviewData: result,
				user: req.user,
			});
		});
	});

	// Display a form to add a review. Requires authentication.
	app.get("/add", checkAuth, checkVerification, function (req, res) {
		// Get a list of all courses to populate the module selection UI
		let sql = "SELECT id, title FROM courses";
		db.query(sql, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("addreview.html", {
				title: "Compass – Add Review",
				heading: "Add Review",
				courseList: result,
				addResult: req.query.addResult,
				user: req.user,
			});
		});
	});

	// Add a review to the database and report success or failure. Requires authentication.

	app.post("/added", checkAuth, checkVerification, canAddReview, body("text").escape(), function (req, res) {

		// saving data in database
		let sqlquery = "INSERT INTO reviews (user_id, \
											course_id, \
											session, \
											difficulty, \
											workload, \
											rating, \
											text) \
						VALUES (?,?,?,?,?,?,?)"; // build sql query
		let newrecord = [req.user.id, req.body.course_id, req.body.session, req.body.difficulty, req.body.workload, req.body.rating, req.body.text];
		db.query(sqlquery, newrecord, (err, result) => {
			if (err) {
				res.send("The review couldn't be added. Try again.");
				return console.error(err.message);
			} else res.redirect("../add/?addResult=success");
		});
	});

	// Get single review by id
	app.get("/review/:id", function (req, res) {
		// Get review by id
		let sqlquery =
			"SELECT reviews.id, \
						reviews.course_id, \
						reviews.user_id, \
						users.username AS author, \
						reviews.timestamp, \
						courses.title, \
						reviews.session, \
						reviews.difficulty, \
						reviews.workload, \
						reviews.rating, \
						reviews.text FROM reviews \
						JOIN courses \
						ON reviews.course_id=courses.id \
						JOIN users \
						ON reviews.user_id=users.id \
						WHERE reviews.id \
						LIKE ?";
		let id = [req.params.id];

		db.query(sqlquery, id, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("reviews.html", {
				title: "Compass – Review " + id[0],
				heading: "Review #" + id[0],
				reviews: result,
				user: req.user,
			});
		});
	});

	// List all reviews, optionally filtered by course_id
	app.get("/reviews", function (req, res) {
		/*
		 * If a GET parameter for a selected module is sent, insert a WHERE clause
		 * The typical parameter format is CMXXXX, e.g. CM1005
		 * This filters the returned reviews by module
		 * The "LIKE" comparison allows for fuzzy matching, e.g. CM10 returns all L4 modules
		 */

		// Get all reviews. JOIN to courses table is required to get the course titles
		let sqlquery =
			"SELECT reviews.id, \
						reviews.course_id, \
						reviews.user_id, \
						users.username AS author, \
						reviews.timestamp, \
						courses.title, \
						reviews.session, \
						reviews.difficulty, \
						reviews.workload, \
						reviews.rating, \
						reviews.text \
						FROM reviews \
						JOIN courses \
						ON reviews.course_id=courses.id \
						JOIN users \
						ON reviews.user_id=users.id";

		// Insert a WHERE clause if a course ID has been provided
		if (req.query.course_id !== undefined) {
			sqlquery += " WHERE reviews.course_id LIKE '%" + req.query.course_id + "%'";
		}

		// Complete the SQL query
		sqlquery += " ORDER BY reviews.timestamp DESC";

		// Run the final query and return reviews for display
		db.query(sqlquery, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("reviews.html", {
				title: "Compass – Reviews",
				heading: "Reviews",
				reviews: result,
				user: req.user,
			});
		});
	});

	// get review to update by id and render form
	app.get("/review/:id/update", checkAuth, canUpdateReview, function (req, res) {
		// Get review to update by id
		let sqlquery =
			"SELECT reviews.id, \
						reviews.course_id, \
						courses.title, \
						reviews.session, \
						reviews.difficulty, \
						reviews.workload, \
						reviews.rating, \
						reviews.text FROM reviews \
						JOIN courses \
						ON reviews.course_id=courses.id \
						JOIN users \
						ON reviews.user_id=users.id \
						WHERE reviews.id \
						LIKE ?";
		let id = [req.params.id];

		db.query(sqlquery, id, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("editreview.html", {
				message: req.flash("editReviewMessage"),
				title: "Compass – Edit Review ",
				heading: "Edit Review #" + id[0],
				review: result[0],
				user: req.user,
			});
		});
	});

	// update review in database
	app.put("/review/:id/update", checkAuth, canUpdateReview, function (req, res) {
		// Update by id
		let sqlquery = "UPDATE reviews 	\
						SET session = ?, \
						difficulty = ?,	\
						workload = ?, \
						rating = ?, \
						text = ? \
						WHERE id = ?";
		let entry = [req.body.session, req.body.difficulty, req.body.workload, req.body.rating, req.body.text, req.params.id];
		db.query(sqlquery, entry, (err, result) => {
			if (err) {
				req.flash("editReviewMessage", "Could not update review");
				res.redirect("/review/" + req.params.id + "/update");
			} else {
				req.flash("editReviewMessage", "Review updated.");
				res.redirect("/review/" + req.params.id + "/update");
			}
		});
	});

	// delete review in database by id
	app.delete("/review/:id/delete", canUpdateReview, function (req, res) {
		let sqlquery = "DELETE FROM reviews WHERE id = ?";
		let id = [req.params.id];
		db.query(sqlquery, id, (err, result) => {
			if (err) {
				req.flash("editReviewMessage", "Could not delete review");
				res.redirect("/review/" + req.params.id + "/update");
			} else {
				res.redirect("/profile");
			}
		});
	});

	app.get("/login", function (req, res) {
		// render login page with flash messages, if any.
		res.render("login.html", {
			message: req.flash("loginMessage"),
			heading: "Login",
			title: "Compass - Login",
		});
	});

	// authenticate login requests with `local.login` strategy specified in auth.js
	app.post(
		"/login",
		passport.authenticate("local.login", {
			failureRedirect: "/login",
			failureFlash: true,
		}),
		function (req, res) {
			// Set cookie age to 7 days
			req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
			res.redirect("/");
		}
	);

	app.get("/register", function (req, res) {
		// render registration page with flash messages, if any.
		res.render("register.html", {
			message: req.flash("registrationMessage"),
			heading: "Register",
			title: "Compass - Register",
		});
	});

	// authenticate registration requests with `local.register` strategy specified in auth.js
	app.post(
		"/register",
		passport.authenticate("local.register", {
			successRedirect: "/profile",
			failureRedirect: "/register",
			failureFlash: true,
		})
	);

	// logout user
	app.get("/logout", function (req, res) {
		req.logout();
		res.redirect("/");
	});

	// profile page of the user
	app.get("/profile", checkAuth, function (req, res) {
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
				message: req.flash("profileMessage"),
				heading: "Profile",
				title: "Compass - profile",
				reviews: typeof result == "undefined" ? [] : result,
				user: req.user,
			});
		});
	});

	// Update profile details
	app.put("/profile", checkAuth, function (req, res) {
		db.query("UPDATE users SET username= ? WHERE id= ?", [req.body.username, req.user.id], (err, result) => {
			if (err) {
				req.flash("profileMessage", "Could not update profile");
				res.redirect("/profile");
			}
			req.flash("profileMessage", "Profile updated");
			res.redirect("/profile");
		});
	});

	// Intiate slack authentication process
	app.get("/auth/slack", passport.authorize("slack.login"));

	// OAuth callback url used by Slack
	app.get(
		"/auth/slack/callback",
		passport.authorize("slack.login", {
			failureRedirect: "/profile",
		}),
		(req, res) => res.redirect("/profile")
	);
};

// middleware for blocking access to desired routes
function checkAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.flash("loginMessage", "You have to login before you can access this page");
		res.redirect("/login");
	}
}

// middleware for requiring verified account on desired routes
function checkVerification(req, res, next) {
	if (req.user.verified) {
		next();
	} else {
		req.flash("profileMessage", "You must verify your account before you can access this page.");
		res.redirect("/profile");
	}
}

// middleware for checking if someone can add review
function canAddReview(req, res, next) {
	sqlquery = "SELECT id FROM reviews WHERE course_id = ? AND user_id = ?;";
	entry = [req.body.course_id, req.user.id];

	db.query(sqlquery, entry, (err, result) => {
		if (err) {
			console.error("Data not found: " + err.message);
			res.redicrect("/");
		} else if (result.length < 1) {
			next();
		} else {
			req.flash("editReviewMessage", "You have already reviewed this course. Would you like to edit it?");
			res.redirect("/review/" + result[0].id + "/update");
		}
	});
}

// middleware for checking if someone can update review
function canUpdateReview(req, res, next) {
	sqlquery = "SELECT user_id FROM reviews WHERE id = ? LIMIT 1;";

	db.query(sqlquery, [req.params.id], (err, result) => {
		if (err) {
			return console.error("Data not found: " + err.message);
		} else if (result[0].user_id == req.user.id) {
			next();
		} else {
			req.flash("profileMessage", "You can only edit reviews you own");
			res.redirect("/profile");
		}
	});
}
