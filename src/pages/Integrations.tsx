import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const IntegrationCard = ({ name, icon, status, onConnect }: any) => {
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
        disabled={isConnected}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          isConnected
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-hexa-primary text-white hover:bg-indigo-700'
        }`}
      >
        {isConnected ? 'Gerenciar' : 'Conectar Conta'}
      </button>
    </div>
  );
};

export const Integrations = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);

  const platforms = [
    { id: 'FACEBOOK', name: 'Facebook Ads', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg' },
    { id: 'GOOGLE', name: 'Google Ads', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { id: 'TIKTOK', name: 'TikTok Ads', icon: 'https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-dark-e5f8fe6.png' },
  ];

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await api.get('/integrations');
        setIntegrations(response.data);
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
    };
    fetchIntegrations();
  }, []);

  const handleConnect = async (platformId: string) => {
    try {
      // Mock auth code
      const authCode = `auth_${Math.random().toString(36)}`;
      await api.post('/integrations/connect', { platform: platformId, authCode });
      
      // Refresh list
      const response = await api.get('/integrations');
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Erro ao conectar integração');
    }
  };

  const getStatus = (platformId: string) => {
    const integration = integrations.find(i => i.platform === platformId);
    return integration ? integration.status : 'DISCONNECTED';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
          <p className="text-gray-500 mt-1">Gerencie suas conexões com redes sociais e plataformas de anúncios.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />
          Sincronizar Tudo
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
          />
        ))}
      </div>
    </div>
  );
};
