const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const HospitalAdmin = require('./HospitalAdmin');
const DrugInformation = require('./DrugInformation');

const ConsumptionRecord = sequelize.define('ConsumptionRecord', {
    consumptionRecordId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    hospitalAdminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: HospitalAdmin,
            key: 'hospitalAdminId',
        },
    },
    patientName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    healthIssue: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    drugId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: DrugInformation,
            key: 'drugId',
        },
    },
    quantityUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = ConsumptionRecord;
