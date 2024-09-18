const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Vendor = sequelize.define('Vendor', {
    vendorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    vendorName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documentPath: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    uploadedDocument: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    rejected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
    hooks: {
        beforeSave: (vendor) => {
            if (vendor.documentPath) {
                vendor.uploadedDocument = true;
            }
        },
    },
});

module.exports = Vendor;
