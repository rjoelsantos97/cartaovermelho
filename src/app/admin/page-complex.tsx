"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, AlertCircle, Eye, Clock, Power, PowerOff } from 'lucide-react';

interface PipelineResult {
  success: boolean;
  pipeline?: {
    scrapingJob: {
      id: string;
      status: string;
      articlesScraped: number;
    };
    processingJob: {
      id: string;
      status: string;
      articlesProcessed: number;
    };
    publishedCount: number;
  };
  sampleArticles?: Array<{
    id: string;
    dramaticTitle: string;
    dramaScore: number;
    urgencyLevel: string;
    category: string;
    isPublished: boolean;
  }>;
  error?: string;
}

interface SystemStatus {
  success: boolean;
  status?: {
    originalArticles: number;
    processedArticles: number;
    publishedArticles: number;
    recentScrapingJobs: Array<{
      id: string;
      status: string;
      articlesScraped: number;
      startedAt: string;
    }>;
    recentProcessingJobs: Array<{
      id: string;
      status: string;
      articlesProcessed: number;
      startedAt: string;
    }>;
  };
  sampleArticles?: Array<{
    id: string;
    dramaticTitle: string;
    category: string;
    dramaScore: number;
    urgencyLevel: string;
  }>;
  error?: string;
}

interface SchedulerStatus {
  success: boolean;
  schedulers?: Array<{
    jobName: string;
    running: boolean;
    nextRun?: string;
  }>;
  availableActions?: string[];
  error?: string;
}

