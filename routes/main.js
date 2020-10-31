module.exports = function (app, passport) {
	const userRoutes = require("./user")(app, passport);
	const reviewRoutes = require("./reviews");

	// routes related to user profile and authentication
	app.use("/user", userRoutes);

	// routes related to reviews
	app.use("/reviews", reviewRoutes);

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
				errorMessage: req.flash("error"),
				warningMessage: req.flash("warning"),
			});
		});
	});

	// handle pages not found. This should be the second last route.
	app.use(function (req, res) {
		res.status(404).render("404.html", {
			title: "Compass - Page not found",
		});
	});

	// handle 500 server errors. This should be the last route.
	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(500).send("<h1>500: Internal server error</h1>");
	});
};
