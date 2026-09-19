import { getPool } from '../config/db.js';

/**
 * Dedicated Product Management Service
 */

export const getProducts = async ({ q, status } = {}) => {
  const pool = getPool();
  let query = 'SELECT * FROM products';
  const params = [];
  const whereClauses = [];

  if (q) {
    whereClauses.push('LOWER(name) LIKE ?');
    params.push(`%${q.toLowerCase().trim()}%`);
  }

  if (status) {
    if (status === 'out') {
      whereClauses.push('current_stock = 0');
    } else if (status === 'low') {
      whereClauses.push('current_stock > 0 AND current_stock <= minimum_stock');
    } else if (status === 'in') {
      whereClauses.push('current_stock > minimum_stock');
    }
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY name ASC';

  const [products] = await pool.query(query, params);

  return products.map(p => {
    const current = parseFloat(p.current_stock);
    const min = parseFloat(p.minimum_stock);
    let stockStatus = 'IN_STOCK';
    if (current === 0) stockStatus = 'OUT_OF_STOCK';
    else if (current <= min) stockStatus = 'LOW_STOCK';

    return {
      ...p,
      current_stock: current,
      minimum_stock: min,
      status: stockStatus,
    };
  });
};

export const getProductById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (rows.length === 0) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const p = rows[0];
  const current = parseFloat(p.current_stock);
  const min = parseFloat(p.minimum_stock);
  let stockStatus = 'IN_STOCK';
  if (current === 0) stockStatus = 'OUT_OF_STOCK';
  else if (current <= min) stockStatus = 'LOW_STOCK';

  return {
    ...p,
    current_stock: current,
    minimum_stock: min,
    status: stockStatus,
  };
};

export const createProduct = async ({ name, unit, current_stock = 0, minimum_stock = 5 }) => {
  if (!name || !name.trim()) {
    const error = new Error('Product name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!unit || !unit.trim()) {
    const error = new Error('Product unit is required');
    error.statusCode = 400;
    throw error;
  }

  const cleanName = name.trim();
  const cleanUnit = unit.trim().toLowerCase();
  const initialStock = Math.max(0, parseFloat(current_stock) || 0);
  const minStock = Math.max(0, parseFloat(minimum_stock) || 5);

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const [existing] = await conn.query('SELECT id FROM products WHERE LOWER(name) = ?', [cleanName.toLowerCase()]);
    if (existing.length > 0) {
      const error = new Error(`A product named "${cleanName}" already exists`);
      error.statusCode = 409;
      throw error;
    }

    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      'INSERT INTO products (name, unit, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
      [cleanName, cleanUnit, initialStock, minStock]
    );

    const newProductId = insertResult.insertId;

    if (initialStock > 0) {
      await conn.query(
        `INSERT INTO inventory_transactions 
         (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command)
         VALUES (?, 'ADD', ?, ?, 0, ?, 'MANUAL', 1.0, 'Initial product creation')`,
        [newProductId, initialStock, cleanUnit, initialStock]
      );
    }

    await conn.commit();

    return {
      id: newProductId,
      name: cleanName,
      unit: cleanUnit,
      current_stock: initialStock,
      minimum_stock: minStock,
      status: initialStock === 0 ? 'OUT_OF_STOCK' : (initialStock <= minStock ? 'LOW_STOCK' : 'IN_STOCK'),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const updateProduct = async (id, { name, unit, minimum_stock }) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (rows.length === 0) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = [];
  const params = [];

  if (name && name.trim()) {
    updates.push('name = ?');
    params.push(name.trim());
  }
  if (unit && unit.trim()) {
    updates.push('unit = ?');
    params.push(unit.trim().toLowerCase());
  }
  if (minimum_stock !== undefined && !isNaN(parseFloat(minimum_stock))) {
    updates.push('minimum_stock = ?');
    params.push(Math.max(0, parseFloat(minimum_stock)));
  }

  if (updates.length === 0) {
    const error = new Error('No fields provided for update');
    error.statusCode = 400;
    throw error;
  }

  params.push(id);
  await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

  const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  const p = updated[0];

  return {
    ...p,
    current_stock: parseFloat(p.current_stock),
    minimum_stock: parseFloat(p.minimum_stock),
  };
};

export const deleteProduct = async (id) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT name FROM products WHERE id = ?', [id]);
  if (rows.length === 0) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const productName = rows[0].name;
  await pool.query('DELETE FROM products WHERE id = ?', [id]);

  return {
    success: true,
    message: `Product "${productName}" and its transaction history removed successfully`,
  };
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
