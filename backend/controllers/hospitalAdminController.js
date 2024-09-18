const { HospitalAdmin, User,ConsumptionRecord ,HospitalStaff, Vendor, Orders, HospitalInventory, DrugInformation, OrdersByHospital, VendorStock } = require('../models');  // Adjust the import paths according to your setup
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

exports.addStaff = async (req, res) => {
    console.log('req.user:', req.user);
    const { username, staffName, email, phoneNumber, password } = req.body;
    const userId = req.user.userId; 

    try {

        const hospitalAdmin = await HospitalAdmin.findOne({
            where: {
                userId: userId 
            }
        });

        if (!hospitalAdmin) {
            return res.status(404).json({ error: 'Hospital admin not found' });
        }

        const hospitalAdminId = hospitalAdmin.hospitalAdminId; 

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const newUser = await User.create({
            username,
            email,
            phoneNumber,
            password,
            role: 'hospital_staff'
        });

        console.log('hospitalAdminId:', hospitalAdminId);
        console.log('newUser.userId:', newUser.userId);

        const newStaff = await HospitalStaff.create({
            hospitalAdminId,
            userId: newUser.userId,
            staffName
        });

        return res.status(201).json({
            message: 'Hospital staff added successfully',
            user: newUser,
            staff: newStaff
        });

    } catch (error) {
        console.error('Error adding hospital staff:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.viewMyProfile= async (req, res) => {
    try {
        const user = await User.findOne({
            where: { userId: req.user.userId },
            attributes: ['username', 'email', 'phoneNumber', 'role']
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        let additionalInfo = {};

        switch (user.role) {
            case 'hospital_admin':
                const hospitalAdmin = await HospitalAdmin.findOne({
                    where: { userId: req.user.userId },
                    attributes: ['hospitalName']
                });
                additionalInfo = hospitalAdmin ? { hospitalName: hospitalAdmin.hospitalName } : {};
                break;
            
            case 'hospital_staff':
                const hospitalStaff = await HospitalStaff.findOne({
                    where: { userId: req.user.userId },
                    include: {
                        model: HospitalAdmin,
                        attributes: ['hospitalName']
                    }
                });
                additionalInfo = hospitalStaff ? { hospitalName: hospitalStaff.HospitalAdmin.hospitalName } : {};
                break;

            case 'vendor':
                const vendor = await Vendor.findOne({
                    where: { userId: req.user.userId },
                    attributes: ['vendorName']
                });
                additionalInfo = vendor ? { vendorName: vendor.vendorName } : {};
                break;

            case 'delivery_partner':
                const deliveryPartner = await DeliveryPartner.findOne({
                    where: { userId: req.user.userId },
                    attributes: ['partnerName']
                });
                additionalInfo = deliveryPartner ? { partnerName: deliveryPartner.partnerName } : {};
                break;

            case 'normal_user':
                const normalUser = await NormalUser.findOne({
                    where: { userId: req.user.userId },
                    attributes: ['fullName']
                });
                additionalInfo = normalUser ? { fullName: normalUser.fullName } : {};
                break;

            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        res.json({
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            ...additionalInfo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addHospitalInventory = async (req, res) => {
    try {
        const { drugName, availableQuantity, threshold, maxRequirement } = req.body;
        const { userId } = req.user; 
        
        const hospitalAdmin = await HospitalAdmin.findOne({ where: { userId } });
        if (!hospitalAdmin) {
            return res.status(403).json({ message: 'User is not authorized to add inventory' });
        }
        const hospitalAdminId = hospitalAdmin.hospitalAdminId;

        const drug = await DrugInformation.findOne({ where: { drugName } });
        if (!drug) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        const drugId = drug.drugId;

        const newInventory = await HospitalInventory.create({
            hospitalAdminId,
            drugId,
            availableQuantity: availableQuantity || 0,
            threshold,
            maxRequirement,
        });

        res.status(201).json({ message: 'Hospital inventory added successfully', inventory: newInventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add hospital inventory', error: error.message });
    }
};

module.exports.getAllPatientRecords = async (req, res) => {
    try {
        const records = await ConsumptionRecord.findAll({
            attributes: ['patientName', 'healthIssue', 'quantityUsed', 'date'],
            include: [
                {
                    model: DrugInformation,
                    attributes: ['drugName'],
                }
            ],
            order: [['date', 'DESC']],
        });

        if (!records.length) {
            return res.status(404).json({ message: 'No patient records found' });
        }
        const result = records.map(record => ({
            patientName: record.patientName,
            healthIssue: record.healthIssue,
            drugName: record.DrugInformation.drugName,
            quantityUsed: record.quantityUsed,
            date: record.date
        }));

        res.status(200).json({ records: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve patient records', error: error.message });
    }
};

exports.addPatientRecordEntry = async (req, res) => {
    try {
        const { patientName, healthIssue, drugName, quantityUsed, date } = req.body;
        const { userId } = req.user; 

        const hospitalAdmin = await HospitalAdmin.findOne({ where: { userId } });
        if (!hospitalAdmin) {
            return res.status(403).json({ message: 'User is not authorized to add patient record entries' });
        }
        const hospitalAdminId = hospitalAdmin.hospitalAdminId;

        const drug = await DrugInformation.findOne({ where: { drugName } });
        if (!drug) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        const drugId = drug.drugId;

        const newRecord = await ConsumptionRecord.create({
            hospitalAdminId,
            patientName,
            healthIssue,
            drugId,
            quantityUsed: quantityUsed || 0,
            date,
        });


        const inventory = await HospitalInventory.findOne({
            where: { hospitalAdminId, drugId },
        });

        if (inventory) {
            const updatedQuantity = inventory.availableQuantity - quantityUsed;
            if (updatedQuantity < 0) {
                return res.status(400).json({ message: 'Insufficient quantity in inventory' });
            }

            await inventory.update({ availableQuantity: updatedQuantity });
        } else {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        res.status(201).json({ message: 'Patient record entry added successfully', record: newRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add patient record entry', error: error.message });
    }
};

exports.getInventoryByHospital = async (req, res) => {
    try {

        const { userId } = req.user;

        const hospitalAdmin = await HospitalAdmin.findOne({ where: { userId } });
        if (!hospitalAdmin) {
            return res.status(403).json({ message: 'User is not authorized to access inventory records' });
        }
        const hospitalAdminId = hospitalAdmin.hospitalAdminId;

        const inventoryRecords = await HospitalInventory.findAll({
            where: { hospitalAdminId },
            include: [
                {
                    model: DrugInformation,
                    attributes: ['drugName'] 
                }
            ]
        });

        if (inventoryRecords.length === 0) {
            return res.status(404).json({ message: 'No inventory records found' });
        }

        const formattedRecords = inventoryRecords.map(record => ({
            drugName: record.DrugInformation.drugName,
            availableQuantity: record.availableQuantity,
            threshold: record.threshold,
            maxRequirement: record.maxRequirement
        }));

        res.status(200).json(formattedRecords);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Failed to fetch inventory records', error: error.message });
    }
};

exports.hospitalOrderWithVendorById = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { vendorId, drugName, quantity } = req.body;
        const userId = req.user.userId;

        const vendor = await Vendor.findOne({
            where: { vendorId },
            attributes: ['vendorName', 'location']
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        const drug = await DrugInformation.findOne({
            where: { drugName },
            attributes: ['drugId']
        });

        if (!drug) {
            return res.status(404).json({ error: 'Drug not found' });
        }

        const hospitalAdmin = await HospitalAdmin.findOne({
            where: { userId },
            attributes: ['hospitalAdminId']
        });

        if (!hospitalAdmin) {
            return res.status(404).json({ error: 'Hospital Admin not found' });
        }

        const vendorStock = await VendorStock.findOne({
            where: {
                vendorId,
                drugId: drug.drugId
            },
            attributes: ['availableQuantity', 'pricePerStrip']
        });

        if (!vendorStock || vendorStock.availableQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock or stock not available' });
        }

        const cost = vendorStock.pricePerStrip * quantity;

        const newOrder = await Orders.create({
            vendorName: vendor.vendorName,
            orderRecivedDate: new Date(),
            deliveryPartner: null,
            deliveryDate: null,
            batchId: 2,
            currentLocation: vendor.location,
            status: 'order_received'
        }, { transaction: t });

        const newHospitalOrder = await OrdersByHospital.create({
            hospitalAdminId: hospitalAdmin.hospitalAdminId,
            orderId: newOrder.orderId,
            drugId: drug.drugId,
            quantity,
            cost
        }, { transaction: t });

        await updateHospitalInventory(hospitalAdmin.hospitalAdminId, drug.drugId, quantity, t);

        await updateVendorStock(vendorId, drug.drugId, quantity, t);

        await t.commit();
        res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            hospitalOrder: newHospitalOrder
        });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: 'Failed to place order', details: error.message });
    }
};

exports.openOrdersByHospital = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { drugName, quantity } = req.body;
        const userId = req.user.userId; 

        const drug = await DrugInformation.findOne({
            where: { drugName },
            attributes: ['drugId']
        });

        if (!drug) {
            return res.status(404).json({ error: 'Drug not found' });
        }

        const hospitalAdmin = await HospitalAdmin.findOne({
            where: { userId },
            attributes: ['hospitalAdminId']
        });

        if (!hospitalAdmin) {
            return res.status(404).json({ error: 'Hospital Admin not found' });
        }

        const newOrder = await Orders.create({
            vendorName: null, 
            orderRecivedDate: new Date(),
            deliveryPartner: null,
            deliveryDate: null,
            batchId: 2, 
            currentLocation: null,
            status: 'open_order' 
        }, { transaction: t });

        const newHospitalOrder = await OrdersByHospital.create({
            hospitalAdminId: hospitalAdmin.hospitalAdminId,
            orderId: newOrder.orderId, 
            drugId: drug.drugId,
            quantity,
            cost: null 
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Open order placed successfully',
            order: newOrder,
            hospitalOrder: newHospitalOrder
        });

    } catch (error) {
        await t.rollback();
        console.error("Error creating open order:", error);
        res.status(500).json({ error: 'Failed to create open order', details: error.message });
    }
};

const updateHospitalInventory = async (hospitalAdminId, drugId, quantity, transaction) => {
    const hospitalInventory = await HospitalInventory.findOne({
        where: {
            hospitalAdminId,
            drugId
        }
    });

    if (hospitalInventory) {
        hospitalInventory.availableQuantity += quantity;
        await hospitalInventory.save({ transaction });
    } else {

        await HospitalInventory.create({
            hospitalAdminId,
            drugId,
            availableQuantity: quantity,
            threshold: 0, 
            maxRequirement: 0 
        }, { transaction });
    }
};

const updateVendorStock = async (vendorId, drugId, quantity, transaction) => {
    const vendorStock = await VendorStock.findOne({
        where: {
            vendorId,
            drugId
        }
    });

    if (vendorStock) {
        vendorStock.availableQuantity -= quantity;

        if (vendorStock.availableQuantity < 0) {
            throw new Error('Stock cannot be negative');
        }

        await vendorStock.save({ transaction });
    } else {
        throw new Error('Vendor Stock not found');
    }
};


exports.openOrdersByHospital = async (req, res) => {
    try {
        const { userId, userType } = req.user;
        const { drugName, quantity } = req.body;

        if (userType !== 'hospital_admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const hospitalAdmin = await HospitalAdmin.findOne({ where: { userId } });
        if (!hospitalAdmin) {
            return res.status(404).json({ error: 'Hospital admin not found' });
        }

        const hospitalAdminId = hospitalAdmin.hospitalAdminId;

        const drugInformation = await DrugInformation.findOne({ where: { drugName } });
        if (!drugInformation) {
            return res.status(404).json({ error: 'Drug not found' });
        }

        const drugId = drugInformation.drugId;

        const newOrder = await OrdersByHospital.create({
            hospitalAdminId: hospitalAdminId,
            drugId: drugId,
            quantity: quantity,
            vendorName: null, 
            cost: null, 
            location: null, 
            status: 'open', 
            orderRecivedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating open order:', error);
        res.status(500).json({ error: 'Failed to create open order', details: error.message });
    }
};




exports.viewAllStaffDetails = async (req, res) => {
    try {
        const allStaff = await HospitalStaff.findAll();
        
        res.status(200).json({ message: 'All staff details retrieved successfully', allStaff });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving staff details', error });
    }
};

exports.removeStaffById = async (req, res) => {
    try {
        const { hospitalStaffId } = req.params;
        
        await HospitalStaff.destroy({ where: { id: hospitalStaffId } });

        res.status(200).json({ message: 'Staff removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing staff', error });
    }
};

exports.reviewVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { reviewDetails } = req.body;
        
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const updatedReviews = [...vendor.reviews, reviewDetails]; 
        await Vendor.update({ reviews: updatedReviews }, { where: { id: vendorId } });

        res.status(200).json({ message: 'Vendor review submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting vendor review', error });
    }
};

exports.getAllVendorData = async (req, res) => {
    try {
        const vendors = await Vendor.findAll({ where: { verified: true } });
        res.status(200).json({ vendors });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor data', error });
    }
};

exports.getVendorDataById = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.status(200).json({ vendor });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor data', error });
    }
};

exports.viewAvailableStockFromVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.status(200).json({ stock: vendor.inventoryLevel });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor stock', error });
    }
};

exports.checkInventoryLevels = async (req, res) => {
    try {
        const inventory = await Inventory.findAll();
        res.status(200).json({ inventory });
    } catch (error) {
        res.status(500).json({ message: 'Error checking inventory levels', error });
    }
};

exports.consumptionOfDrug = async (req, res) => {
    try {
        const consumptionData = await Inventory.findAll({
            attributes: ['drugName', 'quantityUsed'], 
            where: { hospitalId: req.params.hospitalId } 
        });
        res.status(200).json({ consumptionData });
    } catch (error) {
        res.status(500).json({ message: 'Error monitoring drug consumption', error });
    }
};

exports.addAndManageRequiredDrugs = async (req, res) => {
    try {
        const { drugDetails } = req.body;
        const updatedInventory = await Inventory.upsert(drugDetails); 
        res.status(200).json({ message: 'Drug list updated successfully', updatedInventory });
    } catch (error) {
        res.status(500).json({ message: 'Error updating drug list', error });
    }
};

exports.trackHospitalOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { hospitalId: req.params.hospitalId } });
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking hospital orders', error });
    }
};

exports.placeOrderWithVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { orderDetails } = req.body;

        const order = await Order.create({
            ...orderDetails,
            vendorId,
            hospitalId: req.hospitalId 
        });

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'Shipped') {
            return res.status(400).json({ message: 'Cannot cancel shipped order' });
        }

        await Order.destroy({ where: { id: orderId } });

        res.status(200).json({ message: 'Order canceled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error canceling order', error });
    }
};

exports.getDeliveryUpdates = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ deliveryUpdates: order.deliveryUpdates });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving delivery updates', error });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking order', error });
    }
};

exports.communicateWithVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { message } = req.body;

        res.status(200).json({ message: 'Message sent to vendor successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with vendor', error });
    }
};

exports.communicateWithDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { message } = req.body;

        res.status(200).json({ message: 'Message sent to driver successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with driver', error });
    }
};


exports.generateHospitalReport = async (req, res) => {
    try {
        const report = {
            drugConsumption: await Inventory.findAll(),
            orderHistory: await Order.findAll({ where: { hospitalId: req.hospitalId } }),
            inventoryLevels: await Inventory.findAll()
        };

        res.status(200).json({ report });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error });
    }
};