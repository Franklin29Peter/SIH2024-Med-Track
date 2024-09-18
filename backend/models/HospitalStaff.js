const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const HospitalAdmin = require('./HospitalAdmin');
const User = require('./User');

const HospitalStaff = sequelize.define('HospitalStaff', {
    hospitalStaffId: {
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    staffName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = HospitalStaff;
