import app from './app.js';
import { initDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Connecting to MySQL and initializing schema...');
    await initDB();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 People Voice Backend running on http://localhost:${PORT}`);
      console.log(`API endpoints accessible at http://localhost:${PORT}/api`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
