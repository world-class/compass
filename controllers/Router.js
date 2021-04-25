"use strict";

const express = require("express");

class Router {
	/**
	 * Creates an Express session, router and passport.
	 * @constructor
	 */
	constructor(app, passport, db) {
		// Set up the Express Router and Passport
		this.app = app;
		this.passport = passport;
		this.db = db;
		this.router = express.Router();
		this.setRoutes(db);
		app.use("/", this.router);
	}

	/**
	 * @virtual
	 * Invokes the routes for each feature of the application.
	 * This can invoke sub-features by importing the specific classes and instantiating them,
	 * or it can declare Express routes of it's own, e.g. using 'this.router.get()'
	 */
	setRoutes(db) {
		throw "Abstract method updateChartsData not implemented";
	}
}

module.exports = Router;
