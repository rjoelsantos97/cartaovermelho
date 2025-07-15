import { NextRequest, NextResponse } from 'next/server';
import { getCronService } from '@/lib/scheduler/cron-service';

export async function POST(request: NextRequest) {
  // Check for service key authentication (same as middleware pattern)
  const authHeader = request.headers.get('authorization');
  const hasServiceKey = authHeader && authHeader.startsWith('Bearer ') && 
                       authHeader.split(' ')[1] === process.env.SUPABASE_SERVICE_KEY;
  
  if (!hasServiceKey) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized access'
    }, { status: 401 });
  }
  try {
    console.log('🚀 Iniciando schedulers via API...');
    
    const cronService = getCronService();
    
    // Start only pipeline scheduler (includes scraping + LLM)
    cronService.startPipelineScheduler();
    
    const status = cronService.getJobStatus();
    
    console.log('✅ Schedulers iniciados via API:', status);
    
    return NextResponse.json({
      success: true,
      message: 'Schedulers iniciados automaticamente',
      schedulers: status
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar schedulers via API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}