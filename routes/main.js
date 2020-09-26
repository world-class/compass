module.exports = function (app) {
	app.get("/", function (req, res) {
		let sqlquery = "SELECT courses.id, courses.title, \
						COUNT(courses.id) AS reviewCount, \
						AVG(reviews.difficulty) AS difficulty, \
						AVG(reviews.workload) AS workload, \
						AVG(reviews.rating) AS rating \
						FROM courses \
						JOIN reviews \
						ON courses.id=reviews.course_id \
						GROUP BY courses.id \
						ORDER BY courses.id ASC";
		db.query(sqlquery, (err, result) => {
			if (err) {
				return console.error("Data not found: "+ err.message);
			}
			console.log(result)
			res.render("index.html", {
				title: "REPL Reviews – Courses",
				heading: "Courses",
				courseReviewData: result
			});
		});
	});

	app.get("/reviews", function (req, res) {
		res.render("reviews.html", {
			title: "REPL Reviews – Courses",
			heading: "Welcome to CalorieBuddy",
		});
	});

	// app.post("/added", function (req, res) {
	// 	// saving data in database
	// 	let sqlquery = "INSERT INTO food (name, typicalAmount, typicalUnit, calories, salt, sugar, fat, protein, carbs) VALUES (?,?,?,?,?,?,?,?,?)"; // execute sql query
	// 	let newrecord = [
	// 		req.body.name,
	// 		req.body.amount,
	// 		req.body.unit,
	// 		req.body.calories,
	// 		req.body.salt,
	// 		req.body.sugar,
	// 		req.body.fat,
	// 		req.body.protein,
	// 		req.body.carbs,
	// 	];
	// 	db.query(sqlquery, newrecord, (err, result) => {
	// 		if (err) {
	// 			res.render("add.html", {
	// 				title: "CalorieBuddy - Add Food Item",
	// 				heading: "Add Food Item",
	// 				success: "",
	// 				failure: "Food item couldn't be added. You may have submitted invalid values. Try again.",
	// 				food: req.body.name,
	// 				availableFoods: [{}],
	// 				lead: "Add food items to CalorieBuddy.",
	// 				action: "added",
	// 				mode: "",
	// 			});
	// 			return console.error(err.message);
	// 		} else
	// 			res.render("add.html", {
	// 				title: "CalorieBuddy - Add Food Item",
	// 				heading: "Add Food Item",
	// 				success: "Item added.",
	// 				failure: "",
	// 				food: req.body.name,
	// 				availableFoods: [{}],
	// 				lead: "Add food items to CalorieBuddy.",
	// 				action: "added",
	// 				mode: "",
	// 			});
	// 	});
	// });
};
