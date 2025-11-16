/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts
 * Used to initialize the BullMQ queue system
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      console.log('🚀 Initializing BullMQ queue system...');
      
      const { initializeQueueSystem } = await import('./src/lib/queue-init');
      await initializeQueueSystem();
      
      console.log('✅ BullMQ queue system initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize BullMQ queue system:', error);
      // Don't throw - allow server to start even if queue init fails
      // This prevents the entire app from crashing if Redis is unavailable
    }
  }
}

