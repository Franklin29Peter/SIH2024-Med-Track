const sequelize = require('../config/db');
const User = require('./User');
const HospitalAdmin = require('./HospitalAdmin');
const HospitalStaff = require('./HospitalStaff');
const Vendor = require('./Vendor');
const NormalUser = require('./NormalUser');
const DeliveryPartner = require('./DeliveryPartner');
const DrugInformation = require('./DrugInformation');
const Orders = require('./Orders');
const OrdersByHospital = require('./OrdersByHospital');
const OrdersByNormalUser = require('./OrdersByNormalUser');
const VendorStock = require('./VendorStock');
const HospitalInventory = require('./HospitalInventory');
const NormalUserInventory = require('./NormalUserInventory');
const ConsumptionRecord = require('./ConsumptionRecord');
const Batch = require('./Batch');

// Associations
User.hasOne(HospitalAdmin, { foreignKey: 'userId' });
HospitalAdmin.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(HospitalStaff, { foreignKey: 'userId' });
HospitalStaff.belongsTo(User, { foreignKey: 'userId' });

HospitalAdmin.hasMany(HospitalStaff, { foreignKey: 'hospitalAdminId' });
HospitalStaff.belongsTo(HospitalAdmin, { foreignKey: 'hospitalAdminId' });

User.hasOne(Vendor, { foreignKey: 'userId' });
Vendor.belongsTo(User, { foreignKey: 'userId' });

Vendor.hasMany(VendorStock, { foreignKey: 'vendorId' });
VendorStock.belongsTo(Vendor, { foreignKey: 'vendorId' });

DrugInformation.hasMany(VendorStock, { foreignKey: 'drugId' });
VendorStock.belongsTo(DrugInformation, { foreignKey: 'drugId' });

User.hasOne(NormalUser, { foreignKey: 'userId' });
NormalUser.belongsTo(User, { foreignKey: 'userId' });

NormalUser.hasMany(NormalUserInventory, { foreignKey: 'normalUserId' });
NormalUserInventory.belongsTo(NormalUser, { foreignKey: 'normalUserId' });

DrugInformation.hasMany(NormalUserInventory, { foreignKey: 'drugId' });
NormalUserInventory.belongsTo(DrugInformation, { foreignKey: 'drugId' });

User.hasOne(DeliveryPartner, { foreignKey: 'userId' });
DeliveryPartner.belongsTo(User, { foreignKey: 'userId' });

Vendor.hasMany(DeliveryPartner, { foreignKey: 'vendorId' });
DeliveryPartner.belongsTo(Vendor, { foreignKey: 'vendorId' });

HospitalAdmin.hasMany(HospitalInventory, { foreignKey: 'hospitalAdminId' });
HospitalInventory.belongsTo(HospitalAdmin, { foreignKey: 'hospitalAdminId' });

DrugInformation.hasMany(HospitalInventory, { foreignKey: 'drugId' });
HospitalInventory.belongsTo(DrugInformation, { foreignKey: 'drugId' });

Orders.hasMany(OrdersByHospital, { foreignKey: 'orderId' });
OrdersByHospital.belongsTo(Orders, { foreignKey: 'orderId' });

Orders.hasMany(OrdersByNormalUser, { foreignKey: 'orderId' });
OrdersByNormalUser.belongsTo(Orders, { foreignKey: 'orderId' });

HospitalAdmin.hasMany(ConsumptionRecord, { foreignKey: 'hospitalAdminId' });
ConsumptionRecord.belongsTo(HospitalAdmin, { foreignKey: 'hospitalAdminId' });

DrugInformation.hasMany(ConsumptionRecord, { foreignKey: 'drugId' });
ConsumptionRecord.belongsTo(DrugInformation, { foreignKey: 'drugId' });

Batch.hasMany(Orders, {
    foreignKey: 'batchId',
    sourceKey: 'batchId',
    as: 'orders'
});

Orders.belongsTo(Batch, {
    foreignKey: 'batchId',
    targetKey: 'batchId',
    as: 'batch'
});

Vendor.hasMany(Batch, {
    foreignKey: 'vendorId',
    as: 'batches'
});

Batch.belongsTo(Vendor, {
    foreignKey: 'vendorId',
    as: 'vendor'
});

sequelize.sync({ alter: true })
    .then(() => console.log("All models were synchronized successfully."))
    .catch(error => console.log("Error synchronizing models: ", error));

module.exports = {
    User,
    HospitalAdmin,
    HospitalStaff,
    Vendor,
    NormalUser,
    DeliveryPartner,
    DrugInformation,
    Orders,
    OrdersByHospital,
    OrdersByNormalUser,
    VendorStock,
    HospitalInventory,
    NormalUserInventory,
    ConsumptionRecord,
    Batch
};
