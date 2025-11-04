// utils/authUtils.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Generate a JWT token
const generateJWTToken = (user, secret, expiresIn = "1h") => {
    return jwt.sign(user, secret, { expiresIn: expiresIn });
};

// Verify JWT token
const verifyJWTToken = (token, secret) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (err) {
        return null;
    }
};

module.exports = {
    generateJWTToken,
    verifyJWTToken
};