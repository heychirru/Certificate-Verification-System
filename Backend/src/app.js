const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');


const connectDB = require('./config/db');
const { scheduleCleanupJob, runCleanupNow } = require('./utils/cleanupUnverifiedUsers');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

const app = express();

// Connect to database
connectDB();

// Schedule cleanup job for unverified users with expired tokens
scheduleCleanupJob();

// Run cleanup immediately on startup
runCleanupNow();

// Security headers first — applied to every response including parse errors
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Default JSON parser (honours Content-Type: application/json)
const jsonStrict = express.json({ limit: '10kb' });
// Auth POSTs: parse as JSON even when Content-Type is missing (REST Client, some proxies)
const jsonAuthLenient = express.json({ limit: '10kb', type: '*/*' });

app.use((req, res, next) => {
  const authWrite =
    req.path.startsWith('/api/auth') && ['POST', 'PUT', 'PATCH'].includes(req.method);
  const ct = (req.headers['content-type'] || '').toLowerCase();
  const skipLenient =
    ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data');

  if (authWrite && !skipLenient) {
    return jsonAuthLenient(req, res, next);
  }
  return jsonStrict(req, res, next);
});
// Sanitize body and params to block NoSQL injection ($ and . keys)
const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        }
    }
};
app.use((req, res, next) => {
    sanitize(req.body);
    sanitize(req.params);
    next();
});

// Validate CLIENT_URL at startup — fail fast rather than silently allowing all origins
if (!process.env.CLIENT_URL) {
    throw new Error('Set CLIENT_URL in your .env file');
}

// Build list of allowed origins from env, stripping any trailing slashes
const allowedOrigins = [
    process.env.CLIENT_URL?.replace(/\/+$/, ''),
    'https://certificate-verified-system.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
].filter(Boolean);

console.log('✅ Allowed CORS Origins:', allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/certificate', certificateRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ error: `${field} already in use` });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: 'Validation Error', details: messages });
    }

    const status = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

    res.status(status).json({ error: message });
});

module.exports = app;