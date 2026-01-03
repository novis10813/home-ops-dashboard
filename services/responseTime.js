// In-memory storage for response time data
const responseTimeData = new Map();

/**
 * Measure response time for a single URL
 */
export async function measureResponseTime(url, name) {
    const start = Date.now();
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        const duration = Date.now() - start;
        return {
            name,
            url,
            duration,
            success: true,
            status: response.status,
        };
    } catch (error) {
        const duration = Date.now() - start;
        return {
            name,
            url,
            duration,
            success: false,
            error: error.message,
        };
    }
}

/**
 * Track response times for all monitored services
 */
export async function trackServices() {
    const services = [
        { name: 'Dashboard', url: 'http://dashboard:3000' },
        { name: 'Pi-hole', url: 'http://pihole:80' },
        { name: 'Immich', url: 'http://immich_server:2283' },
        { name: 'Portainer', url: 'http://portainer:9000' },
        { name: 'Nginx', url: 'http://nginx:80' },
    ];

    const results = await Promise.all(
        services.map(s => measureResponseTime(s.url, s.name))
    );

    // Store results with timestamp
    const timestamp = Date.now();
    results.forEach(result => {
        const key = result.name;
        if (!responseTimeData.has(key)) {
            responseTimeData.set(key, []);
        }

        const data = responseTimeData.get(key);
        data.push({ timestamp, ...result });

        // Keep only last 24 hours of data
        const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
        responseTimeData.set(key, data.filter(d => d.timestamp > oneDayAgo));
    });

    return results;
}

/**
 * Get stored response time data
 */
export function getResponseTimeData() {
    const result = {};
    responseTimeData.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}

/**
 * Get latest response times
 */
export function getLatestResponseTimes() {
    const result = [];
    responseTimeData.forEach((data, name) => {
        if (data.length > 0) {
            result.push(data[data.length - 1]);
        }
    });
    return result;
}
