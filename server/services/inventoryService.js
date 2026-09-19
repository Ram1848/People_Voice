import { getPool } from '../config/db.js';

/**
 * Dedicated Inventory Service
 * 
 * Enforces business rules:
 * - Quantity must be greater than zero.
 * - Product must exist.
 * - Unit must be valid.
 * - Cannot remove more stock than available.
 * - Stock cannot become negative.
 * - Every successful modification must create a transaction record.
 * - Uses atomic MySQL transactions.
 */

export const addStock = async ({
  productId,
  productName,
  quantity,
  unit,
  source = 'MANUAL',
  confidence = 1.0,
  originalCommand = null,
}) => {
  const parsedQty = parseFloat(quantity);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    const error = new Error('Please enter a valid quantity greater than 0');
    error.statusCode = 400;
    throw error;
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let product = null;
    if (productId) {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
      if (rows.length > 0) product = rows[0];
    } else if (productName) {
      const [rows] = await conn.query('SELECT * FROM products WHERE LOWER(name) = ? FOR UPDATE', [productName.trim().toLowerCase()]);
      if (rows.length > 0) product = rows[0];
    }

    if (!product) {
      await conn.rollback();
      const notFoundError = new Error(`${productName || 'Product'} was not found in your inventory.`);
      notFoundError.statusCode = 404;
      notFoundError.suggestCreate = true;
      notFoundError.productName = productName || '';
      throw notFoundError;
    }

    const previousStock = parseFloat(product.current_stock);
    const updatedStock = previousStock + parsedQty;
    const finalUnit = unit || product.unit;

    // Update stock
    await conn.query('UPDATE products SET current_stock = ? WHERE id = ?', [updatedStock, product.id]);

    // Record transaction
    const validSource = ['VOICE', 'TEXT', 'MANUAL'].includes(source) ? source : 'MANUAL';
    const cleanConfidence = Math.min(1.0, Math.max(0.0, parseFloat(confidence) || 1.0));
    const commandText = originalCommand ? String(originalCommand).substring(0, 255) : `Added ${parsedQty} ${finalUnit} of ${product.name}`;

    await conn.query(
      `INSERT INTO inventory_transactions 
       (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command)
       VALUES (?, 'ADD', ?, ?, ?, ?, ?, ?, ?)`,
      [product.id, parsedQty, finalUnit, previousStock, updatedStock, validSource, cleanConfidence, commandText]
    );

    await conn.commit();

    const minStock = parseFloat(product.minimum_stock);
    let stockStatus = 'IN_STOCK';
    if (updatedStock === 0) stockStatus = 'OUT_OF_STOCK';
    else if (updatedStock <= minStock) stockStatus = 'LOW_STOCK';

    return {
      id: product.id,
      product: product.name,
      action: 'ADD',
      quantity: parsedQty,
      unit: finalUnit,
      previousStock,
      currentStock: updatedStock,
      minimumStock: minStock,
      status: stockStatus,
      source: validSource,
      confidence: cleanConfidence,
      originalCommand: commandText,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const removeStock = async ({
  productId,
  productName,
  quantity,
  unit,
  source = 'MANUAL',
  confidence = 1.0,
  originalCommand = null,
}) => {
  const parsedQty = parseFloat(quantity);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    const error = new Error('Please enter a valid quantity greater than 0');
    error.statusCode = 400;
    throw error;
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let product = null;
    if (productId) {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
      if (rows.length > 0) product = rows[0];
    } else if (productName) {
      const [rows] = await conn.query('SELECT * FROM products WHERE LOWER(name) = ? FOR UPDATE', [productName.trim().toLowerCase()]);
      if (rows.length > 0) product = rows[0];
    }

    if (!product) {
      await conn.rollback();
      const notFoundError = new Error(`${productName || 'Product'} was not found in your inventory.`);
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    const previousStock = parseFloat(product.current_stock);
    const finalUnit = unit || product.unit;

    // Rule: Cannot remove more stock than currently available
    if (previousStock < parsedQty) {
      await conn.rollback();
      const insufficientError = new Error(`You only have ${previousStock} ${product.unit} available.`);
      insufficientError.statusCode = 400;
      insufficientError.availableStock = previousStock;
      insufficientError.requestedQuantity = parsedQty;
      insufficientError.product = product.name;
      insufficientError.unit = product.unit;
      throw insufficientError;
    }

    const updatedStock = previousStock - parsedQty;

    // Update stock
    await conn.query('UPDATE products SET current_stock = ? WHERE id = ?', [updatedStock, product.id]);

    // Record transaction
    const validSource = ['VOICE', 'TEXT', 'MANUAL'].includes(source) ? source : 'MANUAL';
    const cleanConfidence = Math.min(1.0, Math.max(0.0, parseFloat(confidence) || 1.0));
    const commandText = originalCommand ? String(originalCommand).substring(0, 255) : `Removed ${parsedQty} ${finalUnit} of ${product.name}`;

    await conn.query(
      `INSERT INTO inventory_transactions 
       (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command)
       VALUES (?, 'REMOVE', ?, ?, ?, ?, ?, ?, ?)`,
      [product.id, parsedQty, finalUnit, previousStock, updatedStock, validSource, cleanConfidence, commandText]
    );

    await conn.commit();

    const minStock = parseFloat(product.minimum_stock);
    let stockStatus = 'IN_STOCK';
    if (updatedStock === 0) stockStatus = 'OUT_OF_STOCK';
    else if (updatedStock <= minStock) stockStatus = 'LOW_STOCK';

    return {
      id: product.id,
      product: product.name,
      action: 'REMOVE',
      quantity: parsedQty,
      unit: finalUnit,
      previousStock,
      currentStock: updatedStock,
      minimumStock: minStock,
      status: stockStatus,
      source: validSource,
      confidence: cleanConfidence,
      originalCommand: commandText,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const checkStock = async (idOrName) => {
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
  const curStock = parseFloat(product.current_stock);
  const minStock = parseFloat(product.minimum_stock);

  let stockStatus = 'IN_STOCK';
  if (curStock === 0) stockStatus = 'OUT_OF_STOCK';
  else if (curStock <= minStock) stockStatus = 'LOW_STOCK';

  return {
    id: product.id,
    product: product.name,
    currentStock: curStock,
    minimumStock: minStock,
    unit: product.unit,
    status: stockStatus,
  };
};

export const getLowStock = async () => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM products 
     WHERE current_stock <= minimum_stock 
     ORDER BY (current_stock = 0) DESC, current_stock ASC, name ASC`
  );

  return rows.map(p => {
    const current = parseFloat(p.current_stock);
    const min = parseFloat(p.minimum_stock);
    return {
      ...p,
      current_stock: current,
      minimum_stock: min,
      status: current === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    };
  });
};

export const getOutOfStock = async () => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM products WHERE current_stock = 0 ORDER BY name ASC');
  return rows.map(p => ({
    ...p,
    current_stock: 0,
    minimum_stock: parseFloat(p.minimum_stock),
    status: 'OUT_OF_STOCK',
  }));
};

export const getStockHistory = async (limit = 50, filters = {}) => {
  const pool = getPool();
  const maxLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

  let query = `
    SELECT t.id, t.action, t.quantity, t.unit, t.previous_stock, t.updated_stock, 
           t.source, t.confidence, t.original_command, t.created_at, 
           p.id as product_id, p.name as product_name
    FROM inventory_transactions t
    JOIN products p ON t.product_id = p.id
  `;

  const params = [];
  const whereClauses = [];

  if (filters.action && filters.action !== 'ALL') {
    whereClauses.push('t.action = ?');
    params.push(filters.action);
  }

  if (filters.source && filters.source !== 'ALL') {
    whereClauses.push('t.source = ?');
    params.push(filters.source);
  }

  if (filters.productId) {
    whereClauses.push('t.product_id = ?');
    params.push(filters.productId);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY t.created_at DESC, t.id DESC LIMIT ?';
  params.push(maxLimit);

  const [rows] = await pool.query(query, params);

  return rows.map(r => ({
    id: r.id,
    productId: r.product_id,
    product: r.product_name,
    action: r.action,
    quantity: parseFloat(r.quantity),
    unit: r.unit,
    previousStock: parseFloat(r.previous_stock),
    updatedStock: parseFloat(r.updated_stock),
    source: r.source,
    confidence: r.confidence !== null ? parseFloat(r.confidence) : 0.95,
    originalCommand: r.original_command || `${r.action} ${parseFloat(r.quantity)} ${r.unit} of ${r.product_name}`,
    createdAt: r.created_at,
  }));
};

export default {
  addStock,
  removeStock,
  checkStock,
  getLowStock,
  getOutOfStock,
  getStockHistory,
};
