const express = require('express');
const router = express.Router();
const hospitalAdminController = require('../controllers/hospitalAdminController');
const authMiddleware  = require('../middlewares/authMiddleware');

const {addStaff}  = require('../controllers/hospitalAdminController');

router.post('/addStaff',authMiddleware, addStaff);
router.get('/viewMyProfile',authMiddleware,hospitalAdminController.viewMyProfile );

router.post('/addInventory', authMiddleware, hospitalAdminController.addHospitalInventory);
router.post('/addPatientRecordEntry', authMiddleware, hospitalAdminController.addPatientRecordEntry);
router.get('/getAllPatientRecords', authMiddleware, hospitalAdminController.getAllPatientRecords);
router.get('/inventory',authMiddleware, hospitalAdminController.getInventoryByHospital);


router.post('/orders', authMiddleware, hospitalAdminController.hospitalOrderWithVendorById);
router.post('/open-order', authMiddleware, hospitalAdminController.openOrdersByHospital);

module.exports = router;
