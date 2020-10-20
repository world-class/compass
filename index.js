require("dotenv").config();
const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mysql = require("mysql");
const path = require("path");
const app = express();
const httpPort = process.env.HTTP_PORT || 8087;
const httpsPort = process.env.HTTPS_PORT || 8443;
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const flash = require("connect-flash");

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

const sessionStore = new MySQLStore({}, db);

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
		key: "compass-session",
		secret: process.env.SESSION_SECRET,
		store: sessionStore,
		resave: false,
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

const httpServer = http.createServer(app);

// create HTTP server
httpServer.listen(httpPort, () => {
	console.log(`compass http listening on port ${httpPort}!`);
});

if (process.env.NODE_ENV == "PROD") {
	const certDir = process.env.TLS_CERTDIR;
	const tlsOptions = {
		key: fs.readFileSync(certDir + "privkey.pem", "utf8"),
		cert: fs.readFileSync(certDir + "cert.pem", "utf8"),
		ca: fs.readFileSync(certDir + "chain.pem", "utf8"),
	};

	// create HTTPS server
	const httpsServer = https.createServer(tlsOptions, app);

	httpsServer.listen(httpsPort, () => {
		console.log(`compass https listening on port ${httpsPort}!`);
	});
}
