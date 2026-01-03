/**
 * Get Pi-hole statistics from API
 */
export async function getPiholeStats() {
    try {
        // Pi-hole API endpoint
        const response = await fetch('http://pihole:80/admin/api.php?summary');

        if (!response.ok) {
            throw new Error(`Pi-hole API returned ${response.status}`);
        }

        const data = await response.json();

        return {
            status: 'healthy',
            queries_today: data.dns_queries_today || 0,
            blocked_today: data.ads_blocked_today || 0,
            percent_blocked: data.ads_percentage_today || 0,
            domains_blocked: data.domains_being_blocked || 0,
            unique_clients: data.unique_clients || 0,
        };
    } catch (error) {
        console.error('Error fetching Pi-hole stats:', error);
        return {
            status: 'unhealthy',
            error: error.message,
        };
    }
}

/**
 * Check if Pi-hole DNS is responding
 */
export async function checkPiholeDNS() {
    try {
        // Simple check: try to fetch the admin page
        const response = await fetch('http://pihole:80/admin/', {
            method: 'HEAD',
            timeout: 5000,
        });

        return {
            dns_responding: response.ok,
            status_code: response.status,
        };
    } catch (error) {
        return {
            dns_responding: false,
            error: error.message,
        };
    }
}
