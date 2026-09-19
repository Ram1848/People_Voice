/**
 * Voice Command Validator
 * 
 * Validates payloads before business logic execution.
 * Ensures security, data integrity, and strict business rule compliance.
 */

export const validateCommandInput = (req, res, next) => {
  const { command, transcript } = req.body;
  const rawText = command || transcript;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({
      success: false,
      message: 'No speech detected. Please say or enter a command.',
      spokenMessage: 'No speech detected. Please try again.',
      errorCode: 'EMPTY_COMMAND',
    });
  }

  req.body.cleanedCommand = rawText.trim();
  next();
};

export const validateConfirmationInput = (req, res, next) => {
  const { commandId, pendingCommandId } = req.body;
  const targetId = commandId || pendingCommandId;

  if (!targetId || isNaN(parseInt(targetId, 10))) {
    return res.status(400).json({
      success: false,
      message: 'A valid commandId is required to confirm an action.',
      spokenMessage: 'Invalid command confirmation reference.',
      errorCode: 'INVALID_COMMAND_ID',
    });
  }

  req.body.parsedCommandId = parseInt(targetId, 10);
  req.body.commandId = parseInt(targetId, 10);
  next();
};

export const validateCancellationInput = (req, res, next) => {
  const { commandId, pendingCommandId } = req.body;
  const targetId = commandId || pendingCommandId;

  if (!targetId || isNaN(parseInt(targetId, 10))) {
    return res.status(400).json({
      success: false,
      message: 'A valid commandId is required to cancel an action.',
      spokenMessage: 'Invalid command cancellation reference.',
      errorCode: 'INVALID_COMMAND_ID',
    });
  }

  req.body.parsedCommandId = parseInt(targetId, 10);
  req.body.commandId = parseInt(targetId, 10);
  next();
};

// --- COMPREHENSIVE UNIT TAXONOMY & FAMILIES ---
export const UNIT_FAMILIES = {
  // 1. WEIGHT
  'mg': 'weight',
  'milligram': 'weight',
  'milligrams': 'weight',
  'g': 'weight',
  'gram': 'weight',
  'grams': 'weight',
  'gm': 'weight',
  'gms': 'weight',
  'kg': 'weight',
  'kgs': 'weight',
  'kilo': 'weight',
  'kilos': 'weight',
  'kilogram': 'weight',
  'kilograms': 'weight',
  'quintal': 'weight',
  'quintals': 'weight',
  'tonne': 'weight',
  'tonnes': 'weight',
  'ton': 'weight',
  'tons': 'weight',

  // 2. LIQUID / VOLUME
  'ml': 'volume',
  'millilitre': 'volume',
  'millilitres': 'volume',
  'milliliter': 'volume',
  'milliliters': 'volume',
  'l': 'volume',
  'ltr': 'volume',
  'ltrs': 'volume',
  'litre': 'volume',
  'litres': 'volume',
  'liter': 'volume',
  'liters': 'volume',
  'kl': 'volume',
  'kilolitre': 'volume',
  'kilolitres': 'volume',
  'kiloliter': 'volume',
  'kiloliters': 'volume',

  // 3. COUNT
  'piece': 'count',
  'pieces': 'count',
  'pc': 'count',
  'pcs': 'count',
  'item': 'count',
  'items': 'count',
  'nag': 'count',
  'nagulu': 'count',
  'unit': 'count',
  'units': 'count',

  // 4. PACKAGING / TRADE
  'bag': 'packaging',
  'bags': 'packaging',
  'packet': 'packaging',
  'packets': 'packaging',
  'pkt': 'packaging',
  'pkts': 'packaging',
  'box': 'packaging',
  'boxes': 'packaging',
  'carton': 'packaging',
  'cartons': 'packaging',
  'bottle': 'packaging',
  'bottles': 'packaging',
  'can': 'packaging',
  'cans': 'packaging',
  'tin': 'packaging',
  'tins': 'packaging',
  'jar': 'packaging',
  'jars': 'packaging',
  'bundle': 'packaging',
  'bundles': 'packaging',
  'sack': 'packaging',
  'sacks': 'packaging',
  'roll': 'packaging',
  'rolls': 'packaging',
  'pack': 'packaging',
  'packs': 'packaging',
  'crate': 'packaging',
  'crates': 'packaging',
  'tray': 'packaging',
  'trays': 'packaging',

  // 5. QUANTITY GROUPS
  'dozen': 'group',
  'dozens': 'group',
  'pair': 'group',
  'pairs': 'group',
  'set': 'group',
  'sets': 'group',

  // 6. AGRICULTURE / WHOLESALE
  'bale': 'wholesale',
  'bales': 'wholesale',
};

