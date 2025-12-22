import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface Integration {
  id: string;
  userId: string;
  platform: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  lastSync: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
}

const IntegrationCard = ({ name, icon, status, onConnect, isConnecting }: any) => {
  const isConnected = status === 'CONNECTED';

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-48">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-gray-50 rounded-lg">
          <img src={icon} alt={name} className="w-8 h-8 object-contain" />
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Conectado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" /> Desconectado
          </span>
        )}
      </div>
      
      <div>
        <h3 className="font-bold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500 mt-1">Sincronização de leads e campanhas</p>
      </div>

      <button
        onClick={onConnect}
        disabled={isConnected || isConnecting}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          isConnected
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-hexa-primary text-white hover:bg-indigo-700'
        }`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Conectando...
          </>
        ) : isConnected ? (
          'Gerenciar'
        ) : (
          'Conectar Conta'
        )}
      </button>
    </div>
  );
};

export const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const platforms: Platform[] = [
    { id: 'FACEBOOK', name: 'Facebook Ads', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg' },
    { id: 'GOOGLE', name: 'Google Ads', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { id: 'TIKTOK', name: 'TikTok Ads', icon: 'https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-dark-e5f8fe6.png' },
  ];

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations');
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Erro ao carregar integrações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (platformId: string) => {
    setConnectingId(platformId);
    try {
      // Mock auth code - in production this would be a redirect to OAuth provider
      const authCode = `auth_${Math.random().toString(36)}`;
      await api.post('/integrations/connect', { platform: platformId, authCode });
      
      toast.success('Integração conectada com sucesso!');
      // Refresh list
      await fetchIntegrations();
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Erro ao conectar integração');
    } finally {
      setConnectingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      // In a real app, you might have a dedicated sync endpoint
      // For now, we'll just refresh the list which confirms status
      await fetchIntegrations();
      toast.success('Sincronização concluída!');
    } catch (error) {
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  const getStatus = (platformId: string) => {
    const integration = integrations.find(i => i.platform === platformId);
    return integration ? integration.status : 'DISCONNECTED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-hexa-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
          <p className="text-gray-500 mt-1">Gerencie suas conexões com redes sociais e plataformas de anúncios.</p>
        </div>
        <button 
          onClick={handleSyncAll}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <IntegrationCard
            key={platform.id}
            name={platform.name}
            icon={platform.icon}
            status={getStatus(platform.id)}
            onConnect={() => handleConnect(platform.id)}
            isConnecting={connectingId === platform.id}
          />
        ))}
      </div>
    </div>
  );
};
