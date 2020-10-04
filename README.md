# repl-reviews

## Developer Installation

1.  Navigate to the repository locally and install the required node modules.

        $ npm install

2.  Run the `db_setup` script in the `db` folder to build the database.
3.  Create `.env` file and insert your secrets into it. Use `.env.example` file as reference for what is required.
4.  Run `nodemon` and open the app at `localhost:<port>` specifying the port defined in `index.js`.

        $ npm install -g nodemon
        $ nodemon
