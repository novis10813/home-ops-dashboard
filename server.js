import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Import routes
import dockerRoutes from './routes/docker.js';
import monitoringRoutes from './routes/monitoring.js';

// Import utilities
import { startMonitoring } from './utils/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Gateway API URL - uses Docker internal network in production
const GATEWAY_URL = process.env.GATEWAY_API_URL || 'http://gateway:8000';

app.use(cors());
app.use(express.json());

// Proxy /internal requests to Gateway API
app.use('/internal', createProxyMiddleware({
    target: GATEWAY_URL,
    changeOrigin: true,
    // Restore /internal prefix that Express strips when mounting at '/internal'
    pathRewrite: (path, req) => '/internal' + path,
    // v3 API: use 'on' object for event handlers
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${GATEWAY_URL}${proxyReq.path}`);
        },
        error: (err, req, res) => {
            console.error('Gateway proxy error:', err.message);
            res.status(502).json({
                error: 'Gateway unavailable',
                details: err.message
            });
        }
    }
}));

// Serve static files in production
app.use(express.static(join(__dirname, 'dist')));

// API Routes
app.use('/api/docker', dockerRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all other routes (Express 5 compatible)
// Exclude /api and /internal (proxy to gateway)
app.get(/^\/(?!api|internal).*/, (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Dashboard server running on http://localhost:${PORT}`);
    console.log(`📊 Docker API: /api/docker/*`);
    console.log(`🔍 Monitoring API: /api/monitoring/*`);

    // Start background monitoring tasks
    startMonitoring(60000); // Check every 60 seconds
});
