import { getPool } from '../config/db.js';
import businessAssistantService from '../services/businessAssistantService.js';

export const getStockInsights = async (req, res, next) => {
  try {
    const pool = getPool();

    // 1. Today's activity
    const today = await businessAssistantService.getTodayActivity();

    // 2. High usage products past 7 days
    const [highUsageRows] = await pool.query(`
      SELECT 
        p.id, p.name, p.unit, p.current_stock, p.minimum_stock,
        COALESCE(SUM(t.quantity), 0) as totalSold,
        COUNT(t.id) as salesCount
      FROM products p
      LEFT JOIN inventory_transactions t 
        ON p.id = t.product_id 
        AND t.action = 'REMOVE' 
        AND t.created_at >= NOW() - INTERVAL 7 DAY
      GROUP BY p.id, p.name, p.unit, p.current_stock, p.minimum_stock
      ORDER BY totalSold DESC, p.current_stock ASC
      LIMIT 5
    `);

    // 3. Critical items & Low Stock
    const [criticalItems] = await pool.query(`
      SELECT id, name, unit, current_stock, minimum_stock
      FROM products
      WHERE current_stock <= minimum_stock
      ORDER BY (current_stock = 0) DESC, current_stock ASC
      LIMIT 5
    `);

    // 4. Products overview stats
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as totalProducts,
        COALESCE(SUM(current_stock), 0) as totalStockUnits,
        COALESCE(SUM(CASE WHEN current_stock = 0 THEN 1 ELSE 0 END), 0) as outOfStockCount,
        COALESCE(SUM(CASE WHEN current_stock > 0 AND current_stock <= minimum_stock THEN 1 ELSE 0 END), 0) as lowStockCount,
        COALESCE(SUM(CASE WHEN current_stock > minimum_stock THEN 1 ELSE 0 END), 0) as healthyCount
      FROM products
    `);

    res.json({
      success: true,
      data: {
        today,
        overview: {
          totalProducts: parseInt(counts[0].totalProducts || 0, 10),
          totalUnits: parseFloat(counts[0].totalStockUnits || 0),
          outOfStock: parseInt(counts[0].outOfStockCount || 0, 10),
          lowStock: parseInt(counts[0].lowStockCount || 0, 10),
          healthy: parseInt(counts[0].healthyCount || 0, 10),
        },
        highUsageProducts: highUsageRows.map(p => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          currentStock: parseFloat(p.current_stock),
          minimumStock: parseFloat(p.minimum_stock),
          totalSoldPast7Days: parseFloat(p.totalSold),
          salesTransactionsCount: parseInt(p.salesCount, 10),
        })),
        criticalItems: criticalItems.map(p => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          currentStock: parseFloat(p.current_stock),
          minimumStock: parseFloat(p.minimum_stock),
          status: parseFloat(p.current_stock) === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStockInsights,
};
