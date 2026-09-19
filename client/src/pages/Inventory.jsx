import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  PlusCircle, 
  MinusCircle, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  PackageOpen
} from 'lucide-react';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  addStock, 
  removeStock 
} from '../services/api.js';
import { Badge, LoadingState, EmptyState, Modal, ConfirmDialog } from '../components/common/index.js';
import { GlassCard, GlassButton, GlassBadge, GlassInput } from '../components/glass/index.js';

export const Inventory = ({ onInventoryUpdated }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockActionType, setStockActionType] = useState('ADD'); // 'ADD' or 'REMOVE'
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    unit: 'bags',
    current_stock: '',
    minimum_stock: '5',
  });
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const unitsList = [
    'bags',
    'kg',
    'grams',
    'litres',
    'pieces',
    'cartons',
    'dozens',
    'quintals',
  ];

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        q: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [searchQuery, statusFilter]);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await createProduct({
        name: formData.name.trim(),
        unit: formData.unit,
        current_stock: parseFloat(formData.current_stock) || 0,
        minimum_stock: parseFloat(formData.minimum_stock) || 5,
      });
      if (res.success) {
        notify(`Product "${formData.name}" added successfully`);
        setShowAddModal(false);
        setFormData({ name: '', unit: 'bags', current_stock: '', minimum_stock: '5' });
        fetchProductsList();
        if (onInventoryUpdated) onInventoryUpdated();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Product Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const res = await updateProduct(selectedProduct.id, {
        name: formData.name.trim(),
        unit: formData.unit,
        minimum_stock: parseFloat(formData.minimum_stock),
      });
      if (res.success) {
        notify(`Product "${formData.name}" updated successfully`);
        setShowEditModal(false);
        setSelectedProduct(null);
        fetchProductsList();
        if (onInventoryUpdated) onInventoryUpdated();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      const res = await deleteProduct(deleteCandidate.id);
      if (res.success) {
        notify(res.message);
        setDeleteCandidate(null);
        fetchProductsList();
        if (onInventoryUpdated) onInventoryUpdated();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  // Quick Stock Adjustment (+ / -)
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    const qty = parseFloat(stockAdjustmentQty);
    if (isNaN(qty) || qty <= 0) {
      notify('Please enter a valid quantity greater than 0', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: selectedProduct.id,
        quantity: qty,
        unit: selectedProduct.unit,
        source: 'MANUAL',
      };

      const res = stockActionType === 'ADD' 
        ? await addStock(payload) 
        : await removeStock(payload);

      if (res.success) {
        notify(res.message);
        setShowStockModal(false);
        setStockAdjustmentQty('');
        fetchProductsList();
        if (onInventoryUpdated) onInventoryUpdated();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Inventory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">View, update, and manage your shop's stock levels with precision</p>
        </div>

        <GlassButton
          onClick={() => {
            setFormData({ name: '', unit: 'bags', current_stock: '', minimum_stock: '5' });
            setShowAddModal(true);
          }}
          icon={Plus}
        >
          Add New Product
        </GlassButton>
      </GlassCard>

      {/* Notification toast */}
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

      {/* Filters & Search Toolbar Glass Card */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <GlassInput
            icon={Search}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name..."
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Stock' },
            { id: 'in', label: 'In Stock' },
            { id: 'low', label: 'Low Stock' },
            { id: 'out', label: 'Out of Stock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-white/60 hover:bg-white text-slate-600 border border-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button 
            onClick={fetchProductsList} 
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </GlassCard>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && products.length === 0 ? (
          <LoadingState message="Loading inventory products..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No inventory products found"
            description={searchQuery ? `No items matching "${searchQuery}"` : 'No products in this category yet.'}
            actionLabel="Add New Product"
            actionIcon={Plus}
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Current Stock</th>
                  <th className="px-6 py-3.5">Unit</th>
                  <th className="px-6 py-3.5">Min. Threshold</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <span>{p.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-base text-slate-800">
                        {p.current_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {p.unit}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {p.minimum_stock} {p.unit}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status} size="sm">
                        {p.status?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Quick Add */}
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setStockActionType('ADD');
                            setStockAdjustmentQty('10');
                            setShowStockModal(true);
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Add Stock"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Quick Remove */}
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setStockActionType('REMOVE');
                            setStockAdjustmentQty('5');
                            setShowStockModal(true);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Remove Stock"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setFormData({
                              name: p.name,
                              unit: p.unit,
                              current_stock: p.current_stock.toString(),
                              minimum_stock: p.minimum_stock.toString(),
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Add Product */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        subtitle="Create a new store inventory catalog item"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Basmati Rice, Sunflower Oil"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
            >
              {unitsList.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Stock Threshold
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                placeholder="5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30"
            >
              {submitting ? 'Creating...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Product */}
      <Modal
        isOpen={showEditModal && !!selectedProduct}
        onClose={() => setShowEditModal(false)}
        title={`Edit Product: ${selectedProduct?.name || ''}`}
        subtitle="Update unit measurement and safety stock threshold"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
            >
              {unitsList.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum Stock Threshold (For alerts & reorders)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.minimum_stock}
              onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30"
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Quick Stock Adjustment (+ / -) */}
      <Modal
        isOpen={showStockModal && !!selectedProduct}
        onClose={() => setShowStockModal(false)}
        title={stockActionType === 'ADD' ? 'Add Stock' : 'Remove Stock'}
        subtitle={`Adjust balance for ${selectedProduct?.name || ''}`}
        size="sm"
      >
        <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs space-y-1">
          <div className="font-bold text-slate-800">{selectedProduct?.name}</div>
          <div className="text-slate-500">
            Current Balance: <span className="font-semibold text-slate-800">{selectedProduct?.current_stock} {selectedProduct?.unit}</span>
          </div>
        </div>

        <form onSubmit={handleStockAdjustment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity to {stockActionType === 'ADD' ? 'Add' : 'Remove'} ({selectedProduct?.unit})
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              required
              autoFocus
              value={stockAdjustmentQty}
              onChange={(e) => setStockAdjustmentQty(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowStockModal(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md ${
                stockActionType === 'ADD' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' 
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              {submitting ? 'Updating...' : `Confirm ${stockActionType === 'ADD' ? 'Addition' : 'Removal'}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DIALOG: Delete Product */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"? All related transaction history will also be permanently deleted.`}
        confirmText="Delete Product"
        variant="danger"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};

export default Inventory;
