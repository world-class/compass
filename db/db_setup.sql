CREATE DATABASE IF NOT EXISTS compass_db
DEFAULT CHARSET = utf8mb4
DEFAULT COLLATE = utf8mb4_unicode_ci;

USE compass_db;

DROP TABLE IF EXISTS reviews;

DROP TABLE IF EXISTS courses;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS semesters;

CREATE TABLE `courses` (
	`id` VARCHAR(6),
	`title` VARCHAR(100),
	`required` BIT,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(80) NOT NULL,
    `email` VARCHAR(80),
    `slackuid` VARCHAR(25) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`user_id` INT,
	`course_id` VARCHAR(6) NOT NULL,
	`semester` VARCHAR(30),
	`difficulty` TINYINT NOT NULL,
	`workload` TINYINT,
	`rating` TINYINT,
	`text` TEXT,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`course_id`) REFERENCES courses(`id`),
	FOREIGN KEY (`user_id`) REFERENCES users(`id`),
	unique (course_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `semesters` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name_string` VARCHAR(50),
	`start_date` DATE,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