// Base weight scale in grams (includes standard wholesale packaging weights for dry goods)
export const WEIGHT_TO_GRAMS = {
  'mg': 0.001,
  'milligram': 0.001,
  'milligrams': 0.001,
  'g': 1,
  'gram': 1,
  'grams': 1,
  'gm': 1,
  'gms': 1,
  'kg': 1000,
  'kgs': 1000,
  'kilo': 1000,
  'kilos': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
  'quintal': 100000,
  'quintals': 100000,
  'tonne': 1000000,
  'tonnes': 1000000,
  'ton': 1000000,
  'tons': 1000000,
  // Wholesale & retail packaging equivalents for agricultural dry goods
  'bag': 25000,
  'bags': 25000,
  'sack': 50000,
  'sacks': 50000,
  'packet': 1000,
  'packets': 1000,
};

// Base volume scale in millilitres
export const VOLUME_TO_ML = {
  'ml': 1,
  'millilitre': 1,
  'millilitres': 1,
  'milliliter': 1,
  'milliliters': 1,
  'l': 1000,
  'ltr': 1000,
  'ltrs': 1000,
  'litre': 1000,
  'litres': 1000,
  'liter': 1000,
  'liters': 1000,
  'kl': 1000000,
  'kilolitre': 1000000,
  'kilolitres': 1000000,
  'kiloliter': 1000000,
  'kiloliters': 1000000,
};

// Base count scale in units/pieces
export const COUNT_TO_PIECES = {
  'piece': 1,
  'pieces': 1,
  'pc': 1,
  'pcs': 1,
  'item': 1,
  'items': 1,
  'unit': 1,
  'units': 1,
  'pair': 2,
  'pairs': 2,
  'dozen': 12,
  'dozens': 12,
  'set': 1,
  'sets': 1,
};

export const convertUnit = (quantity, fromUnit, toUnit) => {
  if (!fromUnit || !toUnit) return quantity;
  const f = fromUnit.toLowerCase().trim();
  const t = toUnit.toLowerCase().trim();
  if (f === t) return quantity;

  // Weight conversion
  if (WEIGHT_TO_GRAMS[f] && WEIGHT_TO_GRAMS[t]) {
    return (quantity * WEIGHT_TO_GRAMS[f]) / WEIGHT_TO_GRAMS[t];
  }

  // Volume conversion
  if (VOLUME_TO_ML[f] && VOLUME_TO_ML[t]) {
    return (quantity * VOLUME_TO_ML[f]) / VOLUME_TO_ML[t];
  }

  // Group / Count conversion
  if (COUNT_TO_PIECES[f] && COUNT_TO_PIECES[t]) {
    return (quantity * COUNT_TO_PIECES[f]) / COUNT_TO_PIECES[t];
  }

  // Same packaging synonyms (e.g. bag <-> bags, sack <-> sacks)
  const norm = (u) => u.replace(/s$/, '');
  if (norm(f) === norm(t)) {
    return quantity;
  }

  return null;
};

export const validateInventoryQuantities = (quantity, productUnit, commandUnit) => {
  const num = parseFloat(quantity);
  if (isNaN(num) || num <= 0) {
    const err = new Error('Quantity must be a positive number greater than 0.');
    err.statusCode = 400;
    err.errorCode = 'INVALID_QUANTITY';
    throw err;
  }

  if (!productUnit || !commandUnit) {
    return {
      effectiveQuantity: num,
      effectiveUnit: productUnit || commandUnit,
      wasConverted: false,
    };
  }

  const normProductUnit = productUnit.toLowerCase().trim();
  const normCommandUnit = commandUnit.toLowerCase().trim();

  // Exact match
  if (normProductUnit === normCommandUnit) {
    return {
      effectiveQuantity: num,
      effectiveUnit: productUnit,
      wasConverted: false,
    };
  }

  // Check proportional conversion
  const converted = convertUnit(num, normCommandUnit, normProductUnit);
  if (converted !== null) {
    return {
      effectiveQuantity: converted,
      effectiveUnit: productUnit,
      wasConverted: converted !== num,
      originalQuantity: num,
      originalUnit: commandUnit,
    };
  }

  // Incompatible unit families check
  const pFam = UNIT_FAMILIES[normProductUnit] || 'unknown';
  const cFam = UNIT_FAMILIES[normCommandUnit] || 'unknown';

  if (pFam !== 'unknown' && cFam !== 'unknown' && pFam !== cFam) {
    const err = new Error(`The unit (${commandUnit}) does not match the product stock unit (${productUnit}).`);
    err.statusCode = 400;
    err.errorCode = 'INCOMPATIBLE_UNIT';
    throw err;
  }

  return {
    effectiveQuantity: num,
    effectiveUnit: productUnit,
    wasConverted: false,
  };
};

export default {
  validateCommandInput,
  validateConfirmationInput,
  validateCancellationInput,
  validateInventoryQuantities,
  convertUnit,
  UNIT_FAMILIES,
};
