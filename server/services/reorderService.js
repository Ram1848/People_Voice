import { getPool } from '../config/db.js';

/**
 * Dedicated Smart Reorder Engine Service
 * 
 * Computes usage-based recommendations when sales history exists:
 * Expected Usage = Average Daily Usage × Lead Time
 * Recommended Reorder = max(1, Expected Usage + Minimum Stock - Current Stock)
 * 
 * Falls back cleanly to: (Minimum Stock × 2) - Current Stock labeled "Basic Reorder Suggestion"
 */

export const calculateAverageDailyUsage = async (productId, days = 14) => {
  const pool = getPool();
  const [usageRows] = await pool.query(
    `SELECT SUM(quantity) as totalRemoved, COUNT(*) as removeCount,
            MIN(created_at) as earliestDate
     FROM inventory_transactions
     WHERE product_id = ? AND action = 'REMOVE' AND created_at >= NOW() - INTERVAL ? DAY`,
    [productId, days]
  );

  if (!usageRows.length || !usageRows[0].totalRemoved || usageRows[0].totalRemoved <= 0) {
    return { hasHistory: false, avgDailyUsage: null, totalRemoved: 0, daysElapsed: 0 };
  }

  const totalRemoved = parseFloat(usageRows[0].totalRemoved);
  let daysElapsed = 7;
  if (usageRows[0].earliestDate) {
    const diffMs = new Date() - new Date(usageRows[0].earliestDate);
    daysElapsed = Math.max(1, Math.min(days, Math.ceil(diffMs / (1000 * 60 * 60 * 24))));
  }

  const avgDailyUsage = parseFloat((totalRemoved / daysElapsed).toFixed(1));
  return { hasHistory: true, avgDailyUsage, totalRemoved, daysElapsed };
};

export const getReorderRecommendations = async (leadTime = 3) => {
  const pool = getPool();
  const leadDays = Math.max(1, parseInt(leadTime, 10) || 3);

  // Get all items at or below minimum threshold
  const [products] = await pool.query(
    `SELECT * FROM products 
     WHERE current_stock <= minimum_stock 
     ORDER BY (current_stock = 0) DESC, (minimum_stock - current_stock) DESC`
  );

  const recommendations = [];

  for (const p of products) {
    const current = parseFloat(p.current_stock);
    const min = parseFloat(p.minimum_stock);

    const { hasHistory, avgDailyUsage } = await calculateAverageDailyUsage(p.id, 14);

    let recommendedQty = 0;
    let reorderType = 'Basic Reorder Suggestion';
    let reason = '';

    if (hasHistory && avgDailyUsage > 0) {
      const expectedUsage = avgDailyUsage * leadDays;
      recommendedQty = Math.max(1, Math.round(expectedUsage + min - current));
      reorderType = 'Usage-Based Reorder';
      reason = current === 0
        ? `Product is out of stock. Based on recent usage (~${avgDailyUsage} ${p.unit}/day) and ${leadDays}-day lead time, order ${recommendedQty} ${p.unit}.`
        : `Stock is low and recent usage is approx ${avgDailyUsage} ${p.unit}/day. Based on expected usage, order ${recommendedQty} ${p.unit}.`;
    } else {
      recommendedQty = Math.max(1, Math.round((min * 2) - current));
      reorderType = 'Basic Reorder Suggestion';
      reason = current === 0
        ? `Product is out of stock. Not enough sales history, using standard replenishment of ${recommendedQty} ${p.unit}.`
        : `Stock (${current} ${p.unit}) is at or below minimum threshold (${min} ${p.unit}).`;
    }

    recommendations.push({
      productId: p.id,
      productName: p.name,
      unit: p.unit,
      currentStock: current,
      minimumStock: min,
      recommendedQuantity: recommendedQty,
      reorderType,
      averageDailyUsage: avgDailyUsage,
      leadTimeDays: leadDays,
      urgency: current === 0 ? 'CRITICAL' : 'HIGH',
      reason,
    });
  }

  return recommendations;
};

export default {
  calculateAverageDailyUsage,
  getReorderRecommendations,
};
