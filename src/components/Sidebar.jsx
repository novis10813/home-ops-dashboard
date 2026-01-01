import { NavLink } from 'react-router-dom';

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🏠</div>
                <h1>Home Ops</h1>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                    <span className="nav-link-icon">📊</span>
                    Dashboard
                </NavLink>
                <NavLink to="/api-keys" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon">🔑</span>
                    API Keys
                </NavLink>
                <NavLink to="/ports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-link-icon">🔌</span>
                    Ports
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;
