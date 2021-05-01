"use strict";

const { DataTypes } = require("sequelize");

class User {
	constructor(sequelize) {
		return sequelize.define(
			"User",
			{
				// Model attributes are defined here
				id: {
					type: DataTypes.STRING(9),
					allowNull: false,
					unique: true,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
				email: {
					type: DataTypes.STRING(100),
				},
				avatar_url: {
					type: DataTypes.STRING(250),
				},
			},
			{
				// Other model options go here
			}
		);
	}
}

module.exports = User;
