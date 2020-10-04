// Creates session options based off current date
// and adds to <select> element on instantiation
function SessionOptions (selectID) {
	this.selectID = selectID;
	this.currentDate = new Date();
	this.currentYear = this.currentDate.getFullYear();
	this.startYear = 2019
	this.sessionMonths = {
		first: { start: 3, end: 8 },
		second: { start: 9, end: 2 }
	}
	this.months = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
	this.makePastYearSessions();
	this.makeCurrentYearSessions();
}

//Add both sessions for all past years
SessionOptions.prototype.makePastYearSessions  = function() {
	for(let i = this.startYear; i < this.currentYear; i++){
		let s1 = this.makeStr(this.sessionMonths.first, i);
		let s2 = this.makeStr(this.sessionMonths.second, i);
		this.append(s1);
		this.append(s2);
	}
}

// Makes 0, 1, or 2 sessions for current year based on current month
SessionOptions.prototype.makeCurrentYearSessions = function() {
	const currentMonth = this.currentDate.getMonth();

	//return if no new sessions
	if(currentMonth < this.sessionMonths.first.start) return;
	//add first session
	if(currentMonth > this.sessionMonths.first.start){
		let s1 = this.makeStr(this.sessionMonths.first, this.currentYear);	
		this.append(s1);
	}
	//add second session
	if(currentMonth > this.sessionMonths.second.start){
		let s2 = this.makeStr(this.sessionMonths.second, this.currentYear);
		this.append(s2);
	}
}

//Adds new option to select element
SessionOptions.prototype.append = function(sessionStr) {
	$("#" + this.selectID).append(new Option(sessionStr, sessionStr));
}

SessionOptions.prototype.makeStr = function (sessionMonth, endYear) {
	return this.months[sessionMonth.start] + " to " +
		this.months[sessionMonth.end] + " " + endYear
}

//run everything dependent on jQuery in here
window.onload = function() {
	new SessionOptions("session")
}