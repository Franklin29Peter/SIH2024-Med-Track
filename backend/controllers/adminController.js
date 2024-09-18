const { User, HospitalAdmin, Vendor, NormalUser, Orders, DeliveryPartner, Inventory } = require('../models');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

exports.addAdmin= async(req, res) => {
    const { username, email, phoneNumber, password } = req.body;

    if (!username || !email || !phoneNumber || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'admin', 
        });

        res.status(201).json({
            message: 'Admin user added successfully',
            data: newAdmin,
        });
    } catch (error) {
        console.error('Error adding admin user:', error);
        res.status(500).json({ message: 'Error adding admin user', error });
    }
}

exports.getHospitalCount = async (req, res) => {
    try {
        
        const hospitalCount = await HospitalAdmin.count();

        res.status(200).json({
            message: 'Total number of hospitals retrieved successfully',
            totalHospitals: hospitalCount,
        });
    } catch (error) {
        console.error('Error fetching hospital count:', error);
        res.status(500).json({
            message: 'Failed to retrieve hospital count',
            error: error.message,
        });
    }
};

exports.getTotalNormalUserCount = async (req, res) => {
    try {
        
        const normalUserCount = await NormalUser.count();

        res.status(200).json({ totalNormalUsers: normalUserCount });
    } catch (error) {
        console.error('Error fetching normal user count:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getTotalVendorCount = async (req, res) => {
    try {

        const vendorCount = await Vendor.count();

        res.status(200).json({ totalVendors: vendorCount });
    } catch (error) {
        console.error('Error fetching vendor count:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getTotalActiveOrdersCount = async (req, res) => {
    try {

        const activeOrdersCount = await Orders.count({
            where: {
                status: ['shipped', 'reached_local_basement', 'out_for_delivery']
            }
        });

        res.status(200).json({
            success: true,
            count: activeOrdersCount,
            message: 'Total active orders count retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting total active orders count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve total active orders count'
        });
    }
};


exports.getOrdersConfirmedTodayCount = async (req, res) => {
    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const startOfDay = today;
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999); 

        const ordersConfirmedTodayCount = await Orders.count({
            where: {
                orderRecivedDate: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        res.status(200).json({
            success: true,
            count: ordersConfirmedTodayCount,
            message: 'Total orders confirmed today retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting orders confirmed today count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders confirmed today count'
        });
    }
};

exports.getOrdersConfirmedToday = async (req, res) => {
    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const endOfDay = new Date(today);
        endOfDay.setDate(today.getDate() + 1); 

        const ordersConfirmedToday = await Orders.findAll({
            where: {
                orderRecivedDate: {
                    [Op.between]: [today, endOfDay]
                }
            }
        });

        res.status(200).json({
            success: true,
            orders: ordersConfirmedToday,
            message: 'Orders confirmed today retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting orders confirmed today:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders confirmed today'
        });
    }
};

exports.getOrdersConfirmedThisWeekCount = async (req, res) => {
    try {
        const today = new Date();

        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
        startOfWeek.setHours(0, 0, 0, 0); 

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); 
        endOfWeek.setHours(23, 59, 59, 999); 

        const ordersConfirmedThisWeekCount = await Orders.count({
            where: {
                orderRecivedDate: {
                    [Op.between]: [startOfWeek, endOfWeek]
                }
            }
        });

        res.status(200).json({
            success: true,
            count: ordersConfirmedThisWeekCount,
            message: 'Order count for this week retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting order count for this week:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order count for this week'
        });
    }
};

exports.getOrdersConfirmedThisWeek = async (req, res) => {
    try {
        const today = new Date();
        const currentDay = today.getDay(); 

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - currentDay));

        const ordersConfirmedThisWeek = await Orders.findAll({
            where: {
                orderRecivedDate: {
                    [Op.between]: [startOfWeek, endOfWeek]
                }
            }
        });

        res.status(200).json({
            success: true,
            orders: ordersConfirmedThisWeek,
            message: 'Orders confirmed this week retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting orders confirmed this week:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders confirmed this week'
        });
    }
};

exports.getPendingApprovalsOfHospitalAdmin = async (req, res) => {
    try {
        const pendingHospitalAdmins = await HospitalAdmin.findAll({
            where: {
                approved: false,
                rejected: false
            },
            attributes: ['hospitalAdminId','hospitalName', 'location', 'documentPath']
        });

        res.status(200).json({
            success: true,
            pendingHospitalAdmins,
            message: 'Pending hospital admins approvals list retrieved successfully'
        });
    } catch (error) {
        console.error('Error retrieving pending hospital admins approvals list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending hospital admins approvals list'
        });
    }
};

