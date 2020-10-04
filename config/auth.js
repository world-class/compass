const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

/* user in database is represented in following schema:
 *   `id`       - unique primary integer key
 *   `username` - display name. Not used for logging in.
 *   `email`    - unique email address, used for logging in.
 *   `password` - bcrypt hashed password
**/

module.exports = function (passport) {
    // use `id` for serializing and deserializing users in database
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        db.query(
            "SELECT * FROM users WHERE id = ? LIMIT 1",
            [id],
            function (err, result) {
                done(err, result[0]);
            }
        );
    });

    passport.use(
        'local.register',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            async function (req, email, password, done) {
                // check if email already exists
                db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email],
                    async function (err, rows) {
                        if (err) {
                            return done(err);
                        }
                        if (rows.length) {
                            return done(null, false,
                                req.flash('registrationMessage',
                                    'That email is already taken. \
                                Please login or use another email.'));
                        }
                        else {
                            // hash password using bcrypt's async function. Using 10 rounds.
                            const hashed_password = await bcrypt.hash(password, 10);

                            // store hashed password into database
                            db.query("INSERT INTO users (username, email, password) \
                                values (?, ?, ?)",
                                [req.body.username, email, hashed_password],
                                function (err, result) {
                                    // just id is enough for passport to serialize user.
                                    // Since we are not using ORM, this is a hack to provide
                                    // a user "object".
                                    return done(err, {id: result.insertId});
                                });
                        }
                    });
            })
    );

    passport.use(
        'local.login',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            async function (req, email, password, done) {
                // get user object from table
                db.query("SELECT * FROM users WHERE email = ? LIMIT 1",
                    [email],
                    async function (err, result) {
                        if (err) {
                            return done(err);
                        }
                        // if no rows are returned warn user.
                        if (!result.length) {
                            return done(null, false,
                                req.flash('loginMessage', 'No user found.'));
                        }
                        // Use bcrypt to compare password with stored hash.
                        else if (await bcrypt.compare(password, result[0].password)) {
                            return done(null, result[0]);
                        } else {
                            return done(null, false,
                                req.flash('loginMessage', 'Wrong password.'));
                        }
                    });
            })
    );
}
