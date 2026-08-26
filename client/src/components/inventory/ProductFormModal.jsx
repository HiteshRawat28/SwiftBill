import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createProduct, updateProduct, getCategories, createCategory, getUnits, createUnit } from '../../api/inventoryApi';

const ProductFormModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unitId: '',
    price: '',
    stockQuantity: 0,
    lowStockThreshold: 5
  });

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  // Inline creation states
  const [newCatName, setNewCatName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewUnit, setShowNewUnit] = useState(false);

  useEffect(() => {
    fetchLookups();
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        unitId: product.unitId,
        price: (product.price / 100).toString(),
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold
      });
    }
  }, [product]);

  const fetchLookups = async () => {
    const cats = await getCategories();
    const uns = await getUnits();
    setCategories(cats);
    setUnits(uns);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const cat = await createCategory({ name: newCatName });
      setCategories([...categories, cat]);
      setFormData(prev => ({ ...prev, categoryId: cat.id }));
      setShowNewCat(false);
      toast.success('Category added successfully');
      setNewCatName('');
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      const un = await createUnit({ name: newUnitName });
      setUnits([...units, un]);
      setFormData(prev => ({ ...prev, unitId: un.id }));
      setShowNewUnit(false);
      toast.success('Unit added successfully');
      setNewUnitName('');
    } catch (err) {
      toast.error('Failed to add unit');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        categoryId: parseInt(formData.categoryId),
        unitId: parseInt(formData.unitId),
        price: Math.round(parseFloat(formData.price) * 100), // convert to paise
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      };

      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
        toast.success('Product added successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to save product');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '16px' }}>{product ? 'Edit Product' : 'Add Product'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Name</label>
            <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>SKU (Unique)</label>
            <input type="text" className="input-field" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Category</label>
            {!showNewCat ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="input-field" required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowNewCat(true)} className="btn-primary" style={{ padding: '8px' }}>+</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" placeholder="New Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                <button type="button" onClick={handleAddCategory} className="btn-primary">Add</button>
                <button type="button" onClick={() => setShowNewCat(false)} style={{ padding: '8px', cursor: 'pointer', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)' }}>Cancel</button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Unit</label>
            {!showNewUnit ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="input-field" required value={formData.unitId} onChange={e => setFormData({...formData, unitId: e.target.value})}>
                  <option value="">Select Unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowNewUnit(true)} className="btn-primary" style={{ padding: '8px' }}>+</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" placeholder="New Unit Name" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} />
                <button type="button" onClick={handleAddUnit} className="btn-primary">Add</button>
                <button type="button" onClick={() => setShowNewUnit(false)} style={{ padding: '8px', cursor: 'pointer', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text)' }}>Cancel</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Price (₹)</label>
              <input type="number" step="0.01" min="0" className="input-field" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Current Stock</label>
              <input type="number" min="0" className="input-field" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Low Stock Alert Threshold</label>
            <input type="number" min="0" className="input-field" required value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
