import React from 'react';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>
      
      <div className="card">
        <h2>Welcome back!</h2>
        <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
          You are logged in as <strong>{user?.email}</strong> with role <strong>{user?.role}</strong>.
        </p>
        <p style={{ marginTop: '16px' }}>
          This is the foundation for SwiftBill. In the upcoming phases, we will build out the inventory, party ledgers, and GST invoicing features.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
