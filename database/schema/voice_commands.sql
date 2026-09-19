-- Schema for People Voice AI Voice Assistant Table
-- Tracks all voice interactions, pending confirmations, and audit outcomes.

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
