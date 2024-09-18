const express = require('express');
const router = express.Router();
const normalUserController = require('../controllers/normalUserController');
const authMiddleware = require('../middlewares/authMiddleware'); 

router.post('/addInventory', authMiddleware, normalUserController.addNormalUserInventory);

module.exports = router;
