import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { ConnectModal } from '../components/ConnectModal';

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
  guide: string;
}

const IntegrationCard = ({ name, icon, status, onConnect, onDisconnect, isConnecting }: any) => {
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

      {isConnected ? (
        <button
          onClick={onDisconnect}
          disabled={isConnecting}
          className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Desconectando...
            </>
          ) : (
            'Desconectar'
          )}
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-hexa-primary text-white hover:bg-indigo-700"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Conectando...
            </>
          ) : (
            'Conectar Conta'
          )}
        </button>
      )}
    </div>
  );
};

export const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  const platforms: Platform[] = [
    { 
      id: 'FACEBOOK', 
      name: 'Facebook Ads', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg',
      guide: 'Acesse o Business Manager > Configurações do Negócio > Usuários > Usuários do Sistema. Crie um usuário, adicione ativos e clique em "Gerar Token".'
    },
    { 
      id: 'INSTAGRAM', 
      name: 'Instagram Ads', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
      guide: 'Utiliza o mesmo token do Facebook Ads. Certifique-se de que a conta do Instagram está vinculada ao seu Gerenciador de Negócios.'
    },
    { 
      id: 'GOOGLE', 
      name: 'Google Ads', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
      guide: 'Acesse o Google Cloud Console > APIs e Serviços > Credenciais. Crie uma chave de API ou ID do cliente OAuth 2.0.'
    },
    { 
      id: 'YOUTUBE', 
      name: 'YouTube Ads', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      guide: 'Utiliza a mesma configuração do Google Ads. Certifique-se de ativar a "YouTube Data API v3" no Google Cloud Console.'
    },
    { 
      id: 'TIKTOK', 
      name: 'TikTok Ads', 
      icon: 'https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-dark-e5f8fe6.png',
      guide: 'Acesse o TikTok for Business > Central de Desenvolvedores > Meus Apps. Crie um app para obter o Access Token.'
    },
    { 
      id: 'STRIPE', 
      name: 'Stripe Payments', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      guide: 'No Dashboard do Stripe, vá em Desenvolvedores > Chaves de API. Copie e cole a "Chave Secreta" (começa com sk_live_...).'
    },
    { 
      id: 'OPENAI', 
      name: 'OpenAI Intelligence', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
      guide: 'Acesse platform.openai.com > Dashboard > API Keys. Clique em "Create new secret key" para gerar sua chave.'
    },
  ];

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations');
      setIntegrations(response.data.integrations || []);
      setOnboardingStatus(response.data.onboarding || {});
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

  const handleConnectClick = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  const handleConfirmConnect = async (apiKey: string) => {
    if (!selectedPlatform) return;

    setConnectingId(selectedPlatform.id);
    try {
      // Use the provided API Key instead of mock auth code
      await api.post('/integrations/connect', { 
        platform: selectedPlatform.id, 
        authCode: apiKey 
      });
      
      toast.success('Integração conectada com sucesso!');
      // Refresh list
      await fetchIntegrations();
      setSelectedPlatform(null);
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Erro ao conectar integração');
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta integração?')) return;
    
    setConnectingId(platformId);
    try {
      await api.delete(`/integrations/${platformId}`);
      toast.success('Integração desconectada com sucesso!');
      await fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erro ao desconectar integração');
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
        <div className="flex items-center gap-3">
           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              SaaS Mode: Active
            </span>
            <button 
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
            </button>
        </div>
      </div>

      {onboardingStatus && (
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">Status do Onboarding Automático</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${onboardingStatus.stripe === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-indigo-700">Stripe: {onboardingStatus.stripe}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${onboardingStatus.openai === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-indigo-700">OpenAI: {onboardingStatus.openai}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${onboardingStatus.googleAds === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-indigo-700">Google Ads: {onboardingStatus.googleAds}</span>
              </div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <IntegrationCard
            key={platform.id}
            name={platform.name}
            icon={platform.icon}
            status={getStatus(platform.id)}
            onConnect={() => handleConnectClick(platform)}
            onDisconnect={() => handleDisconnect(platform.id)}
            isConnecting={connectingId === platform.id}
          />
        ))}
      </div>

      <ConnectModal
        isOpen={!!selectedPlatform}
        onClose={() => setSelectedPlatform(null)}
        onConnect={handleConfirmConnect}
        platformName={selectedPlatform?.name || ''}
        isConnecting={!!connectingId}
        guide={selectedPlatform?.guide}
      />
    </div>
  );
};
