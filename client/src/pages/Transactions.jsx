import React, { useState, useEffect } from 'react';
import { getTransactions } from '../../api/transactionApi';
import RoleGuard from '../common/RoleGuard';
import TransactionFormModal from '../transaction/TransactionFormModal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('Sale');

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenModal = (type) => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchTransactions();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Transactions</h1>
        <RoleGuard allowedRoles={['Admin', 'Accountant']}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => handleOpenModal('Sale')} style={{ backgroundColor: 'var(--color-primary)' }}>
              + Record Sale
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal('Purchase')} style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-bg-main)' }}>
              + Record Purchase
            </button>
          </div>
        </RoleGuard>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Party</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Items</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px' }}>{new Date(t.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: t.type === 'Sale' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)', 
                          color: t.type === 'Sale' ? '#4caf50' : '#2196f3'
                        }}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{t.party?.name}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                        {t.lineItems.length} items
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        ₹{(t.totalAmount / 100).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <TransactionFormModal 
          type={transactionType} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default Transactions;
