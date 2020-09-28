CREATE DATABASE IF NOT EXISTS repl_reviews;

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
	`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`course_id` VARCHAR(6) NOT NULL,
	`session` VARCHAR(30),
	`difficulty` TINYINT NOT NULL,
	`workload` TINYINT,
	`rating` TINYINT,
	`text` VARCHAR(5000),
	PRIMARY KEY (`id`),
	FOREIGN KEY (course_id) REFERENCES courses(id)
);