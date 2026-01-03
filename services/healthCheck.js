import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * Check health status of all containers
 */
export async function checkContainersHealth() {
    try {
        const containers = await docker.listContainers();
        const healthStatus = [];

        for (const container of containers) {
            const inspect = await docker.getContainer(container.Id).inspect();
            const name = container.Names[0].replace('/', '');

            healthStatus.push({
                name,
                id: container.Id.substring(0, 12),
                state: inspect.State.Status,
                health: inspect.State.Health?.Status || 'none',
                running: inspect.State.Running,
                restartCount: inspect.RestartCount,
                startedAt: inspect.State.StartedAt,
            });
        }

        return healthStatus;
    } catch (error) {
        console.error('Error checking container health:', error);
        throw error;
    }
}

/**
 * Get container resource stats (CPU, Memory)
 */
export async function getContainerStats() {
    try {
        const containers = await docker.listContainers();

        const statsPromises = containers.map(async (container) => {
            try {
                const containerObj = docker.getContainer(container.Id);
                const stat = await containerObj.stats({ stream: false });

                // Calculate CPU percentage
                const cpuDelta = stat.cpu_stats.cpu_usage.total_usage - stat.precpu_stats.cpu_usage.total_usage;
                const systemDelta = stat.cpu_stats.system_cpu_usage - stat.precpu_stats.system_cpu_usage;
                const cpuPercent = systemDelta > 0 && cpuDelta > 0
                    ? (cpuDelta / systemDelta) * stat.cpu_stats.online_cpus * 100
                    : 0;

                // Calculate memory usage
                const memUsage = stat.memory_stats.usage;
                const memLimit = stat.memory_stats.limit;
                const memPercent = memLimit > 0 ? (memUsage / memLimit) * 100 : 0;

                return {
                    name: container.Names[0].replace('/', ''),
                    id: container.Id.substring(0, 12),
                    cpu_percent: cpuPercent.toFixed(2),
                    memory_usage: (memUsage / 1024 / 1024).toFixed(2), // MB
                    memory_limit: (memLimit / 1024 / 1024).toFixed(2), // MB
                    memory_percent: memPercent.toFixed(2),
                };
            } catch (err) {
                console.warn(`Failed to get stats for container ${container.Names[0]}:`, err.message);
                return null;
            }
        });

        const results = await Promise.allSettled(statsPromises);
        const stats = results
            .filter(r => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);

        return stats;
    } catch (error) {
        console.error('Error getting container stats:', error);
        throw error;
    }
}
