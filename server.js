import express from 'express';
import Docker from 'dockerode';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

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

// Docker API: Get containers
app.get('/api/docker/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });
        res.json({
            containers: containers.map(c => ({
                id: c.Id.substring(0, 12),
                name: c.Names[0]?.replace('/', ''),
                image: c.Image,
                state: c.State,
                status: c.Status,
                ports: c.Ports,
            }))
        });
    } catch (error) {
        console.error('Error fetching containers:', error);
        res.status(500).json({ error: error.message });
    }
});

// Docker API: Get port mappings
app.get('/api/docker/ports', async (req, res) => {
    try {
        const containers = await docker.listContainers();
        const portsMap = new Map(); // Use Map to deduplicate by container+port

        for (const container of containers) {
            const containerName = container.Names[0]?.replace('/', '');
            for (const port of container.Ports || []) {
                if (port.PublicPort) {
                    // Skip IPv6 addresses (::) to avoid duplicates
                    if (port.IP === '::') continue;

                    // Create unique key for deduplication
                    const key = `${containerName}-${port.PublicPort}-${port.PrivatePort}`;

                    // Only add if not already present (prefer specific IPs over 0.0.0.0)
                    if (!portsMap.has(key) || (port.IP && port.IP !== '0.0.0.0')) {
                        portsMap.set(key, {
                            container_name: containerName,
                            container_id: container.Id.substring(0, 12),
                            private_port: port.PrivatePort,
                            public_port: port.PublicPort,
                            protocol: port.Type,
                            ip: port.IP || '0.0.0.0',
                        });
                    }
                }
            }
        }

        // Convert Map to array and sort by public port
        const ports = Array.from(portsMap.values());
        ports.sort((a, b) => a.public_port - b.public_port);

        res.json({ ports });
    } catch (error) {
        console.error('Error fetching ports:', error);
        res.status(500).json({ error: error.message });
    }
});

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
});
