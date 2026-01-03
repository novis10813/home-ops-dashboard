import { useState } from 'react';
import ContainersTab from './services/ContainersTab';
import PortsTab from './services/PortsTab';
import ResponseTimeTab from './services/ResponseTimeTab';

function Services() {
    const [activeTab, setActiveTab] = useState('containers');

    return (
        <div>
            <div className="page-header">
                <h2>Services</h2>
                <p>容器、Port 和服務監控</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'containers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('containers')}
                >
                    Containers
                </button>
                <button
                    className={`tab-button ${activeTab === 'ports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ports')}
                >
                    Ports
                </button>
                <button
                    className={`tab-button ${activeTab === 'response-time' ? 'active' : ''}`}
                    onClick={() => setActiveTab('response-time')}
                >
                    Response Time
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'containers' && <ContainersTab />}
                {activeTab === 'ports' && <PortsTab />}
                {activeTab === 'response-time' && <ResponseTimeTab />}
            </div>
        </div>
    );
}

export default Services;
