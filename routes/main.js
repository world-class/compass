module.exports = function(app, passport) {
	// List all courses and their scores
	app.get("/", function(req, res) {
		// Get a list of all courses and calculate the average scores to show
		let sqlquery =
			"SELECT courses.id, courses.title, \
						COUNT(courses.id) AS reviewCount, \
						ROUND(AVG(reviews.difficulty), 2) AS difficulty, \
						ROUND(AVG(reviews.workload), 2) AS workload, \
						ROUND(AVG(reviews.rating), 2) AS rating \
						FROM courses \
						JOIN reviews \
						ON courses.id=reviews.course_id \
						GROUP BY courses.id \
						ORDER BY courses.id ASC";

		// Run the query and return the result
		db.query(sqlquery, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("index.html", {
				title: "REPL Reviews – Courses",
				heading: "Courses",
				courseReviewData: result,
                user: req.user
			});
		});
	});

	// Display a form to add a review. Requires authentication.
	app.get("/add", checkAuth, function(req, res) {
		// Get a list of all courses to populate the module selection UI
		let sql = "SELECT id, title FROM courses";
		db.query(sql, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("addreview.html", {
				title: "REPL Reviews – Add Review",
				heading: "Add Review",
				courseList: result,
				addResult: req.query.addResult,
                user: req.user
			});
		});
	});

	// Add a review to the database and report success or failure. Requires authentication.
	app.post("/added", checkAuth, function(req, res) {
		// saving data in database
		let sqlquery = "INSERT INTO reviews (course_id, \
											session, \
											difficulty, \
											workload, \
											rating, \
											text) \
						VALUES (?,?,?,?,?,?)"; // build sql query
		let newrecord = [
			req.body.course_id, 
			req.body.session, 
			req.body.difficulty, 
			req.body.workload, 
			req.body.rating, 
			req.body.text
		];
		db.query(sqlquery, newrecord, (err, result) => {
			if (err) {
				res.send("The review couldn't be added. Try again.");
				return console.error(err.message);
			} else res.redirect("../add/?addResult=success");
		});
	});

	// List all reviews, optionally filtered by course_id
	app.get("/reviews", function(req, res) {

		/*
		 * If a GET parameter for a selected module is sent, insert a WHERE clause
		 * The typical parameter format is CMXXXX, e.g. CM1005
		 * This filters the returned reviews by module
		 * The "LIKE" comparison allows for fuzzy matching, e.g. CM10 returns all L4 modules
		*/

		// Get all reviews. JOIN to courses table is required to get the course titles
		let sqlquery =
			"SELECT reviews.course_id, \
						reviews.timestamp, \
						courses.title, \
						reviews.session, \
						reviews.difficulty, \
						reviews.workload, \
						reviews.rating, \
						reviews.text FROM reviews \
						JOIN courses \
						ON reviews.course_id=courses.id ";

		// Insert a WHERE clause if a course ID has been provided
		if (req.query.course_id !== undefined) {
			sqlquery += " WHERE reviews.course_id LIKE '%" + req.query.course_id + "%'";
		}

		// Complete the SQL query
		sqlquery += " ORDER BY reviews.timestamp DESC";

		// Run the final query and return reviews for display
		db.query(sqlquery, (err, result) => {
			if (err) {
				return console.error("Data not found: " + err.message);
			}
			res.render("reviews.html", {
				title: "REPL Reviews – All Reviews",
				heading: "Reviews",
				reviews: result,
                user: req.user
			});
		});
	});

    app.get('/login', function(req, res) {
        // render login page with flash messages, if any.
        res.render('login.html', {
            message: req.flash('loginMessage'),
            heading: "Login",
            title: "REPL Reviews - Login"
        });
    });

    // authenticate login requests with `local.login` strategy specified in auth.js
    app.post('/login', passport.authenticate('local.login', {
            failureRedirect : '/login',
            failureFlash : true
        }),
        function(req, res) {
            // Set cookie age to 7 days
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
            res.redirect('/');
        }
    );


    app.get('/register', function(req, res) {
        // render registration page with flash messages, if any.
        res.render('register.html', {
            message: req.flash('registrationMessage'),
            heading: "Register",
            title: "REPL Reviews - Register"
        });
    });

    // authenticate registration requests with `local.register` strategy specified in auth.js
    app.post('/register', passport.authenticate('local.register', {
        successRedirect : '/',
        failureRedirect : '/register',
        failureFlash : true
    }));

    // logout user
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};


// middleware for blocking access to desired routes
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('loginMessage', 'You have to login before you can access this page');
        res.redirect('/login');
    }
}
