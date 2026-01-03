import { useState, useEffect } from 'react';
import { Server, AlertCircle, Activity } from 'lucide-react';
import { getContainerHealth, getResourceStats } from '../../services/monitoringApi';

function ContainersTab() {
    const [containers, setContainers] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const [healthData, resourceData] = await Promise.all([
                    getContainerHealth(),
                    getResourceStats().catch(() => ({ stats: [] })) // Optional
                ]);

                setContainers(healthData.health || []);
                setResources(resourceData.stats || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                載入中...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <AlertCircle />
                <div>
                    <strong>無法載入容器資訊</strong>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{error}</p>
                </div>
            </div>
        );
    }

    const healthyCount = containers.filter(c => c.health === 'healthy').length;
    const unhealthyCount = containers.filter(c => c.health === 'unhealthy').length;
    const runningCount = containers.filter(c => c.running).length;

    return (
        <div>
            {/* Summary Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Server />
                    </div>
                    <div className="stat-info">
                        <h3>{containers.length}</h3>
                        <p>Total Containers</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <Activity />
                    </div>
                    <div className="stat-info">
                        <h3>{runningCount}</h3>
                        <p>Running</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <Activity />
                    </div>
                    <div className="stat-info">
                        <h3>{healthyCount}</h3>
                        <p>Healthy</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <AlertCircle />
                    </div>
                    <div className="stat-info">
                        <h3>{unhealthyCount}</h3>
                        <p>Unhealthy</p>
                    </div>
                </div>
            </div>

            {/* Container List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">容器列表</h3>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>容器名稱</th>
                                <th>狀態</th>
                                <th>健康</th>
                                <th>重啟次數</th>
                                {resources.length > 0 && (
                                    <>
                                        <th>CPU</th>
                                        <th>Memory</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {containers.map((container) => {
                                const resource = resources.find(r => r.name === container.name);
                                return (
                                    <tr key={container.id}>
                                        <td><strong>{container.name}</strong></td>
                                        <td>
                                            <span className={`status-badge ${container.running ? 'success' : 'danger'}`}>
                                                {container.state}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${container.health === 'healthy' ? 'healthy' :
                                                    container.health === 'unhealthy' ? 'unhealthy' : 'none'
                                                }`}>
                                                {container.health}
                                            </span>
                                        </td>
                                        <td>{container.restartCount}</td>
                                        {resources.length > 0 && (
                                            <>
                                                <td>{resource ? `${resource.cpu_percent}%` : '-'}</td>
                                                <td>{resource ? `${resource.memory_usage} MB` : '-'}</td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ContainersTab;
