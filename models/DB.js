"use strict";

const { Sequelize } = require("sequelize");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Load Data Models
const User = require("./User");
const Course = require("./Course");

// Load initial data
const courses = require("./Course.json").courses;

class DB {
	constructor(app) {
		this.app = app;

		this.createDBConnection()
			.then((sequelize) => {
				this.createSessionStore(sequelize);
				this.initializeModels(sequelize).then(() => {
					this.setupInitialData();
				});
			})
			.catch((err) => {
				console.log(
					"\x1b[31m",
					"Data models setup failed: " + err,
					"\x1b[0m"
				);
			});
	}

	initializeModels(sequelize) {
		return new Promise((resolve) => {
			this.User = new User(sequelize);
			this.Course = new Course(sequelize);
			resolve();
		});
	}

	createDBConnection() {
		return new Promise((resolve) => {
			this.sequelize = new Sequelize(
				process.env.DB_DATABASE,
				process.env.DB_USER,
				process.env.DB_PASSWORD,
				{
					host: process.env.DB_HOST,
					dialect: "mysql",
				}
			);

			this.sequelize
				.authenticate()
				.then(() => {
					console.log("DB Connection succeeded");
				})
				.catch((err) => {
					console.log(err);
					console.log("DB Connection Failed");
				});
			resolve(this.sequelize);
		});
	}

	createSessionStore(sequelize) {
		// Create a session store object
		const myStore = new SequelizeStore({
			db: sequelize,
		});

		// Attach the session store to the Express app
		this.app.use(
			session({
				secret: process.env.SESSION_SECRET,
				store: myStore,
				resave: false,
				saveUninitialized: true,
				proxy: true,
				HttpOnly: true,
				name: "compass-session",
			})
		);

		// Make sure the sessions table is available in the database
		myStore.sync();
	}

	setupInitialData() {
		this.Course.sync().then(() => {
			for (let course in courses) {
				this.Course.findOrCreate({
					where: {
						id: courses[course].id,
						title: courses[course].title,
						level: courses[course].level,
					},
				})
					.then(() => {
						return true;
					})
					.catch((err) => {
						console.log(err);
					});
			}
		});

		this.User.sync().then(() => {
			return true;
		});
	}
}

module.exports = { DB: DB, User: this.User, Course: this.Course };
