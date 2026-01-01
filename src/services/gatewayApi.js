// Gateway API Service - Connects to gateway-api internal endpoints
// In development, Vite proxies /internal/* to localhost:8000
// In production, this should be set to 'http://gateway:8000'
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || '';

export async function getSystemStatus() {
    const response = await fetch(`${GATEWAY_URL}/internal/status`);
    if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
    }
    return response.json();
}

export async function listApiKeys() {
    const response = await fetch(`${GATEWAY_URL}/internal/list-api-keys`);
    if (!response.ok) {
        throw new Error(`Failed to list API keys: ${response.statusText}`);
    }
    return response.json();
}

export async function createApiKey({ name, service, permissions }) {
    const response = await fetch(`${GATEWAY_URL}/internal/generate-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, service, permissions }),
    });
    if (!response.ok) {
        throw new Error(`Failed to create API key: ${response.statusText}`);
    }
    return response.json();
}

export async function deactivateApiKey(apiKey) {
    const response = await fetch(`${GATEWAY_URL}/internal/deactivate-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
    });
    if (!response.ok) {
        throw new Error(`Failed to deactivate API key: ${response.statusText}`);
    }
    return response.json();
}
