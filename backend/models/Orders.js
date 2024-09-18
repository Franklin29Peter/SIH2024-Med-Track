const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Orders = sequelize.define('Orders', {
    orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    vendorName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    orderRecivedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    deliveryPartner: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    batchId: {
        type: DataTypes.INTEGER,
        allowNull: false,//true
        defaultValue: 2,
    },
    currentLocation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('open_order','order_received','order_accepted','order_denied','shipped', 'reached_local_basement', 'out_for_delivery', 'delivered'),
        allowNull: false,
        defaultValue: 'order_received',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = Orders;
