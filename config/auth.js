const SlackStrategy = require("passport-slack").Strategy;

/* user in database is represented in following schema:
 *   `id`       - unique primary integer key
 *   `slackuid` - unique user id.
 *   `username` - display name. Retrieved from Slack.
 *   `email`    - email address. Retrieved from Slack.
 **/

module.exports = function (passport) {
	// use `id` for serializing and deserializing users in database
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id], function (err, result) {
			done(err, result[0]);
		});
	});

	passport.use(
		"slack.login",
		new SlackStrategy(
			{
				clientID: process.env.SLACK_CLIENT_ID,
				clientSecret: process.env.SLACK_CLIENT_SECRET,
				scope: ["identity.basic", "identity.team"],
				passReqToCallback: true,
			},
			(req, accessToken, refreshToken, profile, done) => {
				// check if user belongs to UoL team
				if (profile.team.id != process.env.SLACK_TEAM) {
					return done(null, false, req.flash("error", "Please verify using UoL slack workspace"));
				}
				db.query("SELECT * from users WHERE slackuid = ?", [profile.id], (err, result) => {
					if (err) {
						req.flash("error", "Slack login failed");
						done(null, false);
					} else if (result.length == 1) {
						// known user. Return user id for deserializing
						done(null, { id: result[0].id });
					} else {
						// Insert new user
						db.query(
							"INSERT INTO users (username, email, slackuid) \
                                values (?, ?, ?)",
							[profile.displayName, profile.user.email, profile.id],
							function (err, result) {
								if (err) {
									done(null, false);
									req.flash("error", "Slack login failed");
								}
								// return user id for deserializing.
								done(err, { id: result.insertId });
							}
						);
					}
				});
			}
		)
	);
};
