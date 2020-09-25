USE repl_reviews;
CREATE TABLE `reviews` (
	`id` TINYINT NOT NULL AUTO_INCREMENT,
	`course_id` VARCHAR(6) NOT NULL,
    `difficulty` TINYINT NOT NULL,
    `workload` TINYINT,
    `rating` TINYINT,
    PRIMARY KEY (`id`),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);