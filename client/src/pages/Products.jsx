import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FolderKanban
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api.js';
import { Badge, LoadingState, EmptyState, Modal, ConfirmDialog } from '../components/common/index.js';
import { GlassCard, GlassButton, GlassInput, GlassBadge } from '../components/glass/index.js';

export const Products = ({ onInventoryUpdated }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: 'bags',
    current_stock: '',
    minimum_stock: '5',
  });

  const UNIT_CATEGORIES = {
    'Weight': ['mg', 'g', 'kg', 'quintal', 'tonne', 'ton'],
    'Liquid / Volume': ['ml', 'litre', 'kilolitre'],
    'Count': ['piece', 'unit'],
    'Packaging / Trade': [
      'bag', 'packet', 'box', 'carton', 'bottle', 'can', 'tin', 'jar',
      'bundle', 'sack', 'roll', 'pack', 'crate', 'tray'
    ],
    'Quantity Groups': ['dozen', 'pair', 'set'],
    'Agriculture / Wholesale': ['quintal', 'tonne', 'sack', 'bale'],
  };

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ q: search });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search]);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', unit: 'bags', current_stock: '', minimum_stock: '5' });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      unit: prod.unit,
      current_stock: prod.current_stock.toString(),
      minimum_stock: prod.minimum_stock.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, {
          name: formData.name.trim(),
          unit: formData.unit,
          minimum_stock: parseFloat(formData.minimum_stock),
        });
        if (res.success) {
          notify(`Product "${formData.name}" updated successfully.`);
        }
      } else {
        const res = await createProduct({
          name: formData.name.trim(),
          unit: formData.unit,
          current_stock: parseFloat(formData.current_stock) || 0,
          minimum_stock: parseFloat(formData.minimum_stock) || 5,
        });
        if (res.success) {
          notify(`Product "${formData.name}" created successfully.`);
        }
      }

      setShowModal(false);
      fetchCatalog();
      if (onInventoryUpdated) onInventoryUpdated();
    } catch (err) {
      notify(err.response?.data?.message || 'Error saving product.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      const res = await deleteProduct(deleteCandidate.id);
      if (res.success) {
        notify(res.message);
        setDeleteCandidate(null);
        fetchCatalog();
        if (onInventoryUpdated) onInventoryUpdated();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Define store items, measurement units, and safety stock thresholds</p>
        </div>

        <GlassButton
          onClick={handleOpenCreate}
          icon={Plus}
        >
          New Catalog Item
        </GlassButton>
      </GlassCard>

      {notification && (
        <div className={`p-4 rounded-2xl backdrop-blur-xl flex items-center space-x-2.5 text-sm font-medium shadow-sm animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/80' 
            : 'bg-rose-50/80 text-rose-800 border border-rose-200/80'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Search Toolbar Glass Card */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <GlassInput
            icon={Search}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by name..."
          />
        </div>
        <GlassBadge variant="neutral" size="md">
          Total Products: {products.length}
        </GlassBadge>
      </GlassCard>

      {/* Grid of Product Cards */}
      {loading && products.length === 0 ? (
        <LoadingState message="Loading catalog items..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No products in catalog"
          description={search ? `No results found for "${search}"` : 'Get started by creating your first product.'}
          actionLabel="New Catalog Item"
          actionIcon={Plus}
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">Unit: {p.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(p)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">In Stock</span>
                    <span className="font-extrabold text-slate-900 text-sm">{p.current_stock} {p.unit}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Min Threshold</span>
                    <span className="font-extrabold text-slate-700 text-sm">{p.minimum_stock} {p.unit}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Status</span>
                <Badge variant={p.status} size="sm">
                  {p.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add Catalog Product'}
        subtitle="Configure item details and reorder alert thresholds"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rice, Sugar, Cooking Oil"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unit of Measurement *
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(UNIT_CATEGORIES).map(([category, catUnits]) => (
                <optgroup key={category} label={category}>
                  {catUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {!editingProduct && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum Stock Threshold (For Alerts)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.minimum_stock}
              onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
              placeholder="5"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.name}"? All associated inventory records will be removed.`}
        confirmText="Delete Item"
        variant="danger"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};

export default Products;
