'use client';

import { useEffect } from 'react';

export function SchedulerInitializer() {
  useEffect(() => {
    // Initialize schedulers when the app loads
    const initializeSchedulers = async () => {
      try {
        console.log('🚀 Inicializando schedulers...');
        
        const response = await fetch('/api/scheduler/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-key': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || ''
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Schedulers inicializados:', result);
        } else {
          const error = await response.json();
          console.error('❌ Erro ao inicializar schedulers:', error);
        }
      } catch (error) {
        console.error('❌ Erro na inicialização dos schedulers:', error);
      }
    };

    // Initialize with a small delay to ensure the app is ready
    const timeoutId = setTimeout(initializeSchedulers, 2000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return null; // This component doesn't render anything
}