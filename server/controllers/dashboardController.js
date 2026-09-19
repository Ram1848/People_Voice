import { getPool } from '../config/db.js';
import reorderService from '../services/reorderService.js';
import inventoryService from '../services/inventoryService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const pool = getPool();

    // 1. Product counts & stock totals
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as totalProducts,
        COALESCE(SUM(current_stock), 0) as totalStockQuantity,
        COALESCE(SUM(CASE WHEN current_stock = 0 THEN 1 ELSE 0 END), 0) as outOfStockCount,
        COALESCE(SUM(CASE WHEN current_stock > 0 AND current_stock <= minimum_stock THEN 1 ELSE 0 END), 0) as lowStockCount
      FROM products
    `);

    // 2. Recent transactions via inventoryService
    const recentTransactions = await inventoryService.getStockHistory(5);

    // 3. Top low stock items via inventoryService
    const lowStockProducts = await inventoryService.getLowStock();

    // 4. Reorder suggestions via reorderService
    const reorderSuggestions = await reorderService.getReorderRecommendations(3);

    const summary = {
      totalProducts: parseInt(stats[0].totalProducts || 0, 10),
      totalStockQuantity: parseFloat(stats[0].totalStockQuantity || 0),
      outOfStockCount: parseInt(stats[0].outOfStockCount || 0, 10),
      lowStockCount: parseInt(stats[0].lowStockCount || 0, 10),
      recentTransactions,
      lowStockProducts: lowStockProducts.slice(0, 5),
      reorderSuggestions: reorderSuggestions.slice(0, 5),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardSummary,
};
