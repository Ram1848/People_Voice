import { getPool } from '../config/db.js';
import { calculateAverageDailyUsage } from './reorderService.js';

/**
 * Stock Explanation Service
 * 
 * Provides transparent, data-driven explanations of product inventory:
 * - Current Stock vs Minimum Stock
 * - Stock Status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
 * - Average Daily Usage (computed from past transactions in MySQL)
 * - Dynamic Reorder Suggestions based on lead time & run-rate
 */
export const explainStock = async (idOrName) => {
  const pool = getPool();
  let query = 'SELECT * FROM products WHERE ';
  const params = [];

  if (!isNaN(parseInt(idOrName, 10)) && String(parseInt(idOrName, 10)) === String(idOrName)) {
    query += 'id = ?';
    params.push(parseInt(idOrName, 10));
  } else {
    query += 'LOWER(name) = ? OR LOWER(name) LIKE ?';
    params.push(idOrName.trim().toLowerCase(), `%${idOrName.trim().toLowerCase()}%`);
  }

  const [rows] = await pool.query(query, params);
  if (rows.length === 0) {
    const error = new Error(`Product "${idOrName}" was not found in your inventory.`);
    error.statusCode = 404;
    error.productName = idOrName;
    throw error;
  }

  const product = rows[0];
  const currentStock = parseFloat(product.current_stock);
  const minStock = parseFloat(product.minimum_stock);

  let stockStatus = 'In Stock';
  if (currentStock === 0) stockStatus = 'Out of Stock';
  else if (currentStock <= minStock) stockStatus = 'Low Stock';

  const { hasHistory, avgDailyUsage } = await calculateAverageDailyUsage(product.id, 14);

  const leadTime = 3;
  let suggestedReorder = 0;
  let calculationMethod = 'Standard Reorder Formula';

  if (hasHistory && avgDailyUsage > 0) {
    const expectedLeadUsage = avgDailyUsage * leadTime;
    suggestedReorder = Math.max(1, Math.round(expectedLeadUsage + minStock - currentStock));
    calculationMethod = 'Usage-Based Calculation';
  } else {
    suggestedReorder = Math.max(1, Math.round((minStock * 2) - currentStock));
    calculationMethod = 'Fallback Minimum-Stock Calculation';
  }

  let formattedUsage = hasHistory && avgDailyUsage > 0 ? `${avgDailyUsage} ${product.unit}/day` : 'Not enough sales history';
  let formattedStatus = stockStatus;

  // Build human-friendly explanation message
  let explanation = '';
  if (currentStock === 0) {
    explanation = `${product.name} is completely Out of Stock (0 ${product.unit}). Minimum requirement is ${minStock} ${product.unit}. Immediate reorder of ${suggestedReorder} ${product.unit} is recommended.`;
  } else if (currentStock <= minStock) {
    explanation = `${product.name} is Running Low at ${currentStock} ${product.unit} (Minimum: ${minStock} ${product.unit}). Suggested reorder is ${suggestedReorder} ${product.unit}.`;
  } else {
    explanation = `${product.name} stock is healthy with ${currentStock} ${product.unit} available, well above your minimum threshold of ${minStock} ${product.unit}.`;
  }

  return {
    productId: product.id,
    productName: product.name,
    currentStock,
    minimumStock: minStock,
    unit: product.unit,
    status: formattedStatus,
    averageDailyUsage: avgDailyUsage,
    formattedUsage,
    leadTimeDays: leadTime,
    suggestedReorder: (currentStock <= minStock) ? suggestedReorder : 0,
    calculationMethod,
    explanation,
  };
};

export default {
  explainStock,
};
