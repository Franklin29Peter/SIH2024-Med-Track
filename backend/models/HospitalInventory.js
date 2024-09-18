const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const HospitalAdmin = require('./HospitalAdmin');
const DrugInformation = require('./DrugInformation');

const HospitalInventory = sequelize.define('HospitalInventory', {
    hospitalInventoryId: {
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
    drugId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: DrugInformation,
            key: 'drugId',
        },
    },
    availableQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    maxRequirement: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = HospitalInventory;
