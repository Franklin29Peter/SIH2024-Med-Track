const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

const vendorMiddleware = (req, res, next) => {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Access denied: Vendors only' });
    }
    next();
};

const hospitalAdminStaffMiddleware = (req, res, next) => {
    if (req.user.role !== 'hospital_admin' && req.user.role !== 'hospital_staff') {
        return res.status(403).json({ message: 'Access denied: Hospital Admins or Staff only' });
    }
    next();
};

const deliveryPartnerMiddleware = (req, res, next) => {
    if (req.user.role !== 'delivery_partner') {
        return res.status(403).json({ message: 'Access denied: Delivery Partners only' });
    }
    next();
};

module.exports = {
    adminMiddleware,
    vendorMiddleware,
    hospitalAdminStaffMiddleware,
    deliveryPartnerMiddleware,
};