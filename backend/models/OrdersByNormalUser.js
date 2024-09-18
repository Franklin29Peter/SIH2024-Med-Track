const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const NormalUser = require('./NormalUser');
const Orders = require('./Orders');
const DrugInformation = require('./DrugInformation');

const OrdersByNormalUser = sequelize.define('OrdersByNormalUser', {
    normalUserOrderId: {
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = OrdersByNormalUser;