exports.getPendingApprovalsOfVendor = async (req, res) => {
    try {
        const pendingVendors = await Vendor.findAll({
            where: {
                verified: false,
                rejected: false
            },
            attributes: ['vendorId','vendorName', 'location', 'documentPath']
        });

        res.status(200).json({
            success: true,
            pendingVendors,
            message: 'Pending vendors approvals list retrieved successfully'
        });
    } catch (error) {
        console.error('Error retrieving pending vendors approvals list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending vendors approvals list'
        });
    }
};


exports.getHospitalRejectedList = async (req, res) => {
    try {
        const rejectedHospitals = await HospitalAdmin.findAll({
            where: {
                rejected: true
            },
            attributes: ['hospitalAdminId','hospitalName', 'location', 'documentPath']
        });

        if (rejectedHospitals.length === 0) {
            return res.status(404).json({ message: 'No rejected hospitals found' });
        }

        res.status(200).json({
            success: true,
            rejectedHospitals
        });
    } catch (error) {
        console.error('Error retrieving rejected hospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rejected hospitals'
        });
    }
};

exports.getVendorRejectedList = async (req, res) => {
    try {
        const rejectedVendors = await Vendor.findAll({
            where: {
                rejected: true
            },
            attributes: ['vendorId','vendorName', 'location', 'documentPath']
        });

        if (rejectedVendors.length === 0) {
            return res.status(404).json({ message: 'No rejected vendors found' });
        }

        res.status(200).json({
            success: true,
            rejectedVendors
        });
    } catch (error) {
        console.error('Error retrieving rejected vendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rejected vendors'
        });
    }
};

exports.approveHospitalAdminById = async (req, res) => {
    const { hospitalAdminId } = req.params;

    try {
        const hospitalAdmin = await HospitalAdmin.findByPk(hospitalAdminId);

        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'HospitalAdmin not found' });
        }

        if (hospitalAdmin.rejected) {
            return res.status(400).json({ message: 'HospitalAdmin is already rejected' });
        }

        hospitalAdmin.approved = true;
        await hospitalAdmin.save();

        res.status(200).json({
            success: true,
            message: 'HospitalAdmin approved successfully',
            hospitalAdmin
        });
    } catch (error) {
        console.error('Error approving HospitalAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve HospitalAdmin'
        });
    }
};


exports.verifyVendorById = async (req, res) => {
    const { vendorId } = req.params;

    try {
        const vendor = await Vendor.findByPk(vendorId);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (vendor.rejected) {
            return res.status(400).json({ message: 'Vendor is already rejected' });
        }

        vendor.verified = true;
        await vendor.save();

        res.status(200).json({
            success: true,
            message: 'Vendor verified successfully',
            vendor
        });
    } catch (error) {
        console.error('Error verifying Vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify Vendor'
        });
    }
};

exports.rejectHospitalAdmin = async (req, res) => {
    const { hospitalAdminId } = req.params;

    try {
        const hospitalAdmin = await HospitalAdmin.findByPk(hospitalAdminId);
        
        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'Hospital Admin not found' });
        }

        hospitalAdmin.rejected = true;
        hospitalAdmin.approved = false; 
        await hospitalAdmin.save();

        res.status(200).json({ message: 'Hospital Admin rejected successfully', hospitalAdmin });
    } catch (error) {
        console.error('Error rejecting Hospital Admin:', error);
        res.status(500).json({ message: 'Error rejecting Hospital Admin' });
    }
};

