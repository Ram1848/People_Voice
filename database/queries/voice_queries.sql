-- Core SQL Queries for People Voice Voice Assistant

-- 1. Create a pending command when confirmation is required
-- (e.g. insufficient stock or low confidence)
INSERT INTO voice_commands 
  (original_command, intent, product_id, product_name, quantity, unit, confidence, status, suggested_quantity)
VALUES 
  (?, ?, ?, ?, ?, ?, ?, 'PENDING_CONFIRMATION', ?);

-- 2. Lock and retrieve a pending command for safe confirmation (Row-level lock)
SELECT * FROM voice_commands 
WHERE id = ? FOR UPDATE;

-- 3. Mark pending command as CONFIRMED with final confirmed quantity
UPDATE voice_commands 
SET status = 'CONFIRMED', quantity = ? 
WHERE id = ?;

-- 4. Cancel a pending command
UPDATE voice_commands 
SET status = 'CANCELLED' 
WHERE id = ? AND status = 'PENDING_CONFIRMATION';

-- 5. Fetch latest voice action history
SELECT 
  id, original_command, intent, product_name, 
  quantity, unit, confidence, status, created_at 
FROM voice_commands 
ORDER BY created_at DESC 
LIMIT ?;

-- 6. Fetch currently active pending command
SELECT * FROM voice_commands 
WHERE status = 'PENDING_CONFIRMATION' 
ORDER BY created_at DESC 
LIMIT 1;

-- 7. Query today's voice command metrics
SELECT 
  COUNT(*) AS total_commands,
  SUM(CASE WHEN intent = 'ADD' AND status IN ('SUCCESS', 'CONFIRMED') THEN 1 ELSE 0 END) AS additions_count,
  SUM(CASE WHEN intent = 'REMOVE' AND status IN ('SUCCESS', 'CONFIRMED') THEN 1 ELSE 0 END) AS removals_count
FROM voice_commands
WHERE created_at >= CURDATE();
