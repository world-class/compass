module.exports = function (app) {
	app.get("/", function (req, res) {
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
		db.query(sqlquery, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("index.html", {
				title: "REPL Reviews – Courses",
				heading: "Courses",
				courseReviewData: result,
			});
		});
	});

	app.get("/add", function (req, res) {
		let sql = "SELECT id, title FROM courses";
		db.query(sql, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("addreview.html", {
				title: "REPL Reviews – Add Review",
				heading: "Add Review",
				courseList: result,
				addResult: req.query.addResult,
			});
		});
	});

	app.post("/added", function (req, res) {
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

	app.get("/reviews",function(req, res) {
		let sqlquery = "SELECT reviews.course_id, \
						reviews.timestamp, \
						courses.title, \
						reviews.session, \
						reviews.difficulty, \
						reviews.workload, \
						reviews.rating, \
						reviews.text FROM reviews \
						JOIN courses \
						ON reviews.course_id=courses.id \
						ORDER BY reviews.timestamp DESC";
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