exports.rejectVendor = async (req, res) => {
    const { vendorId } = req.params;

    try {
        const vendor = await Vendor.findByPk(vendorId);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        vendor.rejected = true;
        vendor.verified = false; 
        await vendor.save();

        res.status(200).json({ message: 'Vendor rejected successfully', vendor });
    } catch (error) {
        console.error('Error rejecting Vendor:', error);
        res.status(500).json({ message: 'Error rejecting Vendor' });
    }
};

exports.getAllHospitalData = async (req, res) => {
    try {
        const approvedHospitals = await HospitalAdmin.findAll({
            where: {
                approved: true
            },
            attributes: ['hospitalName', 'location', 'documentPath', 'createdAt', 'updatedAt'] // Include all fields as needed
        });

        res.status(200).json({
            success: true,
            approvedHospitals,
            message: 'All approved hospital data retrieved successfully'
        });
    } catch (error) {
        console.error('Error retrieving all approved hospital data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve all approved hospital data'
        });
    }
};

exports.getAllVendorData = async (req, res) => {
    try {
        const approvedVendors = await Vendor.findAll({
            where: {
                verified: true
            },
            attributes: ['vendorName', 'location', 'documentPath', 'createdAt', 'updatedAt'] // Include all fields as needed
        });

        res.status(200).json({
            success: true,
            approvedVendors,
            message: 'All approved vendor data retrieved successfully'
        });
    } catch (error) {
        console.error('Error retrieving all approved vendor data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve all approved vendor data'
        });
    }
};

exports.getAllNormalUserData = async (req, res) => {
    try {
        const normalUsers = await NormalUser.findAll({
            attributes: [ 'fullName', 'address', 'createdAt', 'updatedAt'] 
        });

        res.status(200).json({
            success: true,
            normalUsers,
            message: 'All normal user data retrieved successfully'
        });
    } catch (error) {
        console.error('Error retrieving all normal user data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve all normal user data'
        });
    }
};

// exports.updateHospitalAdmin = async (req, res) => {
//     try {
//         const { hospitalAdminId } = req.params;
//         const updatedData = req.body;

//         const [updatedRows] = await HospitalAdmin.update(updatedData, {
//             where: { id: hospitalAdminId }
//         });

//         if (updatedRows > 0) {
//             res.status(200).json({
//                 success: true,
//                 message: 'Hospital Admin updated successfully'
//             });
//         } else {
//             res.status(404).json({
//                 success: false,
//                 message: 'Hospital Admin not found'
//             });
//         }
//     } catch (error) {
//         console.error('Error updating Hospital Admin:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update Hospital Admin',
//             error: error.message
//         });
//     }
// };

// exports.updateVendor = async (req, res) => {
//     try {
//         const { vendorId } = req.params;
//         const updatedData = req.body;

//         const [updatedRows] = await Vendor.update(updatedData, {
//             where: { id: vendorId }
//         });

//         if (updatedRows > 0) {
//             res.status(200).json({
//                 success: true,
//                 message: 'Vendor updated successfully'
//             });
//         } else {
//             res.status(404).json({
//                 success: false,
//                 message: 'Vendor not found'
//             });
//         }
//     } catch (error) {
//         console.error('Error updating Vendor:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update Vendor',
//             error: error.message
//         });
//     }
// };

// exports.updateNormalUser = async (req, res) => {
//     try {
//         const { normalUserId } = req.params;
//         const updatedData = req.body;

//         const [updatedRows] = await NormalUser.update(updatedData, {
//             where: { id: normalUserId }
//         });

//         if (updatedRows > 0) {
//             res.status(200).json({
//                 success: true,
//                 message: 'Normal User updated successfully'
//             });
//         } else {
//             res.status(404).json({
//                 success: false,
//                 message: 'Normal User not found'
//             });
//         }
//     } catch (error) {
//         console.error('Error updating Normal User:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update Normal User',
//             error: error.message
//         });
//     }
// };



exports.deleteHospitalAdmin = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const hospitalAdmin = await HospitalAdmin.destroy({ where: { userId } });
        if (!hospitalAdmin) {
            return res.status(404).json({ success: false, message: 'Hospital admin not found' });
        }

        await User.destroy({ where: { userId } }); 

        res.status(200).json({ success: true, message: 'Hospital admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting hospital admin:', error);
        res.status(500).json({ success: false, message: 'Failed to delete hospital admin' });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const vendor = await Vendor.destroy({ where: { userId } });
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        await User.destroy({ where: { userId } });

        res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ success: false, message: 'Failed to delete vendor' });
    }
};


