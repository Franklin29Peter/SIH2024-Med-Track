const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        console.log('Decoded Token:', decoded);

         req.user =  decoded.user;

         console.log('Request User:', req.user);


        next();
    } catch (err) {
        console.error('Token Verification Error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
