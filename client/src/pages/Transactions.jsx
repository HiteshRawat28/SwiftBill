import React, { useState, useEffect } from 'react';
import { getTransactions } from '../../api/transactionApi';
import RoleGuard from '../common/RoleGuard';
import TransactionFormModal from '../transaction/TransactionFormModal';
import { requiresEwayBill } from '../../utils/ewaybillUtils';

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

  const downloadInvoice = async (transactionId, invoiceNumber) => {
    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
    try {
      const response = await fetch(`http://localhost:3000/api/invoices/${transactionId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert('Could not download PDF');
    }
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
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Date & Inv #</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Party</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total Amount</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
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
                  const needsEwayBill = requiresEwayBill(t.totalAmount / 100);
                  
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{new Date(t.date).toLocaleDateString()}</div>
                        {t.invoiceNumber && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{t.invoiceNumber}</div>}
                      </td>
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
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.lineItems.length} items</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ₹{(t.totalAmount / 100).toFixed(2)}
                          {needsEwayBill && (
                            <span style={{ padding: '2px 6px', backgroundColor: 'var(--color-error)', color: 'white', borderRadius: '4px', fontSize: '10px' }}>
                              🚚 E-Way
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {t.type === 'Sale' && (
                          <button onClick={() => downloadInvoice(t.id, t.invoiceNumber)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                            Download PDF
                          </button>
                        )}
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
