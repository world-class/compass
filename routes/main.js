module.exports = function(app) {
	// List all courses and their scores
	app.get("/", function(req, res) {
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
				title: "REPL Reviews – Courses",
				heading: "Courses",
				courseReviewData: result
			});
		});
	});

	// Display a form to add a review
	app.get("/add", function(req, res) {
		// Get a list of all courses to populate the module selection UI
		let sql = "SELECT id, title FROM courses";
		db.query(sql, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("addreview.html", {
				title: "REPL Reviews – Add Review",
				heading: "Add Review",
				courseList: result,
				addResult: req.query.addResult
			});
		});
	});

	// Add a review to the database and report success or failure
	app.post("/added", function(req, res) {
		// saving data in database
		let sqlquery = "INSERT INTO reviews (course_id, session, difficulty, workload, rating, text) VALUES (?,?,?,?,?,?)"; // execute sql query
		let newrecord = [
			req.body.course_id, 
			req.body.session, 
			req.body.difficulty, 
			req.body.workload, 
			req.body.rating, 
			req.body.text
		];
		db.query(sqlquery, newrecord, (err, result) => {
			if (err) {
				res.send("The review couldn't be added. Try again.");
				return console.error(err.message);
			} else res.redirect("../add/?addResult=success");
		});
	});

	// List all reviews, optionally filtered by course_id
	app.get("/reviews", function(req, res) {
	
		/*
		 * If a GET parameter for a selected module is sent, insert a WHERE clause
		 * The typical parameter format is CMXXXX, e.g. CM1005
		 * This filters the returned reviews by module
		 * The "LIKE" comparison allows for fuzzy matching, e.g. CM10 returns all L4 modules
		*/

		// Get all reviews. JOIN to courses table is required to get the course titles
		let sqlquery =
			"SELECT reviews.course_id, \
						reviews.timestamp, \
						courses.title, \
						reviews.session, \
						reviews.difficulty, \
						reviews.workload, \
						reviews.rating, \
						reviews.text FROM reviews \
						JOIN courses \
						ON reviews.course_id=courses.id ";

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
				title: "REPL Reviews – All Reviews",
				heading: "Reviews",
				reviews: result
			});
		});
	});
};
