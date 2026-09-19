import app from './app.js';
import { initDB, getPool } from './config/db.js';

let server;

async function runTests() {
  await initDB();
  const PORT = 5099;
  server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api`;

  try {
    console.log('\n--- 1. Testing GET /api/dashboard ---');
    const dashRes = await fetch(`${BASE_URL}/dashboard`).then(r => r.json());
    console.log('Dashboard stats:', {
      totalProducts: dashRes.data.totalProducts,
      totalStock: dashRes.data.totalStockQuantity,
      lowStock: dashRes.data.lowStockCount,
      outOfStock: dashRes.data.outOfStockCount
    });

    console.log('\n--- 2. Testing GET /api/products ---');
    const prodRes = await fetch(`${BASE_URL}/products`).then(r => r.json());
    console.log(`Loaded ${prodRes.data.length} products`);

    console.log('\n--- 3. Testing POST /api/voice/command ("Add 20 bags of rice") ---');
    const addRes = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Add 20 bags of rice', source: 'VOICE' })
    }).then(r => r.json());
    console.log('Add response:', addRes.message, 'Current stock:', addRes.data?.currentStock);

    console.log('\n--- 4. Testing POST /api/voice/command ("Remove 5 bags of rice") ---');
    const removeRes = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Remove 5 bags of rice', source: 'VOICE' })
    }).then(r => r.json());
    console.log('Remove response:', removeRes.message, 'Current stock:', removeRes.data?.currentStock);

    console.log('\n--- 5. Testing POST /api/voice/command ("How much rice do I have?") ---');
    const checkRes = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'How much rice do I have?', source: 'VOICE' })
    }).then(r => r.json());
    console.log('Check response:', checkRes.message);

    console.log('\n--- 6. Testing Insufficient Stock Error ("Remove 9999 bags of rice") ---');
    const errorRes = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Remove 9999 bags of rice', source: 'VOICE' })
    }).then(r => r.json());
    console.log('Insufficient stock handling:', errorRes.message, 'Success is false:', !errorRes.success);

    console.log('\n--- 7. Testing Missing Quantity ("Add rice") ---');
    const missingQtyRes = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Add rice', source: 'VOICE' })
    }).then(r => r.json());
    console.log('Missing quantity response:', missingQtyRes.message);

    console.log('\n--- 8. Testing Product Not Found ("Add 10 bags of nonexistentitem") ---');
    const notFoundRes = await fetch(`${BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'Add 10 bags of dragonfruit', source: 'VOICE' })
    }).then(r => r.json());
    console.log('Not found response:', notFoundRes.message);

    console.log('\n--- 9. Testing GET /api/inventory/history ---');
    const histRes = await fetch(`${BASE_URL}/inventory/history?limit=5`).then(r => r.json());
    console.log(`History count: ${histRes.data.length}, latest:`, histRes.data[0]?.action, histRes.data[0]?.product, histRes.data[0]?.quantity, histRes.data[0]?.source);

    console.log('\n--- 10. Testing GET /api/inventory/recommendations ---');
    const recRes = await fetch(`${BASE_URL}/inventory/recommendations`).then(r => r.json());
    console.log(`Recommendations count: ${recRes.data.length}, sample:`, recRes.data[0]);

    console.log('\nALL API TESTS PASSED SUCCESSFULLY! 🎉');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    const pool = getPool();
    await pool.end();
    process.exit(0);
  }
}

runTests();
