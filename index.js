const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const app = express();
const port = 8087;
app.use(express.static(path.join(__dirname, "/public")));

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root",
	database: "repl_reviews",
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

app.use(bodyParser.urlencoded({ extended: true }));

require("./routes/main")(app);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
