import { useState, useEffect } from 'react';
import { Server, Heart, Plug, Key, AlertCircle, Activity, Shield } from 'lucide-react';
import { getSystemStatus } from '../services/gatewayApi';
import { getPortMappings } from '../services/dockerApi';
import { getContainerHealth, getResponseTimes, getPiholeStats } from '../services/monitoringApi';

function Dashboard() {
    const [status, setStatus] = useState(null);
    const [containers, setContainers] = useState([]);
    const [ports, setPorts] = useState([]);
    const [responseTimes, setResponseTimes] = useState([]);
    const [piholeStats, setPiholeStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch all data in parallel
                const [statusData, healthData, portData, responseData, piholeData] = await Promise.all([
                    getSystemStatus(),
                    getContainerHealth().catch(() => ({ health: [] })),
                    getPortMappings().catch(() => ({ ports: [] })),
                    getResponseTimes().catch(() => ({ response_times: [] })),
                    getPiholeStats().catch(() => null)
                ]);

                setStatus(statusData);
                setContainers(healthData.health || []);
                setPorts(portData.ports || []);
                setResponseTimes(responseData.response_times || []);
                setPiholeStats(piholeData);
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
                    <strong>無法連接到服務</strong>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{error}</p>
                </div>
            </div>
        );
    }

    const runningCount = containers.filter(c => c.running).length;
    const healthyCount = containers.filter(c => c.health === 'healthy').length;
    const unhealthyContainers = containers.filter(c => c.health === 'unhealthy' || c.state === 'restarting');
    const successfulServices = responseTimes.filter(rt => rt.success).length;

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Home Server 狀態總覽</p>
            </div>

            {/* Main Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Server />
                    </div>
                    <div className="stat-info">
                        <h3>{runningCount}</h3>
                        <p>Running Containers</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <Heart />
                    </div>
                    <div className="stat-info">
                        <h3>{healthyCount}</h3>
                        <p>Healthy</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon info">
                        <Plug />
                    </div>
                    <div className="stat-info">
                        <h3>{ports.length}</h3>
                        <p>Active Ports</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <Key />
                    </div>
                    <div className="stat-info">
                        <h3>{status?.total_active_keys || 0}</h3>
                        <p>API Keys</p>
                    </div>
                </div>
            </div>

            {/* Container Health Summary */}
            {unhealthyContainers.length > 0 && (
                <div className="card" style={{ marginTop: '2rem', borderLeft: '4px solid var(--danger)' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ color: 'var(--danger)' }}>
                            <AlertCircle size={20} style={{ marginRight: '0.5rem' }} />
                            需要注意的容器
                        </h3>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        {unhealthyContainers.map(container => (
                            <div key={container.id} style={{
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                backgroundColor: 'var(--danger-bg)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <strong>{container.name}</strong>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        狀態: {container.state} | 健康: {container.health}
                                    </p>
                                </div>
                                <span className="status-badge unhealthy">
                                    {container.health}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Service Response Times */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Activity size={18} style={{ marginRight: '0.5rem' }} />
                            服務回應時間
                        </h3>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        {responseTimes.length > 0 ? (
                            responseTimes.map((rt, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 0',
                                    borderBottom: idx < responseTimes.length - 1 ? '1px solid var(--border)' : 'none'
                                }}>
                                    <span style={{ fontWeight: 500 }}>{rt.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {rt.success ? (
                                            <>
                                                <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                                                    {rt.duration}ms
                                                </span>
                                                <span className="status-badge healthy" style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}>
                                                    ✓
                                                </span>
                                            </>
                                        ) : (
                                            <span className="status-badge unhealthy" style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}>
                                                ✗
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>無資料</p>
                        )}
                    </div>
                </div>

                {/* Pi-hole Stats */}
                {piholeStats && piholeStats.status === 'healthy' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Shield size={18} style={{ marginRight: '0.5rem' }} />
                                Pi-hole 統計
                            </h3>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {piholeStats.queries_today?.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    今日查詢數
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                        {piholeStats.blocked_today?.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        已阻擋
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                                        {piholeStats.percent_blocked?.toFixed(1)}%
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        阻擋率
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
