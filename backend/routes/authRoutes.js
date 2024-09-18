const express = require('express');
const authController = require('../controllers/authController');

const upload = require('../middlewares/upload')

const router = express.Router();
const { adminMiddleware, vendorMiddleware, hospitalAdminStaffMiddleware, deliveryPartnerMiddleware } = require('../middlewares/roleMiddleware');

router.post('/login', authController.login);

router.post('/register/hospital-admin', upload.single('document'), authController.hospitalAdminRegistration);

router.post('/register/vendor', upload.single('document'), authController.vendorRegistration);

router.post('/register/normal-user', authController.normalUserRegistration);

module.exports = router;

