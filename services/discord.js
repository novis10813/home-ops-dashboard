/**
 * Send notification to Discord webhook
 */
export async function sendDiscordNotification(webhookUrl, message, options = {}) {
    try {
        const payload = {
            content: options.content || null,
            embeds: [{
                title: options.title || '🏠 Home Server Alert',
                description: message,
                color: options.color || 0xff6b6b, // Red by default
                timestamp: new Date().toISOString(),
                fields: options.fields || [],
            }]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Discord API returned ${response.status}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending Discord notification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send health alert notification
 */
export async function sendHealthAlert(webhookUrl, containerName, status) {
    const message = `Container **${containerName}** is ${status}`;
    return sendDiscordNotification(webhookUrl, message, {
        title: '⚠️ Container Health Alert',
        color: 0xff0000, // Red
        fields: [
            { name: 'Container', value: containerName, inline: true },
            { name: 'Status', value: status, inline: true },
        ]
    });
}

/**
 * Send service down alert
 */
export async function sendServiceDownAlert(webhookUrl, serviceName, error) {
    const message = `Service **${serviceName}** is not responding`;
    return sendDiscordNotification(webhookUrl, message, {
        title: '🚨 Service Down Alert',
        color: 0xff0000, // Red
        fields: [
            { name: 'Service', value: serviceName, inline: true },
            { name: 'Error', value: error || 'Unknown', inline: false },
        ]
    });
}
