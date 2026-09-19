import { parseCommand } from './services/commandParser.js';

const testCases = [
  {
    input: "Add 20 bags of rice",
    expectedAction: "ADD",
    expectedProduct: "rice",
    expectedQty: 20,
    expectedUnit: "bags",
    expectedConfidenceLevel: "HIGH"
  },
  {
    input: "Remove 5 kg sugar",
    expectedAction: "REMOVE",
    expectedProduct: "sugar",
    expectedQty: 5,
    expectedUnit: "kg",
    expectedConfidenceLevel: "HIGH"
  },
  {
    input: "How much rice do I have?",
    expectedAction: "CHECK",
    expectedProduct: "rice"
  },
  {
    input: "How is my rice stock?",
    expectedAction: "STOCK_EXPLAIN",
    expectedProduct: "rice"
  },
  {
    input: "What changed today?",
    expectedAction: "DAILY_ACTIVITY"
  },
  {
    input: "Which products need attention?",
    expectedAction: "ATTENTION"
  },
  {
    input: "What should I reorder?",
    expectedAction: "REORDER"
  },
  {
    input: "What do I need to buy today?",
    expectedAction: "REORDER"
  },
  {
    input: "Rice 20 bags add cheyyi",
    expectedAction: "ADD",
    expectedProduct: "rice",
    expectedQty: 20,
    expectedUnit: "bags",
    expectedConfidenceLevel: "HIGH"
  },
  {
    input: "5 kg sugar remove cheyyi",
    expectedAction: "REMOVE",
    expectedProduct: "sugar",
    expectedQty: 5,
    expectedUnit: "kg"
  },
  {
    input: "Sugar 5 kg theeyi",
    expectedAction: "REMOVE",
    expectedProduct: "sugar",
    expectedQty: 5,
    expectedUnit: "kg"
  },
  {
    input: "Rice twenty... maybe bags",
    expectedRequiresConfirmation: true,
    expectedConfidenceLevel: "MEDIUM" // or LOW
  }
];

console.log("--- Testing Upgraded Parser & Intent Classifier ---");
let passed = 0;
for (const tc of testCases) {
  const result = parseCommand(tc.input);
  const actionMatch = !tc.expectedAction || result.action === tc.expectedAction;
  const prodMatch = !tc.expectedProduct || result.product === tc.expectedProduct;
  const qtyMatch = tc.expectedQty === undefined || result.quantity === tc.expectedQty;
  const unitMatch = !tc.expectedUnit || result.unit === tc.expectedUnit;
  const confMatch = !tc.expectedConfidenceLevel || result.confidenceLevel === tc.expectedConfidenceLevel;
  const confirmMatch = tc.expectedRequiresConfirmation === undefined || result.requiresConfirmation === tc.expectedRequiresConfirmation;

  if (actionMatch && prodMatch && qtyMatch && unitMatch && confMatch && confirmMatch) {
    console.log(`[PASS] "${tc.input}" -> Action: ${result.action}, Confidence: ${result.confidence} (${result.confidenceLevel}), RequiresConfirm: ${result.requiresConfirmation}`);
    passed++;
  } else {
    console.error(`[FAIL] "${tc.input}" -> Got:`, result, "Expected:", tc);
  }
}

console.log(`\nParser tests: ${passed}/${testCases.length} passed.`);
if (passed !== testCases.length) process.exit(1);
