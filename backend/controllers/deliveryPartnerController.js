const { Order, HospitalAdmin, Vendor, NormalUser } = require('../models');
const { Op } = require('sequelize');

exports.updateDeliveryStatus = async (req, res) => {
    const { driverId, orderId, status } = req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.driverId !== driverId) {
            return res.status(403).json({ message: 'Unauthorized driver for this order' });
        }
        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error });
    }
};

exports.provideLocation = async (req, res) => {
    const { driverId, orderId, locationData } = req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.driverId !== driverId) {
            return res.status(403).json({ message: 'Unauthorized driver for this order' });
        }

        order.locationData = locationData;
        await order.save();

        res.status(200).json({ message: 'Location updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating location', error });
    }
};

exports.communicationWithHospital = async (req, res) => {
    const { hospitalStaffId, message } = req.body;

    try {
        res.status(200).json({ message: 'Message sent to hospital staff successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with hospital staff', error });
    }
};

exports.communicationWithVendor = async (req, res) => {
    const { vendorId, message } = req.body;

    try {

        res.status(200).json({ message: 'Message sent to vendor successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with vendor', error });
    }
};

exports.communicationWithNormalUser = async (req, res) => {
    const { normalUserId, message } = req.body;

    try {
        res.status(200).json({ message: 'Message sent to normal user successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with normal user', error });
    }
};

exports.confirmDelivery = async (req, res) => {
    const { orderId, recipientSignature } = req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        order.status = 'Delivered';
        order.recipientSignature = recipientSignature;
        await order.save();

        res.status(200).json({ message: 'Delivery confirmed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error confirming delivery', error });
    }
};