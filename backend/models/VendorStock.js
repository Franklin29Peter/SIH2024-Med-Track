const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Vendor = require('./Vendor');
const DrugInformation = require('./DrugInformation');

const VendorStock = sequelize.define('VendorStock', {
    vendorStockId: {
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
    pricePerStrip: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    timestamps: true,
});

module.exports = VendorStock;
