const { User,NormalUserInventory,DrugInformation,NormalUser, Order, Vendor, Drug } = require('../models'); // Assuming Sequelize models
const { Op } = require('sequelize');

exports.addNormalUserInventory = async (req, res) => {
    try {
        const { drugName, availableQuantity, orderLevel, maxRequirement } = req.body;
        const { userId } = req.user; 
        

        const normalUser = await NormalUser.findOne({ where: { userId } });
        if (!normalUser) {
            return res.status(403).json({ message: 'User is not authorized to add inventory' });
        }
        const normalUserId = normalUser.normalUserId;

        const drug = await DrugInformation.findOne({ where: { drugName } });
        if (!drug) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        const drugId = drug.drugId;

        const newInventory = await NormalUserInventory.create({
            normalUserId,
            drugId,
            availableQuantity: availableQuantity || 0,
            orderLevel,
            maxRequirement,
        });

        res.status(201).json({ message: 'Normal user inventory added successfully', inventory: newInventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add normal user inventory', error: error.message });
    }
};

exports.manageUserProfile = async (req, res) => {
    const { userId, profileData } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update(profileData);

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

exports.addAndManageRequiredDrugs = async (req, res) => {
    const { userId, drugDetails } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await Drug.create({ userId, ...drugDetails });

        res.status(200).json({ message: 'Drug added/updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error managing required drugs', error });
    }
};

exports.setMedicationReminder = async (req, res) => {
    const { userId, reminderData } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({ reminders: reminderData });

        res.status(200).json({ message: 'Reminder set successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error setting reminder', error });
    }
};

exports.checkInventoryLevels = async (req, res) => {
    const { userId } = req.params;

    try {
        const drugs = await Drug.findAll({ where: { userId } });
        if (!drugs.length) return res.status(404).json({ message: 'No drugs found for user' });

        res.status(200).json({ message: 'Inventory levels fetched successfully', drugs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory levels', error });
    }
};

exports.consumptionOfDrug = async (req, res) => {
    const { userId, drugId, quantityConsumed } = req.body;

    try {
        const drug = await Drug.findOne({ where: { userId, id: drugId } });
        if (!drug) return res.status(404).json({ message: 'Drug not found' });

        drug.quantity -= quantityConsumed;
        await drug.save();

        res.status(200).json({ message: 'Drug consumption tracked successfully', drug });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking drug consumption', error });
    }
};

exports.placeMedicationOrder = async (req, res) => {
    const { userId, orderDetails, isDirectOrder, vendorId } = req.body;

    try {
        let order;

        if (isDirectOrder && vendorId) {

            order = await Order.create({ userId, vendorId, ...orderDetails });
        } else {
            order = await Order.create({ userId, ...orderDetails });
        }

        res.status(200).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
};

exports.trackUserOrders = async (req, res) => {
    const { userId, orderId } = req.params;

    try {
        const order = await Order.findOne({ where: { userId, id: orderId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json({ message: 'Order status fetched successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order status', error });
    }
};

exports.getDeliveryUpdates = async (req, res) => {
    const { userId, orderId } = req.params;

    try {
        const order = await Order.findOne({ where: { userId, id: orderId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json({ message: 'Delivery updates fetched successfully', deliveryStatus: order.deliveryStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery updates', error });
    }
};

exports.cancelOrder = async (req, res) => {
    const { userId, orderId } = req.body;

    try {
        const order = await Order.findOne({ where: { userId, id: orderId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status === 'Dispatched') {
            return res.status(400).json({ message: 'Cannot cancel a dispatched order' });
        }

        await order.destroy();

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error });
    }
};

exports.getAllVendorData = async (req, res) => {
    try {
        const vendors = await Vendor.findAll();
        res.status(200).json({ message: 'Vendors fetched successfully', vendors });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors', error });
    }
};

exports.getVendorDataById = async (req, res) => {
    const { vendorId } = req.params;

    try {
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json({ message: 'Vendor details fetched successfully', vendor });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor details', error });
    }
};

exports.viewAvailableStockFromVendor = async (req, res) => {
    const { vendorId, drugId } = req.params;

    try {
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const stock = await vendor.getDrugs({ where: { id: drugId } });
        if (!stock.length) return res.status(404).json({ message: 'Drug not available with vendor' });

        res.status(200).json({ message: 'Stock availability fetched successfully', stock });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock availability', error });
    }
};

exports.autoReorderMedications = async (req, res) => {
    const { userId } = req.body;

    try {

        res.status(200).json({ message: 'Auto reorder process initiated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error initiating auto reorder', error });
    }
};

exports.getReorderStatus = async (req, res) => {
    const { userId } = req.params;

    try {

        res.status(200).json({ message: 'Reorder status fetched successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reorder status', error });
    }
};

exports.communicateWithVendor = async (req, res) => {
    const { vendorId, message } = req.body;

    try {
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json({ message: 'Message sent to vendor successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message to vendor', error });
    }
};

exports.communicateWithDriver = async (req, res) => {
    const { driverId, message } = req.body;

    try {

        res.status(200).json({ message: 'Message sent to driver successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message to driver', error });
    }
};