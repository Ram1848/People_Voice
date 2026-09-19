/**
 * Comprehensive Verification of Expanded Telugu + English Voice Commands (Section 31 & Section W Test Matrix)
 */
async function runExpandedVoiceTests() {
  const API_URL = 'http://127.0.0.1:5000/api';
  console.log('========================================================================');
  console.log('   PEOPLE VOICE — EXPANDED TELUGU + ENGLISH VOICE COMMANDS TEST MATRIX');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  const { getPool } = await import('./config/db.js');
  const pool = getPool();
  await pool.query("UPDATE voice_commands SET status = 'CANCELLED' WHERE status = 'PENDING_CONFIRMATION'");
  await pool.query("UPDATE products SET current_stock = 45 WHERE LOWER(name) = 'rice'");

  async function postCommand(cmd) {
    const res = await fetch(`${API_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd, source: 'VOICE' })
    });
    return await res.json();
  }

  function assertTest(title, condition, details) {
    total++;
    if (condition) {
      console.log(`[PASS] ${title}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       -> ${details}`);
    }
  }

  // --- SECTION 1: ENGLISH ---
  console.log('--- 1. ENGLISH COMMANDS ---');
  const e1 = await postCommand('Add 20 kg rice');
  assertTest('Add 20 kg rice', e1.success && e1.parsed?.action === 'ADD' && e1.parsed?.product === 'Rice' && e1.data?.action === 'ADD', e1.message);

  const e2 = await postCommand('Remove 5 kg rice');
  assertTest('Remove 5 kg rice', e2.success && e2.parsed?.action === 'REMOVE' && e2.parsed?.product === 'Rice', e2.message);

  const e3 = await postCommand('How much rice do I have?');
  assertTest('How much rice do I have?', e3.success && e3.parsed?.action === 'CHECK' && e3.parsed?.product === 'Rice', e3.spokenMessage);

  const e4 = await postCommand("What's running low?");
  assertTest("What's running low?", e4.success && e4.parsed?.action === 'LOW_STOCK', e4.spokenMessage);

  const e5 = await postCommand('What should I buy today?');
  assertTest('What should I buy today?', e5.success && (e5.parsed?.action === 'REORDER' || e5.parsed?.action === 'BUSINESS_QUERY'), e5.spokenMessage);

  // --- SECTION 2: TELUGU NATIVE SCRIPT ---
  console.log('\n--- 2. TELUGU NATIVE SCRIPT COMMANDS ---');
  const t1 = await postCommand('బియ్యం 20 కిలోలు యాడ్ చెయ్యి');
  assertTest('బియ్యం 20 కిలోలు యాడ్ చెయ్యి', t1.success && t1.parsed?.action === 'ADD' && t1.parsed?.product === 'Rice', t1.message);

  const t2 = await postCommand('బియ్యం 5 కిలోలు తీసేయి');
  assertTest('బియ్యం 5 కిలోలు తీసేయి', t2.success && t2.parsed?.action === 'REMOVE' && t2.parsed?.product === 'Rice', t2.message);

  const t3 = await postCommand('బియ్యం ఎంత ఉంది?');
  assertTest('బియ్యం ఎంత ఉంది?', t3.success && t3.parsed?.action === 'CHECK' && t3.parsed?.product === 'Rice', t3.spokenMessage);

  const t4 = await postCommand('ఏవి తక్కువగా ఉన్నాయి?');
  assertTest('ఏవి తక్కువగా ఉన్నాయి?', t4.success && t4.parsed?.action === 'LOW_STOCK', t4.spokenMessage);

  const t5 = await postCommand('ఈరోజు ఏం కొనాలి?');
  assertTest('ఈరోజు ఏం కొనాలి?', t5.success && (t5.parsed?.action === 'REORDER' || t5.parsed?.action === 'BUSINESS_QUERY'), t5.spokenMessage);

  // --- SECTION 3: MIXED TELUGU + ENGLISH ---
  console.log('\n--- 3. MIXED TELUGU + ENGLISH COMMANDS ---');
  const m1 = await postCommand('Rice 20 bags add cheyyi');
  assertTest('Rice 20 bags add cheyyi', m1.success && m1.parsed?.action === 'ADD' && m1.parsed?.product === 'Rice' && m1.parsed?.quantity === 20, m1.message);

  const m2 = await postCommand('Rice 5 bags remove cheyyi');
  assertTest('Rice 5 bags remove cheyyi', m2.success && m2.parsed?.action === 'REMOVE' && m2.parsed?.product === 'Rice' && m2.parsed?.quantity === 5, m2.message);

  const m3 = await postCommand('Rice stock entha undi?');
  assertTest('Rice stock entha undi?', m3.success && m3.parsed?.action === 'CHECK' && m3.parsed?.product === 'Rice', m3.spokenMessage);

  const m4 = await postCommand('Low stock products chupinchu');
  assertTest('Low stock products chupinchu', m4.success && m4.parsed?.action === 'LOW_STOCK', m4.spokenMessage);

  const m5 = await postCommand('Today em purchase cheyyali?');
  assertTest('Today em purchase cheyyali?', m5.success && (m5.parsed?.action === 'REORDER' || m5.parsed?.action === 'BUSINESS_QUERY'), m5.spokenMessage);

  const m6 = await postCommand('Rice ki reorder kavala?');
  assertTest('Rice ki reorder kavala?', m6.success && (m6.parsed?.action === 'REORDER' || m6.parsed?.action === 'STOCK_EXPLAIN'), m6.spokenMessage);

  // --- SECTION 4: WORD ORDER FLEXIBILITY & TELUGU NUMBERS ---
  console.log('\n--- 4. TELUGU NUMBERS & WORD ORDER FLEXIBILITY ---');
  const n1 = await postCommand('బియ్యం ఇరవై కిలోలు యాడ్ చెయ్యి');
  assertTest('బియ్యం ఇరవై కిలోలు యాడ్ చెయ్యి (Telugu numeral: ఇరవై -> 20)', n1.success && n1.parsed?.action === 'ADD' && n1.parsed?.quantity === 20, n1.message);

  const n2 = await postCommand('చక్కెర పది కిలోలు తీసేయి');
  assertTest('చక్కెర పది కిలోలు తీసేయి (Telugu numeral: పది -> 10)', n2.success && n2.parsed?.action === 'REMOVE' && n2.parsed?.quantity === 10, n2.message);

  const w1 = await postCommand('Twenty bags rice add cheyyi');
  assertTest('Twenty bags rice add cheyyi (Quantity First)', w1.success && w1.parsed?.action === 'ADD' && w1.parsed?.quantity === 20 && w1.parsed?.product === 'Rice', w1.message);

  const w2 = await postCommand('Rice ki twenty bags add cheyyi');
  assertTest('Rice ki twenty bags add cheyyi (Telugu suffix ki)', w2.success && w2.parsed?.action === 'ADD' && w2.parsed?.quantity === 20 && w2.parsed?.product === 'Rice', w2.message);

  const w3 = await postCommand('Rice nunchi 5 bags remove cheyyi');
  assertTest('Rice nunchi 5 bags remove cheyyi (Telugu particle nunchi)', w3.success && w3.parsed?.action === 'REMOVE' && w3.parsed?.quantity === 5 && w3.parsed?.product === 'Rice', w3.message);

  // --- SECTION 5: CLARIFICATIONS & AMBIGUITY ---
  console.log('\n--- 5. CLARIFICATIONS & AMBIGUITY ---');
  const c1 = await postCommand('Rice add cheyyi');
  assertTest('Rice add cheyyi (Missing quantity)', !c1.success && (c1.error === 'MISSING_QUANTITY' || c1.message.includes('How much Rice')), c1.message);

  const c2 = await postCommand('Add 20');
  assertTest('Add 20 (Missing product)', !c2.success && (c2.missingField === 'product' || c2.message.includes('Which product')), c2.message);

  const c3 = await postCommand('Oil add cheyyi');
  assertTest('Oil add cheyyi (Ambiguous oil entity)', !c3.success && c3.isAmbiguous && c3.message.includes('Which product do you mean'), c3.message);

  const c4 = await postCommand('బియ్యం 5 కిలోలు పోయాయి');
  assertTest('బియ్యం 5 కిలోలు పోయాయి (Ambiguous poyayi prompt)', !c4.success && c4.isAmbiguous && c4.clarificationType === 'DISCARD_OR_SALE', c4.message);

  // --- SECTION 6: VOICE CONFIRMATION & CANCELLATION ---
  console.log('\n--- 6. VOICE-TRIGGERED CONFIRMATION & CANCELLATION ---');
  // First trigger an overdraft removal to create a PENDING_CONFIRMATION
  const pending1 = await postCommand('Remove 500 bags of rice');
  assertTest('Trigger overdraft PENDING_CONFIRMATION', pending1.requiresConfirmation && pending1.pendingCommandId !== undefined, `Pending Command ID: ${pending1.pendingCommandId}`);

  // Now speak voice confirmation: "Confirm cheyyi"
  const conf1 = await postCommand('Confirm cheyyi');
  assertTest('Voice command: "Confirm cheyyi"', conf1.success && conf1.isVoiceConfirmation, conf1.message);

  // Trigger another overdraft removal to test voice cancellation
  await postCommand('Add 30 bags of rice');
  const pending2 = await postCommand('Remove 500 bags of rice');
  assertTest('Trigger overdraft for cancellation test', pending2.requiresConfirmation, pending2.message);

  // Now speak voice cancellation: "వద్దు"
  const canc1 = await postCommand('వద్దు');
  assertTest('Voice command: "వద్దు" (Telugu Cancel)', canc1.success && canc1.isVoiceCancellation, canc1.message);

  // Ensure all pending actions are cleared before testing empty confirmation
  await pool.query("UPDATE voice_commands SET status = 'CANCELLED' WHERE status = 'PENDING_CONFIRMATION'");
  const noPending = await postCommand('Yes');
  assertTest('Voice command "Yes" with no pending confirmation', !noPending.success && noPending.message.includes('no pending action'), noPending.message);

  console.log('\n========================================================================');
  console.log(`TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');
}

runExpandedVoiceTests();
