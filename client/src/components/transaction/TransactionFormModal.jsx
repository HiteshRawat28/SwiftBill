import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createTransaction } from '../../api/transactionApi';
import { getParties } from '../../api/partyApi';
import { getProducts } from '../../api/inventoryApi';
import { calculateGST } from '../../utils/gstUtils';
import { requiresEwayBill } from '../../utils/ewaybillUtils';

// Hardcoded for now. In a real app, fetch from a settings API.
const BUSINESS_STATE = 'Maharashtra';

const TransactionFormModal = ({ type, onClose }) => {
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [partyId, setPartyId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    Promise.all([getParties(), getProducts()]).then(([partiesData, productsData]) => {
      const filteredParties = type === 'Sale' 
        ? partiesData.filter(p => p.type === 'Customer')
        : partiesData.filter(p => p.type === 'Supplier');
      setParties(filteredParties);
      setProducts(productsData);
    });
  }, [type]);

  const getSelectedPartyState = () => {
    const p = parties.find(x => x.id === parseInt(partyId));
    return p ? p.state : null;
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    const newItems = [...lineItems];
    newItems[index].productId = productId;
    if (product) {
      newItems[index].unitPrice = (product.price / 100).toFixed(2);
    }
    setLineItems(newItems);
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculatePreview = () => {
    let grandTotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const partyState = getSelectedPartyState();

    lineItems.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const baseTotal = qty * price;
      
      const product = products.find(p => p.id === parseInt(item.productId));
      const gstRate = product ? (product.gstRate || 18) : 18;

      if (partyState) {
        // use paise for math, then convert back
        const tax = calculateGST(BUSINESS_STATE, partyState, baseTotal * 100, gstRate);
        totalCgst += tax.cgst;
        totalSgst += tax.sgst;
        totalIgst += tax.igst;
        grandTotal += baseTotal + (tax.totalTax / 100);
      } else {
        grandTotal += baseTotal;
      }
    });

    return {
      totalCgst: (totalCgst / 100).toFixed(2),
      totalSgst: (totalSgst / 100).toFixed(2),
      totalIgst: (totalIgst / 100).toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        partyId: parseInt(partyId),
        type,
        date: new Date(date).toISOString(),
        lineItems: lineItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          unitPrice: Math.round(parseFloat(item.unitPrice) * 100)
        }))
      };

      await createTransaction(payload);
      toast.success('Transaction recorded successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to record transaction');
    }
  };

  const preview = calculatePreview();
  const showEwayAlert = requiresEwayBill(parseFloat(preview.grandTotal));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Record {type}</h2>
          {showEwayAlert && (
            <div style={{ padding: '6px 12px', backgroundColor: 'var(--color-error)', color: 'white', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}>
              ⚠️ E-Way Bill Required (&gt; ₹50k)
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>{type === 'Sale' ? 'Customer' : 'Supplier'}</label>
              <select className="input-field" required value={partyId} onChange={e => setPartyId(e.target.value)}>
                <option value="">Select {type === 'Sale' ? 'Customer' : 'Supplier'}</option>
                {parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.state})</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Date</label>
              <input type="date" className="input-field" required value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Line Items</h3>
          
          {lineItems.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ flex: 3 }}>
                <select className="input-field" required value={item.productId} onChange={e => handleProductSelect(index, e.target.value)}>
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stockQuantity}, Tax: {p.gstRate || 18}%)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <input type="number" min="1" className="input-field" required placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <input type="number" step="0.01" min="0" className="input-field" required placeholder="Price (₹)" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} />
              </div>
              <div style={{ flex: 1, fontWeight: 600, textAlign: 'right', fontSize: '14px' }}>
                ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>+ GST</div>
              </div>
              <div>
                <button type="button" onClick={() => removeLineItem(index)} disabled={lineItems.length === 1} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', fontSize: '20px', padding: '0 8px' }}>
                  ×
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addLineItem} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, marginTop: '8px' }}>
            + Add Line Item
          </button>

          <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
               {parseFloat(preview.totalIgst) > 0 ? (
                 <div>IGST: ₹{preview.totalIgst}</div>
               ) : (
                 <>
                   <div>CGST: ₹{preview.totalCgst}</div>
                   <div>SGST: ₹{preview.totalSgst}</div>
                 </>
               )}
               <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginTop: '8px' }}>
                 Grand Total: ₹{preview.grandTotal}
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={lineItems.length === 0 || !partyId}>
                Save Transaction
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
