const crypto = require("crypto");

// Function to generate a random verification token
function generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
}

// Define status codes
const statusCode = {
    SUCCESS: {
        code: 200,
        message: "OK",
    },
    NOT_MODIFIED: { 
        code: 304,
        message: "Not Modified"
    },
    BAD_REQUEST: {
        code: 400,
        message: "Bad Request",
    },
    UNAUTHORIZED: {
        code: 401,
        message: "Unauthorized",
    },
    FORBIDDEN: {
        code: 403,
        message: "Forbidden",
    },
    INTERNAL_SERVER_ERROR: {
        code: 500,
        message: "Internal Server Error",
    }
};

module.exports = {
    generateVerificationToken,   // Keep the function reference, not invocation
    statusCode,
};