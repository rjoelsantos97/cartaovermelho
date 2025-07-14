import { NextResponse } from 'next/server';
import { getCronService } from '@/lib/scheduler/cron-service';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const cronService = getCronService();

    switch (action) {
      case 'start-pipeline':
        cronService.startPipelineScheduler();
        return NextResponse.json({
          success: true,
          message: 'Pipeline scheduler ativado - execução a cada 2 horas'
        });

      case 'start-scraping':
        cronService.startScrapingOnlyScheduler();
        return NextResponse.json({
          success: true,
          message: 'Scraping scheduler ativado - execução a cada hora'
        });

      case 'start-both':
        cronService.startPipelineScheduler();
        cronService.startScrapingOnlyScheduler();
        return NextResponse.json({
          success: true,
          message: 'Ambos schedulers ativados - Pipeline a cada 2h, Scraping a cada 1h'
        });

      case 'stop-pipeline':
        cronService.stopJob('pipeline');
        return NextResponse.json({
          success: true,
          message: 'Pipeline scheduler parado'
        });

      case 'stop-scraping':
        cronService.stopJob('scraping');
        return NextResponse.json({
          success: true,
          message: 'Scraping scheduler parado'
        });

      case 'stop-all':
        cronService.stopAllJobs();
        return NextResponse.json({
          success: true,
          message: 'Todos os schedulers parados'
        });

      case 'trigger-pipeline':
        await cronService.triggerPipeline();
        return NextResponse.json({
          success: true,
          message: 'Pipeline executada manualmente'
        });

      case 'trigger-scraping':
        await cronService.triggerScraping();
        return NextResponse.json({
          success: true,
          message: 'Scraping executado manualmente'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação inválida'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Erro no scheduler:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cronService = getCronService();
    const status = cronService.getJobStatus();
    
    return NextResponse.json({
      success: true,
      schedulers: status,
      availableActions: [
        'start-pipeline',
        'start-scraping', 
        'start-both',
        'stop-pipeline',
        'stop-scraping',
        'stop-all',
        'trigger-pipeline',
        'trigger-scraping'
      ]
    });
  } catch (error) {
    console.error('❌ Erro ao obter status do scheduler:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}