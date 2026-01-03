import { useState } from 'react';
import { Bell } from 'lucide-react';
import { sendTestNotification } from '../services/monitoringApi';

function Settings() {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState('');

    async function handleTestNotification() {
        if (!webhookUrl) {
            setMessage('請輸入 Webhook URL');
            return;
        }

        setTesting(true);
        setMessage('');

        try {
            const result = await sendTestNotification(
                webhookUrl,
                'Test notification from Home Ops Dashboard 🚀'
            );

            if (result.success) {
                setMessage('✅ 通知發送成功！請檢查你的 Discord 頻道。');
            } else {
                setMessage(`❌ 發送失敗：${result.error}`);
            }
        } catch (error) {
            setMessage(`❌ 錯誤：${error.message}`);
        } finally {
            setTesting(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h2>Settings</h2>
                <p>系統設定</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Bell size={20} style={{ marginRight: '0.5rem' }} />
                        Discord 通知設定
                    </h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                        }}>
                            Webhook URL
                        </label>
                        <input
                            type="text"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem'
                            }}
                        />
                        <p style={{
                            marginTop: '0.5rem',
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)'
                        }}>
                            在 Discord 伺服器設定中建立 Webhook，然後貼上 URL
                        </p>
                    </div>

                    <button
                        onClick={handleTestNotification}
                        disabled={!webhookUrl || testing}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: webhookUrl && !testing ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: webhookUrl && !testing ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: webhookUrl && !testing ? 'pointer' : 'not-allowed',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}
                    >
                        {testing ? '發送中...' : '測試通知'}
                    </button>

                    {message && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: message.startsWith('✅') ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: message.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
                            fontSize: '0.875rem'
                        }}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