export default function AdminPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isSchedulerLoading, setIsSchedulerLoading] = useState(false);

  const runPipeline = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/run-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data: PipelineResult = await response.json();
      setResult(data);
      
      // Refresh status after pipeline
      if (data.success) {
        await loadStatus();
      }
      
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro na execução'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    
    try {
      const response = await fetch('/api/run-pipeline');
      const data: SystemStatus = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar status'
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadSchedulerStatus = async () => {
    setIsSchedulerLoading(true);
    
    try {
      const response = await fetch('/api/scheduler');
      const data: SchedulerStatus = await response.json();
      setSchedulerStatus(data);
    } catch (error) {
      setSchedulerStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar status do scheduler'
      });
    } finally {
      setIsSchedulerLoading(false);
    }
  };

  const controlScheduler = async (action: string) => {
    setIsSchedulerLoading(true);
    
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadSchedulerStatus(); // Refresh status
      }
      
      return data;
    } catch (error) {
      console.error('Erro no controlo do scheduler:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    } finally {
      setIsSchedulerLoading(false);
    }
  };

  // Load scheduler status on component mount
  useEffect(() => {
    loadSchedulerStatus();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'breaking': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-oxford-blue mb-2">
            ADMIN CARTÃO VERMELHO
          </h1>
          <p className="text-lg text-muted-foreground">
            Painel de controlo para scraping e processamento de notícias
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">EXECUTAR PIPELINE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Executa o pipeline completo: scraping do abola.pt → processamento LLM → publicação automática
              </p>
              
              <Button 
                onClick={runPipeline}
                disabled={isRunning}
                className="w-full font-headline text-lg py-6"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    EXECUTANDO PIPELINE...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    INICIAR DRAMA PIPELINE
                  </>
                )}
              </Button>

              <Button 
                onClick={loadStatus}
                disabled={isLoadingStatus}
                variant="outline"
                className="w-full"
              >
                {isLoadingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Status do Sistema
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <a href="/" target="_blank">Ver Site Público</a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href="http://127.0.0.1:54323" target="_blank">Supabase Studio</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scheduler Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">SCHEDULER AUTOMÁTICO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Controla a execução automática dos jobs de scraping e processamento
              </p>

              {schedulerStatus && schedulerStatus.success && (
                <div className="space-y-2">
                  {schedulerStatus.schedulers?.map((scheduler) => (
                    <div key={scheduler.jobName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium capitalize">{scheduler.jobName}</span>
                      </div>
                      <Badge variant={scheduler.running ? "default" : "secondary"}>
                        {scheduler.running ? "Ativo" : "Parado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => controlScheduler('start-both')}
                  disabled={isSchedulerLoading}
                  variant="default"
                  size="sm"
                >
                  {isSchedulerLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Power className="mr-1 h-4 w-4" />
                      Ativar Todos
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => controlScheduler('stop-all')}
                  disabled={isSchedulerLoading}
                  variant="destructive"
                  size="sm"
                >
                  {isSchedulerLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <PowerOff className="mr-1 h-4 w-4" />
                      Parar Todos
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={() => controlScheduler('trigger-pipeline')}
                  disabled={isSchedulerLoading}
                  variant="outline"
                  size="sm"
                >
                  Executar Pipeline Manual
                </Button>
                
                <Button 
                  onClick={() => controlScheduler('trigger-scraping')}
                  disabled={isSchedulerLoading}
                  variant="outline"
                  size="sm"
                >
                  Executar Scraping Manual
                </Button>
              </div>

              <Button 
                onClick={loadSchedulerStatus}
                disabled={isSchedulerLoading}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                {isSchedulerLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  "Atualizar Status"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">RESULTADOS</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {result.success ? (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Pipeline executado com sucesso!</span>
                      </div>
                      
                      {result.pipeline && (
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-2xl font-bold text-blue-600">
                              {result.pipeline.scrapingJob.articlesScraped}
                            </div>
                            <div className="text-xs text-blue-600">Scraped</div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <div className="text-2xl font-bold text-purple-600">
                              {result.pipeline.processingJob.articlesProcessed}
                            </div>
                            <div className="text-xs text-purple-600">Processed</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <div className="text-2xl font-bold text-green-600">
                              {result.pipeline.publishedCount}
                            </div>
                            <div className="text-xs text-green-600">Published</div>
                          </div>
                        </div>
                      )}

                      {result.sampleArticles && result.sampleArticles.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Artigos criados:</h4>
                          <div className="space-y-2">
                            {result.sampleArticles.map((article) => (
                              <div key={article.id} className="p-3 bg-gray-50 rounded text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="font-medium line-clamp-2">
                                      {article.dramaticTitle}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {article.category}
                                      </Badge>
                                      <Badge className={`${getUrgencyColor(article.urgencyLevel)} text-white text-xs`}>
                                        {article.urgencyLevel.toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Drama: {article.dramaScore}/10
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Erro no pipeline</div>
                        <div className="text-sm">{result.error}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : isRunning ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Executando pipeline... Isto pode demorar alguns minutos.</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Clique em "Iniciar Pipeline" para começar o processo de scraping e criação de conteúdo dramático.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        {status && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">STATUS DO SISTEMA</CardTitle>
            </CardHeader>
            <CardContent>
              {status.success && status.status ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded">
                      <div className="text-3xl font-bold text-blue-600">
                        {status.status.originalArticles}
                      </div>
                      <div className="text-sm text-blue-600">Artigos Originais</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded">
                      <div className="text-3xl font-bold text-purple-600">
                        {status.status.processedArticles}
                      </div>
                      <div className="text-sm text-purple-600">Artigos Processados</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <div className="text-3xl font-bold text-green-600">
                        {status.status.publishedArticles}
                      </div>
                      <div className="text-sm text-green-600">Artigos Publicados</div>
                    </div>
                  </div>

                  {status.sampleArticles && status.sampleArticles.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Últimos artigos processados:</h4>
                      <div className="space-y-2">
                        {status.sampleArticles.map((article) => (
                          <div key={article.id} className="p-3 bg-gray-50 rounded text-sm">
                            <div className="font-medium line-clamp-1">
                              {article.dramaticTitle}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                              <Badge className={`${getUrgencyColor(article.urgencyLevel)} text-white text-xs`}>
                                {article.urgencyLevel.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Drama: {article.dramaScore}/10
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  Erro ao carregar status: {status.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}