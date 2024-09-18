const bcrypt = require('bcrypt');
const { User, HospitalAdmin, Vendor, NormalUser } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const path = require('path');

exports.login = async (req, res) => {
    const { phoneNumber, password } = req.body;

    try {

        console.log("Login attempt:", { phoneNumber, password });

        const user = await User.findOne({ where: { phoneNumber } });

        if (!user) {
            console.log("User not found with phoneNumber:", phoneNumber);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("Stored password hash:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch for user:", user.phoneNumber);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
              userId: user.userId,
              userType: user.role,
            },
          };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log("Token generated successfully:", token);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.hospitalAdminRegistration = async (req, res) => {
    const { username, email, phoneNumber, hospitalName, location, password } = req.body;
    // const document = req.file; // Assuming file upload middleware is set up
    const documentPath = req.file ? req.file.path : req.body.documentPath;

    if (!username || !email || !phoneNumber || !hospitalName || !location || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Hashed Password:', hashedPassword);

        const newUser = await User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'hospital_admin',
        });

        const newHospitalAdmin = await HospitalAdmin.create({
            userId: newUser.userId,
            hospitalName,
            location,
            documentPath: documentPath || null,
            uploadedDocument: !!documentPath,
            approved: false,
            rejected: false,
        });

        res.status(201).json({
            message: 'Hospital Admin registered successfully',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                hospitalName: newHospitalAdmin.hospitalName,
                location: newHospitalAdmin.location,
            },
        });
    } catch (error) {
        console.error('Error registering hospital admin:', error);
        res.status(500).json({ message: 'Error registering hospital admin', error });
    }
};

exports.vendorRegistration = async (req, res) => {
    const { username, email, phoneNumber, vendorName, location, password } = req.body;
    const documentPath = req.file ? req.file.path : req.body.documentPath;


    if (!username || !email || !phoneNumber || !vendorName || !location || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'vendor',
        });

        const newVendor = await Vendor.create({
            userId: newUser.userId,
            vendorName,
            location,
            documentPath: documentPath || null,
            uploadedDocument: !!documentPath,
            verified: false,
            rejected: false,
        });

        res.status(201).json({
            message: 'Vendor registered successfully',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                vendorName: newVendor.vendorName,
                location: newVendor.location,
            },
        });
    } catch (error) {
        console.error('Error registering vendor:', error);
        res.status(500).json({ message: 'Error registering vendor', error });
    }
};

exports.normalUserRegistration = async (req, res) => {
    const { username, email, phoneNumber, address, fullName, password } = req.body;

    if (!username || !email || !phoneNumber || !address || !fullName || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'normal_user',
        });

        console.log("New User Object:", newUser);

        const newNormalUser = await NormalUser.create({
            userId: newUser.userId,
            fullName, 
            address,
        });

        res.status(201).json({
            message: 'Normal user registered successfully',
            data: {
                id: newUser.userId,
                username: newUser.username,
                email: newUser.email,
                address: newNormalUser.address,
                fullName: newNormalUser.fullName,
            },
        });
    } catch (error) {
        console.error('Error registering normal user:', error);
        res.status(500).json({ message: 'Error registering normal user', error });
    }
};
