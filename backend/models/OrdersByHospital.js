const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const HospitalAdmin = require('./HospitalAdmin');
const Orders = require('./Orders');
const DrugInformation = require('./DrugInformation');

const OrdersByHospital = sequelize.define('OrdersByHospital', {
    hospitalOrderId: {
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
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Orders,
            key: 'orderId',
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = OrdersByHospital;
