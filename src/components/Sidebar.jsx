import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Key, Plug } from 'lucide-react';

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Home />
                </div>
                <h1>Home Ops</h1>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                    <span className="nav-link-icon"><LayoutDashboard /></span>
                    Dashboard
                </NavLink>
                <NavLink to="/api-keys" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon"><Key /></span>
                    API Keys
                </NavLink>
                <NavLink to="/ports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon"><Plug /></span>
                    Ports
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;
