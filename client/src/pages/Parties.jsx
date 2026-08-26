import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getParties, deleteParty } from "../api/partyApi";
import RoleGuard from "../components/common/RoleGuard";
import PartyFormModal from "../components/party/PartyFormModal";

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [filter, setFilter] = useState('All');

  const fetchParties = async () => {
    try {
      const data = await getParties();
      setParties(data);
    } catch (error) {
      console.error('Failed to fetch parties', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleEdit = (party) => {
    setEditingParty(party);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      try {
        await deleteParty(id);
        setParties(parties.filter(p => p.id !== id));
        toast.success('Party deleted successfully');
      } catch (error) {
        toast.error('Could not delete party');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingParty(null);
    fetchParties();
  };

  const filteredParties = filter === 'All' ? parties : parties.filter(p => p.type === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Parties (Customers & Suppliers)</h1>
        <RoleGuard allowedRoles={['Admin', 'Accountant']}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Add Party</button>
        </RoleGuard>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {['All', 'Customer', 'Supplier'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              backgroundColor: filter === f ? 'var(--color-primary)' : 'var(--color-bg-main)',
              color: filter === f ? '#fff' : 'var(--color-text)'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>State & GSTIN</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Balance</th>
                <RoleGuard allowedRoles={['Admin', 'Accountant']}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </RoleGuard>
              </tr>
            </thead>
            <tbody>
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No parties found.
                  </td>
                </tr>
              ) : (
                filteredParties.map((p) => {
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {p.email} {p.phone && `| ${p.phone}`}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                          backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-secondary)'
                        }}>
                          {p.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{p.state}</div>
                        {p.gstin && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>GST: {p.gstin}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {p.balance === 0 ? (
                          <span style={{ color: 'var(--color-text-secondary)' }}>₹0.00</span>
                        ) : p.balance > 0 ? (
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                            ₹{(p.balance / 100).toFixed(2)} (Recv)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>
                            ₹{(Math.abs(p.balance) / 100).toFixed(2)} (Pay)
                          </span>
                        )}
                      </td>
                      <RoleGuard allowedRoles={['Admin', 'Accountant']}>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', marginRight: '16px' }}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </RoleGuard>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <PartyFormModal 
          party={editingParty} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default Parties;
