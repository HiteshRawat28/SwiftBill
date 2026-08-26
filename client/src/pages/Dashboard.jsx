import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import RoleGuard from '../components/common/RoleGuard';
import apiClient from '../api/apiClient';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [adminTestResult, setAdminTestResult] = useState('');

  const testAdminRoute = async () => {
    try {
      const response = await apiClient.get('/auth/admin-only');
      setAdminTestResult(response.data.message);
    } catch (err) {
      setAdminTestResult(err.response?.data?.error?.message || 'Failed to access route');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>
      
      <div className="card">
        <h2>Welcome back!</h2>
        <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
          You are logged in as <strong>{user?.email}</strong> with role <strong>{user?.role}</strong>.
        </p>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexDirection: 'column' }}>
        <RoleGuard allowedRoles={['Admin']}>
          <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
            <h3>👑 Admin Actions</h3>
            <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              This card is wrapped in a <code>&lt;RoleGuard allowedRoles={['Admin']}&gt;</code>. You can only see this because you are an Admin.
            </p>
            <button className="btn-primary" onClick={testAdminRoute}>
              Test Backend Admin Route
            </button>
            {adminTestResult && (
              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--color-bg-main)', borderRadius: '4px', fontSize: '14px' }}>
                {adminTestResult}
              </div>
            )}
          </div>
        </RoleGuard>

        <RoleGuard allowedRoles={['Admin', 'Accountant']}>
          <div className="card" style={{ borderColor: 'var(--color-success)' }}>
            <h3>📝 Accountant Actions</h3>
            <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              This section is visible to Admins and Accountants. Viewers cannot see this. (e.g. Create Invoice button)
            </p>
          </div>
        </RoleGuard>

        <RoleGuard allowedRoles={['Admin', 'Accountant', 'Viewer']}>
          <div className="card" style={{ borderColor: 'var(--color-border)' }}>
            <h3>👀 Viewer Actions</h3>
            <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              This section is visible to everyone (Admin, Accountant, Viewer). (e.g. View Reports)
            </p>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
};

export default Dashboard;
