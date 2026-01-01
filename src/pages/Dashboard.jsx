import { useState, useEffect } from 'react';
import { Key, Database, Archive, Plug, AlertCircle } from 'lucide-react';
import { getSystemStatus } from '../services/gatewayApi';
import { getPortMappings } from '../services/dockerApi';

function Dashboard() {
    const [status, setStatus] = useState(null);
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch gateway status
                const statusData = await getSystemStatus();
                setStatus(statusData);

                // Try to fetch port mappings (may fail if Docker API not available)
                try {
                    const portData = await getPortMappings();
                    setPorts(portData.ports || []);
                } catch (e) {
                    console.warn('Port data not available:', e);
                    setPorts([]);
                }
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

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Home Server 狀態總覽</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Key />
                    </div>
                    <div className="stat-info">
                        <h3>{status?.total_active_keys || 0}</h3>
                        <p>Active API Keys</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <Database />
                    </div>
                    <div className="stat-info">
                        <h3>{status?.database_keys_count || 0}</h3>
                        <p>Database Keys</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <Archive />
                    </div>
                    <div className="stat-info">
                        <h3>{status?.legacy_keys_count || 0}</h3>
                        <p>Legacy Keys</p>
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
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">系統資訊</h3>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td style={{ color: 'var(--text-secondary)' }}>Client IP</td>
                            <td>{status?.client_ip || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-secondary)' }}>使用 Legacy Keys</td>
                            <td>{status?.use_legacy_api_keys ? '是' : '否'}</td>
                        </tr>
                        <tr>
                            <td style={{ color: 'var(--text-secondary)' }}>API Key 資料庫</td>
                            <td><code>{status?.api_key_db_file || 'N/A'}</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
