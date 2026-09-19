import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'people_voice';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

// Pool for general queries once DB is confirmed
let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true, // Parse decimals as numbers instead of strings
    });
  }
  return pool;
};

export const initDB = async () => {
  try {
    // 1. First connect without specifying database to create DB if needed
    const serverConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
    });

    await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await serverConnection.end();

    const dbPool = getPool();

    // 2. Create products table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        minimum_stock DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_product_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create inventory_transactions table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        action ENUM('ADD', 'REMOVE') NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        previous_stock DECIMAL(10, 2) NOT NULL,
        updated_stock DECIMAL(10, 2) NOT NULL,
        source ENUM('VOICE', 'TEXT', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create voice_commands table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS voice_commands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL DEFAULT 1,
        original_command VARCHAR(255) NOT NULL,
        intent ENUM(
          'ADD', 
          'REMOVE', 
          'CHECK', 
          'LOW_STOCK', 
          'STOCK_EXPLAIN', 
          'BUSINESS_QUERY', 
          'REORDER', 
          'DAILY_ACTIVITY', 
          'ATTENTION', 
          'UNKNOWN'
        ) NOT NULL DEFAULT 'UNKNOWN',
        product_id INT NULL,
        product_name VARCHAR(150) NULL,
        quantity DECIMAL(10, 2) NULL,
        unit VARCHAR(50) NULL,
        confidence DECIMAL(3, 2) NOT NULL DEFAULT 0.95,
        status ENUM(
          'PENDING_CONFIRMATION', 
          'CONFIRMED', 
          'CANCELLED', 
          'SUCCESS', 
          'FAILED'
        ) NOT NULL DEFAULT 'SUCCESS',
        suggested_quantity DECIMAL(10, 2) NULL,
        error_message VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_voice_status (status),
        INDEX idx_voice_intent (intent),
        INDEX idx_voice_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Safe migration: Add confidence and original_command to inventory_transactions if not present
    try {
      const [cols] = await dbPool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'inventory_transactions' AND COLUMN_NAME IN ('confidence', 'original_command')
      `, [DB_NAME]);

      const existingColNames = cols.map(c => c.COLUMN_NAME.toLowerCase());

      if (!existingColNames.includes('confidence')) {
        await dbPool.query('ALTER TABLE inventory_transactions ADD COLUMN confidence DECIMAL(3, 2) DEFAULT 0.95');
        console.log('Migration: Added column "confidence" to inventory_transactions');
      }

      if (!existingColNames.includes('original_command')) {
        await dbPool.query('ALTER TABLE inventory_transactions ADD COLUMN original_command VARCHAR(255) NULL');
        console.log('Migration: Added column "original_command" to inventory_transactions');
      }
    } catch (migError) {
      console.warn('Migration note:', migError.message);
    }

    // 5. Seed demo data if products table is empty
    const [rows] = await dbPool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('Seeding initial demo products and transactions...');

      const demoProducts = [
        { name: 'Rice', unit: 'bags', current_stock: 45, minimum_stock: 15 },
        { name: 'Sugar', unit: 'kg', current_stock: 8, minimum_stock: 10 },
        { name: 'Cooking Oil', unit: 'litres', current_stock: 24, minimum_stock: 10 },
        { name: 'Biscuits', unit: 'cartons', current_stock: 0, minimum_stock: 5 },
        { name: 'Wheat Flour', unit: 'bags', current_stock: 12, minimum_stock: 8 },
        { name: 'Milk', unit: 'litres', current_stock: 4, minimum_stock: 10 },
        { name: 'Tea Powder', unit: 'grams', current_stock: 2500, minimum_stock: 1000 },
      ];

      for (const p of demoProducts) {
        const [result] = await dbPool.query(
          'INSERT INTO products (name, unit, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
          [p.name, p.unit, p.current_stock, p.minimum_stock]
        );

        const productId = result.insertId;

        // Add initial intake transaction
        await dbPool.query(
          `INSERT INTO inventory_transactions 
           (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command, created_at)
           VALUES (?, 'ADD', ?, ?, 0, ?, 'MANUAL', 1.00, 'Initial inventory setup', NOW() - INTERVAL 7 DAY)`,
          [productId, p.current_stock + 15, p.unit, p.current_stock + 15]
        );

        // Add historical sales transactions across past 5 days for realistic average usage
        await dbPool.query(
          `INSERT INTO inventory_transactions 
           (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command, created_at)
           VALUES (?, 'REMOVE', ?, ?, ?, ?, 'VOICE', 0.96, ?, NOW() - INTERVAL 3 DAY)`,
          [productId, 5, p.unit, p.current_stock + 15, p.current_stock + 10, `Remove 5 ${p.unit} ${p.name}`]
        );

        await dbPool.query(
          `INSERT INTO inventory_transactions 
           (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command, created_at)
           VALUES (?, 'REMOVE', ?, ?, ?, ?, 'VOICE', 0.94, ?, NOW() - INTERVAL 1 DAY)`,
          [productId, 10, p.unit, p.current_stock + 10, p.current_stock, `Sold 10 ${p.unit} of ${p.name}`]
        );
      }

      console.log('Demo products seeded with historical usage data successfully!');
    }

    console.log(`Database connected and initialized successfully on MySQL (${DB_NAME})`);
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
};
