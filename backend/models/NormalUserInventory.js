const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const NormalUser = require('./NormalUser');
const DrugInformation = require('./DrugInformation');

const NormalUserInventory = sequelize.define('NormalUserInventory', {
    normalUserInventoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    normalUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: NormalUser,
            key: 'normalUserId',
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
        allowNull: false,
    },
    orderLevel: {
        type: DataTypes.ENUM('one_time', 'regular'),
        allowNull: false,
    },
    // threshold: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    // },
    maxRequirement: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = NormalUserInventory;
