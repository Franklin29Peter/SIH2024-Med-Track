const { Order, Inventory, DeliveryPartner, Batch, HospitalAdmin, NormalUser, Vendor, User, VendorStock,DrugInformation } = require('../models'); // Assuming Sequelize models
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.createBatch = async (req, res) => {
    try {
        const { storageCondition, cityToBeDelivered } = req.body;
        const { userId } = req.user; 

        const vendor = await Vendor.findOne({ where: { userId } });

        if (!vendor) {
            return res.status(403).json({ message: 'User is not authorized to create a batch' });
        }

        const vendorId = vendor.vendorId;

        const newBatch = await Batch.create({
            storageCondition,
            cityToBeDelivered,
            availability: 'available', 
            vendorId, 
        });

        res.status(201).json({ message: 'Batch created successfully', batch: newBatch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create batch', error: error.message });
    }
};

exports.addDeliveryPartner = async (req, res) => {
    try {
        const { partnerName, licenseNumber, city, username, email, phoneNumber, password } = req.body;
        const { userId } = req.user;

        const vendor = await Vendor.findOne({ where: { userId } });

        if (!vendor) {
            return res.status(403).json({ message: 'User is not authorized to add a delivery partner' });
        }

        const vendorId = vendor.vendorId;

        const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword, 
            role: 'delivery_partner'   
        });

        const newDeliveryPartner = await DeliveryPartner.create({
            partnerName,
            licenseNumber,
            city,
            userId: newUser.userId,  
            vendorId                
        });

        res.status(201).json({ message: 'Delivery Partner added successfully', deliveryPartner: newDeliveryPartner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add delivery partner', error: error.message });
    }
};


exports.addVendorStock = async (req, res) => {
    try {
        const { drugName, availableQuantity, pricePerStrip } = req.body;
        const { userId } = req.user; 

        const vendor = await Vendor.findOne({ where: { userId } });

        if (!vendor) {
            return res.status(403).json({ message: 'User is not authorized to add stock' });
        }

        const vendorId = vendor.vendorId;

        const drug = await DrugInformation.findOne({ where: { drugName } });

        if (!drug) {
            return res.status(404).json({ message: 'Drug not found' });
        }

        const drugId = drug.drugId;

        const newVendorStock = await VendorStock.create({
            vendorId,
            drugId, 
            availableQuantity,
            pricePerStrip,
        });

        res.status(201).json({ message: 'Vendor stock added successfully', vendorStock: newVendorStock });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add vendor stock', error: error.message });
    }
};

exports.getVendorStock = async (req, res) => {
    try {
        const { userId } = req.user; 

        const vendor = await Vendor.findOne({ where: { userId } });

        if (!vendor) {
            return res.status(403).json({ message: 'User is not authorized to view stock' });
        }

        const vendorId = vendor.vendorId;

        const stocks = await VendorStock.findAll({
            where: { vendorId },
            include: [
                {
                    model: DrugInformation,
                    attributes: ['drugName']
                },
                {
                    model: Vendor,
                    attributes: ['vendorName'] 
                }
            ]
        });

        if (stocks.length === 0) {
            return res.status(404).json({ message: 'No stock found for this vendor' });
        }

        res.status(200).json({ message: 'Vendor stock retrieved successfully', stocks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve vendor stock', error: error.message });
    }
};

exports.viewVendorOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { vendorId: req.vendorId } });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor orders', error });
    }
};

exports.assignDeliveryDriver = async (req, res) => {
    const { orderId, driverId } = req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.driverId = driverId;
        await order.save();

        res.status(200).json({ message: 'Driver assigned to order successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning driver to order', error });
    }
};

exports.trackDeliveries = async (req, res) => {
    try {
        const deliveries = await Order.findAll({ 
            where: { vendorId: req.vendorId },
            include: [{ model: DeliveryDriver, attributes: ['name', 'location', 'status', 'environmentalConditions'] }]
        });
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Error tracking deliveries', error });
    }
};