exports.deleteNormalUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const normalUser = await NormalUser.destroy({ where: { userId } });
        if (!normalUser) {
            return res.status(404).json({ success: false, message: 'Normal user not found' });
        }

        await User.destroy({ where: { userId } }); 

        res.status(200).json({ success: true, message: 'Normal user deleted successfully' });
    } catch (error) {
        console.error('Error deleting normal user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete normal user' });
    }
};

exports.verifyHospitalAdmin = async (req, res) => {
    const { username, action } = req.body;

    try {
        const hospitalAdmin = await HospitalAdmin.findOne({ where: { '$User.username$': username }, include: User });

        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'Hospital Admin not found' });
        }

        if (action === 'approve') {
            hospitalAdmin.approved = true;
            hospitalAdmin.rejected = false;
        } else if (action === 'reject') {
            hospitalAdmin.approved = false;
            hospitalAdmin.rejected = true;
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await hospitalAdmin.save();

        res.status(200).json({ message: `Hospital Admin ${action}d successfully` });
    } catch (error) {
        console.error('Error verifying Hospital Admin:', error);
        res.status(500).json({ message: 'Error verifying Hospital Admin', error });
    }
};

exports.getHospitalDocumentsById = async (req, res) => {
    const { id } = req.params;

    try {
        const hospitalAdmin = await HospitalAdmin.findByPk(id);

        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'Hospital Admin not found' });
        }

        res.status(200).json({
            hospitalName: hospitalAdmin.hospitalName,
            documentPath: hospitalAdmin.documentPath,
            approved: hospitalAdmin.approved,
            rejected: hospitalAdmin.rejected,
        });
    } catch (error) {
        console.error('Error fetching hospital documents:', error);
        res.status(500).json({ message: 'Error fetching hospital documents', error });
    }
};

exports.getUploadedDocumentsThatAreWaitingToBeApproved = async (req, res) => {
    try {
        const hospitalAdmins = await HospitalAdmin.findAll({
            where: {
                approved: false,
                rejected: false,
            },
            attributes: ['hospitalAdminId', 'hospitalName', 'documentPath'],
        });

        const vendors = await Vendor.findAll({
            where: {
                verified: false,
                rejected: false,
            },
            attributes: ['vendorName', 'documentPath'],
        });

        res.status(200).json({
            hospitalAdmins,
            vendors,
        });
    } catch (error) {
        console.error('Error fetching documents waiting for approval:', error);
        res.status(500).json({ message: 'Error fetching documents waiting for approval', error });
    }
};

exports.getAllHospitalAdminData = async (req, res) => {
    try {
        const hospitalAdmins = await HospitalAdmin.findAll({
            include: [
                {
                    model: HospitalStaff,
                    as: 'staff',
                    attributes: ['staffId', 'staffName'], // Only select relevant fields
                }
            ]
        });

        if (!hospitalAdmins.length) {
            return res.status(404).json({ message: 'No hospital admins found' });
        }

        res.status(200).json(hospitalAdmins.map(admin => ({
            hospitalAdminId: admin.hospitalAdminId,
            hospitalName: admin.hospitalName,
            location: admin.location,
            documentPath: admin.documentPath,
            approved: admin.approved,
            rejected: admin.rejected,
            userId: admin.userId,
            staff: admin.staff.map(staffMember => ({
                staffId: staffMember.staffId,
                staffName: staffMember.staffName,
            })),
        })));
    } catch (error) {
        console.error('Error fetching hospital admin data:', error);
        res.status(500).json({ message: 'Error fetching hospital admin data', error });
    }
};

