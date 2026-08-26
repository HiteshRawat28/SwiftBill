import React, { useState, useEffect } from 'react';
import { getSalesSummary, getGstLiability, getStockValuation } from '../api/reportApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  
  const [salesData, setSalesData] = useState([]);
  const [gstData, setGstData] = useState({ taxCollected: 0, taxPaid: 0, netLiability: 0 });
  const [stockData, setStockData] = useState({ byCategory: [], grandTotalValue: 0 });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [salesRes, gstRes, stockRes] = await Promise.all([
          getSalesSummary(),
          getGstLiability(),
          getStockValuation()
        ]);
        setSalesData(salesRes);
        setGstData(gstRes);
        setStockData(stockRes);
      } catch (error) {
        console.error('Error fetching reports', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatCurrency = (paise) => {
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const renderSalesChart = () => (
    <div className="card" style={{ height: '400px' }}>
      <h2 style={{ marginBottom: '24px' }}>Sales Summary (Last 30 Days)</h2>
      {salesData.length === 0 ? (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
          No sales data found for the last 30 days.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
            <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Sales (₹)" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  const renderGstLiability = () => (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>GST Liability Summary</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>Tax Collected (Sales)</div>
        <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(gstData.taxCollected)}</div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>Tax Paid (Purchases)</div>
        <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{formatCurrency(gstData.taxPaid)}</div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 16px', backgroundColor: 'var(--color-bg-main)', marginTop: '16px', borderRadius: '8px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Net Liability</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: gstData.netLiability > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
          {formatCurrency(Math.abs(gstData.netLiability))}
          <span style={{ fontSize: '12px', marginLeft: '8px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
            {gstData.netLiability > 0 ? '(To Pay)' : '(Refund/Credit)'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderStockValuation = () => (
    <div className="card">
      <h2 style={{ marginBottom: '24px' }}>Stock Valuation (by Category)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Category</th>
            <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {stockData.byCategory.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No stock data found.
              </td>
            </tr>
          ) : (
            stockData.byCategory.map((cat, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px' }}>{cat.category}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(cat.value)}
                </td>
              </tr>
            ))
          )}
          {stockData.byCategory.length > 0 && (
            <tr style={{ backgroundColor: 'var(--color-bg-main)' }}>
              <td style={{ padding: '16px', fontWeight: 700 }}>Grand Total Valuation</td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)' }}>
                {formatCurrency(stockData.grandTotalValue)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div>Loading reports...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Reports</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setActiveTab('sales')}
          style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: activeTab === 'sales' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeTab === 'sales' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          Sales Summary
        </button>
        <button 
          onClick={() => setActiveTab('gst')}
          style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: activeTab === 'gst' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeTab === 'gst' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          GST Liability
        </button>
        <button 
          onClick={() => setActiveTab('stock')}
          style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: activeTab === 'stock' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: activeTab === 'stock' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          Stock Valuation
        </button>
      </div>

      <div>
        {activeTab === 'sales' && renderSalesChart()}
        {activeTab === 'gst' && renderGstLiability()}
        {activeTab === 'stock' && renderStockValuation()}
      </div>
    </div>
  );
};

export default Reports;
