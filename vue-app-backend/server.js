require('dotenv').config();
const express = require('express');
const http = require('http');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const { Server } = require('socket.io');
const server = http.createServer(app);
const db = require('./config/db')
const rateLimit = require('express-rate-limit');
const pgSession = require('connect-pg-simple')(session);
const { requireAuth } = require("./config/middleware");

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST"],
    },
    path: "/socket.io",
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Database connection status
let dbConnected = false;
let dbResult = null;

async function initializeDatabase() {
    const result = await db.initialize();
    dbConnected = result.connected;
    dbResult = result;

    if (result.connected) {
        console.log('🎉 Database ready - all tables, indexes, and constraints verified');
    } else {
        console.log(`📍 Server mode: ${result.mode.toUpperCase()}`);
    }

    return result;
}

// Initialize database FIRST before setting up server
async function startServer() {
    console.log('🔍 Checking database connection...');

    // Try to connect to database first
    await initializeDatabase();

    // Now proceed with server setup based on ACTUAL database state
    console.log(`💾 Database Status: ${dbConnected ? '✅ Connected' : '❌ Idle Mode'}`);


    app.use((req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

        res.setHeader(
            "Content-Security-Policy",
            `default-src 'self'; connect-src 'self' * https://*.firebaseio.com https://*.firebaseapp.com; script-src 'self' 'unsafe-inline'; img-src 'self'; style-src 'self';`
        );
        next();
    });

    // CORS configuration for Angular frontend
    app.use(cors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://app.vueApp.com'] : ['http://192.168.0.111:8080'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use("/public", express.static(path.join(__dirname, "public")));

    app.use(bodyParser.json({ limit: "50mb" }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10000,
    });
    app.use(limiter);

    // Body parsing middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Set timeout for requests to prevent hanging
    app.use((req, res, next) => {
        req.setTimeout(300000);
        res.setTimeout(300000);
        next();
    });

    const sessionConfig = {
        secret: process.env.SESSION_SECRET || 'vue-app-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    };

    // Only use PostgreSQL session store if database is connected
    if (dbConnected && db.isConnected()) {
        sessionConfig.store = new pgSession({
            pool: db.getPool(),
            tableName: 'user_sessions'
        });
        console.log('📊 Using PostgreSQL session store');
    } else {
        console.log('📊 Using memory session store (development only)');
    }

    app.use(session(sessionConfig));

    // Static files with proper MIME type configuration
    app.use(express.static('public', {
        setHeaders: (res, path, stat) => {
            if (path.endsWith('.svg')) {
                res.type('image/svg+xml');
            }
        }
    }));

    // Middleware to check database connection for API routes
    app.use('/api', (req, res, next) => {
        if (!dbConnected) {
            return res.status(503).json({
                error: 'Service temporarily unavailable',
                message: 'Database not connected - server running in idle mode',
                suggestion: 'Please check database configuration and restart the service'
            });
        }
        next();
    });

    // API Routes - Always mount auth routes (they handle DB checks internally)
    try {
        app.use('/api/auth', require('./api/auth'));

        console.log('✅ API routes loaded successfully');
    } catch (error) {
        console.log('⚠️  Error loading API routes:', error);
    }


    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong!!!!' });
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0'; // Bind to all network interfaces

    server.listen(PORT, HOST, () => {
        console.log('🚀 ===== Vue App Server Started =====');
        console.log(`🔥 Server running on ${HOST}:${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📁 Static files served from public/`);
        console.log(`🔌 Socket.io ready for real-time updates`);
        console.log(`💾 Database: ${dbConnected ? '✅ Connected' : '❌ Idle Mode'}`);
        console.log('========================================');

        if (!dbConnected) {
            console.log('');
            console.log('⚠️  NOTICE: Server is running in IDLE MODE');
            console.log('📌 To enable full functionality:');
            console.log('   1. Set up PostgreSQL database');
            console.log('   2. Configure DB_PASSWORD or DATABASE_URL');
            console.log('   3. Restart the server');
            console.log('');
        }
    });
}

// Start the server
startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

module.exports = { io, server };