// Docker API Service - Connects to Docker daemon for container/port info
const DOCKER_API_URL = import.meta.env.VITE_DOCKER_API_URL || '/api/docker';

export async function getContainers() {
    const response = await fetch(`${DOCKER_API_URL}/containers`);
    if (!response.ok) {
        throw new Error(`Failed to fetch containers: ${response.statusText}`);
    }
    return response.json();
}

export async function getPortMappings() {
    const response = await fetch(`${DOCKER_API_URL}/ports`);
    if (!response.ok) {
        throw new Error(`Failed to fetch port mappings: ${response.statusText}`);
    }
    return response.json();
}
