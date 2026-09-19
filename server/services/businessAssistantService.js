import { getPool } from '../config/db.js';
import { calculateAverageDailyUsage, getReorderRecommendations } from './reorderService.js';
import { explainStock } from './stockExplanationService.js';

/**
 * Business Assistant Service
 * 
 * Provides high-level business intelligence directly using real MySQL data.
 */

// 1. Today's Activity & Stock Changes
export const getTodayActivity = async (actionFilter = null) => {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT t.id, t.action, t.quantity, t.unit, t.previous_stock, t.updated_stock,
           t.source, t.confidence, t.original_command, t.created_at, p.name as product_name
    FROM inventory_transactions t
    JOIN products p ON t.product_id = p.id
    WHERE DATE(t.created_at) = CURRENT_DATE()
    ORDER BY t.created_at DESC
  `);

  let addedUnits = 0;
  let removedUnits = 0;
  let additionsCount = 0;
  let removalsCount = 0;
  const updatedProductIds = new Set();

  rows.forEach(r => {
    updatedProductIds.add(r.product_name);
    if (r.action === 'ADD') {
      addedUnits += parseFloat(r.quantity);
      additionsCount++;
    }
    if (r.action === 'REMOVE') {
      removedUnits += parseFloat(r.quantity);
      removalsCount++;
    }
  });

  addedUnits = Math.round(addedUnits * 100) / 100;
  removedUnits = Math.round(removedUnits * 100) / 100;

  const formattedTransactions = rows.map(r => {
    const timeStr = new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      id: r.id,
      time: timeStr,
      action: r.action,
      product: r.product_name,
      quantity: parseFloat(r.quantity),
      unit: r.unit,
      source: r.source,
      formattedText: `${timeStr} - ${r.action === 'ADD' ? 'Add' : 'Remove'} ${parseFloat(r.quantity)} ${r.unit} ${r.product_name}`,
    };
  });

  let spokenMessage = '';
  if (actionFilter === 'ADD') {
    spokenMessage = `Today you added ${addedUnits} units across ${additionsCount} transactions.`;
  } else if (actionFilter === 'REMOVE') {
    spokenMessage = `Today you dispatched or sold ${removedUnits} units across ${removalsCount} transactions.`;
  } else {
    spokenMessage = `Today's Activity: ${addedUnits} units added, ${removedUnits} units removed, and ${updatedProductIds.size} products updated.`;
  }

  return {
    totalTransactions: rows.length,
    summary: {
      addedUnits,
      removedUnits,
      additionsCount,
      removalsCount,
      updatedProductsCount: updatedProductIds.size,
    },
    transactions: formattedTransactions,
    spokenMessage,
  };
};

// 2. Fastest Selling Products
export const getFastestSellingProducts = async (days = 14) => {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT p.id, p.name, p.unit, p.current_stock,
           SUM(t.quantity) as total_sold,
           COUNT(t.id) as sales_events
    FROM inventory_transactions t
    JOIN products p ON t.product_id = p.id
    WHERE t.action = 'REMOVE' AND t.created_at >= NOW() - INTERVAL ? DAY
    GROUP BY p.id, p.name, p.unit, p.current_stock
    ORDER BY total_sold DESC
    LIMIT 5
  `, [days]);

  if (rows.length === 0) {
    return {
      products: [],
      spokenMessage: 'No sales transactions recorded in the past 14 days.',
    };
  }

  const top = rows[0];
  const listText = rows.map(r => `${r.name} (${parseFloat(r.total_sold)} ${r.unit} sold)`).join(', ');
  const spokenMessage = `Your fastest selling product is ${top.name} with ${parseFloat(top.total_sold)} ${top.unit} sold. Top items: ${listText}.`;

  return {
    products: rows.map(r => ({
      id: r.id,
      name: r.name,
      unit: r.unit,
      currentStock: parseFloat(r.current_stock),
      totalSold: parseFloat(r.total_sold),
      salesEvents: r.sales_events,
    })),
    spokenMessage,
  };
};

// 3. Most Used Products
export const getMostUsedProducts = async (days = 14) => {
  return getFastestSellingProducts(days);
};

// 4. Products Needing Attention (Low Stock & Out of Stock)
export const getAttentionItems = async (productFilter = null) => {
  const pool = getPool();
  let query = 'SELECT * FROM products WHERE current_stock <= minimum_stock';
  const params = [];

  if (productFilter) {
    query += ' AND LOWER(name) LIKE ?';
    params.push(`%${productFilter.toLowerCase().trim()}%`);
  }
  query += ' ORDER BY (current_stock = 0) DESC, current_stock ASC';

  const [items] = await pool.query(query, params);

  const formatted = items.map(p => ({
    id: p.id,
    name: p.name,
    currentStock: parseFloat(p.current_stock),
    minimumStock: parseFloat(p.minimum_stock),
    unit: p.unit,
    status: parseFloat(p.current_stock) === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
  }));

  let spokenMessage = '';
  if (formatted.length === 0) {
    spokenMessage = productFilter 
      ? `No critical stock issues found for ${productFilter}. Levels are healthy.` 
      : 'All products are currently well-stocked. No items require urgent attention.';
  } else {
    const listSummary = formatted.map(i => `${i.name}: ${i.currentStock} ${i.unit}`).join(', ');
    spokenMessage = `${formatted.length} product(s) need attention: ${listSummary}.`;
  }

  return {
    items: formatted,
    count: formatted.length,
    spokenMessage,
  };
};

// 5. Today's Purchase Suggestions ("What do I need to buy today?")
export const getPurchaseSuggestions = async () => {
  const recommendations = await getReorderRecommendations(3);

  if (recommendations.length === 0) {
    return {
      items: [],
      count: 0,
      reason: 'All products are currently above their required safety stock thresholds.',
      spokenMessage: 'All products are currently well-stocked. No purchases needed today.',
    };
  }

  const listText = recommendations
    .map(r => `${r.productName} — ${r.recommendedQuantity} ${r.unit}`)
    .join(', ');

  const spokenMessage = `Today's Purchase Suggestions: ${listText}. Reason: These products are approaching or below their required stock levels.`;

  return {
    items: recommendations,
    count: recommendations.length,
    reason: 'These products are approaching or below their required stock level.',
    spokenMessage,
  };
};

export default {
  getTodayActivity,
  getFastestSellingProducts,
  getMostUsedProducts,
  getAttentionItems,
  getPurchaseSuggestions,
  explainProductStock: explainStock,
};
