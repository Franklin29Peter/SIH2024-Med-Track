const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); 

const HospitalAdmin = sequelize.define('HospitalAdmin', {
    hospitalAdminId: {
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
    hospitalName: {
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
    approved: {
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
        beforeSave: (hospitalAdmin) => {
            if (hospitalAdmin.documentPath) {
                hospitalAdmin.uploadedDocument = true;
            }
        },
    },
});

module.exports = HospitalAdmin;
