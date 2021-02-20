const express = require("express");
const router = express.Router();

const validator = require("validator");
const markdown = require("markdown-it")();
const checkAuth = require("../middlewares/checkAuth");
const paginate = require("express-paginate");

// Use pagination for review routes. Minimum 10 items per page.
router.use(paginate.middleware(10, 30));

// List all reviews, optionally filtered by course_id
router.get("/", function (req, res) {
	/*
	 * If a GET parameter for a selected module is sent, insert a WHERE clause
	 * The typical parameter format is CMXXXX, e.g. CM1005
	 * This filters the returned reviews by module
	 * The "LIKE" comparison allows for fuzzy matching, e.g. CM10 returns all L4 modules
	 */

	// Get count of all reviews
	let countQuery = "SELECT COUNT(*) AS reviewCount FROM reviews";
	if (req.query.course_id !== undefined) {
		countQuery += " WHERE reviews.course_id LIKE " + db.escape(`%${req.query.course_id}%`);
	}

	let itemCount;
	db.query(countQuery, (err, result) => {
		if (err) {
			return console.error("Can not retrieve count of reviews. " + err.message);
		}
		itemCount = result[0].reviewCount;
	});

	// Get reviews. JOIN to courses table is required to get the course titles
	let sqlquery =
		"SELECT reviews.id, \
						reviews.course_id, \
						reviews.user_id, \
						users.username AS author, \
						reviews.timestamp, \
						courses.title, \
						reviews.semester, \
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
	let heading = "Reviews";
	if (req.query.course_id !== undefined) {
		sqlquery += " WHERE reviews.course_id LIKE " + db.escape(`%${req.query.course_id}%`);
		heading = heading + " for " + req.query.course_id;
	}

	// Complete the SQL query. Sort by recency and paginate.
	sqlquery += " ORDER BY reviews.timestamp DESC LIMIT ? OFFSET ?";

	// Run the final query and return reviews for display
	db.query(sqlquery, [req.query.limit, req.skip], (err, result) => {
		if (err) {
			return console.error("Data not found: " + err.message);
		}

		// Convert markdown to HTML
		result.forEach((review) => {
			review.text = markdown.render(review.text);
		});

		const pageCount = Math.ceil(itemCount / req.query.limit);
		res.render("reviews.html", {
			title: "Compass – Reviews",
			heading: heading,
			reviews: result,
			user: req.user,
			filteredModule: req.query.course_id,
			pageCount,
			itemCount,
			pages: paginate.getArrayPages(req)(5, pageCount, req.query.page),
		});
	});
});

// Display a form to add a review. Requires authentication.
router.get("/add", checkAuth, function (req, res) {
	let courseSql = "SELECT id, title \
					FROM courses \
					WHERE id NOT IN \
						(SELECT DISTINCT course_id \
						FROM reviews \
						WHERE user_id = ?)";
	let semesterSql = "SELECT name_string FROM semesters WHERE start_date <= CURDATE()";
	let id = [req.user.id];

	db.query(courseSql, id, (courseErr, courseResult) => {
		if (courseErr) {
			return console.error("Data not found: " + courseErr.message);
		}
		db.query(semesterSql, (semesterErr, semesterResult) => {
			if (semesterErr) {
				return console.error("Data not found: " + semesterErr.message);
			}
			res.render("addreview.html", {
				title: "Compass – Add Review",
				heading: "Add Review",
				courseList: courseResult,
				semesterList: semesterResult,
				addResult: req.query.addResult,
				user: req.user,
				selectedModule: req.query.course_id,
			});
		});
	});
});

// Add a review to the database and report success or failure. Requires authentication.
router.post("/add", checkAuth, validateReview, function (req, res) {
	// saving data in database
	let sqlquery = "INSERT INTO reviews (user_id, \
											course_id, \
											semester, \
											difficulty, \
											workload, \
											rating, \
											text) \
						VALUES (?,?,?,?,?,?,?)"; // build sql query
	let newrecord = [req.user.id, req.body.course_id, req.body.semester, req.body.difficulty, req.body.workload, req.body.rating, req.body.text];
	db.query(sqlquery, newrecord, (err, result) => {
		if (err) {
			console.error(err.message);
			return res.status(500).send("<h1>500: Internal server error</h1>");
		} else res.redirect(req.baseUrl + "?addResult=success");
	});
});

