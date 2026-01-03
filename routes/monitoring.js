import express from 'express';
import { checkContainersHealth, getContainerStats } from '../services/healthCheck.js';
import { getPiholeStats, checkPiholeDNS } from '../services/piholeMonitor.js';
import { trackServices, getLatestResponseTimes, getResponseTimeData } from '../services/responseTime.js';
import { sendDiscordNotification, sendHealthAlert, sendServiceDownAlert } from '../services/discord.js';

const router = express.Router();

// Container health check
router.get('/health', async (req, res) => {
    try {
        const health = await checkContainersHealth();
        res.json({ health });
    } catch (error) {
        console.error('Error in /health:', error);
        res.status(500).json({ error: error.message });
    }
});

// Container resource stats
router.get('/resources', async (req, res) => {
    try {
        const stats = await getContainerStats();
        res.json({ stats });
    } catch (error) {
        console.error('Error in /resources:', error);
        res.status(500).json({ error: error.message });
    }
});

// Pi-hole statistics
router.get('/pihole/stats', async (req, res) => {
    try {
        const stats = await getPiholeStats();
        res.json(stats);
    } catch (error) {
        console.error('Error in /pihole/stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Pi-hole DNS check
router.get('/pihole/dns', async (req, res) => {
    try {
        const dnsCheck = await checkPiholeDNS();
        res.json(dnsCheck);
    } catch (error) {
        console.error('Error in /pihole/dns:', error);
        res.status(500).json({ error: error.message });
    }
});

// Latest response times
router.get('/response-times', async (req, res) => {
    try {
        const latest = getLatestResponseTimes();
        res.json({ response_times: latest });
    } catch (error) {
        console.error('Error in /response-times:', error);
        res.status(500).json({ error: error.message });
    }
});

// Historical response time data
router.get('/response-times/history', async (req, res) => {
    try {
        const history = getResponseTimeData();
        res.json({ history });
    } catch (error) {
        console.error('Error in /response-times/history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send test notification
router.post('/notify/test', async (req, res) => {
    try {
        const { webhookUrl, message } = req.body;

        if (!webhookUrl) {
            return res.status(400).json({ error: 'webhookUrl is required' });
        }

        const result = await sendDiscordNotification(
            webhookUrl,
            message || 'Test notification from Home Ops Dashboard',
            { title: '🧪 Test Notification', color: 0x4caf50 }
        );

        res.json(result);
    } catch (error) {
        console.error('Error in /notify/test:', error);
        res.status(500).json({ error: error.message });
    }
});

// Trigger manual service check (useful for testing)
router.post('/check-services', async (req, res) => {
    try {
        const results = await trackServices();
        res.json({ results });
    } catch (error) {
        console.error('Error in /check-services:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
