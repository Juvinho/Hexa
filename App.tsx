import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Facebook, 
  Instagram, 
  Youtube, 
  Globe, 
  Settings, 
  LogOut, 
  Smartphone,
  BrainCircuit,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import { Platform, Lead, PlatformData, ChartDataPoint } from './types';
import { StatCard } from './components/StatCard';
import { ROIChart, LeadsTrendChart } from './components/Charts';
import { LiveFeed } from './components/LiveFeed';
import { AddLeadModal, EditMetricsModal } from './components/Modals';
import { getMarketingInsights } from './services/geminiService';

// --- DATA INITIALIZATION ---
const INITIAL_PLATFORMS_TEMPLATE: PlatformData[] = [
  { id: 'facebook', name: 'Facebook', color: '#3b82f6', spend: 0, impressions: 0, clicks: 0, leads: 0, roi: 0 },
  { id: 'instagram', name: 'Instagram', color: '#ec4899', spend: 0, impressions: 0, clicks: 0, leads: 0, roi: 0 },
  { id: 'tiktok', name: 'TikTok', color: '#14b8a6', spend: 0, impressions: 0, clicks: 0, leads: 0, roi: 0 },
  { id: 'google', name: 'Google Ads', color: '#22c55e', spend: 0, impressions: 0, clicks: 0, leads: 0, roi: 0 },
  { id: 'youtube', name: 'YouTube', color: '#ef4444', spend: 0, impressions: 0, clicks: 0, leads: 0, roi: 0 },
];

