"use strict";

const Router = require("./Router");

class Errors extends Router {
	constructor(app, passport, db) {
		super(app, passport, db);
	}

	setRoutes(db) {
		// Handle pages not found.
		this.app.use((req, res) => {
			res.status(404).render("404.html", {
				title: "Compass - Page not found",
			});
		});

		// Handle 500 server errors.
		this.app.use((err, req, res) => {
			console.error(err.stack);
			res.status(500).send("<h1>500: Internal server error</h1>");
		});
	}
}

module.exports = Errors;
