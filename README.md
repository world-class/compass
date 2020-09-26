# repl-reviews

## Developer Installation

1.  Navigate to the repository locally and install the required node modules.

        $ npm install

2.  Run the `db_setup` script in the `db` folder to build the database.
3.  Insert your mysql password into the `index.js` file in this section:

        const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "repl_reviews",
        });

4.  Run `nodemon` and open the app at `localhost:<port>` specifying the port defined in `index.js`.

        $ npm install -g nodemon
        $ nodemon
