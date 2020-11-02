module.exports = function (app, passport) {
	const userRoutes = require("./user")(app, passport);
	const reviewRoutes = require("./reviews");
	const courseRoutes = require("./courses");

	// add routes related to user with prefix `/user`
	app.use("/user", userRoutes);

	// add routes related to reviews with prefix `/reviews`
	app.use("/reviews", reviewRoutes);

	// add routes related to courses with prefix `/courses`
	app.use("/courses", courseRoutes);

	// Redirect homepage to courses summary for now
	app.use("/", (req, res) => res.redirect("/courses"));

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
