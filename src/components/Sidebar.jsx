import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Key, Activity, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Home />
                </div>
                {!collapsed && <h1>Home Ops</h1>}
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                    <span className="nav-link-icon"><LayoutDashboard /></span>
                    {!collapsed && <span>Dashboard</span>}
                </NavLink>
                <NavLink to="/api-keys" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon"><Key /></span>
                    {!collapsed && <span>API Keys</span>}
                </NavLink>
                <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon"><Activity /></span>
                    {!collapsed && <span>Services</span>}
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon"><Settings /></span>
                    {!collapsed && <span>Settings</span>}
                </NavLink>
            </nav>

            <button
                className="sidebar-toggle"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
        </aside>
    );
}

export default Sidebar;
