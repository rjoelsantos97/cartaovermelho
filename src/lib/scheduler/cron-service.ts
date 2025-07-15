import * as cron from 'node-cron';

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobSchedules: Map<string, string> = new Map();
  private instanceId: string = Math.random().toString(36).substr(2, 9);

  constructor() {
    // CronService instance created
  }

  startPipelineScheduler(): void {
    // Stop existing job if running
    this.stopJob('pipeline');

    // Schedule pipeline to run every hour at 20 minutes past the hour
    const cronExpression = '20 * * * *';
    const task = cron.schedule(cronExpression, async () => {
      console.log('🕐 Iniciando pipeline automática...');
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/run-pipeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
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
      scheduled: true, // Start immediately
      timezone: 'Europe/Lisbon'
    });

    this.jobs.set('pipeline', task);
    this.jobSchedules.set('pipeline', cronExpression);
    
    console.log('🚀 Scheduler da pipeline ativado - execução a cada hora às xx:20');
  }

  startScrapingOnlyScheduler(): void {
    // Stop existing job if running
    this.stopJob('scraping');

    // Schedule scraping only to run every hour at 13 minutes past the hour
    const cronExpression = '13 * * * *';
    const task = cron.schedule(cronExpression, async () => {
      console.log('🕐 Iniciando scraping automático...');
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/test-scraping-only`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
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
      scheduled: true,
      timezone: 'Europe/Lisbon'
    });

    this.jobs.set('scraping', task);
    this.jobSchedules.set('scraping', cronExpression);
    
    console.log('🚀 Scheduler do scraping ativado - execução a cada hora às xx:13');
  }

  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.destroy();
      this.jobs.delete(jobName);
      this.jobSchedules.delete(jobName);
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
    this.jobSchedules.clear();
  }

  private getNextRunTime(cronExpression: string): Date {
    const now = new Date();
    
    if (cronExpression === '20 * * * *') {
      // Cron executa a cada hora aos 20 minutos
      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Se ainda não passou dos 20 minutos desta hora
      if (minute < 20) {
        // Próxima execução é hoje, esta hora, aos 20 minutos
        return new Date(year, month, date, hour, 20, 0, 0);
      } else {
        // Já passou dos 20 minutos, próxima execução é na próxima hora
        // Se for 23h, volta para 0h do dia seguinte
        if (hour === 23) {
          return new Date(year, month, date + 1, 0, 20, 0, 0);
        } else {
          return new Date(year, month, date, hour + 1, 20, 0, 0);
        }
      }
    }
    
    return new Date(now.getTime() + 60000); // Default: 1 minute
  }

  getJobStatus(): { jobName: string; running: boolean; nextRun?: Date }[] {
    const status: { jobName: string; running: boolean; nextRun?: Date }[] = [];
    
    // Get job status
    
    this.jobs.forEach((job, name) => {
      try {
        const cronExpression = this.jobSchedules.get(name);
        const jobStatus = job.getStatus();
        // In node-cron, when scheduled:true, job is active
        const running = this.jobs.has(name) && jobStatus !== 'destroyed';
        
        // Calculate next run time manually
        const nextRun = cronExpression ? this.getNextRunTime(cronExpression) : undefined;
        
        status.push({
          jobName: name,
          running: running,
          nextRun: nextRun
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
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

// Global singleton instance using globalThis for Next.js
declare global {
  var __cronService: CronService | undefined;
}

export function getCronService(): CronService {
  if (!globalThis.__cronService) {
    globalThis.__cronService = new CronService();
  }
  return globalThis.__cronService;
}