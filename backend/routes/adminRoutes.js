const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/hospital-admin/hospital-count',adminController.getHospitalCount);
router.get('/normal-user/total-count',adminController.getTotalNormalUserCount);
router.get('/vendor/total-count', adminController.getTotalVendorCount);
router.get('/orders/active-count', adminController.getTotalActiveOrdersCount);
router.get('/orders/confirmed-today-count', adminController.getOrdersConfirmedTodayCount);
router.get('/orders/confirmed-today', adminController.getOrdersConfirmedToday);
router.get('/orders/confirmed-this-week/count', adminController.getOrdersConfirmedThisWeekCount);
router.get('/orders/confirmed-this-week', adminController.getOrdersConfirmedThisWeek);

// router.get('/pending-approvals', adminController.getPendingApprovalList);
router.get('/hospital-admin/pending-approvals', adminController.getPendingApprovalsOfHospitalAdmin);
router.get('/vendor/pending-approvals', adminController.getPendingApprovalsOfVendor);
router.get('/hospital-admin/rejected', adminController.getHospitalRejectedList);
router.get('/vendor/rejected', adminController.getVendorRejectedList);
router.put('/hospital-admin/approve/:hospitalAdminId', adminController.approveHospitalAdminById);
router.put('/vendor/verify/:vendorId', adminController.verifyVendorById);
router.put('/hospital-admin/reject/:hospitalAdminId', adminController.rejectHospitalAdmin);
router.put('/vendor/reject/:vendorId', adminController.rejectVendor);

router.get('/hospitals/approved', adminController.getAllHospitalData);
router.get('/vendors/approved', adminController.getAllVendorData);
router.get('/normal-users', adminController.getAllNormalUserData);


router.delete('/hospitalAdmin/:userId', adminController.deleteHospitalAdmin);
router.delete('/vendor/:userId', adminController.deleteVendor);
router.delete('/normalUser/:userId', adminController.deleteNormalUser);

router.post('/hospital-admin/verify', adminController.verifyHospitalAdmin);
router.get('/hospital-admin/documents/:id', adminController.getHospitalDocumentsById);
router.get('/hospital-admin/data', adminController.getAllHospitalAdminData);
router.get('/hospital-admin/data/:hospitalAdminId', adminController.getHospitalAdminDataById);
router.put('/hospital-admin/update/:hospitalAdminId', adminController.updateHospitalAdmin);
router.delete('/hospital-admin/remove/:hospitalAdminId', adminController.removeHospitalAdmin);

router.post('/vendor/verify', adminController.verifyVendor);
router.get('/vendor/documents/:id', adminController.getVendorDocumentsById);

router.get('/documents/pending-approval', adminController.getUploadedDocumentsThatAreWaitingToBeApproved);

router.post('/admin/add', adminController.addAdmin);

module.exports = router;
