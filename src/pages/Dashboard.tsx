import { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, DollarSign, MousePointer, Target, Activity, Calendar } from 'lucide-react';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { StatCard } from '../components/StatCard';
import { ChartWrapper } from '../components/ChartWrapper';
import { AiInsights } from '../components/AiInsights';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useApiConfig } from '../context/ApiContext';

export const Dashboard = () => {
  const { currentTheme } = useTheme();
  const { config } = useApiConfig();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const { scrollY } = useScroll();
  const yStats = useTransform(scrollY, [0, 300], [0, 30]);
  const yCharts = useTransform(scrollY, [0, 500], [0, 50]);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [metricsRes, leadsRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/leads')
        ]);
        
        setMetrics(metricsRes.data);

        // Process leads data for chart (Aggregate by Date)
        const leadsData = leadsRes.data;
        const aggregated: Record<string, any> = {};

        leadsData.forEach((item: any) => {
          const date = new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' });
          if (!aggregated[date]) {
            aggregated[date] = { name: date, leads: 0, spend: 0, revenue: 0 }; // revenue missing in leads endpoint, assuming 0 or add to endpoint
          }
          aggregated[date].leads += item.leads;
          aggregated[date].spend += item.spend;
          // aggregated[date].revenue += item.revenue; // leads endpoint doesn't return revenue currently
        });

        // Convert to array and reverse to show oldest to newest if needed, or keep logic
        // The mock data returns 1 day usually.
        // If empty, use fallback
        const chartArray = Object.values(aggregated);
        
        if (chartArray.length > 0) {
          setChartData(chartArray);
        } else {
           // Fallback Mock Data
           setChartData([
            { name: 'Seg', leads: 40, spend: 240, revenue: 400 },
            { name: 'Ter', leads: 30, spend: 139, revenue: 300 },
            { name: 'Qua', leads: 20, spend: 980, revenue: 1200 },
            { name: 'Qui', leads: 27, spend: 390, revenue: 550 },
            { name: 'Sex', leads: 18, spend: 480, revenue: 500 },
            { name: 'Sab', leads: 23, spend: 380, revenue: 450 },
            { name: 'Dom', leads: 34, spend: 430, revenue: 600 },
          ]);
        }

      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Fallback Mock Data on error
         setChartData([
            { name: 'Seg', leads: 40, spend: 240, revenue: 400 },
            { name: 'Ter', leads: 30, spend: 139, revenue: 300 },
            { name: 'Qua', leads: 20, spend: 980, revenue: 1200 },
            { name: 'Qui', leads: 27, spend: 390, revenue: 550 },
            { name: 'Sex', leads: 18, spend: 480, revenue: 500 },
            { name: 'Sab', leads: 23, spend: 380, revenue: 450 },
            { name: 'Dom', leads: 34, spend: 430, revenue: 600 },
          ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Initialize Socket.io connection dynamically
    try {
      const socketUrl = new URL(config.baseUrl).origin;
      socketRef.current = io(socketUrl);
      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Connected to WebSocket');
        toast.success('Conectado ao servidor em tempo real');
      });

      socket.on('dashboard_update', (data) => {
        setRealtimeData(prev => {
          const newData = [...prev, data].slice(-10);
          return newData;
        });
        
        setMetrics((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalLeads: prev.totalLeads + data.leads
          };
        });
        
        toast.info(`Novos leads: ${data.leads}`, { duration: 2000 });
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.error('Invalid API URL for socket connection');
    }
  }, [config.baseUrl]);

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-gray-500 font-medium">Carregando dashboard...</p>
      </div>
    </div>
  );

  // Mock data for static charts (fallback)
  // const chartData = ... (Moved to state)


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-xl">
          <p className="text-slate-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Quick Navigation - Sticky */}
      <div className="sticky top-16 z-30 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur py-3 -mx-4 px-8 border-b border-gray-200/50 dark:border-slate-800/50 mb-6 transition-colors duration-200">
        <nav className="flex gap-6 text-sm font-medium overflow-x-auto no-scrollbar">
          <a href="#overview" className="whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Visão Geral</a>
          <a href="#insights" className="whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Insights AI</a>
          <a href="#performance" className="whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Performance</a>
        </nav>
      </div>

      <div id="overview" className="flex flex-col md:flex-row md:items-center justify-between gap-4 scroll-mt-32">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Atualizando em tempo real via WebSocket
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-700 dark:text-slate-200 cursor-pointer">
              <option>Últimos 7 dias</option>
              <option>Este Mês</option>
              <option>Este Ano</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div 
        style={{ y: yStats }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard 
          title="Total de Leads" 
          value={metrics?.totalLeads || 0} 
          change="+12.5%" 
          trend="up" 
          icon={Users}
          delay={0.1}
        />
        <StatCard 
          title="Investimento (Ads)" 
          value={`R$ ${metrics?.totalSpend?.toFixed(2) || 0}`} 
          change="+8.2%" 
          trend="up" 
          icon={DollarSign}
          delay={0.2}
        />
        <StatCard 
          title="ROI Médio" 
          value={`${metrics?.roi?.toFixed(1) || 0}%`} 
          change="-2.4%" 
          trend="down" 
          icon={Target}
          delay={0.3}
        />
        <StatCard 
          title="Campanhas Ativas" 
          value={metrics?.campaignsCount || 0} 
          change="0" 
          trend="neutral" 
          icon={MousePointer}
          delay={0.4}
        />
      </motion.div>

      <div id="insights" className="grid grid-cols-1 scroll-mt-32">
        <AiInsights metrics={metrics} />
      </div>

      <motion.div 
        id="performance"
        style={{ y: yCharts }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-32"
      >
        <ChartWrapper 
          title="Performance de Leads" 
          subtitle="Dados em tempo real"
          delay={0.5}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={realtimeData.length > 0 ? realtimeData : chartData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey={realtimeData.length > 0 ? "timestamp" : "name"} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                dy={10}
                tickFormatter={(val) => realtimeData.length > 0 ? new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : val} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="leads" 
                stroke={currentTheme.colors.primary}
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorLeads)" 
                isAnimationActive={true} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper 
          title="Investimento vs Retorno" 
          subtitle="Comparativo semanal"
          delay={0.6}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar 
                dataKey="spend" 
                name="Investimento" 
                fill="#94a3b8" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1500}
              />
              <Bar 
                dataKey="revenue" 
                name="Receita" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </motion.div>
    </motion.div>
  );
};
