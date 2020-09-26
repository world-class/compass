USE repl_reviews;

INSERT INTO
	courses(id, title, required)
VALUES
	('CM1005', 'Introduction to Programming I', true),
	('CM1010', 'Introduction to Programming II', true),
	('CM1015', 'Numerical Mathematics', true),
	('CM1020', 'Discrete Mathematics', true),
	(
		'CM1025',
		'Fundamentals of Computer Science',
		true
	),
	('CM1030', 'How Computers Work', true),
	(
		'CM1035',
		'Algorithms and Data Structures I',
		true
	),
	('CM1040', 'Web Development', true),
	('CM2005', 'Object Oriented Programming', true),
	('CM2010', 'Software Design and Development', true),
	('CM2015', 'Programming with Data', true),
	('CM2020', 'Agile Software Projects', true),
	('CM2025', 'Computer Security', true),
	('CM2030', 'Graphics Programming', true),
	(
		'CM2035',
		'Algorithms and Data Structures II',
		true
	),
	('CM2040', 'Databases, Networks and the Web', true),
	('CM3005', 'Data Science', false),
	(
		'CM3010',
		'Databases and Advanced Data Techniques',
		false
	),
	(
		'CM3015',
		'Machine Learning and Neural Networks',
		false
	),
	('CM3020', 'Artificial Intelligence', false),
	('CM3025', 'Virtual Reality', false),
	('CM3030', 'Games Development', false),
	('CM3035', 'Advanced Web Development', false),
	(
		'CM3040',
		'Physical Computing and Internet of Things',
		false
	),
	('CM3045', '3D Graphics and Animation', false),
	('CM3050', 'Mobile Development', false),
	('CM3055', 'Interaction Design', false),
	('CM3060', 'Natural Language Processing', false),
	('CM3070', 'Final Project', true);