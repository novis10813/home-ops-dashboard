import { useState, useEffect } from 'react';
import { listApiKeys, createApiKey, deactivateApiKey } from '../services/gatewayApi';

function ApiKeys() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newKey, setNewKey] = useState({ name: '', service: '', permissions: [] });
    const [createdKey, setCreatedKey] = useState(null);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await listApiKeys();
            // API returns 'keys' as an object with masked key as property name
            // Convert to array format for rendering
            const keysObj = data.keys || {};
            const keysArray = Object.entries(keysObj).map(([maskedKey, keyData]) => ({
                key_masked: maskedKey,
                is_active: true, // All returned keys are active
                ...keyData,
            }));
            setKeys(keysArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const result = await createApiKey(newKey);
            setCreatedKey(result);
            setNewKey({ name: '', service: '', permissions: [] });
            await fetchKeys();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeactivate = async (key) => {
        if (!window.confirm(`確定要停用 API Key "${key.name}" 嗎？`)) return;
        try {
            setError(null);
            await deactivateApiKey(key.key_masked.replace('...', '*'));
            await fetchKeys();
        } catch (err) {
            setError(err.message);
        }
    };

    const togglePermission = (perm) => {
        setNewKey(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

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
                <h2>API Keys 管理</h2>
                <p>管理 Gateway API 的 API Keys</p>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {createdKey && (
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--success)' }}>
                    <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>✅ API Key 建立成功！</h4>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        請立即複製此 Key，之後將無法再次查看完整內容：
                    </p>
                    <code style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        wordBreak: 'break-all',
                        fontSize: '1rem'
                    }}>
                        {createdKey.api_key}
                    </code>
                    <button
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '1rem' }}
                        onClick={() => {
                            navigator.clipboard.writeText(createdKey.api_key);
                            setCreatedKey(null);
                        }}
                    >
                        📋 複製並關閉
                    </button>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">API Keys 列表</h3>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ➕ 新增 API Key
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>名稱</th>
                                <th>服務</th>
                                <th>權限</th>
                                <th>使用次數</th>
                                <th>狀態</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <div className="empty-state-icon">🔑</div>
                                        目前沒有 API Keys
                                    </td>
                                </tr>
                            ) : (
                                keys.map((key, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <strong>{key.name}</strong>
                                            <br />
                                            <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {key.key_masked}
                                            </code>
                                        </td>
                                        <td>{key.service}</td>
                                        <td>
                                            {key.permissions?.map(p => (
                                                <span key={p} className="badge permission">{p}</span>
                                            ))}
                                        </td>
                                        <td>{key.usage_count || 0}</td>
                                        <td>
                                            <span className={`badge ${key.is_active ? 'active' : 'inactive'}`}>
                                                {key.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            {key.is_active && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeactivate(key)}
                                                >
                                                    停用
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>新增 API Key</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>名稱</label>
                                <input
                                    type="text"
                                    value={newKey.name}
                                    onChange={e => setNewKey({ ...newKey, name: e.target.value })}
                                    placeholder="e.g., WebDAV Service"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>服務</label>
                                <input
                                    type="text"
                                    value={newKey.service}
                                    onChange={e => setNewKey({ ...newKey, service: e.target.value })}
                                    placeholder="e.g., webdav, blog, yt-transcript"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>權限</label>
                                <div className="checkbox-group">
                                    {['read', 'write', 'admin'].map(perm => (
                                        <label key={perm} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={newKey.permissions.includes(perm)}
                                                onChange={() => togglePermission(perm)}
                                            />
                                            {perm}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    建立
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApiKeys;
