import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { LayoutDashboard, Package, FileText, Users, LogOut, BarChart3 } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, token, logout } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/parties', label: 'Parties', icon: Users },
    { path: '/transactions', label: 'Transactions', icon: FileText },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SwiftBill</h2>
          <div className="user-badge">{user?.role}</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle both / and /dashboard matching
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
