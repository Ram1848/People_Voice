import app from './app.js';
import { initDB, getPool } from './config/db.js';

let server;

async function runEndToEndTests() {
  await initDB();
  const PORT = 5088;
  server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api`;
  const pool = getPool();

  console.log('====================================================');
  console.log('    PEOPLE VOICE — 8 REQUIRED END-TO-END TESTS      ');
  console.log('====================================================\n');

  let passed = 0;

  try {
    // Reset Rice stock to 45 bags for clean baseline
    await pool.query("UPDATE products SET current_stock = 45 WHERE LOWER(name) = 'rice'");

    // ----------------------------------------------------
    // TEST 1: "Add 20 bags of rice"
    // ----------------------------------------------------
    console.log('--- TEST 1: "Add 20 bags of rice" ---');
    const [beforeT1] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const initialStock = parseFloat(beforeT1[0].current_stock); // 45

    const res1 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Add 20 bags of rice', source: 'VOICE' })
    }).then(r => r.json());

    const [afterT1] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const updatedStockT1 = parseFloat(afterT1[0].current_stock);

    const [txT1] = await pool.query(
      `SELECT * FROM inventory_transactions 
       WHERE action = 'ADD' AND source = 'VOICE' 
       ORDER BY id DESC LIMIT 1`
    );

    const test1Pass = res1.success === true &&
      updatedStockT1 === initialStock + 20 &&
      txT1.length > 0 &&
      parseFloat(txT1[0].quantity) === 20 &&
      parseFloat(txT1[0].previous_stock) === initialStock &&
      parseFloat(txT1[0].updated_stock) === initialStock + 20 &&
      Boolean(res1.spokenMessage);

    if (test1Pass) {
      console.log(`[PASS] TEST 1: Stock ${initialStock} -> ${updatedStockT1} bags.`);
      console.log(`       Transaction recorded in DB: ID ${txT1[0].id}, Action: ${txT1[0].action}, Qty: ${txT1[0].quantity}, Source: ${txT1[0].source}`);
      console.log(`       Spoken: "${res1.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 1:', res1);
    }

    // ----------------------------------------------------
    // TEST 2: "Remove 5 bags of rice"
    // ----------------------------------------------------
    console.log('--- TEST 2: "Remove 5 bags of rice" ---');
    const [beforeT2] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const stockBeforeT2 = parseFloat(beforeT2[0].current_stock);

    const res2 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Remove 5 bags of rice', source: 'VOICE' })
    }).then(r => r.json());

    const [afterT2] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const updatedStockT2 = parseFloat(afterT2[0].current_stock);

    const [txT2] = await pool.query(
      `SELECT * FROM inventory_transactions 
       WHERE action = 'REMOVE' AND source = 'VOICE' 
       ORDER BY id DESC LIMIT 1`
    );

    const test2Pass = res2.success === true &&
      updatedStockT2 === stockBeforeT2 - 5 &&
      txT2.length > 0 &&
      parseFloat(txT2[0].quantity) === 5 &&
      parseFloat(txT2[0].previous_stock) === stockBeforeT2 &&
      parseFloat(txT2[0].updated_stock) === stockBeforeT2 - 5 &&
      Boolean(res2.spokenMessage);

    if (test2Pass) {
      console.log(`[PASS] TEST 2: Stock ${stockBeforeT2} -> ${updatedStockT2} bags.`);
      console.log(`       Transaction recorded in DB: ID ${txT2[0].id}, Action: ${txT2[0].action}, Qty: ${txT2[0].quantity}, Source: ${txT2[0].source}`);
      console.log(`       Spoken: "${res2.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 2:', res2);
    }

    // ----------------------------------------------------
    // TEST 3: "How much rice do I have?"
    // ----------------------------------------------------
    console.log('--- TEST 3: "How much rice do I have?" ---');
    const res3 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'How much rice do I have?', source: 'VOICE' })
    }).then(r => r.json());

    const test3Pass = res3.success === true &&
      res3.parsed?.action === 'CHECK' &&
      res3.data?.currentStock === updatedStockT2 &&
      Boolean(res3.spokenMessage) &&
      res3.spokenMessage.includes(`${updatedStockT2} bags`);

    if (test3Pass) {
      console.log(`[PASS] TEST 3: Returned real database stock: ${res3.data.currentStock} ${res3.data.unit}`);
      console.log(`       Spoken: "${res3.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 3:', res3);
    }

    // ----------------------------------------------------
    // TEST 4: "What's running low?"
    // ----------------------------------------------------
    console.log("--- TEST 4: \"What's running low?\" ---");
    const res4 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: "What's running low?", source: 'VOICE' })
    }).then(r => r.json());

    const test4Pass = res4.success === true &&
      res4.parsed?.action === 'LOW_STOCK' &&
      res4.data?.items !== undefined &&
      Boolean(res4.spokenMessage);

    if (test4Pass) {
      console.log(`[PASS] TEST 4: Returned real low stock items: ${res4.data.count} items`);
      console.log(`       Spoken: "${res4.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 4:', res4);
    }

    // ----------------------------------------------------
    // TEST 5: "What should I reorder?"
    // ----------------------------------------------------
    console.log('--- TEST 5: "What should I reorder?" ---');
    const res5 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'What should I reorder?', source: 'VOICE' })
    }).then(r => r.json());

    const test5Pass = res5.success === true &&
      res5.parsed?.action === 'REORDER' &&
      (res5.data?.items !== undefined || res5.data?.suggestions !== undefined) &&
      Boolean(res5.spokenMessage);

    if (test5Pass) {
      console.log(`[PASS] TEST 5: Returned reorder suggestions: count ${res5.data.count}`);
      console.log(`       Spoken: "${res5.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 5:', res5);
    }

    // ----------------------------------------------------
    // TEST 6: "Rice 20 bags add cheyyi"
    // ----------------------------------------------------
    console.log('--- TEST 6: "Rice 20 bags add cheyyi" (Mixed Telugu+English) ---');
    const [beforeT6] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const stockBeforeT6 = parseFloat(beforeT6[0].current_stock);

    const res6 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Rice 20 bags add cheyyi', source: 'VOICE' })
    }).then(r => r.json());

    const [afterT6] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const updatedStockT6 = parseFloat(afterT6[0].current_stock);

    const test6Pass = res6.success === true &&
      res6.parsed?.action === 'ADD' &&
      res6.parsed?.product === 'Rice' &&
      res6.parsed?.quantity === 20 &&
      updatedStockT6 === stockBeforeT6 + 20;

    if (test6Pass) {
      console.log(`[PASS] TEST 6: Mixed-language recognized! Stock ${stockBeforeT6} -> ${updatedStockT6} bags.`);
      console.log(`       Spoken: "${res6.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 6:', res6);
    }

    // ----------------------------------------------------
    // TEST 7: "Remove 100 bags of rice" (Overdraft protection)
    // ----------------------------------------------------
    console.log('--- TEST 7: "Remove 100 bags of rice" (Insufficient Stock Safeguard) ---');
    const [beforeT7] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const stockBeforeT7 = parseFloat(beforeT7[0].current_stock); // 80 bags

    const res7 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Remove 100 bags of rice', source: 'VOICE' })
    }).then(r => r.json());

    const [afterT7] = await pool.query("SELECT current_stock FROM products WHERE LOWER(name) = 'rice'");
    const stockAfterT7 = parseFloat(afterT7[0].current_stock);

    // Safeguard condition: DB MUST NOT CHANGE
    const test7Pass = stockAfterT7 === stockBeforeT7 &&
      res7.requiresConfirmation === true &&
      res7.isInsufficientStock === true &&
      Boolean(res7.spokenMessage) &&
      res7.spokenMessage.includes(`${stockBeforeT7}`);

    if (test7Pass) {
      console.log(`[PASS] TEST 7: Insufficient stock safeguard passed! Database UNCHANGED (${stockAfterT7} bags).`);
      console.log(`       Safe Spoken Warning: "${res7.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 7: Stock changed or warning missing! Got:', res7, 'Stock before:', stockBeforeT7, 'after:', stockAfterT7);
    }

    // ----------------------------------------------------
    // TEST 8: "What changed today?"
    // ----------------------------------------------------
    console.log('--- TEST 8: "What changed today?" ---');
    const res8 = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'What changed today?', source: 'VOICE' })
    }).then(r => r.json());

    const test8Pass = res8.success === true &&
      res8.parsed?.action === 'DAILY_ACTIVITY' &&
      res8.data?.totalTransactions > 0 &&
      Boolean(res8.spokenMessage);

    if (test8Pass) {
      console.log(`[PASS] TEST 8: Real activity returned! Total transactions today: ${res8.data.totalTransactions}`);
      console.log(`       Spoken: "${res8.spokenMessage}"\n`);
      passed++;
    } else {
      console.error('[FAIL] TEST 8:', res8);
    }

    console.log('====================================================');
    console.log(`RESULT: ${passed}/8 TESTS PASSED (${Math.round((passed / 8) * 100)}%)`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    await pool.end();
    if (passed === 8) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

runEndToEndTests();
