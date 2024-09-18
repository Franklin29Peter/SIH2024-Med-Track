const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Vendor = require('./Vendor');
const HospitalAdmin = require('./HospitalAdmin');

const Inventory = sequelize.define('Inventory', {
    drugName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    thresholdLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    storageCondition: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
}, {
    timestamps: true,
});

Inventory.belongsTo(Vendor, { foreignKey: 'vendorId', allowNull: true });
Inventory.belongsTo(HospitalAdmin, { foreignKey: 'hospitalAdminId', allowNull: true });

module.exports = Inventory;
