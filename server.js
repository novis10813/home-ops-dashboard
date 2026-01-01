import express from 'express';
import Docker from 'dockerode';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.use(cors());
app.use(express.json());

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
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Dashboard server running on http://localhost:${PORT}`);
});
