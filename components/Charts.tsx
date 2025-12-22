import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ChartDataPoint, PlatformData } from '../types';

interface ROIChartProps {
  data: PlatformData[];
}

export const ROIChart: React.FC<ROIChartProps> = ({ data }) => {
  const hasData = data.some(p => p.roi > 0);

  if (!hasData) {
     return (
       <div className="h-[300px] flex items-center justify-center text-slate-600 text-sm border border-dashed border-slate-800 rounded-lg">
          Nenhum dado de ROI disponível. Adicione gastos e leads.
       </div>
     );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" stroke="#64748b" tickFormatter={(val) => `${val}x`} />
        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
          itemStyle={{ color: '#f1f5f9' }}
          cursor={{ fill: '#1e293b', opacity: 0.4 }}
          formatter={(value: number) => [`${value}x`, 'ROAS']}
        />
        <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface LeadsTrendChartProps {
  data: ChartDataPoint[];
}

export const LeadsTrendChart: React.FC<LeadsTrendChartProps> = ({ data }) => {
  const totalLeads = data.reduce((acc, curr) => acc + curr.total, 0);

  if (totalLeads === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-600 text-sm border border-dashed border-slate-800 rounded-lg">
         Aguardando entrada de dados para gerar gráfico...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="time" stroke="#64748b" />
        <YAxis stroke="#64748b" allowDecimals={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
        />
        <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};