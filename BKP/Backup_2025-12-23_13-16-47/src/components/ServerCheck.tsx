import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface ServerCheckProps {
  children: React.ReactNode;
}

export const ServerCheck: React.FC<ServerCheckProps> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  const checkServer = async () => {
    setStatus('checking');
    try {
      // Use the configured axios instance which points to the backend
      // We assume /health is not under /api based on where we added it in app.ts,
      // but wait, we added it to app, and app is mounted. 
      // In app.ts: app.get('/health', ...)
      // In api.ts: baseURL is http://localhost:3000/api
      // So api.get('/health') would hit http://localhost:3000/api/health
      // But we added it to the root of app, so it is http://localhost:3000/health
      // We should probably check `http://localhost:3000/health` directly or via a new axios instance, 
      // OR move /health to be under /api in the backend?
      // Moving it to be under /api is cleaner if we want to use the same api instance.
      // But let's just fetch directly to be safe and independent of api instance config.
      
      const response = await fetch('http://localhost:3000/health');
      if (response.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.error('Server check failed:', error);
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkServer();
  }, [retryCount]);

  if (status === 'checking') {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#020617',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Activity className="w-12 h-12 text-indigo-500 animate-pulse mx-auto" />
          <h2 className="text-xl font-semibold mt-4">Conectando ao servidor...</h2>
          <p className="text-slate-400">Verificando disponibilidade do sistema</p>
          {/* Fallback text if icons fail */}
          <p style={{ fontSize: '10px', marginTop: '10px', opacity: 0.5 }}>Status: Checking...</p>
        </div>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: 'white' }}>
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl" style={{ maxWidth: '400px', width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '9999px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle className="w-8 h-8 text-red-500" style={{ color: '#ef4444', width: '2rem', height: '2rem' }} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Servidor Indisponível</h2>
            <p className="text-slate-400" style={{ color: '#94a3b8' }}>
              Não foi possível estabelecer conexão com o servidor. Por favor, verifique se o backend está rodando na porta 3000.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-left space-y-2" style={{ padding: '1rem', backgroundColor: '#020617', borderRadius: '0.5rem', border: '1px solid #1e293b', textAlign: 'left', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p className="text-xs font-mono text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase' }}>Diagnóstico</p>
            <div className="flex items-center justify-between text-sm" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <span className="text-slate-300" style={{ color: '#cbd5e1' }}>Endpoint</span>
              <span className="font-mono text-indigo-400" style={{ fontFamily: 'monospace', color: '#818cf8' }}>GET /health</span>
            </div>
            <div className="flex items-center justify-between text-sm" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <span className="text-slate-300" style={{ color: '#cbd5e1' }}>Status</span>
              <span className="text-red-400" style={{ color: '#f87171' }}>Falha na conexão</span>
            </div>
          </div>

          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#4f46e5', color: 'white', fontWeight: '500', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <RefreshCw className="w-4 h-4" style={{ width: '1rem', height: '1rem' }} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
