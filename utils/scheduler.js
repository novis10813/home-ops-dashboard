import { trackServices } from '../services/responseTime.js';

/**
 * Start background monitoring tasks
 */
export function startMonitoring(interval = 60000) {
    console.log(`🔄 Starting monitoring scheduler (interval: ${interval}ms)`);

    // Track service response times every minute
    setInterval(async () => {
        try {
            await trackServices();
            console.log('✓ Service response times updated');
        } catch (error) {
            console.error('Error in monitoring scheduler:', error);
        }
    }, interval);

    // Run initial check immediately
    trackServices().catch(err => console.error('Initial service check failed:', err));
}
