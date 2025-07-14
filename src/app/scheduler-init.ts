import { getCronService } from '@/lib/scheduler/cron-service';

// Auto-start schedulers when the app initializes
if (typeof window === 'undefined') { // Server-side only
  console.log('🚀 Inicializando schedulers automáticos...');
  
  // Start schedulers after a short delay to ensure app is ready
  setTimeout(() => {
    try {
      const cronService = getCronService();
      
      // Start both schedulers by default
      cronService.startPipelineScheduler(); // Every 2 hours
      cronService.startScrapingOnlyScheduler(); // Every hour
      
      console.log('✅ Schedulers automáticos iniciados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao iniciar schedulers automáticos:', error);
    }
  }, 5000); // 5 second delay
}