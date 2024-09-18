const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DrugInformation = sequelize.define('DrugInformation', {
    drugId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    drugName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = DrugInformation;
