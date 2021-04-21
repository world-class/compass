"use strict";

const passport = require("passport");

class Passport {
	constructor(app, db) {
		this.passport = passport;
		this.createPassportSession(app, db);
	}

	createPassportSession(app, db) {
		app.use(passport.initialize(undefined));
		app.use(passport.session(undefined));

		// use `id` for serializing and deserializing users in database
		passport.serializeUser(function (user, done) {
			console.log("Serializing " + user.id);
			done(null, user.id);
		});

		passport.deserializeUser(function (id, done) {
			console.log("Deserializing " + id);

			let result = db.User.findByPk(id)
				.then(done(null, true))
				.catch((err) => {
					done(err, null, { message: "User does not exist" });
				});
		});

		const SlackStrategy = require("passport-slack").Strategy;

		passport.use(
			"slack",
			new SlackStrategy(
				{
					clientID: process.env.SLACK_CLIENT_ID,
					clientSecret: process.env.SLACK_CLIENT_SECRET,
					scope: [
						"identity.basic",
						"identity.email",
						"identity.avatar",
					],
				},
				(accessToken, refreshToken, profile, done) => {
					db.User.findByPk(profile.user.id)
						.then((user) => {
							if (!user) {
								db.User.create({
									id: profile.user.id,
									name: profile.user.name,
									email: profile.user.email,
									avatar_url: profile.user.image_512,
								})
									.then(() => {
										return done(null, user);
									})
									.catch((err) => {
										console.log(
											"User couldn't be created: " + err
										);
									});
							}

							return done(null, user);
						})
						.catch((err) => {
							console.log(err);
						});
				}
			)
		);
	}

	checkAuth(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.flash(
				"warning",
				"You have to sign in before you can access this page"
			);
			res.redirect("/courses");
		}
	}
}

module.exports = Passport;