export default function App() {
  const [activePlatform, setActivePlatform] = useState<Platform>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- PERSISTENT STATE ---
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('hexa_leads');
      return saved ? JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })) : [];
    } catch (e) { return []; }
  });

  const [platformConfig, setPlatformConfig] = useState<PlatformData[]>(() => {
    try {
      const saved = localStorage.getItem('hexa_platforms');
      return saved ? JSON.parse(saved) : INITIAL_PLATFORMS_TEMPLATE;
    } catch (e) { return INITIAL_PLATFORMS_TEMPLATE; }
  });

  // --- MODALS STATE ---
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditMetricsOpen, setIsEditMetricsOpen] = useState(false);

  // --- CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    localStorage.setItem('hexa_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('hexa_platforms', JSON.stringify(platformConfig));
  }, [platformConfig]);


  // --- COMPUTED DATA (Real-time aggregation) ---
  
  // 1. Compute Full Platform Data (Merging Config + Lead Actuals)
  const platforms = useMemo(() => {
    return platformConfig.map(p => {
      const platformLeads = leads.filter(l => l.platform === p.id);
      const totalRevenue = platformLeads.reduce((acc, curr) => acc + curr.value, 0);
      const leadsCount = platformLeads.length;
      
      // ROI = (Revenue - Spend) / Spend. If spend is 0, ROI is 0 (or infinite, but let's say 0 for safety)
      // Actually standard marketing ROI is typically (Revenue - Cost) / Cost
      // ROAS (Return on Ad Spend) is Revenue / Cost. 
      // Let's use ROAS as "ROI" multiplier for display simplicity, or (Rev/Cost)
      const roi = p.spend > 0 ? (totalRevenue / p.spend) : 0;

      return {
        ...p,
        leads: leadsCount,
        roi: parseFloat(roi.toFixed(2))
      };
    });
  }, [platformConfig, leads]);

  // 2. Generate Chart Data based on Leads Timeline (Last 12 hours)
  const chartData = useMemo(() => {
    const now = new Date();
    const data: ChartDataPoint[] = [];
    
    // Create buckets for last 12 hours
    for(let i=11; i>=0; i--) {
       const d = new Date(now.getTime() - i * 60 * 60 * 1000);
       // Round down to hour
       d.setMinutes(0, 0, 0);
       
       const hourLabel = d.getHours().toString().padStart(2, '0') + ":00";
       
       // Filter leads that happened in this hour bucket
       // Note: In a real app, we'd look at the full hour range.
       // Here we check if lead.timestamp is within the hour of d
       const hourLeads = leads.filter(l => {
          const t = new Date(l.timestamp);
          return t.getDate() === d.getDate() && t.getHours() === d.getHours();
       });

       const point: ChartDataPoint = {
         time: hourLabel,
         facebook: hourLeads.filter(l => l.platform === 'facebook').length,
         instagram: hourLeads.filter(l => l.platform === 'instagram').length,
         tiktok: hourLeads.filter(l => l.platform === 'tiktok').length,
         google: hourLeads.filter(l => l.platform === 'google').length,
         youtube: hourLeads.filter(l => l.platform === 'youtube').length,
         total: hourLeads.length
       };
       data.push(point);
    }
    return data;
  }, [leads, currentTime]); // Update every minute essentially to shift chart


  // --- HANDLERS ---
  
  const handleAddLead = (data: { name: string; email: string; platform: Platform; value: number }) => {
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: 'new',
      ...data
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdatePlatform = (id: Platform, updates: Partial<PlatformData>) => {
    setPlatformConfig(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleResetData = () => {
    if(confirm('Tem certeza? Isso apagará todos os dados salvos.')) {
      setLeads([]);
      setPlatformConfig(INITIAL_PLATFORMS_TEMPLATE);
      localStorage.removeItem('hexa_leads');
      localStorage.removeItem('hexa_platforms');
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    const insights = await getMarketingInsights(activePlatform, platforms);
    setAiAnalysis(insights);
    setIsAnalyzing(false);
  };

  // --- FILTERS ---
  const filteredPlatforms = activePlatform === 'all' 
    ? platforms 
    : platforms.filter(p => p.id === activePlatform);

  const totalSpend = filteredPlatforms.reduce((acc, curr) => acc + curr.spend, 0);
  const totalLeads = filteredPlatforms.reduce((acc, curr) => acc + curr.leads, 0);
  
  // Calculate Avg ROI weighted by spend? Or simple average?
  // Simple average of active platforms for dashboard view
  const avgRoi = filteredPlatforms.length > 0 
    ? filteredPlatforms.reduce((acc, curr) => acc + curr.roi, 0) / filteredPlatforms.length
    : 0;
    
  const cpa = totalLeads > 0 ? totalSpend / totalLeads : 0;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
      `}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white text-lg">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">HEXA</span>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Plataformas
          </div>
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Visão Geral" 
            active={activePlatform === 'all'} 
            onClick={() => setActivePlatform('all')} 
          />
          <SidebarItem 
            icon={<Facebook size={18} />} 
            label="Facebook Ads" 
            active={activePlatform === 'facebook'} 
            onClick={() => setActivePlatform('facebook')} 
          />
          <SidebarItem 
            icon={<Instagram size={18} />} 
            label="Instagram" 
            active={activePlatform === 'instagram'} 
            onClick={() => setActivePlatform('instagram')} 
          />
          <SidebarItem 
            icon={<Smartphone size={18} />} 
            label="TikTok Ads" 
            active={activePlatform === 'tiktok'} 
            onClick={() => setActivePlatform('tiktok')} 
          />
          <SidebarItem 
            icon={<Globe size={18} />} 
            label="Google Ads" 
            active={activePlatform === 'google'} 
            onClick={() => setActivePlatform('google')} 
          />
          <SidebarItem 
            icon={<Youtube size={18} />} 
            label="YouTube" 
            active={activePlatform === 'youtube'} 
            onClick={() => setActivePlatform('youtube')} 
          />

          <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gestão
          </div>
          <button 
             onClick={handleResetData}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all duration-200"
          >
             <Trash2 size={18} />
             Limpar Dados
          </button>
          <div className="px-4 mt-2">
            <p className="text-[10px] text-slate-600 leading-tight">
              Os dados são salvos no armazenamento local do navegador.
            </p>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOP BAR */}
        <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-white hidden sm:block">
              {activePlatform === 'all' ? 'Dashboard Geral' : platforms.find(p => p.id === activePlatform)?.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             {/* ACTIONS FOR REAL DATA */}
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditMetricsOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg text-sm transition-all"
                >
                  <Edit3 size={16} />
                  Editar Métricas
                </button>
                <button 
                  onClick={() => setIsAddLeadOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Novo Lead</span>
                </button>
             </div>

             <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden sm:block"></div>

             <div className="text-right hidden sm:block">
               <p className="text-xs text-slate-400">Atualização</p>
               <p className="text-sm font-mono text-emerald-400">{currentTime.toLocaleTimeString()}</p>
             </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* TOP STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Gasto Total" 
              metric={{ value: totalSpend, change: 0, trend: 'neutral', name: 'Spend' }} 
              prefix="R$ " 
            />
            <StatCard 
              title="Total Leads" 
              metric={{ value: totalLeads, change: 0, trend: 'neutral', name: 'Leads' }} 
            />
            <StatCard 
              title="Custo por Lead (CPA)" 
              metric={{ value: cpa, change: 0, trend: 'neutral', name: 'CPA' }} 
              prefix="R$ " 
            />
            <StatCard 
              title="ROAS Médio" 
              metric={{ value: avgRoi, change: 0, trend: 'neutral', name: 'ROI' }} 
              suffix="x" 
            />
          </div>

          {/* MAIN CHARTS AND LIVE FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] lg:h-[500px]">
             {/* Left Column: Charts */}
             <div className="lg:col-span-2 space-y-6 flex flex-col">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-semibold text-white">Entrada de Leads (Últimas 12h)</h3>
                  </div>
                  <div className="flex-1 min-h-0">
                    <LeadsTrendChart data={chartData} />
                  </div>
                </div>
             </div>

             {/* Right Column: Live Feed */}
             <div className="h-full">
                <LiveFeed leads={leads} />
             </div>
          </div>

          {/* SECONDARY ROW: ROI Breakdown & AI Advisor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">ROAS por Plataforma</h3>
                <ROIChart data={platforms} />
             </div>

             <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BrainCircuit size={120} className="text-indigo-400" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BrainCircuit className="text-indigo-400" />
                      Hexa AI Advisor
                    </h3>
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>Analisando...</>
                      ) : (
                        <>Gerar Análise</>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950/50 rounded-xl p-4 border border-indigo-500/20 min-h-[200px]">
                    {aiAnalysis ? (
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                        <div dangerouslySetInnerHTML={{ 
                          __html: aiAnalysis
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-200">$1</strong>')
                            .replace(/\n/g, '<br />')
                        }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-8">
                        <p className="mb-2">A IA analisará seus dados reais de Spend e Leads.</p>
                        <p className="text-xs">Certifique-se de ter adicionado métricas e leads antes de analisar.</p>
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
          
          <footer className="text-center text-slate-600 text-sm pb-6">
            &copy; 2024 Hexa Ads Manager. All rights reserved.
          </footer>

        </div>

        {/* MODALS */}
        <AddLeadModal 
          isOpen={isAddLeadOpen} 
          onClose={() => setIsAddLeadOpen(false)} 
          onSave={handleAddLead} 
        />
        <EditMetricsModal 
          isOpen={isEditMetricsOpen}
          onClose={() => setIsEditMetricsOpen(false)}
          platforms={platformConfig}
          onSave={handleUpdatePlatform}
        />

      </main>
    </div>
  );
}

// Sidebar Item Component
const SidebarItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
    `}
  >
    {icon}
    {label}
  </button>
);