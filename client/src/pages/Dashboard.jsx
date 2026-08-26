import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getDashboardStats } from '../api/reportApi';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalReceivables: 0,
    totalPayables: 0,
    lowStockCount: 0,
    thisMonthSales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (paise) => {
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2>Welcome back, {user?.email}!</h2>
        <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
          Here is a quick overview of your business today.
        </p>
      </div>

      {loading ? (
        <div>Loading metrics...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          
          <div className="card" style={{ borderTop: '4px solid var(--color-success)', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Receivables</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, margin: '12px 0 8px 0' }}>
              {formatCurrency(stats.totalReceivables)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Money owed to you by customers</div>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--color-error)', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Payables</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, margin: '12px 0 8px 0' }}>
              {formatCurrency(stats.totalPayables)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Money you owe to suppliers</div>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--color-primary)', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month's Sales</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, margin: '12px 0 8px 0' }}>
              {formatCurrency(stats.thisMonthSales)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Gross sales since 1st of month</div>
          </div>

          <div className="card" style={{ borderTop: '4px solid #ff9800', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Alerts</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, margin: '12px 0 8px 0' }}>
              {stats.lowStockCount} <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>items</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Products at or below threshold</div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
