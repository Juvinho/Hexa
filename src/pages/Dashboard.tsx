import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, MousePointer, Target, Activity } from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

// Initialize Socket.io connection (pointing to backend URL)
const socket = io('http://localhost:3000');

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-indigo-50 rounded-lg text-hexa-primary">
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-sm font-medium flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {change}
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      </span>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/dashboard/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error('Erro ao carregar métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Socket.io listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      toast.success('Conectado ao servidor em tempo real');
    });

    socket.on('dashboard_update', (data) => {
      // Add new data point and keep only last 10
      setRealtimeData(prev => {
        const newData = [...prev, data].slice(-10);
        return newData;
      });
      
      // Optimistically update total leads for visual effect
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
      socket.off('connect');
      socket.off('dashboard_update');
    };
  }, []);

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Carregando dashboard...</p>
      </div>
    </div>
  );

  // Mock data for static charts (fallback)
  const chartData = [
    { name: 'Seg', leads: 40, spend: 240, revenue: 400 },
    { name: 'Ter', leads: 30, spend: 139, revenue: 300 },
    { name: 'Qua', leads: 20, spend: 980, revenue: 1200 },
    { name: 'Qui', leads: 27, spend: 390, revenue: 550 },
    { name: 'Sex', leads: 18, spend: 480, revenue: 500 },
    { name: 'Sab', leads: 23, spend: 380, revenue: 450 },
    { name: 'Dom', leads: 34, spend: 430, revenue: 600 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Atualizando em tempo real via WebSocket
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hexa-primary/20">
            <option>Últimos 7 dias</option>
            <option>Este Mês</option>
            <option>Este Ano</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Leads" 
          value={metrics?.totalLeads || 0} 
          change="+12.5%" 
          trend="up" 
          icon={Users} 
        />
        <StatCard 
          title="Investimento (Ads)" 
          value={`R$ ${metrics?.totalSpend?.toFixed(2) || 0}`} 
          change="+8.2%" 
          trend="up" 
          icon={DollarSign} 
        />
        <StatCard 
          title="ROI Médio" 
          value={`${metrics?.roi?.toFixed(1) || 0}%`} 
          change="-2.4%" 
          trend="down" 
          icon={Target} 
        />
        <StatCard 
          title="Campanhas Ativas" 
          value={metrics?.campaignsCount || 0} 
          change="0" 
          trend="up" 
          icon={MousePointer} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance de Leads (Tempo Real)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realtimeData.length > 0 ? realtimeData : chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey={realtimeData.length > 0 ? "timestamp" : "name"} axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} 
                  tickFormatter={(val) => realtimeData.length > 0 ? new Date(val).toLocaleTimeString() : val} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Investimento vs Retorno</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="spend" name="Investimento" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
