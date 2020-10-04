CREATE DATABASE IF NOT EXISTS repl_reviews;

USE repl_reviews;

DROP TABLE IF EXISTS reviews;

DROP TABLE IF EXISTS courses;

DROP TABLE IF EXISTS users;

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
	`text` TEXT,
	PRIMARY KEY (`id`),
	FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) NOT NULL,
    `email` VARCHAR(60) UNIQUE NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    PRIMARY KEY (`id`)
);