exports.thresholdOrders = async (req, res) => {
    try {
        const lowStockItems = await Inventory.findAll({ 
            where: { vendorId: req.vendorId, quantity: { [Op.lt]: req.body.threshold } }
        });

        const newOrders = lowStockItems.map(item => ({
            drugId: item.id,
            quantity: req.body.replenishAmount,
            vendorId: req.vendorId,
            hospitalId: req.body.hospitalId 
        }));

        const createdOrders = await Order.bulkCreate(newOrders);

        res.status(200).json({ message: 'Threshold orders generated successfully', orders: createdOrders });
    } catch (error) {
        res.status(500).json({ message: 'Error generating threshold orders', error });
    }
};

exports.viewBatchDetails = async (req, res) => {
    const { batchId } = req.params;

    try {
        const batch = await Batch.findByPk(batchId, {
            include: [{ model: Order }, { model: DeliveryDriver, attributes: ['environmentalConditions'] }]
        });

        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching batch details', error });
    }
};

exports.updateVendorInventory = async (req, res) => {
    const { inventoryUpdates } = req.body;

    try {
        for (const update of inventoryUpdates) {
            const inventory = await Inventory.findByPk(update.drugId);
            if (inventory) {
                inventory.quantity = update.quantity;
                await inventory.save();
            }
        }
        res.status(200).json({ message: 'Vendor inventory updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vendor inventory', error });
    }
};

exports.addDrugStock = async (req, res) => {
    const { drugDetails } = req.body;

    try {
        const newDrug = await Inventory.create(drugDetails);
        res.status(201).json({ message: 'Drug stock added successfully', drug: newDrug });
    } catch (error) {
        res.status(500).json({ message: 'Error adding drug stock', error });
    }
};

exports.updateDrugQuantity = async (req, res) => {
    const { drugId, quantity } = req.body;

    try {
        const drug = await Inventory.findByPk(drugId);
        if (!drug) return res.status(404).json({ message: 'Drug not found' });

        drug.quantity = quantity;
        await drug.save();

        res.status(200).json({ message: 'Drug quantity updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating drug quantity', error });
    }
};

exports.monitorEnvironmentalConditions = async (req, res) => {
    try {
        const conditions = await Batch.findAll({
            where: { vendorId: req.vendorId },
            attributes: ['id', 'environmentalConditions']
        });
        res.status(200).json(conditions);
    } catch (error) {
        res.status(500).json({ message: 'Error monitoring environmental conditions', error });
    }
};

exports.removeDeliveryDriverById = async (req, res) => {
    const { driverId } = req.params;

    try {
        const driver = await DeliveryDriver.findByPk(driverId);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        await driver.destroy();
        res.status(200).json({ message: 'Delivery driver removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing delivery driver', error });
    }
};

exports.viewAllDrivers = async (req, res) => {
    try {
        const drivers = await DeliveryDriver.findAll({ where: { vendorId: req.vendorId } });
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching drivers', error });
    }
};

exports.communicateWithHospitalAdmin = async (req, res) => {
    const { hospitalAdminId, message } = req.body;

    try {
        
        res.status(200).json({ message: 'Message sent to hospital admin successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with hospital admin', error });
    }
};

exports.communicateWithNormalUser = async (req, res) => {
    const { normalUserId, message } = req.body;

    try {
       
        res.status(200).json({ message: 'Message sent to normal user successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with normal user', error });
    }
};

exports.generateVendorReport = async (req, res) => {
    try {
        const report = {
            inventoryLevels: await Inventory.findAll({ where: { vendorId: req.vendorId } }),
            ordersProcessed: await Order.findAll({ where: { vendorId: req.vendorId } }),
            deliveriesCompleted: await Order.findAll({ where: { vendorId: req.vendorId, status: 'completed' } }),
            environmentalCompliance: await Batch.findAll({ where: { vendorId: req.vendorId }, attributes: ['id', 'environmentalConditions'] })
        };

        res.status(200).json({ report });
    } catch (error) {
        res.status(500).json({ message: 'Error generating vendor report', error });
    }
};

exports.createBatch = async (req, res) => {
    const { orderIds, environmentalConditions } = req.body;

    try {
        const newBatch = await Batch.create({
            orderIds: JSON.stringify(orderIds),
            environmentalConditions,
            vendorId: req.vendorId
        });

        await Order.update({ batchId: newBatch.id }, { where: { id: orderIds } });

        res.status(201).json({ message: 'Batch created successfully', batch: newBatch });
    } catch (error) {
        res.status(500).json({ message: 'Error creating batch', error });
    }
};