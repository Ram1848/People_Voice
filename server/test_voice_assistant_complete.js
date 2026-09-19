/**
 * Comprehensive 15-Point Voice Test Suite for People Voice
 */
async function runCompleteTestSuite() {
  const API_URL = 'http://127.0.0.1:5000/api';
  console.log('================================================================');
  console.log('      PEOPLE VOICE — COMPREHENSIVE 15-POINT TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 15;

  async function postCommand(cmd) {
    const res = await fetch(`${API_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd, source: 'VOICE' })
    });
    return await res.json();
  }

  // TEST 1: "Add 20 bags of rice"
  console.log('TEST 1: "Add 20 bags of rice"');
  try {
    const r1 = await postCommand('Add 20 bags of rice');
    console.log(`  Parsed Action: ${r1.parsed?.action}, Product: ${r1.parsed?.product}, Qty: ${r1.parsed?.quantity}`);
    console.log(`  Response: "${r1.message}" | Stock: ${r1.data?.currentStock}`);
    if (r1.success && r1.parsed?.action === 'ADD' && r1.parsed?.quantity === 20) {
      console.log('  [PASS] Test 1 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 1 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 1 error:', err.message);
  }

  // TEST 2: "Remove 5 bags of rice"
  console.log('TEST 2: "Remove 5 bags of rice"');
  try {
    const r2 = await postCommand('Remove 5 bags of rice');
    console.log(`  Parsed Action: ${r2.parsed?.action}, Product: ${r2.parsed?.product}, Qty: ${r2.parsed?.quantity}`);
    console.log(`  Response: "${r2.message}" | Stock: ${r2.data?.currentStock}`);
    if (r2.success && r2.parsed?.action === 'REMOVE' && r2.parsed?.quantity === 5) {
      console.log('  [PASS] Test 2 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 2 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 2 error:', err.message);
  }

  // TEST 3: "How much rice do I have?"
  console.log('TEST 3: "How much rice do I have?"');
  try {
    const r3 = await postCommand('How much rice do I have?');
    console.log(`  Parsed Action: ${r3.parsed?.action}, Product: ${r3.parsed?.product}`);
    console.log(`  Response: "${r3.spokenMessage || r3.message}" | Current Stock: ${r3.data?.currentStock}`);
    if (r3.success && r3.parsed?.action === 'CHECK') {
      console.log('  [PASS] Test 3 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 3 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 3 error:', err.message);
  }

  // TEST 4: "What is running low?"
  console.log('TEST 4: "What is running low?"');
  try {
    const r4 = await postCommand('What is running low?');
    console.log(`  Parsed Action: ${r4.parsed?.action}`);
    console.log(`  Spoken Response: "${r4.spokenMessage}" | Low Stock Count: ${r4.data?.lowStockCount}`);
    if (r4.success && r4.parsed?.action === 'LOW_STOCK') {
      console.log('  [PASS] Test 4 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 4 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 4 error:', err.message);
  }

  // TEST 5: "What do I need to buy today?"
  console.log('TEST 5: "What do I need to buy today?"');
  try {
    const r5 = await postCommand('What do I need to buy today?');
    console.log(`  Parsed Action: ${r5.parsed?.action}`);
    console.log(`  Spoken Response: "${r5.spokenMessage}" | Items count: ${r5.data?.count || r5.data?.recommendations?.length}`);
    if (r5.success && (r5.parsed?.action === 'REORDER' || r5.parsed?.action === 'BUSINESS_QUERY')) {
      console.log('  [PASS] Test 5 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 5 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 5 error:', err.message);
  }

  // TEST 6: "How is my rice stock?"
  console.log('TEST 6: "How is my rice stock?"');
  try {
    const r6 = await postCommand('How is my rice stock?');
    console.log(`  Parsed Action: ${r6.parsed?.action}, Status: ${r6.data?.status}`);
    console.log(`  Explanation: "${r6.data?.explanation}"`);
    if (r6.success && r6.parsed?.action === 'STOCK_EXPLAIN' && r6.data?.explanation) {
      console.log('  [PASS] Test 6 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 6 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 6 error:', err.message);
  }

  // TEST 7: "Show today's stock changes"
  console.log('TEST 7: "Show today\'s stock changes"');
  try {
    const r7 = await postCommand("Show today's stock changes");
    console.log(`  Parsed Action: ${r7.parsed?.action}`);
    console.log(`  Spoken: "${r7.spokenMessage}" | Activity: In: ${r7.data?.todayActivity?.totalItemsIn}, Out: ${r7.data?.todayActivity?.totalItemsOut}`);
    if (r7.success && r7.parsed?.action === 'DAILY_ACTIVITY') {
      console.log('  [PASS] Test 7 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 7 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 7 error:', err.message);
  }

  // TEST 8: "Rice 20 bags add cheyyi" (Telugu mixed ADD)
  console.log('TEST 8: "Rice 20 bags add cheyyi" (Mixed Telugu ADD)');
  try {
    const r8 = await postCommand('Rice 20 bags add cheyyi');
    console.log(`  Parsed Action: ${r8.parsed?.action}, Product: ${r8.parsed?.product}, Qty: ${r8.parsed?.quantity}`);
    console.log(`  Response: "${r8.message}" | New Stock: ${r8.data?.currentStock}`);
    if (r8.success && r8.parsed?.action === 'ADD' && r8.parsed?.quantity === 20) {
      console.log('  [PASS] Test 8 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 8 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 8 error:', err.message);
  }

  // TEST 9: "Rice 5 bags remove cheyyi" (Telugu mixed REMOVE)
  console.log('TEST 9: "Rice 5 bags remove cheyyi" (Mixed Telugu REMOVE)');
  try {
    const r9 = await postCommand('Rice 5 bags remove cheyyi');
    console.log(`  Parsed Action: ${r9.parsed?.action}, Product: ${r9.parsed?.product}, Qty: ${r9.parsed?.quantity}`);
    console.log(`  Response: "${r9.message}" | New Stock: ${r9.data?.currentStock}`);
    if (r9.success && r9.parsed?.action === 'REMOVE' && r9.parsed?.quantity === 5) {
      console.log('  [PASS] Test 9 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 9 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 9 error:', err.message);
  }

  // TEST 10: "Rice stock entha undi?" (Telugu mixed CHECK)
  console.log('TEST 10: "Rice stock entha undi?" (Mixed Telugu CHECK)');
  try {
    const r10 = await postCommand('Rice stock entha undi?');
    console.log(`  Parsed Action: ${r10.parsed?.action}, Product: ${r10.parsed?.product}`);
    console.log(`  Response: "${r10.spokenMessage || r10.message}" | Stock: ${r10.data?.currentStock}`);
    if (r10.success && r10.parsed?.action === 'CHECK') {
      console.log('  [PASS] Test 10 passed\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 10 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 10 error:', err.message);
  }

  // TEST 11: Insufficient stock suggestion + Confirmation flow
  console.log('TEST 11: "Remove 500 bags of rice" (Excess removal -> Suggestion -> Confirm flow)');
  try {
    const r11 = await postCommand('Remove 500 bags of rice');
    console.log(`  Available Stock: ${r11.availableStock}, Suggested: ${r11.suggestedQuantity}`);
    console.log(`  Requires Confirmation: ${r11.requiresConfirmation}, Pending ID: ${r11.pendingCommandId}`);
    
    // Now confirm the suggested quantity if pendingCommandId was created
    if (r11.requiresConfirmation && r11.pendingCommandId) {
      const confirmRes = await fetch(`${API_URL}/voice/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingCommandId: r11.pendingCommandId })
      }).then(r => r.json());
      console.log(`  Confirmation Execution: "${confirmRes.message}", Remaining Stock: ${confirmRes.data?.currentStock}`);
      if (confirmRes.success && confirmRes.data?.currentStock === 0) {
        console.log('  [PASS] Test 11 passed (Safety prevented overdraft & confirmed available balance successfully)\n');
        passed++;
      } else {
        console.log('  [FAIL] Test 11 confirmation failed\n');
      }
    } else if (!r11.success && r11.availableStock !== undefined) {
      console.log('  [PASS] Test 11 passed (Safely blocked overdraft)\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 11 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 11 error:', err.message);
  }

  // TEST 12: Missing quantity: "Add rice"
  console.log('TEST 12: "Add rice" (Missing quantity)');
  try {
    const r12 = await postCommand('Add rice');
    console.log(`  Success: ${r12.success}, Error: ${r12.error}`);
    console.log(`  Message: "${r12.message}"`);
    if (!r12.success && (r12.error === 'MISSING_QUANTITY' || r12.message.includes('How much'))) {
      console.log('  [PASS] Test 12 passed (Correctly prompted for quantity)\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 12 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 12 error:', err.message);
  }

  // TEST 13: Ambiguous product: "Add 10 oil"
  console.log('TEST 13: "Add 10 oil" (Ambiguous product)');
  try {
    const r13 = await postCommand('Add 10 oil');
    console.log(`  Success: ${r13.success}, Is Ambiguous: ${r13.isAmbiguous}`);
    console.log(`  Candidates:`, r13.candidates);
    console.log(`  Message: "${r13.message}"`);
    if (!r13.success && (r13.isAmbiguous || r13.error === 'AMBIGUOUS_PRODUCT' || r13.message.includes('Which product'))) {
      console.log('  [PASS] Test 13 passed (Identified ambiguity cleanly)\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 13 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 13 error:', err.message);
  }

  // TEST 14: Negative quantity: "Add -10 bags rice"
  console.log('TEST 14: "Add -10 bags rice" (Negative quantity guard)');
  try {
    const r14 = await postCommand('Add -10 bags rice');
    console.log(`  Success: ${r14.success}, Error: ${r14.error}`);
    console.log(`  Message: "${r14.message}"`);
    if (!r14.success && (r14.error === 'INVALID_QUANTITY' || r14.error === 'PARSING_FAILED' || r14.message.includes('positive') || r14.message.includes('greater than 0'))) {
      console.log('  [PASS] Test 14 passed (Negative quantity safely rejected)\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 14 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 14 error:', err.message);
  }

  // TEST 15: Empty speech: ""
  console.log('TEST 15: "" (Empty speech guard)');
  try {
    const r15 = await postCommand('');
    console.log(`  Success: ${r15.success}, Error: ${r15.error || r15.errorCode}`);
    console.log(`  Message: "${r15.message}"`);
    if (!r15.success && (r15.error === 'NO_SPEECH' || r15.errorCode === 'NO_SPEECH' || r15.message.includes('No speech'))) {
      console.log('  [PASS] Test 15 passed (Empty speech safely handled)\n');
      passed++;
    } else {
      console.log('  [FAIL] Test 15 failed\n');
    }
  } catch (err) {
    console.error('  [FAIL] Test 15 error:', err.message);
  }

  console.log('================================================================');
  console.log(`TEST SUITE COMPLETED: ${passed}/${total} TESTS PASSED`);
  console.log('================================================================');
}

runCompleteTestSuite();
