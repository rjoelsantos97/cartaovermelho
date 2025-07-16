// Database initialization - runs on app startup
import { initializeDatabase } from '../../lib/database/init-db'

// Initialize database when the module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeDatabase().catch(console.error)
}