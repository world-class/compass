const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mysql = require("mysql");
const path = require("path");
const app = express();
const port = 8087;
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

require("dotenv").config();
app.use(express.static(path.join(__dirname, "/public")));

const db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	typeCast: function castField(field, useDefaultTypeCasting) {
		// Cast bit fields that have a single-bit in them to a boolean
		// Without this, 'bit' fields will not return as true/false
		if (field.type === "BIT" && field.length === 1) {
			var bytes = field.buffer();

			// A Buffer in Node represents a collection of 8-bit unsigned integers.
			// Therefore, our single "bit field" comes back as the bits '0000 0001',
			// which is equivalent to the number 1.
			return bytes[0] === 1;
		}
		return useDefaultTypeCasting();
	},
});

// connect to database
db.connect((err) => {
	if (err) {
		throw err;
	}

	console.log("Connected to database");
});

global.db = db;

// configure PassportJS for local authentication
require("./config/auth")(passport);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// create session store. Use memorystore for now and migrate to MySQL later.
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
	})
);

// Initialize passportjs
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./routes/main")(app, passport);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
