import { parseCommand } from './services/commandParser.js';
import { validateInventoryQuantities, convertUnit, UNIT_FAMILIES } from './validators/voiceCommandValidator.js';

console.log('================================================================');
console.log('       PEOPLE VOICE — COMPREHENSIVE UNITS COVERAGE TEST');
console.log('================================================================\n');

const testCommands = [
  // 1. WEIGHT
  { cmd: 'Add 500 mg paracetamol', expUnit: 'mg', expQty: 500 },
  { cmd: 'Add 250 g tea powder', expUnit: 'grams', expQty: 250 },
  { cmd: 'Add 10 kg sugar', expUnit: 'kg', expQty: 10 },
  { cmd: 'Add 2 quintal wheat flour', expUnit: 'quintals', expQty: 2 },
  { cmd: 'Add 3 tonne rice', expUnit: 'tonnes', expQty: 3 },
  { cmd: 'Add 5 ton sugar', expUnit: 'tons', expQty: 5 },

  // 2. LIQUID / VOLUME
  { cmd: 'Add 750 ml milk', expUnit: 'ml', expQty: 750 },
  { cmd: 'Add 15 litre cooking oil', expUnit: 'litres', expQty: 15 },
  { cmd: 'Add 2 kilolitre water', expUnit: 'kilolitres', expQty: 2 },

  // 3. COUNT
  { cmd: 'Add 100 piece soap', expUnit: 'pieces', expQty: 100 },
  { cmd: 'Add 50 units shampoo', expUnit: 'units', expQty: 50 },

  // 4. PACKAGING / TRADE
  { cmd: 'Add 20 bags rice', expUnit: 'bags', expQty: 20 },
  { cmd: 'Add 30 packet biscuits', expUnit: 'packets', expQty: 30 },
  { cmd: 'Add 15 box chocolates', expUnit: 'boxes', expQty: 15 },
  { cmd: 'Add 10 carton biscuits', expUnit: 'cartons', expQty: 10 },
  { cmd: 'Add 24 bottle mineral water', expUnit: 'bottles', expQty: 24 },
  { cmd: 'Add 12 can soda', expUnit: 'cans', expQty: 12 },
  { cmd: 'Add 6 tin ghee', expUnit: 'tins', expQty: 6 },
  { cmd: 'Add 8 jar pickles', expUnit: 'jars', expQty: 8 },
  { cmd: 'Add 5 bundle coriander', expUnit: 'bundles', expQty: 5 },
  { cmd: 'Add 40 sack wheat', expUnit: 'sacks', expQty: 40 },
  { cmd: 'Add 20 roll tape', expUnit: 'rolls', expQty: 20 },
  { cmd: 'Add 10 pack noodles', expUnit: 'packs', expQty: 10 },
  { cmd: 'Add 15 crate eggs', expUnit: 'crates', expQty: 15 },
  { cmd: 'Add 8 tray mangoes', expUnit: 'trays', expQty: 8 },

  // 5. QUANTITY GROUPS
  { cmd: 'Add 2 dozen eggs', expUnit: 'dozens', expQty: 2 },
  { cmd: 'Add 5 pair gloves', expUnit: 'pairs', expQty: 5 },
  { cmd: 'Add 3 set glasses', expUnit: 'sets', expQty: 3 },

  // 6. AGRICULTURE / WHOLESALE
  { cmd: 'Add 25 bale cotton', expUnit: 'bales', expQty: 25 },
  { cmd: 'Add 10 quintals paddy', expUnit: 'quintals', expQty: 10 },
  { cmd: 'Add 4 tonnes fertilizer', expUnit: 'tonnes', expQty: 4 },
];

let parsePassed = 0;
for (const tc of testCommands) {
  const parsed = parseCommand(tc.cmd);
  const ok = parsed.unit === tc.expUnit && parsed.quantity === tc.expQty;
  if (ok) {
    console.log(`[PASS] "${tc.cmd}" -> Qty: ${parsed.quantity}, Unit: ${parsed.unit}`);
    parsePassed++;
  } else {
    console.log(`[FAIL] "${tc.cmd}" -> Expected: ${tc.expQty} ${tc.expUnit}, Got: ${parsed.quantity} ${parsed.unit}`);
  }
}
console.log(`\nParsing Accuracy: ${parsePassed}/${testCommands.length} Passed\n`);

// Test Proportional Unit Conversions
console.log('--- Proportional Unit Conversions ---');
const conversions = [
  // 500 grams into kg product -> 0.5 kg
  { val: 500, from: 'grams', to: 'kg', expected: 0.5 },
  // 2 quintals into kg product -> 200 kg
  { val: 2, from: 'quintals', to: 'kg', expected: 200 },
  // 1 tonne into kg product -> 1000 kg
  { val: 1, from: 'tonne', to: 'kg', expected: 1000 },
  // 1500 ml into litres product -> 1.5 litres
  { val: 1500, from: 'ml', to: 'litres', expected: 1.5 },
  // 2 kilolitres into litres -> 2000 litres
  { val: 2, from: 'kilolitres', to: 'litres', expected: 2000 },
  // 3 dozens into pieces -> 36 pieces
  { val: 3, from: 'dozens', to: 'pieces', expected: 36 },
  // 4 pairs into pieces -> 8 pieces
  { val: 4, from: 'pairs', to: 'pieces', expected: 8 },
];

let convPassed = 0;
for (const c of conversions) {
  const res = convertUnit(c.val, c.from, c.to);
  if (Math.abs(res - c.expected) < 0.0001) {
    console.log(`[PASS] ${c.val} ${c.from} = ${res} ${c.to}`);
    convPassed++;
  } else {
    console.log(`[FAIL] ${c.val} ${c.from} -> Expected ${c.expected}, got ${res}`);
  }
}
console.log(`\nConversion Accuracy: ${convPassed}/${conversions.length} Passed\n`);

// Test Incompatible Unit Guards
console.log('--- Incompatible Unit Guards ---');
try {
  validateInventoryQuantities(5, 'bags', 'litres');
  console.log('[FAIL] Should have rejected litres for bags');
} catch (e) {
  if (e.errorCode === 'INCOMPATIBLE_UNIT') {
    console.log('[PASS] Rejected incompatible unit: litres cannot be used for bags');
  }
}

try {
  validateInventoryQuantities(10, 'kg', 'litres');
  console.log('[FAIL] Should have rejected litres for kg');
} catch (e) {
  if (e.errorCode === 'INCOMPATIBLE_UNIT') {
    console.log('[PASS] Rejected incompatible unit: litres cannot be used for kg');
  }
}

console.log('\n================================================================');
console.log('ALL UNIT TESTS COMPLETED SUCCESSFULLY!');
console.log('================================================================');
