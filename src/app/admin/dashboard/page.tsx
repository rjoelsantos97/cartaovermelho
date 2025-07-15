'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SchedulerStatus {
  jobName: string;
  running: boolean;
  nextRun?: Date;
}

interface JobInfo {
  id: string;
  status: string;
  articlesScraped?: number;
  articlesProcessed?: number;
  startedAt: string;
}

interface DashboardData {
  schedulers: SchedulerStatus[];
  originalArticles: number;
  processedArticles: number;
  publishedArticles: number;
  recentScrapingJobs: JobInfo[];
  recentProcessingJobs: JobInfo[];
  sampleArticles: Array<{
    id: string;
    dramaticTitle: string;
    category: string;
    dramaScore: number;
    urgencyLevel: string;
  }>;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch scheduler status
      const schedulerResponse = await fetch('/api/scheduler', {
        credentials: 'include'
      });
      
      if (!schedulerResponse.ok) {
        console.error('❌ Erro ao buscar scheduler status:', schedulerResponse.status, schedulerResponse.statusText);
        const errorData = await schedulerResponse.json();
        console.error('❌ Erro detalhado:', errorData);
        return;
      }
      
      const schedulerData = await schedulerResponse.json();
      console.log('📊 Scheduler data received:', schedulerData);
      
      // Fetch pipeline status
      const pipelineResponse = await fetch('/api/run-pipeline', {
        credentials: 'include'
      });
      const pipelineData = await pipelineResponse.json();
      

      setDashboardData({
        schedulers: schedulerData.schedulers || [],
        originalArticles: pipelineData.status?.originalArticles || 0,
        processedArticles: pipelineData.status?.processedArticles || 0,
        publishedArticles: pipelineData.status?.publishedArticles || 0,
        recentScrapingJobs: pipelineData.status?.recentScrapingJobs || [],
        recentProcessingJobs: pipelineData.status?.recentProcessingJobs || [],
        sampleArticles: pipelineData.sampleArticles || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSchedulerAction = async (action: string) => {
    try {
      setActionLoading(action);
      
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ action })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh dashboard data
        fetchDashboardData();
        console.log('✅', result.message);
      } else {
        console.error('❌', result.error);
      }
    } catch (error) {
      console.error('Error executing scheduler action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oxford-blue mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <Button 
          onClick={fetchDashboardData}
          disabled={loading}
          variant="outline"
        >
          🔄 Atualizar
        </Button>
      </div>

      {/* Scheduler Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Status dos Schedulers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {dashboardData?.schedulers && dashboardData.schedulers.length > 0 ? (
            dashboardData.schedulers.map((scheduler) => (
              <div key={scheduler.jobName} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {scheduler.jobName === 'pipeline' ? 'Pipeline Completo (Scraping + LLM)' : 'Scraping Apenas'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.jobName === 'pipeline' ? 'A cada hora às xx:20' : 'A cada hora às xx:20'}
                  </p>
                  {scheduler.nextRun && (
                    <p className="text-xs text-muted-foreground">
                      Próxima: {new Date(scheduler.nextRun).toLocaleString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                <Badge variant={scheduler.running ? 'default' : 'secondary'}>
                  {scheduler.running ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-muted-foreground">Nenhum scheduler ativo. Clique "Iniciar Pipeline" para começar.</p>
            </div>
          )}
        </div>

        {/* Scheduler Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => handleSchedulerAction('start-both')}
            disabled={actionLoading === 'start-both'}
            className="bg-green-600 hover:bg-green-700"
          >
            {actionLoading === 'start-both' ? '⏳' : '🚀'} Iniciar Pipeline
          </Button>
          <Button
            onClick={() => handleSchedulerAction('stop-all')}
            disabled={actionLoading === 'stop-all'}
            variant="destructive"
          >
            {actionLoading === 'stop-all' ? '⏳' : '⏹️'} Parar Todos
          </Button>
          <Button
            onClick={() => handleSchedulerAction('trigger-pipeline')}
            disabled={actionLoading === 'trigger-pipeline'}
            variant="outline"
          >
            {actionLoading === 'trigger-pipeline' ? '⏳' : '🔧'} Executar Pipeline
          </Button>
          <Button
            onClick={() => handleSchedulerAction('trigger-scraping')}
            disabled={actionLoading === 'trigger-scraping'}
            variant="outline"
          >
            {actionLoading === 'trigger-scraping' ? '⏳' : '📰'} Executar Scraping
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Artigos Originais</h3>
          <p className="text-3xl font-bold text-oxford-blue">
            {dashboardData?.originalArticles || 0}
          </p>
          <p className="text-sm text-muted-foreground">Na base de dados</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Artigos Processados</h3>
          <p className="text-3xl font-bold text-indigo-dye">
            {dashboardData?.processedArticles || 0}
          </p>
          <p className="text-sm text-muted-foreground">Transformados pelo LLM</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Artigos Publicados</h3>
          <p className="text-3xl font-bold text-cerulean">
            {dashboardData?.publishedArticles || 0}
          </p>
          <p className="text-sm text-muted-foreground">Visíveis no site</p>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jobs de Scraping Recentes</h3>
          <div className="space-y-3">
            {dashboardData?.recentScrapingJobs.length ? (
              dashboardData.recentScrapingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{job.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.articlesScraped || 0} artigos | {new Date(job.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum job recente</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jobs de Processamento Recentes</h3>
          <div className="space-y-3">
            {dashboardData?.recentProcessingJobs.length ? (
              dashboardData.recentProcessingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{job.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.articlesProcessed || 0} artigos | {new Date(job.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum job recente</p>
            )}
          </div>
        </Card>
      </div>

      {/* Sample Articles */}
      {dashboardData?.sampleArticles.length ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Artigos Recentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.sampleArticles.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 line-clamp-2">{article.dramaticTitle}</h4>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{article.category}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Drama: {article.dramaScore}/10</span>
                    <Badge variant={article.urgencyLevel === 'high' ? 'destructive' : 'secondary'}>
                      {article.urgencyLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}