// Get single review by id
router.get("/:id", function (req, res) {
	// Get review by id
	let sqlquery =
		"SELECT reviews.id, \
						reviews.course_id, \
						reviews.user_id, \
						users.username AS author, \
						reviews.timestamp, \
						courses.title, \
						reviews.semester, \
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

		// Convert markdown to HTML
		result.forEach((review) => {
			review.text = markdown.render(review.text);
		});

		res.render("review.html", {
			title: "Compass – Review " + id[0],
			heading: "Review #" + id[0],
			review: result[0],
			user: req.user,
		});
	});
});

// get review to update by id and render form
router.get("/:id/update", checkAuth, canUpdateReview, function (req, res) {
	// Get review to update by id
	let semesterSql = "SELECT name_string FROM semesters WHERE start_date <= CURDATE()";
	let reviewSql =
		"SELECT reviews.id, \
						reviews.course_id, \
						courses.title, \
						reviews.semester, \
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

	db.query(reviewSql, id, (reviewErr, reviewResult) => {
		if (reviewErr) {
			return console.error("Data not found: " + reviewErr.message);
		}
		db.query(semesterSql, (semesterErr, semesterResult) => {
			if (semesterErr) {
				return console.error("Data not found: " + semesterErr.message);
			}
			// replaced HTML characters for editing again.
			reviewResult[0].text = validator.unescape(reviewResult[0].text);

			res.render("editreview.html", {
				infoMessage: req.flash("info"),
				title: "Compass – Edit Review ",
				heading: "Edit Review #" + id[0],
				review: reviewResult[0],
				semesterList: semesterResult,
				user: req.user,
			});
		});
	});
});

// update review in database
router.put("/:id/update", checkAuth, canUpdateReview, validateReview, function (req, res) {
	let errors = [];
	// Update by id
	let sqlquery = "UPDATE reviews 	\
						SET semester = ?, \
						difficulty = ?,	\
						workload = ?, \
						rating = ?, \
						text = ? \
						WHERE id = ?";
	let entry = [req.body.semester, req.body.difficulty, req.body.workload, req.body.rating, req.body.text, req.params.id];
	db.query(sqlquery, entry, (err, result) => {
		if (err) {
			req.flash("info", "Could not update review");
			res.redirect("/reviews/" + req.params.id + "/update");
		} else {
			let link = "/reviews/" + req.params.id;
			let message = 'Review updated. <a href="' + link + '">Visit</a>';
			req.flash("info", message);
			res.redirect("/reviews/" + req.params.id + "/update");
		}
	});
});

// delete review in database by id
router.delete("/:id/delete", canUpdateReview, function (req, res) {
	let sqlquery = "DELETE FROM reviews WHERE id = ?";
	let id = [req.params.id];
	db.query(sqlquery, id, (err, result) => {
		if (err) {
			req.flash("info", "Could not delete review");
			res.redirect("/reviews/" + req.params.id + "/update");
		} else {
			req.flash("info", "Review deleted.");
			res.redirect("/user/profile");
		}
	});
});

// middleware for checking if someone can update review
function canUpdateReview(req, res, next) {
	sqlquery = "SELECT user_id FROM reviews WHERE id = ? LIMIT 1;";

	db.query(sqlquery, [req.params.id], (err, result) => {
		if (err) {
			return console.error("Data not found: " + err.message);
		} else if (result[0].user_id == req.user.id) {
			next();
		} else {
			req.flash("warning", "You can only edit reviews you wrote");
			res.redirect("/user/profile");
		}
	});
}

// middleware for sanitizing and validaitng new or updated review
function validateReview(req, res, next) {
	// Sanitize user input
	req.body.text = validator.escape(req.body.text);
	req.body.semester = validator.escape(req.body.semester);

	let semesterSql = "SELECT name_string FROM semesters WHERE start_date <= CURDATE()";
	db.query(semesterSql, (semesterErr, semesterResult) => {
		if (semesterErr) {
			return console.error("Data not found: " + semesterErr.message);
		}

		function isSemester() {
			let options = [];
			semesterResult.forEach((items) => {
				options.push(items.name_string);
			});
			return options.includes(req.body.semester);
		}

		// Validate user input
		if (
			validator.isInt(req.body.workload, { min: 1, max: 70 }) &&
			validator.isInt(req.body.rating, { min: 1, max: 5 }) &&
			validator.isInt(req.body.difficulty, { min: 1, max: 5 }) &&
			validator.isLength(req.body.text, { min: 1, max: 4000 }) &&
			isSemester()
		) {
			// if all validation passes proceed
			next();
		} else {
			res.status(500).send("<h1>500: Internal server error</h1>");
		}
	});
}

module.exports = router;
