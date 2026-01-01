import { useState, useEffect } from 'react';
import { getPortMappings } from '../services/dockerApi';

function Ports() {
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPorts() {
            try {
                setLoading(true);
                setError(null);
                const data = await getPortMappings();
                setPorts(data.ports || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPorts();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                載入中...
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2>Port 使用狀況</h2>
                <p>視覺化目前 Docker 容器佔用的 Port</p>
            </div>

            {error && (
                <div className="error-message">
                    ❌ 無法取得 Port 資訊: {error}
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        請確認 Docker API 服務正常運行，且已正確掛載 docker.sock。
                    </p>
                </div>
            )}

            {!error && ports.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔌</div>
                        <p>目前沒有偵測到使用中的 Port</p>
                    </div>
                </div>
            )}

            <div className="port-grid">
                {ports.map((port, idx) => (
                    <div key={idx} className="port-card">
                        <div className="port-number">
                            :{port.public_port}
                        </div>
                        <div className="port-info">
                            <h4>{port.container_name}</h4>
                            <p>
                                {port.private_port && `內部端口 ${port.private_port}`}
                                {port.protocol && ` / ${port.protocol.toUpperCase()}`}
                            </p>
                            {port.ip && port.ip !== '0.0.0.0' && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>
                                    僅限 {port.ip}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Port 使用概覽</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>容器</th>
                            <th>外部 Port</th>
                            <th>內部 Port</th>
                            <th>協議</th>
                            <th>綁定 IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ports.map((port, idx) => (
                            <tr key={idx}>
                                <td><strong>{port.container_name}</strong></td>
                                <td>{port.public_port}</td>
                                <td>{port.private_port}</td>
                                <td>{port.protocol?.toUpperCase()}</td>
                                <td>
                                    <code style={{
                                        color: port.ip === '0.0.0.0' ? 'var(--text-secondary)' : 'var(--warning)'
                                    }}>
                                        {port.ip || '0.0.0.0'}
                                    </code>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Ports;
