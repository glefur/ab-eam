import dotenv from 'dotenv';
import { initializeDatabase } from './config/migrations.js';
import { expressApp } from './config/express.js';

// Load environment variables
dotenv.config();

// Initialize database and start server
async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start Express server
    expressApp.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default expressApp.getApp(); 