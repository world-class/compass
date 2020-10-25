if (typeof reviewSemester !== "undefined") {
	const semester = JSON.parse(reviewSemester); //get session
	$("#semester").selectpicker("val", semester); //set as selected
}
