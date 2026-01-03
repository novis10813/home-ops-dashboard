// Monitoring API service
const API_BASE = '/api/monitoring';

export async function getContainerHealth() {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('Failed to fetch container health');
    return response.json();
}

export async function getResourceStats() {
    const response = await fetch(`${API_BASE}/resources`);
    if (!response.ok) throw new Error('Failed to fetch resource stats');
    return response.json();
}

export async function getPiholeStats() {
    const response = await fetch(`${API_BASE}/pihole/stats`);
    if (!response.ok) throw new Error('Failed to fetch Pi-hole stats');
    return response.json();
}

export async function getResponseTimes() {
    const response = await fetch(`${API_BASE}/response-times`);
    if (!response.ok) throw new Error('Failed to fetch response times');
    return response.json();
}

export async function sendTestNotification(webhookUrl, message) {
    const response = await fetch(`${API_BASE}/notify/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, message })
    });
    if (!response.ok) throw new Error('Failed to send notification');
    return response.json();
}
