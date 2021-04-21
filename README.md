# Compass
 Compass is a suite of tools being developed for students enrolled in the University of London BSc in Computer Science online degree. A demo version is hosted at [compass-reviews.herokuapp.com](https://compass-reviews.herokuapp.com/courses).

 ## Current Features

**Public features**:
 * View a list of modules and sort them by difficulty, effort and quality as rated by other students
 * Read reviews submitted by verified students of the program

**Student-only features**:
 * Write and submit a review for a specific module
 * Edit your previously submitted reviews

## Developement & Contribution

### Principles
We want to make it as easy as possible to extend and maintain the functionality of Compass. Therefore, we adhere to the following development principles.

1. We focus on __high-value functionality__ first, and deprioritize bells & whistles
2. We keep development __lean and minimal__. We do not invest in visual embellishment unless it adds value. We rely on standards provided by the tech stack we use.
3. The circle of contributors is kept deliberately small, in order to retain speed and keep things manageable.
4. Anyone can contribute via forking, and significant contributors may be added as direct contributors to the project.
5. The active contributors decide what functionality will be added and approves any changes submitted.

### How to Contribute

Compass is written as a Node.js application, using [EJS], [Express] and [MySQL].

If you want to contribute to development of Compass, we encourage you to explore the current issues first and follow this process.

1. Pick an existing issue or submit a new one for consideration.
2. Fork the repository.
3. Make your changes in your repository.
4. Open a pull request from your repository into the main repository. We expect well-commented code and concise, yet comprehensive commit messages.

### Local Installation

1.  Navigate to the repository locally and install the required node modules.

        $ npm install

2.  Run the `db_setup` script in the `db` folder to build the database.
3.  Create `.env` file and insert your secrets into it. Use `.env.example` file as reference for what is required.
4.  Run `nodemon` and open the app at `localhost:<port>` specifying the port defined in `app.js`.

        $ npm install -g nodemon
        $ nodemon


[EJS]: https://ejs.co
[Express]: http://expressjs.com
[MySQL]: https://www.mysql.com
