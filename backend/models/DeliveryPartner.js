const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Vendor = require('./Vendor');

const DeliveryPartner = sequelize.define('DeliveryPartner', {
    deliveryPartnerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Vendor,
            key: 'vendorId',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    partnerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    licenseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = DeliveryPartner;
