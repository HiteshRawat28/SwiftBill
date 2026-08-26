import React, { useState, useEffect } from 'react';
import { createParty, updateParty } from '../../api/partyApi';

// Standard list of Indian States for GST calculations
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const PartyFormModal = ({ party, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Customer',
    email: '',
    phone: '',
    address: '',
    state: '',
    gstin: '',
    balance: 0
  });

  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name,
        type: party.type,
        email: party.email || '',
        phone: party.phone || '',
        address: party.address || '',
        state: party.state,
        gstin: party.gstin || '',
        balance: party.balance / 100 // convert paise to rupees for input
      });
    }
  }, [party]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        gstin: formData.gstin,
        balance: Math.round(parseFloat(formData.balance) * 100)
      };

      if (party) {
        await updateParty(party.id, payload);
      } else {
        await createParty(payload);
      }
      onClose();
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to save party');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '16px' }}>{party ? 'Edit Party' : 'Add Party'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Name</label>
              <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Type</label>
              <select className="input-field" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
              <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Phone</label>
              <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>State (Required for GST)</label>
            <select className="input-field" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Address</label>
            <input type="text" className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>GSTIN</label>
              <input type="text" className="input-field" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} placeholder="e.g. 27AAAAA0000A1Z5" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Opening Balance (₹)</label>
              <input type="number" step="0.01" className="input-field" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                +ve = Receivable, -ve = Payable
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {party ? 'Save Changes' : 'Add Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyFormModal;
