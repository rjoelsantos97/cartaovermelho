import { getCronService } from '@/lib/scheduler/cron-service';

// Auto-start schedulers when the app initializes
if (typeof window === 'undefined') { // Server-side only
  console.log('🚀 Inicializando schedulers automáticos...');
  
  // Use setImmediate to ensure it runs after the current event loop
  setImmediate(() => {
    try {
      const cronService = getCronService();
      
      // Start only pipeline scheduler (includes scraping + LLM)
      cronService.startPipelineScheduler(); // Every hour at xx:20
      
      // Log current status
      const status = cronService.getJobStatus();
      console.log('✅ Schedulers automáticos iniciados:', status);
    } catch (error) {
      console.error('❌ Erro ao iniciar schedulers automáticos:', error);
    }
  });
}