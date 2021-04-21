"use strict";

const express = require("express");
const app = express();

// Load third-party modules
const bodyparser = require("body-parser");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const ejs = require("ejs");
const flash = require("connect-flash");
const mysql = require("mysql");

// Load internal modules and classes
const HttpServer = require("./HttpServer");
const { DB } = require("../models/DB");
const Passport = require("./Passport");
const Courses = require("./Courses");
const Users = require("./Users");
const Reviews = require("./Reviews");
const Errors = require("./Errors");

class Server {
	constructor() {
		// Create the Express app

		// Initialize models, views and controllers
		this.initializeModels()
			.then((db) => {
				this.initializeControllers(db);
				this.initializeViews();
			})
			.catch((err) => {
				console.log("Server initialisation failed: " + err);
			});
	}

	initializeViews() {
		// Set up EJS as the views engine & load static paths
		app.set("views", "./views");
		app.set("view engine", "ejs");
		app.engine("html", ejs.renderFile); // Use EJS to render files ending in .html
	}

	initializeControllers(db) {
		// Attach middleware to serve static files,
		// parse API responses and flash messages
		app.use(bodyparser.urlencoded({ extended: true }));
		app.use(express.static("./public")); // Set static assets folder
		app.use(flash());

		// Create the HTTP server and expose the app
		new HttpServer(app);

		// Set up user authentication
		const passport = new Passport(app, db);

		// Courses: Display a course overview with grades and reviews
		let courses = new Courses(app, passport, db);
		app.use("/courses", courses.router);

		// Users: Manage user profiles and personal grades
		let users = new Users(app, passport, db);
		app.use("/profile", users.router);

		// let reviews = new Reviews(app, passport, db);
		// app.use("/reviews", reviews.router);

		let errors = new Errors(app, passport, db);
		app.use(errors.router);

		// Redirect the base route to the courses feature
		app.use("/", (req, res) => res.redirect("/courses"));
	}

	initializeModels() {
		return new Promise((resolve) => {
			const db = new DB(app);
			resolve(db);
		});

		const db_old = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			charset: "utf8mb4",
			typeCast: (field, useDefaultTypeCasting) => {
				// Cast bit fields that have a single-bit in them to a boolean
				// Without this, 'bit' fields will not return as true/false
				if (field.type === "BIT" && field.length === 1) {
					let bytes = field.buffer();

					// A Buffer in Node represents a collection of 8-bit unsigned integers.
					// Therefore, our single "bit field" comes back as the bits '0000 0001',
					// which is equivalent to the number 1.
					return bytes[0] === 1;
				}
				return useDefaultTypeCasting();
			},
		});

		global.db_old = db_old;

		db_old.connect((err) => {
			if (err) {
				throw err;
			}

			console.log("Connected to database");
		});

		// Create session store in the database
		const MySQLStore = mysqlSession(session);
		const sessionStore = new MySQLStore({}, db_old);
		app.use(
			session({
				key: "compass-session",
				secret: process.env.SESSION_SECRET,
				store: sessionStore,
				resave: false,
				saveUninitialized: false,
			})
		);
	}
}

module.exports.Server = Server;