exports.getHospitalAdminDataById = async (req, res) => {
    const { hospitalAdminId } = req.params;

    try {
        const hospitalAdmin = await HospitalAdmin.findOne({
            where: { hospitalAdminId },
            include: [
                {
                    model: HospitalStaff,
                    as: 'staff',
                }
            ]
        });

        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'Hospital admin not found' });
        }

        res.status(200).json({
            hospitalAdminId: hospitalAdmin.hospitalAdminId,
            hospitalName: hospitalAdmin.hospitalName,
            location: hospitalAdmin.location,
            documentPath: hospitalAdmin.documentPath,
            approved: hospitalAdmin.approved,
            rejected: hospitalAdmin.rejected,
            userId: hospitalAdmin.userId,
            staff: hospitalAdmin.staff,
        });
    } catch (error) {
        console.error('Error fetching hospital admin data:', error);
        res.status(500).json({ message: 'Error fetching hospital admin data', error });
    }
};

exports.updateHospitalAdmin = async (req, res) => {
    const hospitalAdminId = req.params.hospitalAdminId;
    const { hospitalName, location, email, phoneNumber, password } = req.body;

    try {

        const hospitalAdmin = await HospitalAdmin.findByPk(hospitalAdminId, {
            include: User,
        });

        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'Hospital Admin not found' });
        }

        if (hospitalName) hospitalAdmin.hospitalName = hospitalName;
        if (location) hospitalAdmin.location = location;
        await hospitalAdmin.save();

        const user = hospitalAdmin.User;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        await user.save();

        res.status(200).json({
            message: 'Hospital Admin updated successfully',
            hospitalAdmin,
            user,
        });
    } catch (error) {
        console.error('Error updating Hospital Admin:', error);
        res.status(500).json({ message: 'Error updating Hospital Admin', error });
    }
};

