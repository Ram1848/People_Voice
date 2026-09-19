import { getPool } from '../config/db.js';
import { parseCommand } from './commandParser.js';
import inventoryService from './inventoryService.js';
import reorderService from './reorderService.js';
import businessAssistantService from './businessAssistantService.js';
import { explainStock } from './stockExplanationService.js';
import { validateInventoryQuantities } from '../validators/voiceCommandValidator.js';

/**
 * Core Voice Service
 * 
 * Orchestrates voice command lifecycle:
 * Parsing -> Validation -> Safety Evaluation -> Pending Confirmation -> Atomic DB Execution -> Audit Logging
 */

export const handleVoiceCommand = async ({
  command,
  source = 'VOICE',
  confirmed = false,
  dryRun = false,
  userId = 1,
}) => {
  const pool = getPool();

  if (!command || !command.trim()) {
    return {
      success: false,
      message: 'No speech detected. Please say or enter a command.',
      spokenMessage: 'No speech detected. Please try again.',
      errorCode: 'NO_SPEECH',
      error: 'NO_SPEECH',
    };
  }

  // 1. Fetch current product catalog for accurate entity matching
  const [productsList] = await pool.query('SELECT id, name, unit, current_stock, minimum_stock FROM products');
  const knownProductNames = productsList.map(p => p.name);

  // 2. Parse command into structured intent & entities
  const parsed = parseCommand(command, knownProductNames);

  // Check for Voice-Triggered Confirmation
  if (parsed.action === 'CONFIRM_PENDING') {
    const [pendingRows] = await pool.query(
      `SELECT * FROM voice_commands 
       WHERE status = 'PENDING_CONFIRMATION' 
       ORDER BY id DESC LIMIT 1`
    );

    if (pendingRows.length === 0) {
      return {
        success: false,
        message: 'There are no pending actions to confirm.',
        spokenMessage: 'There are no pending actions to confirm.',
        parsed,
      };
    }

    const pendingCmd = pendingRows[0];
    const confirmedResult = await confirmPendingCommand({ commandId: pendingCmd.id });
    return {
      ...confirmedResult,
      isVoiceConfirmation: true,
    };
  }

  // Check for Voice-Triggered Cancellation
  if (parsed.action === 'CANCEL_PENDING') {
    const [pendingRows] = await pool.query(
      `SELECT * FROM voice_commands 
       WHERE status = 'PENDING_CONFIRMATION' 
       ORDER BY id DESC LIMIT 1`
    );

    if (pendingRows.length === 0) {
      return {
        success: false,
        message: 'There are no pending actions to cancel.',
        spokenMessage: 'There are no pending actions to cancel.',
        parsed,
      };
    }

    const pendingCmd = pendingRows[0];
    const cancelResult = await cancelPendingCommand({ commandId: pendingCmd.id });
    return {
      ...cancelResult,
      isVoiceCancellation: true,
    };
  }

  // Check for Ambiguous Action (e.g. "పోయాయి" / "poyayi")
  if (parsed.action === 'AMBIGUOUS_ACTION' || (parsed.isAmbiguous && parsed.clarificationType === 'DISCARD_OR_SALE')) {
    return {
      success: false,
      isAmbiguous: true,
      clarificationType: 'DISCARD_OR_SALE',
      message: parsed.message || "Did you sell or discard these items? Please say 'Remove [quantity]' or 'Sold [quantity]' to confirm.",
      spokenMessage: parsed.spokenMessage || "Did you sell or discard these items? Please clarify.",
      parsed,
    };
  }

  // Check for ambiguous product (e.g. user says "oil" and multiple oil items exist)
  if (parsed.isAmbiguous && parsed.candidates.length > 0) {
    const candidateNames = parsed.candidates.join(', ');
    const question = `Which product do you mean: ${candidateNames}?`;
    return {
      success: false,
      isAmbiguous: true,
      candidates: parsed.candidates,
      message: question,
      spokenMessage: question,
      parsed,
      intent: parsed.action,
    };
  }

  // 3. Dispatch Read-Only Queries (No DB modification)

  // A. STOCK_EXPLAIN ("How is my rice stock?", "Tell me about rice")
  if (parsed.action === 'STOCK_EXPLAIN') {
    if (!parsed.product) {
      return {
        success: false,
        message: 'Which product stock would you like me to explain?',
        spokenMessage: 'Which product stock would you like me to explain?',
        parsed,
        missingField: 'product',
      };
    }

    const explanation = await explainStock(parsed.product);

    // Audit log
    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, product_id, product_name, confidence, status)
       VALUES (?, 'STOCK_EXPLAIN', ?, ?, ?, 'SUCCESS')`,
      [command, explanation.productId, explanation.productName, parsed.confidence]
    );

    return {
      success: true,
      intent: 'STOCK_EXPLAIN',
      type: 'STOCK_EXPLANATION',
      message: explanation.explanation,
      spokenMessage: explanation.explanation,
      parsed,
      data: explanation,
    };
  }

  // B. DAILY_ACTIVITY ("What changed today?", "Show today's stock changes")
  if (parsed.action === 'DAILY_ACTIVITY') {
    let actionFilter = null;
    if (parsed.rawText.toLowerCase().includes('add')) actionFilter = 'ADD';
    if (parsed.rawText.toLowerCase().includes('remove') || parsed.rawText.toLowerCase().includes('sold')) actionFilter = 'REMOVE';

    const activity = await businessAssistantService.getTodayActivity(actionFilter);

    // Audit log
    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, confidence, status)
       VALUES (?, 'DAILY_ACTIVITY', ?, 'SUCCESS')`,
      [command, parsed.confidence]
    );

    return {
      success: true,
      intent: 'DAILY_ACTIVITY',
      type: 'DAILY_ACTIVITY',
      message: activity.spokenMessage,
      spokenMessage: activity.spokenMessage,
      parsed,
      data: activity,
    };
  }

  // C. FASTEST_SELLING / MOST_USED
  if (parsed.action === 'FASTEST_SELLING' || parsed.action === 'MOST_USED') {
    const fastData = await businessAssistantService.getFastestSellingProducts(14);
    
    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, confidence, status)
       VALUES (?, 'BUSINESS_QUERY', ?, 'SUCCESS')`,
      [command, parsed.confidence]
    );

    return {
      success: true,
      intent: 'BUSINESS_QUERY',
      type: 'FASTEST_SELLING',
      message: fastData.spokenMessage,
      spokenMessage: fastData.spokenMessage,
      parsed,
      data: fastData,
    };
  }

  // D. ATTENTION ("Which products need attention?")
  if (parsed.action === 'ATTENTION') {
    const attention = await businessAssistantService.getAttentionItems(parsed.product);

    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, confidence, status)
       VALUES (?, 'ATTENTION', ?, 'SUCCESS')`,
      [command, parsed.confidence]
    );

    return {
      success: true,
      intent: 'ATTENTION',
      type: 'ATTENTION',
      message: attention.spokenMessage,
      spokenMessage: attention.spokenMessage,
      parsed,
      data: attention,
    };
  }

  // E. LOW_STOCK ("What is running low?", "Which products are low?")
  if (parsed.action === 'LOW_STOCK') {
    const lowItems = await inventoryService.getLowStock();
    
    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, confidence, status)
       VALUES (?, 'LOW_STOCK', ?, 'SUCCESS')`,
      [command, parsed.confidence]
    );

    if (lowItems.length === 0) {
      const msg = 'All products are currently well-stocked. No items are running low.';
      return {
        success: true,
        intent: 'LOW_STOCK',
        message: msg,
        spokenMessage: msg,
        parsed,
        data: { items: [], count: 0 },
      };
    }

    const listText = lowItems
      .map(item => `${item.name}: ${item.current_stock} ${item.unit}`)
      .join(', ');
    const spoken = `${lowItems.length} products are running low: ${listText}.`;

    return {
      success: true,
      intent: 'LOW_STOCK',
      message: spoken,
      spokenMessage: spoken,
      parsed,
      data: { items: lowItems, count: lowItems.length },
    };
  }

  // F. REORDER / BUY_TODAY ("What do I need to buy today?", "What should I reorder?")
  if (parsed.action === 'REORDER') {
    const purchaseData = await businessAssistantService.getPurchaseSuggestions();

    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, confidence, status)
       VALUES (?, 'REORDER', ?, 'SUCCESS')`,
      [command, parsed.confidence]
    );

    return {
      success: true,
      intent: 'REORDER',
      type: 'REORDER_SUGGESTIONS',
      message: purchaseData.spokenMessage,
      spokenMessage: purchaseData.spokenMessage,
      parsed,
      data: purchaseData,
    };
  }

  // G. CHECK ("How much rice do I have?", "Check rice stock")
  if (parsed.action === 'CHECK') {
    if (!parsed.product) {
      return {
        success: false,
        message: 'Which product would you like to check?',
        spokenMessage: 'Which product would you like to check?',
        parsed,
        missingField: 'product',
      };
    }

    const stockData = await inventoryService.checkStock(parsed.product);
    let stockStatusText = '';
    if (stockData.currentStock === 0) {
      stockStatusText = 'It is currently out of stock.';
    } else if (stockData.status === 'LOW_STOCK') {
      stockStatusText = 'Notice: It is running low on stock.';
    }

    const checkMsg = `You currently have ${stockData.currentStock} ${stockData.unit} of ${stockData.product} in stock. ${stockStatusText}`.trim();

    await pool.query(
      `INSERT INTO voice_commands (original_command, intent, product_id, product_name, quantity, unit, confidence, status)
       VALUES (?, 'CHECK', ?, ?, ?, ?, ?, 'SUCCESS')`,
      [command, stockData.id, stockData.product, stockData.currentStock, stockData.unit, parsed.confidence]
    );

    return {
      success: true,
      intent: 'CHECK',
      message: checkMsg,
      spokenMessage: checkMsg,
      parsed,
      data: stockData,
    };
  }

  // 4. INVENTORY MODIFICATION: ADD & REMOVE
  if (parsed.action === 'ADD' || parsed.action === 'REMOVE') {
    const actionVerb = parsed.action === 'ADD' ? 'add' : 'remove';

    // Validate missing product
    if (!parsed.product) {
      const prompt = parsed.quantity
        ? `Which product should I ${actionVerb} ${parsed.quantity} ${parsed.unit || 'units'} of?`
        : `Which product would you like to ${actionVerb}?`;
      return {
        success: false,
        message: prompt,
        spokenMessage: prompt,
        parsed,
        missingField: 'product',
      };
    }

    // Validate missing or invalid quantity
    if (parsed.quantity === null || isNaN(parsed.quantity)) {
      return {
        success: false,
        message: `How much ${parsed.product} should I ${actionVerb}?`,
        spokenMessage: `How much ${parsed.product} should I ${actionVerb}?`,
        parsed,
        missingField: 'quantity',
        error: 'MISSING_QUANTITY',
        errorCode: 'MISSING_QUANTITY',
      };
    }

    // Reject negative or zero quantity
    if (parsed.quantity <= 0) {
      return {
        success: false,
        message: 'Quantity must be a positive number greater than zero.',
        spokenMessage: 'Please specify a positive quantity greater than zero.',
        parsed,
        error: 'INVALID_QUANTITY',
        errorCode: 'INVALID_QUANTITY',
      };
    }

    // Find product in DB
    const [matchedRows] = await pool.query(
      'SELECT * FROM products WHERE LOWER(name) = ? OR LOWER(name) LIKE ?',
      [parsed.product.toLowerCase().trim(), `%${parsed.product.toLowerCase().trim()}%`]
    );

    if (matchedRows.length === 0) {
      const notFoundMsg = `${parsed.product} was not found in your inventory.`;
      return {
        success: false,
        message: notFoundMsg,
        spokenMessage: notFoundMsg,
        parsed,
        suggestCreate: true,
        productName: parsed.product,
      };
    }

    const product = matchedRows[0];
    const currentStock = parseFloat(product.current_stock);

    // Unit compatibility check & conversion
    let effectiveQuantity = parsed.quantity;
    let finalUnit = product.unit;
    let conversionNote = '';

    try {
      const validation = validateInventoryQuantities(parsed.quantity, product.unit, parsed.unit);
      effectiveQuantity = validation.effectiveQuantity;
      finalUnit = validation.effectiveUnit || product.unit;
      if (validation.wasConverted) {
        conversionNote = ` (${parsed.quantity} ${parsed.unit} = ${effectiveQuantity} ${finalUnit})`;
      }
    } catch (unitErr) {
      return {
        success: false,
        message: unitErr.message,
        spokenMessage: unitErr.message,
        parsed,
        errorCode: unitErr.errorCode || 'INCOMPATIBLE_UNIT',
      };
    }

    const spokenQuantityDesc = parsed.unit ? `${parsed.quantity} ${parsed.unit}` : `${parsed.quantity} ${finalUnit}`;

    // A. INSUFFICIENT STOCK HANDLING FOR REMOVE:
    // User requested more stock than is currently available.
    if (parsed.action === 'REMOVE' && effectiveQuantity > currentStock) {
      // Do NOT modify database. Create a PENDING_CONFIRMATION record suggesting available stock!
      const [cmdResult] = await pool.query(
        `INSERT INTO voice_commands 
         (original_command, intent, product_id, product_name, quantity, unit, confidence, status, suggested_quantity)
         VALUES (?, 'REMOVE', ?, ?, ?, ?, ?, 'PENDING_CONFIRMATION', ?)`,
        [command, product.id, product.name, effectiveQuantity, finalUnit, parsed.confidence, currentStock]
      );

      const commandId = cmdResult.insertId;
      const warningText = `Requested quantity (${spokenQuantityDesc}) exceeds available stock (${currentStock} ${finalUnit}).`;
      const promptText = currentStock > 0
        ? `You only have ${currentStock} ${finalUnit} of ${product.name}. Would you like to remove ${currentStock} ${finalUnit} instead?`
        : `${product.name} is currently out of stock (0 ${finalUnit} available).`;

      return {
        success: true,
        requiresConfirmation: true,
        commandId,
        pendingCommandId: commandId,
        intent: 'REMOVE',
        isInsufficientStock: true,
        currentStock,
        availableStock: currentStock,
        suggestedQuantity: currentStock,
        warning: warningText,
        message: promptText,
        spokenMessage: promptText,
        parsed,
        command: {
          action: 'REMOVE',
          product: product.name,
          productId: product.id,
          quantity: effectiveQuantity,
          suggestedQuantity: currentStock,
          unit: finalUnit,
        },
      };
    }

    // B. CONFIDENCE OR SAFETY CONFIRMATION CHECK:
    // Require confirmation if dryRun, or medium confidence (70-89%), or large quantity change
    const isMediumConfidence = parsed.confidenceLevel === 'MEDIUM';
    const isLargeQuantity = effectiveQuantity > 100;
    const needsConfirmation = dryRun || (!confirmed && (isMediumConfidence || isLargeQuantity || parsed.requiresConfirmation));

    if (needsConfirmation) {
      const [cmdResult] = await pool.query(
        `INSERT INTO voice_commands 
         (original_command, intent, product_id, product_name, quantity, unit, confidence, status, suggested_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_CONFIRMATION', ?)`,
        [command, parsed.action, product.id, product.name, effectiveQuantity, finalUnit, parsed.confidence, effectiveQuantity]
      );

      const commandId = cmdResult.insertId;
      const confirmActionText = parsed.action === 'ADD' ? 'Add' : 'Remove';
      const promptText = `${confirmActionText} ${spokenQuantityDesc} of ${product.name}? Please confirm to proceed.`;

      return {
        success: true,
        requiresConfirmation: true,
        commandId,
        pendingCommandId: commandId,
        intent: parsed.action,
        confidenceLevel: parsed.confidenceLevel,
        confidence: parsed.confidence,
        suggestedQuantity: effectiveQuantity,
        message: promptText,
        spokenMessage: promptText,
        parsed,
        command: {
          action: parsed.action,
          product: product.name,
          productId: product.id,
          quantity: effectiveQuantity,
          unit: finalUnit,
        },
      };
    }

    // C. IMMEDIATE HIGH-CONFIDENCE ATOMIC DATABASE EXECUTION
    const payload = {
      productId: product.id,
      quantity: effectiveQuantity,
      unit: finalUnit,
      source: source.toUpperCase() === 'VOICE' ? 'VOICE' : 'TEXT',
      confidence: parsed.confidence,
      originalCommand: command,
    };

    const updateResult = parsed.action === 'ADD'
      ? await inventoryService.addStock(payload)
      : await inventoryService.removeStock(payload);

    // Record successful execution in voice_commands table
    await pool.query(
      `INSERT INTO voice_commands 
       (original_command, intent, product_id, product_name, quantity, unit, confidence, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
      [command, parsed.action, product.id, product.name, effectiveQuantity, finalUnit, parsed.confidence]
    );

    const actionPast = parsed.action === 'ADD' ? 'added' : 'removed';
    const successMsg = `${spokenQuantityDesc}${conversionNote} of ${product.name} ${actionPast} successfully. Remaining stock: ${updateResult.currentStock} ${finalUnit}.`;

    return {
      success: true,
      intent: parsed.action,
      message: successMsg,
      spokenMessage: successMsg,
      requiresConfirmation: false,
      parsed,
      data: {
        product: product.name,
        productId: product.id,
        action: parsed.action,
        quantity: effectiveQuantity,
        unit: finalUnit,
        previousStock: currentStock,
        currentStock: updateResult.currentStock,
        status: updateResult.status,
      },
    };
  }

  // Fallback for unhandled command
  const fallbackMsg = "I couldn't understand that command. Try saying 'Add 20 bags of rice', 'What is running low?', or 'How is my rice stock?'.";
  return {
    success: false,
    message: fallbackMsg,
    spokenMessage: fallbackMsg,
    parsed,
  };
};

/**
 * Confirm a Pending Voice Command
 * Uses MySQL transactions and status locks to strictly prevent duplicate executions.
 */
export const confirmPendingCommand = async ({ commandId, confirmedQuantity }) => {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Lock and fetch pending command
    const [commands] = await conn.query(
      'SELECT * FROM voice_commands WHERE id = ? FOR UPDATE',
      [commandId]
    );

    if (commands.length === 0) {
      await conn.rollback();
      const err = new Error('Voice command not found.');
      err.statusCode = 404;
      throw err;
    }

    const cmd = commands[0];

    // Idempotency: Prevent duplicate execution
    if (cmd.status !== 'PENDING_CONFIRMATION') {
      await conn.rollback();
      const err = new Error(`Command has already been processed (Current status: ${cmd.status}).`);
      err.statusCode = 400;
      err.alreadyProcessed = true;
      throw err;
    }

    // 2. Fetch product
    const [products] = await conn.query(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [cmd.product_id]
    );

    if (products.length === 0) {
      await conn.rollback();
      const err = new Error('Associated product not found in inventory.');
      err.statusCode = 404;
      throw err;
    }

    const product = products[0];
    const previousStock = parseFloat(product.current_stock);
    const finalQuantity = (confirmedQuantity !== undefined && confirmedQuantity !== null)
      ? parseFloat(confirmedQuantity)
      : (cmd.suggested_quantity !== null ? parseFloat(cmd.suggested_quantity) : parseFloat(cmd.quantity));

    if (isNaN(finalQuantity) || finalQuantity <= 0) {
      await conn.rollback();
      const err = new Error('Invalid confirmed quantity.');
      err.statusCode = 400;
      throw err;
    }

    let updatedStock = previousStock;

    if (cmd.intent === 'REMOVE') {
      if (previousStock < finalQuantity) {
        await conn.rollback();
        const err = new Error(`Cannot remove ${finalQuantity} ${cmd.unit}. Only ${previousStock} ${product.unit} available.`);
        err.statusCode = 400;
        throw err;
      }
      updatedStock = previousStock - finalQuantity;
    } else if (cmd.intent === 'ADD') {
      updatedStock = previousStock + finalQuantity;
    }

    // 3. Update product stock
    await conn.query(
      'UPDATE products SET current_stock = ? WHERE id = ?',
      [updatedStock, product.id]
    );

    // 4. Create inventory transaction record
    await conn.query(
      `INSERT INTO inventory_transactions 
       (product_id, action, quantity, unit, previous_stock, updated_stock, source, confidence, original_command)
       VALUES (?, ?, ?, ?, ?, ?, 'VOICE', ?, ?)`,
      [product.id, cmd.intent, finalQuantity, cmd.unit, previousStock, updatedStock, cmd.confidence, cmd.original_command]
    );

    // 5. Update voice_commands status to CONFIRMED
    await conn.query(
      'UPDATE voice_commands SET status = "CONFIRMED", quantity = ? WHERE id = ?',
      [finalQuantity, cmd.id]
    );

    await conn.commit();

    const actionPast = cmd.intent === 'ADD' ? 'Added' : 'Removed';
    const successMsg = `Confirmed: ${actionPast} ${finalQuantity} ${cmd.unit} of ${product.name}. Remaining stock: ${updatedStock} ${cmd.unit}.`;

    return {
      success: true,
      message: successMsg,
      spokenMessage: successMsg,
      commandId: cmd.id,
      intent: cmd.intent,
      data: {
        productId: product.id,
        product: product.name,
        action: cmd.intent,
        quantity: finalQuantity,
        unit: cmd.unit,
        previousStock,
        currentStock: updatedStock,
      },
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Cancel a Pending Voice Command
 */
export const cancelPendingCommand = async ({ commandId }) => {
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE voice_commands SET status = "CANCELLED" WHERE id = ? AND status = "PENDING_CONFIRMATION"',
    [commandId]
  );

  if (result.affectedRows === 0) {
    const error = new Error('No pending command found to cancel.');
    error.statusCode = 404;
    throw error;
  }

  const cancelMsg = 'Command cancelled. No inventory changes were made.';
  return {
    success: true,
    message: cancelMsg,
    spokenMessage: cancelMsg,
    commandId,
  };
};

/**
 * Fetch Voice Command Audit History
 */
export const getVoiceHistory = async (limit = 30) => {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT vc.id, vc.original_command, vc.intent, vc.product_id, vc.product_name,
           vc.quantity, vc.unit, vc.confidence, vc.status, vc.suggested_quantity,
           vc.created_at
    FROM voice_commands vc
    ORDER BY vc.created_at DESC, vc.id DESC
    LIMIT ?
  `, [Math.min(100, Math.max(1, parseInt(limit, 10) || 30))]);

  return rows.map(r => ({
    id: r.id,
    originalCommand: r.original_command,
    intent: r.intent,
    productId: r.product_id,
    product: r.product_name || '—',
    quantity: r.quantity !== null ? parseFloat(r.quantity) : null,
    unit: r.unit,
    confidence: parseFloat(r.confidence),
    status: r.status,
    suggestedQuantity: r.suggested_quantity !== null ? parseFloat(r.suggested_quantity) : null,
    createdAt: r.created_at,
  }));
};

/**
 * Fetch Pending Confirmation Commands
 */
export const getPendingVoiceCommands = async () => {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT vc.*, p.current_stock
    FROM voice_commands vc
    LEFT JOIN products p ON vc.product_id = p.id
    WHERE vc.status = 'PENDING_CONFIRMATION'
    ORDER BY vc.created_at DESC
    LIMIT 1
  `);

  if (rows.length === 0) return null;
  const cmd = rows[0];
  return {
    commandId: cmd.id,
    originalCommand: cmd.original_command,
    intent: cmd.intent,
    product: cmd.product_name,
    productId: cmd.product_id,
    quantity: parseFloat(cmd.quantity),
    suggestedQuantity: cmd.suggested_quantity !== null ? parseFloat(cmd.suggested_quantity) : parseFloat(cmd.quantity),
    unit: cmd.unit,
    confidence: parseFloat(cmd.confidence),
    currentStock: cmd.current_stock !== null ? parseFloat(cmd.current_stock) : null,
    createdAt: cmd.created_at,
  };
};

export default {
  handleVoiceCommand,
  confirmPendingCommand,
  cancelPendingCommand,
  getVoiceHistory,
  getPendingVoiceCommands,
};
