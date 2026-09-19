import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  addStock,
  removeStock,
  getHistory,
  getLowStock,
  getRecommendations,
  explainStock,
} from '../controllers/inventoryController.js';
import voiceRoutes from './voiceRoutes.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { getStockInsights } from '../controllers/insightsController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'People Voice API', timestamp: new Date() });
});

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Stock Insights
router.get('/insights', getStockInsights);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Inventory
router.post('/inventory/add', addStock);
router.post('/inventory/remove', removeStock);
router.get('/inventory/history', getHistory);
router.get('/inventory/low-stock', getLowStock);
router.get('/inventory/recommendations', getRecommendations);
router.get('/inventory/explain/:idOrName', explainStock);

// Voice Sub-Router (Commands, Confirmation, History, Insights)
router.use('/voice', voiceRoutes);

export default router;
