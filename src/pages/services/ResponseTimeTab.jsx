import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getResponseTimes } from '../../services/monitoringApi';

function ResponseTimeTab() {
    const [responseTimes, setResponseTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const data = await getResponseTimes();
                setResponseTimes(data.response_times || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
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
                    <strong>無法載入回應時間資訊</strong>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{error}</p>
                </div>
            </div>
        );
    }

    const successCount = responseTimes.filter(rt => rt.success).length;
    const avgResponseTime = responseTimes
        .filter(rt => rt.success)
        .reduce((sum, rt) => sum + rt.duration, 0) / (successCount || 1);

    return (
        <div>
            {/* Summary Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Activity />
                    </div>
                    <div className="stat-info">
                        <h3>{responseTimes.length}</h3>
                        <p>Monitored Services</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckCircle />
                    </div>
                    <div className="stat-info">
                        <h3>{successCount}</h3>
                        <p>Healthy</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <XCircle />
                    </div>
                    <div className="stat-info">
                        <h3>{responseTimes.length - successCount}</h3>
                        <p>Failed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon info">
                        <Activity />
                    </div>
                    <div className="stat-info">
                        <h3>{Math.round(avgResponseTime)}ms</h3>
                        <p>Avg Response</p>
                    </div>
                </div>
            </div>

            {/* Service List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">服務回應時間</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        每 30 秒自動更新
                    </p>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>服務名稱</th>
                                <th>URL</th>
                                <th>回應時間</th>
                                <th>狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {responseTimes.map((rt, idx) => (
                                <tr key={idx}>
                                    <td><strong>{rt.name}</strong></td>
                                    <td>
                                        <code style={{ fontSize: '0.75rem' }}>{rt.url}</code>
                                    </td>
                                    <td>
                                        {rt.success ? (
                                            <span style={{ color: 'var(--success)' }}>
                                                {rt.duration}ms
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {rt.success ? (
                                            <span className="status-badge healthy">
                                                <CheckCircle size={14} />
                                                Success
                                            </span>
                                        ) : (
                                            <span className="status-badge unhealthy">
                                                <XCircle size={14} />
                                                Failed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ResponseTimeTab;
