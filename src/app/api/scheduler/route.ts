import { NextRequest, NextResponse } from 'next/server';
import { getCronService } from '@/lib/scheduler/cron-service';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/auth/api-auth';

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = await validateApiAuth(request);
  
  if (!authResult.success) {
    return createUnauthorizedResponse(authResult.error);
  }

  console.log(`✅ Scheduler action initiated by admin: ${authResult.user?.email}`);
  
  try {
    const { action } = await request.json();
    const cronService = getCronService();

    switch (action) {
      case 'start-pipeline':
        cronService.startPipelineScheduler();
        return NextResponse.json({
          success: true,
          message: 'Pipeline scheduler ativado - execução a cada hora'
        });

      case 'start-scraping':
        cronService.startScrapingOnlyScheduler();
        return NextResponse.json({
          success: true,
          message: 'Scraping scheduler ativado - execução a cada hora'
        });

      case 'start-both':
        cronService.startPipelineScheduler();
        return NextResponse.json({
          success: true,
          message: 'Pipeline scheduler ativado - Scraping + LLM a cada hora'
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

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = await validateApiAuth(request);
  
  if (!authResult.success) {
    return createUnauthorizedResponse(authResult.error);
  }

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