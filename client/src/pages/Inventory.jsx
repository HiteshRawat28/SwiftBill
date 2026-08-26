import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from "../api/inventoryApi";
import RoleGuard from "../components/common/RoleGuard";
import ProductFormModal from "../components/inventory/ProductFormModal";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Could not delete product');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh list after add/edit
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Inventory</h1>
        <RoleGuard allowedRoles={['Admin', 'Accountant']}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Add Product</button>
        </RoleGuard>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>SKU</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Category</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Price</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Stock</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</th>
                <RoleGuard allowedRoles={['Admin', 'Accountant']}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </RoleGuard>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No products found. Add one to get started!
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.stockQuantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px' }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{p.sku}</td>
                      <td style={{ padding: '12px 16px' }}>{p.category.name}</td>
                      <td style={{ padding: '12px 16px' }}>₹{(p.price / 100).toFixed(2)} / {p.unit.name}</td>
                      <td style={{ padding: '12px 16px' }}>{p.stockQuantity}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {isLowStock ? (
                          <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            Low Stock
                          </span>
                        ) : (
                          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            In Stock
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
        <ProductFormModal 
          product={editingProduct} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default Inventory;