exports.removeHospitalAdmin = async (req, res) => {
    const hospitalAdminId = req.params.hospitalAdminId;

    try {

        const hospitalAdmin = await HospitalAdmin.findByPk(hospitalAdminId, {
            include: User,
        });

        if (!hospitalAdmin) {
            return res.status(404).json({ message: 'Hospital Admin not found' });
        }

        await hospitalAdmin.User.destroy();

        await hospitalAdmin.destroy();

        res.status(200).json({ message: 'Hospital Admin removed successfully' });
    } catch (error) {
        console.error('Error removing Hospital Admin:', error);
        res.status(500).json({ message: 'Error removing Hospital Admin', error });
    }
};
//........
exports.verifyVendor = async (req, res) => {
    const { username, action } = req.body;

    try {
        const vendor = await Vendor.findOne({ where: { '$User.username$': username }, include: User });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (action === 'approve') {
            vendor.verified = true;
            vendor.rejected = false;
        } else if (action === 'reject') {
            vendor.verified = false;
            vendor.rejected = true;
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await vendor.save();

        res.status(200).json({ message: `Vendor ${action}d successfully` });
    } catch (error) {
        console.error('Error verifying Vendor:', error);
        res.status(500).json({ message: 'Error verifying Vendor', error });
    }
};
//......
exports.getVendorDocumentsById = async (req, res) => {
    const { id } = req.params;

    try {
        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({
            vendorName: vendor.vendorName,
            documentPath: vendor.documentPath,
            verified: vendor.verified,
            rejected: vendor.rejected,
        });
    } catch (error) {
        console.error('Error fetching vendor documents:', error);
        res.status(500).json({ message: 'Error fetching vendor documents', error });
    }
};


exports.getAllVendorDataById = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const vendor = await Vendor.findByPk(vendorId, {
            include: [
                {
                    model: DeliveryPartner,
                    as: 'deliveryPartners',
                    attributes: ['partnerId', 'partnerName', 'licenseNumber'], 
                }
            ]
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({
            vendorId: vendor.vendorId,
            vendorName: vendor.vendorName,
            zipCode: vendor.zipCode,
            location: vendor.location,
            documentPath: vendor.documentPath,
            uploadedDocument: vendor.uploadedDocument,
            verified: vendor.verified,
            rejected: vendor.rejected,
            userId: vendor.userId,
            deliveryPartners: vendor.deliveryPartners.map(partner => ({
                partnerId: partner.partnerId,
                partnerName: partner.partnerName,
                licenseNumber: partner.licenseNumber,
            })),
        });
    } catch (error) {
        console.error('Error fetching vendor data by ID:', error);
        res.status(500).json({ message: 'Error fetching vendor data by ID', error });
    }
};

exports.updateVendor = async (req, res) => {
    const vendorId = req.params.vendorId;
    const { vendorName, location, email, phoneNumber, password } = req.body;

    try {
        const vendor = await Vendor.findByPk(vendorId, {
            include: User,
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (vendorName) vendor.vendorName = vendorName;
        if (location) vendor.location = location;
        await vendor.save();

        const user = vendor.User;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        await user.save();

        res.status(200).json({
            message: 'Vendor updated successfully',
            vendor,
            user,
        });
    } catch (error) {
        console.error('Error updating Vendor:', error);
        res.status(500).json({ message: 'Error updating Vendor', error });
    }
};

exports.removeVendor = async (req, res) => {
    const vendorId = req.params.vendorId;

    try {
        const vendor = await Vendor.findByPk(vendorId, {
            include: User,
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        await vendor.User.destroy();

        await vendor.destroy();

        res.status(200).json({ message: 'Vendor removed successfully' });
    } catch (error) {
        console.error('Error removing Vendor:', error);
        res.status(500).json({ message: 'Error removing Vendor', error });
    }
};

exports.getAllNormalUserData = async (req, res) => {
    try {
        const normalUsers = await NormalUser.findAll();

        if (!normalUsers.length) {
            return res.status(404).json({ message: 'No normal users found' });
        }

        res.status(200).json(normalUsers.map(user => ({
            id: user.id,
            fullName: user.fullName,
            address: user.address,
            email: user.email,
            phoneNumber: user.phoneNumber,
        })));
    } catch (error) {
        console.error('Error fetching Normal User data:', error);
        res.status(500).json({ message: 'Error fetching Normal User data', error });
    }
};

exports.getNormalUserDataById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await NormalUser.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Normal User not found' });
        }

        res.status(200).json({
            id: user.id,
            fullName: user.fullName,
            address: user.address,
            email: user.email,
            phoneNumber: user.phoneNumber,
        });
    } catch (error) {
        console.error('Error fetching Normal User data by ID:', error);
        res.status(500).json({ message: 'Error fetching Normal User data by ID', error });
    }
};

exports.updateNormalUser = async (req, res) => {
    const userId = req.params.id;
    const { fullName, address, email, phoneNumber } = req.body;

    try {
        const user = await NormalUser.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Normal User not found' });
        }

        if (fullName) user.fullName = fullName;
        if (address) user.address = address;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        await user.save();

        res.status(200).json({
            message: 'Normal User updated successfully',
            user,
        });
    } catch (error) {
        console.error('Error updating Normal User:', error);
        res.status(500).json({ message: 'Error updating Normal User', error });
    }
};

exports.getAllInventoryLevelsOfHospital = async (req, res) => {
    try {
        const inventories = await Inventory.findAll({
            where: { quantity: { [Op.lte]: 4 } }, 
            order: [['quantity', 'ASC']]
        });
        res.status(200).json({ data: inventories });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving inventory levels', error });
    }
};

exports.getInventoryLevelsOfHospitalById = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const inventory = await Inventory.findAll({ where: { hospitalId } });
        res.status(200).json({ data: inventory });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving inventory levels', error });
    }
};

exports.getAllOrderDetailsOfVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const orders = await Order.findAll({ where: { vendorId } });
        res.status(200).json({ data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order details', error });
    }
};

exports.getOrderDetailsOfVendorById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (order) {
            res.status(200).json({ data: order });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order details', error });
    }
};

exports.generateSystemReport = async (req, res) => {
    try {
        const report = {
            totalAdmins: await Admin.count(),
            totalHospitals: await HospitalAdmin.count(),
            totalVendors: await Vendor.count(),
            totalNormalUsers: await NormalUser.count(),
            totalOrders: await Order.count(),
            totalInventory: await Inventory.count(),
            lowInventoryItems: await Inventory.count({ where: { quantity: { [Op.lte]: 4 } } }),
        };
        res.status(200).json({ message: 'System report generated successfully', data: report });
    } catch (error) {
        res.status(500).json({ message: 'Error generating system report', error });
    }
};
