const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const vendorController = require('../controllers/vendorController');

router.post('/createBatch', authMiddleware, vendorController.createBatch);
router.post('/delivery-partner/add', authMiddleware, vendorController.addDeliveryPartner);
router.post('/stock/vendor', authMiddleware, vendorController.addVendorStock);
router.get('/stock/vendor', authMiddleware, vendorController.getVendorStock);

module.exports = router;
