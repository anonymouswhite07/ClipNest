const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const downloaderRoutes = require('./routes/downloader');
const seoRoutes = require('./data/seoRoutes');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Enforce non-WWW (Canonicalization)
app.use((req, res, next) => {
    if (req.headers.host && req.headers.host.startsWith('www.')) {
        const newHost = req.headers.host.slice(4);
        return res.redirect(301, `https://${newHost}${req.originalUrl}`);
    }
    next();
});

const PORT = process.env.PORT || 5000;

// View Engine (EJS for SSR)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with CDN assets, but recommended to configure properly in full production
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Reject oversized payloads
app.use(morgan('dev'));

// Rate Limiting (Production Security)
// Note: ClipNest does not have auth routes, so we apply strict limits to the heavy extraction API instead.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Stricter limit: 15 requests per 15 minutes per IP
    message: { success: false, message: 'Too many videos fetched. Please wait 15 minutes.' }
});

// Static files with Caching (Performance)
const cacheOptions = {
    maxAge: '1d',
    etag: true
};

// Redirect legacy index.html to root
app.get('/index.html', (req, res) => res.redirect(301, '/'));

app.use(express.static(path.join(__dirname, '../frontend'), cacheOptions));

// Routes (Versioning for future-proofing)
app.use('/api/v1/downloader', apiLimiter, downloaderRoutes);

// SEO Landing Pages Handler
const renderSEOPage = (req, res) => {
    const path = req.path;
    // Map /contact and /faq to the root page data if they don't have their own
    const pageData = seoRoutes[path] || seoRoutes['/'];
    res.render('index', { pageData });
};

// Explicitly handle contact and faq if not in seoRoutes
app.get(['/contact', '/faq'], renderSEOPage);

// Map SEO routes
Object.keys(seoRoutes).forEach(route => {
    app.get(route, renderSEOPage);
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/robots.txt'));
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const HOST = '0.0.0.0';
    app.listen(PORT, HOST, () => {
        console.log(`🚀 ClipNest Production Server Running`);
        console.log(`🔗 Local:   http://localhost:${PORT}`);
        console.log(`📱 Network: Use your computer's IP address on port ${PORT}`);
        console.log(`\nTIP: Use ngrok for HTTPS to test PWA features on mobile!`);
    });
}

module.exports = app;
