import { useEffect, useState } from 'react';
import { Activity, TrendingUp, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';
import { toast } from 'sonner';
import { ChartWrapper } from '../components/ChartWrapper';
import { motion } from 'framer-motion';

export const Reports = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/leads');
        // Sort by date ascending for charts
        const sorted = [...response.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setData(sorted);
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aggregate data for charts
  const platformData = data.reduce((acc: any, curr) => {
    const existing = acc.find((p: any) => p.name === curr.platform);
    if (existing) {
      existing.value += curr.leads;
    } else {
      acc.push({ name: curr.platform, value: curr.leads });
    }
    return acc;
  }, []);

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#10B981', '#F59E0B'];

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios Avançados</h1>
        <p className="text-slate-500 dark:text-slate-400">Análise detalhada de performance e conversão</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend vs Revenue Chart */}
        <ChartWrapper 
          title="Investimento x Receita (Diário)" 
          delay={0.1}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
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
              <Area 
                type="monotone" 
                dataKey="spend" 
                name="Investimento" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorSpend)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Receita Estimada" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Leads by Platform */}
        <ChartWrapper 
          title="Distribuição de Leads por Plataforma" 
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RePie>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {platformData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
            </RePie>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </motion.div>
  );
};
