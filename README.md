# repl-reviews

## Installation

1.  Navigate to the repository locally and install the following node modules.

        npm install express ejs mysql

2.  Run the SQL commands in the `create_database.sql` file.
3.  Insert your mysql password into the `index.js` file:

        const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "repl_reviews",
        });
