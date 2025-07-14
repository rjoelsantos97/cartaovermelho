import * as cron from 'node-cron';

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  startPipelineScheduler(): void {
    // Stop existing job if running
    this.stopJob('pipeline');

    // Schedule pipeline to run every 2 hours
    const task = cron.schedule('0 */2 * * *', async () => {
      console.log('🕐 Iniciando pipeline automática...');
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/run-pipeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Pipeline automática concluída:', result);
        } else {
          console.error('❌ Erro na pipeline automática:', await response.text());
        }
      } catch (error) {
        console.error('❌ Erro ao executar pipeline automática:', error);
      }
    }, {
      scheduled: false, // Don't start immediately
      timezone: 'Europe/Lisbon'
    });

    this.jobs.set('pipeline', task);
    task.start();
    
    console.log('🚀 Scheduler da pipeline ativado - execução a cada 2 horas');
  }

  startScrapingOnlyScheduler(): void {
    // Stop existing job if running
    this.stopJob('scraping');

    // Schedule scraping only to run every hour
    const task = cron.schedule('0 * * * *', async () => {
      console.log('🕐 Iniciando scraping automático...');
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/test-scraping-only`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Scraping automático concluído:', result);
        } else {
          console.error('❌ Erro no scraping automático:', await response.text());
        }
      } catch (error) {
        console.error('❌ Erro ao executar scraping automático:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Lisbon'
    });

    this.jobs.set('scraping', task);
    task.start();
    
    console.log('🚀 Scheduler do scraping ativado - execução a cada hora');
  }

  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.destroy();
      this.jobs.delete(jobName);
      console.log(`⏹️ Job ${jobName} parado`);
    }
  }

  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      job.destroy();
      console.log(`⏹️ Job ${name} parado`);
    });
    this.jobs.clear();
  }

  getJobStatus(): { jobName: string; running: boolean; nextRun?: Date }[] {
    const status: { jobName: string; running: boolean; nextRun?: Date }[] = [];
    
    this.jobs.forEach((job, name) => {
      try {
        status.push({
          jobName: name,
          running: job.getStatus() === 'scheduled',
          nextRun: undefined // Simplified for now
        });
      } catch (error) {
        console.error(`Error getting status for job ${name}:`, error);
        status.push({
          jobName: name,
          running: false,
          nextRun: undefined
        });
      }
    });

    return status;
  }

  // Manual trigger methods
  async triggerPipeline(): Promise<void> {
    console.log('🔧 Executando pipeline manual...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/run-pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pipeline manual concluída:', result);
      } else {
        console.error('❌ Erro na pipeline manual:', await response.text());
      }
    } catch (error) {
      console.error('❌ Erro ao executar pipeline manual:', error);
      throw error;
    }
  }

  async triggerScraping(): Promise<void> {
    console.log('🔧 Executando scraping manual...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/test-scraping-only`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Scraping manual concluído:', result);
      } else {
        console.error('❌ Erro no scraping manual:', await response.text());
      }
    } catch (error) {
      console.error('❌ Erro ao executar scraping manual:', error);
      throw error;
    }
  }
}

// Global singleton instance
let cronService: CronService | null = null;

export function getCronService(): CronService {
  if (!cronService) {
    cronService = new CronService();
  }
  return cronService;
}