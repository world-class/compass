const express = require("express");
const router = express.Router();

// List all courses and their scores
router.get("/", function (req, res) {
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
			errorMessage: req.flash("error"),
			warningMessage: req.flash("warning"),
		});
	});
});

module.exports = router;
