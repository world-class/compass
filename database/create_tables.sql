USE repl_reviews;

DROP TABLE IF EXISTS reviews;

DROP TABLE IF EXISTS courses;

CREATE TABLE `courses` (
	`id` VARCHAR(6),
	`title` VARCHAR(100),
	`required` BIT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `reviews` (
	`id` SMALLINT NOT NULL AUTO_INCREMENT,
	`course_id` VARCHAR(6) NOT NULL,
	`difficulty` TINYINT NOT NULL,
	`workload` TINYINT,
	`rating` TINYINT,
	PRIMARY KEY (`id`),
	FOREIGN KEY (course_id) REFERENCES courses(id)
);