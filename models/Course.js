"use strict";

const { DataTypes } = require("sequelize");

class Course {
	constructor(sequelize) {
		return sequelize.define(
			"Course",
			{
				// Model attributes are defined here
				id: {
					type: DataTypes.STRING(6),
					allowNull: false,
					unique: true,
					primaryKey: true,
				},
				title: {
					type: DataTypes.STRING(100),
					allowNull: false,
					unique: true,
				},
				level: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				credits: {
					type: DataTypes.VIRTUAL,
					get() {
						if (this.id !== "CM3070") return 30;
						return 15;
					},
				},
				weight: {
					type: DataTypes.VIRTUAL,
					get() {
						if (this.level === 4) return 1;
						if (this.level === 5) return 3;
						if (this.id === "CM3070") return 10;
						if (this.level === 6) return 5;
					},
				},
			},
			{
				// Other model options go here
			}
		);
	}
}
/*

	;*/

module.exports = Course;
