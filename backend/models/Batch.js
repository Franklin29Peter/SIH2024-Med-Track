const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Vendor = require('./Vendor');
const User = require('./User');

const Batch = sequelize.define('Batch', {
    batchId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    storageCondition: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cityToBeDelivered: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    availability: {
        type: DataTypes.ENUM('available', 'notAvailable'),
        allowNull: false,
        defaultValue: 'available',
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Vendor, 
            key: 'vendorId',
        },
        // userId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: User, // Reference to the Vendor model
        //         key: 'userId',
        //     },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = Batch;
