module.exports = function (app) {
	app.get("/", function (req, res) {
		res.render("index.html", {
			title: "REPL Reviews – Courses",
			heading: "Courses",
		});
	});

	app.get("/add", function (req, res) {
		res.render("addreview.html", {
			title: "REPL Reviews – Courses",
			heading: "Add review",
		});
	});

	app.post("/added", function (req, res) {
		// saving data in database
		let sqlquery = "INSERT INTO reviews (course_id, difficulty, workload, rating) VALUES (?,?,?,?)"; // execute sql query
		let newrecord = [req.body.module, req.body.difficulty, req.body.workload, req.body.rating];
		db.query(sqlquery, newrecord, (err, result) => {
			if (err) {
				res.render("add.html", {
					title: "CalorieBuddy - Add Food Item",
					heading: "Add Food Item",
					success: "",
					failure: "Food item couldn't be added. You may have submitted invalid values. Try again.",
					food: req.body.name,
					availableFoods: [{}],
					lead: "Add food items to CalorieBuddy.",
					action: "added",
					mode: "",
				});
				return console.error(err.message);
			} else
				res.render("add.html", {
					title: "CalorieBuddy - Add Food Item",
					heading: "Add Food Item",
					success: "Item added.",
					failure: "",
					food: req.body.name,
					availableFoods: [{}],
					lead: "Add food items to CalorieBuddy.",
					action: "added",
					mode: "",
				});
		});
	});
};
